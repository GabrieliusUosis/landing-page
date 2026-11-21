const express = require('express');
const router = express.Router();
const { db } = require('../db');

router.get('/', (req, res) => {
  const { status, course_id } = req.query;
  let query = `
    SELECT t.*, c.code as course_code, c.color as course_color
    FROM tasks t
    LEFT JOIN courses c ON t.course_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (status && status !== 'all') {
    query += ' AND t.status = ?';
    params.push(status);
  }
  if (course_id) {
    query += ' AND t.course_id = ?';
    params.push(Number(course_id));
  }

  query += `
    ORDER BY
      CASE WHEN t.status = 'done' THEN 1 ELSE 0 END ASC,
      t.is_top_priority DESC,
      CASE t.priority
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        ELSE 4
      END ASC,
      t.due_date ASC NULLS LAST,
      t.id DESC
  `;

  const tasks = db.prepare(query).all(...params);
  res.json(tasks);
});

router.post('/', (req, res) => {
  const { title, description, priority, status, is_top_priority, course_id, due_date } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Task title is required.' });
  }

  const stmt = db.prepare(`
    INSERT INTO tasks (title, description, priority, status, is_top_priority, course_id, due_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    title.trim(),
    (description || '').trim(),
    priority || 'medium',
    status || 'todo',
    is_top_priority ? 1 : 0,
    course_id ? Number(course_id) : null,
    due_date || null
  );

  const created = db.prepare(`
    SELECT t.*, c.code as course_code, c.color as course_color
    FROM tasks t
    LEFT JOIN courses c ON t.course_id = c.id
    WHERE t.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(created);
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  const title = req.body.title !== undefined ? req.body.title.trim() : existing.title;
  const description = req.body.description !== undefined ? req.body.description : existing.description;
  const priority = req.body.priority !== undefined ? req.body.priority : existing.priority;
  const status = req.body.status !== undefined ? req.body.status : existing.status;
  const is_top_priority = req.body.is_top_priority !== undefined ? (req.body.is_top_priority ? 1 : 0) : existing.is_top_priority;
  const course_id = req.body.course_id !== undefined ? (req.body.course_id ? Number(req.body.course_id) : null) : existing.course_id;
  const due_date = req.body.due_date !== undefined ? (req.body.due_date || null) : existing.due_date;
  const completed_at = status === 'done' && existing.status !== 'done'
    ? new Date().toISOString()
    : (status !== 'done' ? null : existing.completed_at);

  db.prepare(`
    UPDATE tasks
    SET title = ?, description = ?, priority = ?, status = ?, is_top_priority = ?,
        course_id = ?, due_date = ?, completed_at = ?
    WHERE id = ?
  `).run(title, description, priority, status, is_top_priority, course_id, due_date, completed_at, id);

  const updated = db.prepare(`
    SELECT t.*, c.code as course_code, c.color as course_color
    FROM tasks t
    LEFT JOIN courses c ON t.course_id = c.id
    WHERE t.id = ?
  `).get(id);

  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  res.json({ deleted: true });
});

module.exports = router;
