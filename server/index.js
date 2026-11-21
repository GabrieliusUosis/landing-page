const path = require('node:path');
const express = require('express');
const { db } = require('./db');

const tasksRouter = require('./routes/tasks');
const calendarRouter = require('./routes/calendar');
const coursesRouter = require('./routes/courses');
const notesRouter = require('./routes/notes');
const bookmarksRouter = require('./routes/bookmarks');
const pulseRouter = require('./routes/pulse');

const app = express();
const PORT = process.env.PORT || 3847;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/tasks', tasksRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/notes', notesRouter);
app.use('/api/bookmarks', bookmarksRouter);
app.use('/api/pulse', pulseRouter);

app.get('/api/overview', (req, res) => {
  const tasks = db.prepare(`
    SELECT t.*, c.code as course_code, c.color as course_color
    FROM tasks t
    LEFT JOIN courses c ON t.course_id = c.id
    ORDER BY
      CASE WHEN t.status = 'done' THEN 1 ELSE 0 END ASC,
      t.is_top_priority DESC,
      CASE t.priority
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        ELSE 4
      END ASC,
      t.due_date ASC NULLS LAST
  `).all();

  const assignments = db.prepare(`
    SELECT a.*, c.code as course_code, c.name as course_name, c.color as course_color
    FROM assignments a
    LEFT JOIN courses c ON a.course_id = c.id
    ORDER BY
      CASE WHEN a.status = 'submitted' THEN 1 ELSE 0 END ASC,
      a.due_date ASC
  `).all();

  const courses = db.prepare('SELECT * FROM courses ORDER BY code ASC').all();

  const events = db.prepare(`
    SELECT e.*, f.name as feed_name, c.code as course_code
    FROM calendar_events e
    LEFT JOIN calendar_feeds f ON e.feed_id = f.id
    LEFT JOIN courses c ON e.course_id = c.id
    WHERE (e.feed_id IS NULL OR f.enabled = 1)
    ORDER BY e.start_time ASC
  `).all();

  const feeds = db.prepare('SELECT * FROM calendar_feeds ORDER BY id DESC').all();

  const notes = db.prepare(`
    SELECT n.*, c.code as course_code, c.color as course_color
    FROM notes n
    LEFT JOIN courses c ON n.course_id = c.id
    ORDER BY n.pinned DESC, n.updated_at DESC
  `).all();

  const bookmarks = db.prepare('SELECT * FROM bookmarks ORDER BY sort_order ASC, id ASC').all();

  res.json({
    tasks,
    assignments,
    courses,
    events,
    feeds,
    notes,
    bookmarks
  });
});

app.listen(PORT, () => {
  console.log(`[CommandCenter] Server listening on http://localhost:${PORT}`);
});
