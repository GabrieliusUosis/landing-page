const express = require('express');
const router = express.Router();
const { db } = require('../db');

router.get('/', (req, res) => {
  const bookmarks = db.prepare('SELECT * FROM bookmarks ORDER BY sort_order ASC, id ASC').all();
  res.json(bookmarks);
});

router.post('/', (req, res) => {
  const { title, url, category, shortcut_key } = req.body;
  if (!title || !url) {
    return res.status(400).json({ error: 'Title and URL are required.' });
  }

  let formattedUrl = url.trim();
  if (!/^https?:\/\//i.test(formattedUrl)) {
    formattedUrl = 'https://' + formattedUrl;
  }

  const maxSort = db.prepare('SELECT COALESCE(MAX(sort_order), 0) as m FROM bookmarks').get().m;

  const result = db.prepare(`
    INSERT INTO bookmarks (title, url, category, shortcut_key, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    title.trim(),
    formattedUrl,
    (category || 'University').trim(),
    (shortcut_key || '').trim(),
    maxSort + 1
  );

  const created = db.prepare('SELECT * FROM bookmarks WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(created);
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  db.prepare('DELETE FROM bookmarks WHERE id = ?').run(id);
  res.json({ deleted: true });
});

module.exports = router;
