const express = require('express');
const router = express.Router();
const { db } = require('../db');

router.get('/', (req, res) => {
  const { course_id } = req.query;
  let query = `
    SELECT n.*, c.code as course_code, c.color as course_color
    FROM notes n
    LEFT JOIN courses c ON n.course_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (course_id === 'general') {
    query += ' AND n.course_id IS NULL';
  } else if (course_id) {
    query += ' AND n.course_id = ?';
    params.push(Number(course_id));
  }

  query += ' ORDER BY n.pinned DESC, n.updated_at DESC';
  const notes = db.prepare(query).all(...params);
  res.json(notes);
});

router.post('/', (req, res) => {
  const { course_id, title, content, pinned } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Note title is required.' });
  }

  const result = db.prepare(`
    INSERT INTO notes (course_id, title, content, pinned, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `).run(
    course_id ? Number(course_id) : null,
    title.trim(),
    content || '',
    pinned ? 1 : 0
  );

  const created = db.prepare(`
    SELECT n.*, c.code as course_code, c.color as course_color
    FROM notes n
    LEFT JOIN courses c ON n.course_id = c.id
    WHERE n.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(created);
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Note not found.' });
  }

  const course_id = req.body.course_id !== undefined ? (req.body.course_id ? Number(req.body.course_id) : null) : existing.course_id;
  const title = req.body.title !== undefined ? req.body.title.trim() : existing.title;
  const content = req.body.content !== undefined ? req.body.content : existing.content;
  const pinned = req.body.pinned !== undefined ? (req.body.pinned ? 1 : 0) : existing.pinned;

  db.prepare(`
    UPDATE notes
    SET course_id = ?, title = ?, content = ?, pinned = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(course_id, title, content, pinned, id);

  const updated = db.prepare(`
    SELECT n.*, c.code as course_code, c.color as course_color
    FROM notes n
    LEFT JOIN courses c ON n.course_id = c.id
    WHERE n.id = ?
  `).get(id);

  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  db.prepare('DELETE FROM notes WHERE id = ?').run(id);
  res.json({ deleted: true });
});

module.exports = router;
