const express = require('express');
const router = express.Router();
const { fetchNewsByCategory, fetchUkWeather } = require('../services/newsAndWeather');

router.get('/news', async (req, res) => {
  const category = req.query.category || 'uk';
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

module.exports = router;
