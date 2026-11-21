const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const { db } = require('../db');

const PROVIDER_DEFAULTS = {
  outlook: {
    imap_host: 'outlook.office365.com',
    imap_port: 993,
    imap_tls: 1,
    webmail_url: 'https://outlook.office.com/mail/'
  },
  gmail: {
    imap_host: 'imap.gmail.com',
    imap_port: 993,
    imap_tls: 1,
    webmail_url: 'https://mail.google.com/mail/u/0/#inbox'
  },
  proton: {
    imap_host: '127.0.0.1',
    imap_port: 1143,
    imap_tls: 0,
    webmail_url: 'https://mail.proton.me/u/0/inbox'
  }
};

async function syncEmailAccount(accountId, maxMessages = 20) {
  const account = db.prepare('SELECT * FROM email_accounts WHERE id = ?').get(accountId);
  if (!account) {
    throw new Error('Email account not found.');
  }

  if (!account.app_password || !account.app_password.trim()) {
    throw new Error(
      `No IMAP / Bridge password configured for ${account.label}. Open Account Settings to enter your App Password or Proton Mail Bridge password.`
    );
  }

  const isLocalBridge = account.imap_host === '127.0.0.1' || account.imap_host === 'localhost';

  const client = new ImapFlow({
    host: account.imap_host,
    port: Number(account.imap_port) || 993,
    secure: Boolean(account.imap_tls),
    auth: {
      user: account.username || account.email_address,
      pass: account.app_password
    },
    tls: {
      // Allow Proton Mail Bridge local self-signed certificate on 127.0.0.1
      rejectUnauthorized: !isLocalBridge
    },
    logger: false
  });

  let syncedCount = 0;

  try {
    await client.connect();
    const lock = await client.getMailboxLock('INBOX');

    try {
      const totalMessages = client.mailbox.exists || 0;
      if (totalMessages > 0) {
        const startSeq = Math.max(1, totalMessages - maxMessages + 1);
        const range = `${startSeq}:*`;

        const upsertStmt = db.prepare(`
          INSERT INTO email_messages (
            account_id, message_uid, subject, sender_name, sender_address,
            received_at, snippet, body_text, is_unread, is_flagged, category
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(account_id, message_uid) DO UPDATE SET
            is_unread = excluded.is_unread,
            is_flagged = excluded.is_flagged
        `);

        for await (const msg of client.fetch(range, {
          uid: true,
          flags: true,
          envelope: true,
          source: true
        })) {
          const parsed = await simpleParser(msg.source);
          const subject = parsed.subject || msg.envelope?.subject || '(No Subject)';
          const fromObj = parsed.from?.value?.[0] || msg.envelope?.from?.[0] || {};
          const senderName = fromObj.name || fromObj.address || 'Unknown Sender';
          const senderAddress = fromObj.address || '';
          const receivedDate = (parsed.date || msg.envelope?.date || new Date()).toISOString();
          const bodyText = (parsed.text || '').trim();
          const snippet = bodyText.replace(/\s+/g, ' ').slice(0, 180);

          const flags = msg.flags || new Set();
          const isUnread = flags.has('\\Seen') ? 0 : 1;
          const isFlagged = flags.has('\\Flagged') ? 1 : 0;

          const category = inferEmailCategory(subject, senderAddress);

          upsertStmt.run(
            account.id,
            String(msg.uid),
            subject,
            senderName,
            senderAddress,
            receivedDate,
            snippet,
            bodyText.slice(0, 10000),
            isUnread,
            isFlagged,
            category
          );
          syncedCount++;
        }
      }
    } finally {
      lock.release();
    }

    await client.logout();

    db.prepare(`
      UPDATE email_accounts
      SET status = 'connected', last_synced_at = datetime('now'), last_error = ''
      WHERE id = ?
    `).run(account.id);

    return { syncedCount, status: 'connected' };
  } catch (err) {
    db.prepare(`
      UPDATE email_accounts
      SET status = 'error', last_error = ?
      WHERE id = ?
    `).run(err.message, account.id);
    throw err;
  }
}

function inferEmailCategory(subject, senderAddress) {
  const s = `${subject} ${senderAddress}`.toLowerCase();
  if (s.includes('.ac.uk') || s.includes('.edu') || /coursework|lecture|module|exam|grade|canvas|blackboard|moodle/.test(s)) {
    return 'Academic';
  }
  if (/github|gitlab|vercel|docker|aws|build|deploy|commit|pull request/.test(s)) {
    return 'Development';
  }
  if (/security|password|login|verification|2fa|proton/.test(s)) {
    return 'Security';
  }
  return 'Primary';
}

module.exports = {
  PROVIDER_DEFAULTS,
  syncEmailAccount
};
