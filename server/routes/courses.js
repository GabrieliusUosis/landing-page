const express = require('express');
const router = express.Router();
const { db } = require('../db');

router.get('/', (req, res) => {
  const courses = db.prepare(`
    SELECT c.*,
      (SELECT COUNT(*) FROM assignments a WHERE a.course_id = c.id AND a.status != 'submitted') as pending_assignments,
      (SELECT COUNT(*) FROM tasks t WHERE t.course_id = c.id AND t.status != 'done') as pending_tasks,
      (SELECT COUNT(*) FROM notes n WHERE n.course_id = c.id) as note_count
    FROM courses c
    ORDER BY c.code ASC
  `).all();
  res.json(courses);
});

router.post('/', (req, res) => {
  const { code, name, instructor, location, color, semester } = req.body;
  if (!code || !name) {
    return res.status(400).json({ error: 'Course code and name are required.' });
  }

  const result = db.prepare(`
    INSERT INTO courses (code, name, instructor, location, color, semester)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    code.trim().toUpperCase(),
    name.trim(),
    (instructor || '').trim(),
    (location || '').trim(),
    color || '#3b82f6',
    (semester || 'Semester 1').trim()
  );

  const created = db.prepare('SELECT * FROM courses WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(created);
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Course not found.' });
  }

  const code = req.body.code !== undefined ? req.body.code.trim().toUpperCase() : existing.code;
  const name = req.body.name !== undefined ? req.body.name.trim() : existing.name;
  const instructor = req.body.instructor !== undefined ? req.body.instructor : existing.instructor;
  const location = req.body.location !== undefined ? req.body.location : existing.location;
  const color = req.body.color !== undefined ? req.body.color : existing.color;
  const semester = req.body.semester !== undefined ? req.body.semester : existing.semester;

  db.prepare(`
    UPDATE courses
    SET code = ?, name = ?, instructor = ?, location = ?, color = ?, semester = ?
    WHERE id = ?
  `).run(code, name, instructor, location, color, semester, id);

  const updated = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  db.prepare('DELETE FROM courses WHERE id = ?').run(id);
  res.json({ deleted: true });
});

// Assignments & Deadlines endpoints
router.get('/assignments', (req, res) => {
  const { course_id, status } = req.query;
  let query = `
    SELECT a.*, c.code as course_code, c.name as course_name, c.color as course_color
    FROM assignments a
    LEFT JOIN courses c ON a.course_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (course_id) {
    query += ' AND a.course_id = ?';
    params.push(Number(course_id));
  }
  if (status && status !== 'all') {
    query += ' AND a.status = ?';
    params.push(status);
  }

  query += `
    ORDER BY
      CASE WHEN a.status = 'submitted' THEN 1 ELSE 0 END ASC,
      a.due_date ASC
  `;

  const assignments = db.prepare(query).all(...params);
  res.json(assignments);
});

router.post('/assignments', (req, res) => {
  const { course_id, title, type, weight, due_date, status, description } = req.body;
  if (!title || !due_date) {
    return res.status(400).json({ error: 'Assignment title and due date are required.' });
  }

  const result = db.prepare(`
    INSERT INTO assignments (course_id, title, type, weight, due_date, status, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    course_id ? Number(course_id) : null,
    title.trim(),
    type || 'Coursework',
    Number(weight) || 0,
    due_date,
    status || 'not_started',
    (description || '').trim()
  );

  const created = db.prepare(`
    SELECT a.*, c.code as course_code, c.name as course_name, c.color as course_color
    FROM assignments a
    LEFT JOIN courses c ON a.course_id = c.id
    WHERE a.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(created);
});

router.put('/assignments/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM assignments WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Assignment not found.' });
  }

  const course_id = req.body.course_id !== undefined ? (req.body.course_id ? Number(req.body.course_id) : null) : existing.course_id;
  const title = req.body.title !== undefined ? req.body.title.trim() : existing.title;
  const type = req.body.type !== undefined ? req.body.type : existing.type;
  const weight = req.body.weight !== undefined ? Number(req.body.weight) : existing.weight;
  const due_date = req.body.due_date !== undefined ? req.body.due_date : existing.due_date;
  const status = req.body.status !== undefined ? req.body.status : existing.status;
  const description = req.body.description !== undefined ? req.body.description : existing.description;

  db.prepare(`
    UPDATE assignments
    SET course_id = ?, title = ?, type = ?, weight = ?, due_date = ?, status = ?, description = ?
    WHERE id = ?
  `).run(course_id, title, type, weight, due_date, status, description, id);

  const updated = db.prepare(`
    SELECT a.*, c.code as course_code, c.name as course_name, c.color as course_color
    FROM assignments a
    LEFT JOIN courses c ON a.course_id = c.id
    WHERE a.id = ?
  `).get(id);

  res.json(updated);
});

router.delete('/assignments/:id', (req, res) => {
  const id = Number(req.params.id);
  db.prepare('DELETE FROM assignments WHERE id = ?').run(id);
  res.json({ deleted: true });
});

module.exports = router;
