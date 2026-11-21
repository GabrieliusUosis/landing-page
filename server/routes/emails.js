const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { PROVIDER_DEFAULTS, syncEmailAccount } = require('../services/emailService');

router.get('/accounts', (req, res) => {
  const accounts = db.prepare(`
    SELECT id, label, provider, email_address, imap_host, imap_port, imap_tls,
           username, webmail_url, last_synced_at, status, last_error,
           CASE WHEN app_password != '' THEN 1 ELSE 0 END as has_password,
           (SELECT COUNT(*) FROM email_messages m WHERE m.account_id = email_accounts.id AND m.is_unread = 1) as unread_count,
           (SELECT COUNT(*) FROM email_messages m WHERE m.account_id = email_accounts.id) as total_count
    FROM email_accounts
    ORDER BY id ASC
  `).all();
  res.json(accounts);
});

router.post('/accounts', (req, res) => {
  const { label, provider, email_address, imap_host, imap_port, imap_tls, username, app_password, webmail_url } = req.body;
  if (!label || !email_address) {
    return res.status(400).json({ error: 'Account label and email address are required.' });
  }

  const prov = (provider || 'custom').toLowerCase();
  const defaults = PROVIDER_DEFAULTS[prov] || {};

  const result = db.prepare(`
    INSERT INTO email_accounts (
      label, provider, email_address, imap_host, imap_port, imap_tls,
      username, app_password, webmail_url, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    label.trim(),
    prov,
    email_address.trim(),
    (imap_host || defaults.imap_host || '').trim(),
    Number(imap_port || defaults.imap_port || 993),
    imap_tls !== undefined ? (imap_tls ? 1 : 0) : (defaults.imap_tls ?? 1),
    (username || email_address).trim(),
    (app_password || '').trim(),
    (webmail_url || defaults.webmail_url || '').trim(),
    app_password ? 'configured' : 'unconfigured'
  );

  const created = db.prepare('SELECT id, label, provider, email_address, imap_host, imap_port, imap_tls, username, webmail_url, status FROM email_accounts WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(created);
});

router.put('/accounts/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM email_accounts WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Account not found.' });
  }

  const label = req.body.label !== undefined ? req.body.label.trim() : existing.label;
  const email_address = req.body.email_address !== undefined ? req.body.email_address.trim() : existing.email_address;
  const imap_host = req.body.imap_host !== undefined ? req.body.imap_host.trim() : existing.imap_host;
  const imap_port = req.body.imap_port !== undefined ? Number(req.body.imap_port) : existing.imap_port;
  const imap_tls = req.body.imap_tls !== undefined ? (req.body.imap_tls ? 1 : 0) : existing.imap_tls;
  const username = req.body.username !== undefined ? req.body.username.trim() : existing.username;
  const app_password = req.body.app_password !== undefined && req.body.app_password !== '' ? req.body.app_password.trim() : existing.app_password;
  const webmail_url = req.body.webmail_url !== undefined ? req.body.webmail_url.trim() : existing.webmail_url;

  db.prepare(`
    UPDATE email_accounts
    SET label = ?, email_address = ?, imap_host = ?, imap_port = ?, imap_tls = ?,
        username = ?, app_password = ?, webmail_url = ?, last_error = ''
    WHERE id = ?
  `).run(label, email_address, imap_host, imap_port, imap_tls, username, app_password, webmail_url, id);

  res.json({ updated: true });
});

router.delete('/accounts/:id', (req, res) => {
  const id = Number(req.params.id);
  db.prepare('DELETE FROM email_accounts WHERE id = ?').run(id);
  res.json({ deleted: true });
});

router.post('/accounts/:id/sync', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await syncEmailAccount(id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Messages endpoints
router.get('/messages', (req, res) => {
  const { account_id, filter } = req.query;
  let query = `
    SELECT m.*, a.label as account_label, a.provider as provider, a.email_address as account_email, a.webmail_url
    FROM email_messages m
    JOIN email_accounts a ON m.account_id = a.id
    WHERE 1=1
  `;
  const params = [];

  if (account_id && account_id !== 'all') {
    query += ' AND m.account_id = ?';
    params.push(Number(account_id));
  }
  if (filter === 'unread') {
    query += ' AND m.is_unread = 1';
  } else if (filter === 'flagged') {
    query += ' AND m.is_flagged = 1';
  }

  query += ' ORDER BY m.received_at DESC LIMIT 100';
  const messages = db.prepare(query).all(...params);
  res.json(messages);
});

router.put('/messages/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM email_messages WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Message not found.' });
  }

  const is_unread = req.body.is_unread !== undefined ? (req.body.is_unread ? 1 : 0) : existing.is_unread;
  const is_flagged = req.body.is_flagged !== undefined ? (req.body.is_flagged ? 1 : 0) : existing.is_flagged;

  db.prepare('UPDATE email_messages SET is_unread = ?, is_flagged = ? WHERE id = ?').run(is_unread, is_flagged, id);
  const updated = db.prepare('SELECT * FROM email_messages WHERE id = ?').get(id);
  res.json(updated);
});

router.delete('/messages/:id', (req, res) => {
  const id = Number(req.params.id);
  db.prepare('DELETE FROM email_messages WHERE id = ?').run(id);
  res.json({ deleted: true });
});

module.exports = router;
