const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { parseIcsContent, fetchAndParseIcsUrl } = require('../services/icsParser');

router.get('/events', (req, res) => {
  const { start, end } = req.query;
  let query = `
    SELECT e.*, f.name as feed_name, c.code as course_code
    FROM calendar_events e
    LEFT JOIN calendar_feeds f ON e.feed_id = f.id
    LEFT JOIN courses c ON e.course_id = c.id
    WHERE (e.feed_id IS NULL OR f.enabled = 1)
  `;
  const params = [];

  if (start) {
    query += ' AND e.end_time >= ?';
    params.push(start);
  }
  if (end) {
    query += ' AND e.start_time <= ?';
    params.push(end);
  }

  query += ' ORDER BY e.start_time ASC';
  const events = db.prepare(query).all(...params);
  res.json(events);
});

router.post('/events', (req, res) => {
  const { title, description, location, start_time, end_time, all_day, category, color, course_id } = req.body;
  if (!title || !start_time || !end_time) {
    return res.status(400).json({ error: 'Title, start_time, and end_time are required.' });
  }

  const stmt = db.prepare(`
    INSERT INTO calendar_events (
      feed_id, external_uid, title, description, location,
      start_time, end_time, all_day, category, color, course_id
    ) VALUES (NULL, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    title.trim(),
    (description || '').trim(),
    (location || '').trim(),
    start_time,
    end_time,
    all_day ? 1 : 0,
    category || 'Personal',
    color || '#3b82f6',
    course_id ? Number(course_id) : null
  );

  const created = db.prepare('SELECT * FROM calendar_events WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(created);
});

router.put('/events/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM calendar_events WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  const title = req.body.title !== undefined ? req.body.title.trim() : existing.title;
  const description = req.body.description !== undefined ? req.body.description : existing.description;
  const location = req.body.location !== undefined ? req.body.location : existing.location;
  const start_time = req.body.start_time !== undefined ? req.body.start_time : existing.start_time;
  const end_time = req.body.end_time !== undefined ? req.body.end_time : existing.end_time;
  const all_day = req.body.all_day !== undefined ? (req.body.all_day ? 1 : 0) : existing.all_day;
  const category = req.body.category !== undefined ? req.body.category : existing.category;
  const color = req.body.color !== undefined ? req.body.color : existing.color;
  const course_id = req.body.course_id !== undefined ? (req.body.course_id ? Number(req.body.course_id) : null) : existing.course_id;

  db.prepare(`
    UPDATE calendar_events
    SET title = ?, description = ?, location = ?, start_time = ?, end_time = ?,
        all_day = ?, category = ?, color = ?, course_id = ?
    WHERE id = ?
  `).run(title, description, location, start_time, end_time, all_day, category, color, course_id, id);

  const updated = db.prepare('SELECT * FROM calendar_events WHERE id = ?').get(id);
  res.json(updated);
});

router.delete('/events/:id', (req, res) => {
  const id = Number(req.params.id);
  db.prepare('DELETE FROM calendar_events WHERE id = ?').run(id);
  res.json({ deleted: true });
});

// Calendar Feeds (.ics URLs & file imports)
router.get('/feeds', (req, res) => {
  const feeds = db.prepare('SELECT * FROM calendar_feeds ORDER BY id DESC').all();
  res.json(feeds);
});

function replaceFeedEvents(feedId, parsedEvents, feedColor) {
  db.prepare('DELETE FROM calendar_events WHERE feed_id = ?').run(feedId);
  const insertStmt = db.prepare(`
    INSERT INTO calendar_events (
      feed_id, external_uid, title, description, location,
      start_time, end_time, all_day, category, color
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const ev of parsedEvents) {
    insertStmt.run(
      feedId,
      ev.external_uid,
      ev.title,
      ev.description,
      ev.location,
      ev.start_time,
      ev.end_time,
      ev.all_day ? 1 : 0,
      ev.category || 'Lecture',
      feedColor || ev.color || '#6366f1'
    );
  }

  db.prepare(`
    UPDATE calendar_feeds
    SET last_synced_at = datetime('now'), event_count = ?
    WHERE id = ?
  `).run(parsedEvents.length, feedId);
}

router.post('/feeds/url', async (req, res) => {
  const { name, url, color } = req.body;
  if (!name || !url) {
    return res.status(400).json({ error: 'Feed name and iCal (.ics) URL are required.' });
  }

  try {
    const feedColor = color || '#6366f1';
    const parsedEvents = await fetchAndParseIcsUrl(url, feedColor);

    const result = db.prepare(`
      INSERT INTO calendar_feeds (name, url, source_type, color, last_synced_at, event_count, enabled)
      VALUES (?, ?, 'url', ?, datetime('now'), ?, 1)
    `).run(name.trim(), url.trim(), feedColor, parsedEvents.length);

    const feedId = result.lastInsertRowid;
    replaceFeedEvents(feedId, parsedEvents, feedColor);

    const createdFeed = db.prepare('SELECT * FROM calendar_feeds WHERE id = ?').get(feedId);
    res.status(201).json(createdFeed);
  } catch (err) {
    res.status(400).json({ error: `Failed to sync .ics feed: ${err.message}` });
  }
});

router.post('/feeds/file', (req, res) => {
  const { name, ics_content, color } = req.body;
  if (!name || !ics_content) {
    return res.status(400).json({ error: 'Feed name and .ics file content are required.' });
  }

  try {
    const feedColor = color || '#10b981';
    const parsedEvents = parseIcsContent(ics_content, feedColor);
    if (parsedEvents.length === 0) {
      return res.status(400).json({ error: 'No VEVENT calendar entries found in the provided .ics file.' });
    }

    const result = db.prepare(`
      INSERT INTO calendar_feeds (name, url, source_type, color, last_synced_at, event_count, enabled)
      VALUES (?, 'Local .ics File Upload', 'file', ?, datetime('now'), ?, 1)
    `).run(name.trim(), feedColor, parsedEvents.length);

    const feedId = result.lastInsertRowid;
    replaceFeedEvents(feedId, parsedEvents, feedColor);

    const createdFeed = db.prepare('SELECT * FROM calendar_feeds WHERE id = ?').get(feedId);
    res.status(201).json(createdFeed);
  } catch (err) {
    res.status(400).json({ error: `Failed to parse .ics file: ${err.message}` });
  }
});

router.post('/feeds/:id/sync', async (req, res) => {
  const id = Number(req.params.id);
  const feed = db.prepare('SELECT * FROM calendar_feeds WHERE id = ?').get(id);
  if (!feed) {
    return res.status(404).json({ error: 'Feed not found.' });
  }
  if (feed.source_type !== 'url' || !feed.url) {
    return res.status(400).json({ error: 'Only remote URL feeds can be re-synced automatically.' });
  }

  try {
    const parsedEvents = await fetchAndParseIcsUrl(feed.url, feed.color);
    replaceFeedEvents(feed.id, parsedEvents, feed.color);
    const updated = db.prepare('SELECT * FROM calendar_feeds WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: `Sync failed: ${err.message}` });
  }
});

router.delete('/feeds/:id', (req, res) => {
  const id = Number(req.params.id);
  db.prepare('DELETE FROM calendar_events WHERE feed_id = ?').run(id);
  db.prepare('DELETE FROM calendar_feeds WHERE id = ?').run(id);
  res.json({ deleted: true });
});

module.exports = router;
