const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { fetchNewsByCategory, fetchUkWeather } = require('../services/newsAndWeather');

router.get('/news', async (req, res) => {
  const category = req.query.category || 'breaking';
  try {
    const items = await fetchNewsByCategory(category);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/weather', async (req, res) => {
  const city = (req.query.city || 'loughborough').toLowerCase();
  try {
    const weather = await fetchUkWeather(city);
    res.json(weather);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/habits', (req, res) => {
  const rows = db.prepare('SELECT * FROM habits ORDER BY id ASC').all();
  const parsed = rows.map((r) => ({
    ...r,
    completed_dates: JSON.parse(r.completed_dates || '[]')
  }));
  res.json(parsed);
});

router.post('/habits', (req, res) => {
  const { name, category } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Habit name is required.' });
  }
  const result = db.prepare('INSERT INTO habits (name, category, completed_dates) VALUES (?, ?, ?)').run(
    name.trim(),
    (category || 'Life').trim(),
    '[]'
  );
  const created = db.prepare('SELECT * FROM habits WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ ...created, completed_dates: [] });
});

router.post('/habits/:id/toggle', (req, res) => {
  const id = Number(req.params.id);
  const dateStr = req.body.date || new Date().toISOString().slice(0, 10);
  const row = db.prepare('SELECT * FROM habits WHERE id = ?').get(id);
  if (!row) {
    return res.status(404).json({ error: 'Habit not found.' });
  }

  let dates = [];
  try {
    dates = JSON.parse(row.completed_dates || '[]');
  } catch {
    dates = [];
  }

  if (dates.includes(dateStr)) {
    dates = dates.filter((d) => d !== dateStr);
  } else {
    dates.push(dateStr);
  }

  db.prepare('UPDATE habits SET completed_dates = ? WHERE id = ?').run(JSON.stringify(dates), id);
  res.json({ id, completed_dates: dates });
});

router.delete('/habits/:id', (req, res) => {
  const id = Number(req.params.id);
  db.prepare('DELETE FROM habits WHERE id = ?').run(id);
  res.json({ deleted: true });
});

module.exports = router;
