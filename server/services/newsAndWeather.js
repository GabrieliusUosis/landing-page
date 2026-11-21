/**
 * BBC / Guardian / Sky News Visual RSS Engine
 * + Multi-City UK Weather (Loughborough & London) with Outfit Advice
 */

const NEWS_SOURCES = {
  uk: [
    { name: 'BBC UK', url: 'https://feeds.bbci.co.uk/news/uk/rss.xml' },
    { name: 'Sky News UK', url: 'https://feeds.skynews.com/feeds/rss/uk.xml' },
    { name: 'The Guardian UK', url: 'https://www.theguardian.com/uk-news/rss' }
  ],
  world: [
    { name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
    { name: 'Sky World', url: 'https://feeds.skynews.com/feeds/rss/world.xml' },
    { name: 'The Guardian World', url: 'https://www.theguardian.com/world/rss' }
  ],
  tech: [
    { name: 'BBC Tech', url: 'https://feeds.bbci.co.uk/news/technology/rss.xml' },
    { name: 'The Guardian Tech', url: 'https://www.theguardian.com/uk/technology/rss' }
  ]
};

const newsCache = new Map();
const NEWS_TTL_MS = 5 * 60 * 1000;

const weatherCache = new Map();
const WEATHER_TTL_MS = 10 * 60 * 1000;

const UK_CITIES = {
  loughborough: { name: 'Loughborough', lat: 52.7721, lon: -1.2062 },
  london: { name: 'London', lat: 51.5074, lon: -0.1278 }
};

function decodeXmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/<[^>]+>/g, '')
    .trim();
}

function extractRssImage(block) {
  const thumb = block.match(/<media:thumbnail[^>]*url="([^"]+)"/i);
  if (thumb && thumb[1]) {
    // Upgrade BBC 240px thumbnails to 640px for sharp display
    return decodeXmlEntities(thumb[1]).replace('/standard/240/', '/standard/640/');
  }
  const content = block.match(/<media:content[^>]*url="([^"]+)"/i);
  if (content && content[1]) {
    return decodeXmlEntities(content[1]);
  }
  const enc = block.match(/<enclosure[^>]*url="([^"]+)"/i);
  if (enc && enc[1]) {
    return decodeXmlEntities(enc[1]);
  }
  return '';
}

function parseRssItems(xmlText, sourceObj) {
  const items = [];
  const itemRegex = /<item\b[^>]*>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xmlText)) !== null && items.length < 12) {
    const block = match[1];
    const titleMatch = block.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const linkMatch = block.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
    const descMatch = block.match(/<description[^>]*>([\s\S]*?)<\/description>/i);
    const pubDateMatch = block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i);

    const title = decodeXmlEntities(titleMatch ? titleMatch[1] : '');
    const link = decodeXmlEntities(linkMatch ? linkMatch[1] : '');
    const description = decodeXmlEntities(descMatch ? descMatch[1] : '').slice(0, 190);
    const pubDateRaw = pubDateMatch ? decodeXmlEntities(pubDateMatch[1]) : '';
    const pubDate = pubDateRaw ? new Date(pubDateRaw) : new Date();
    const image = extractRssImage(block);

    if (title && link) {
      items.push({
        title,
        link,
        description,
        image,
        source: sourceObj.name,
        publishedAt: isNaN(pubDate.getTime()) ? new Date().toISOString() : pubDate.toISOString()
      });
    }
  }

  return items;
}

async function fetchNewsByCategory(category = 'uk') {
  const key = NEWS_SOURCES[category] ? category : 'uk';
  const cached = newsCache.get(key);
  if (cached && Date.now() - cached.fetchedAt < NEWS_TTL_MS) {
    return cached.items;
  }

  const sources = NEWS_SOURCES[key];
  const results = await Promise.allSettled(
    sources.map(async (src) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      try {
        const res = await fetch(src.url, {
          signal: controller.signal,
          headers: { 'User-Agent': 'GabrieliusCommandCenter/1.0' }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const xml = await res.text();
        return parseRssItems(xml, src);
      } finally {
        clearTimeout(timer);
      }
    })
  );

  const combined = [];
  for (const r of results) {
    if (r.status === 'fulfilled' && Array.isArray(r.value)) {
      combined.push(...r.value);
    }
  }
  combined.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  const finalItems = combined.slice(0, 16);

  if (finalItems.length > 0) {
    newsCache.set(key, { items: finalItems, fetchedAt: Date.now() });
  }
  return finalItems;
}

const WMO_CODES = {
  0: 'Clear Sky',
  1: 'Mainly Clear',
  2: 'Partly Cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Rime Fog',
  51: 'Light Drizzle',
  53: 'Moderate Drizzle',
  55: 'Dense Drizzle',
  61: 'Slight Rain',
  63: 'Moderate Rain',
  65: 'Heavy Rain',
  71: 'Light Snow',
  80: 'Rain Showers',
  81: 'Heavy Showers',
  95: 'Thunderstorm'
};

function generateClothingNote(temp, feelsLike, rainChance, windKmh, condition) {
  const isWet = rainChance >= 45 || /rain|drizzle|shower|storm/i.test(condition);

  if (feelsLike <= 3) {
    return isWet
      ? 'Freezing & wet — heavy waterproof winter coat, gloves & umbrella needed.'
      : 'Freezing out — wear a heavy winter coat and warm layers.';
  }
  if (feelsLike <= 9) {
    return isWet
      ? 'Cold & damp — bring a warm waterproof jacket or coat over a hoodie.'
      : 'Cold outside — definitely bring a warm jacket or thick hoodie.';
  }
  if (feelsLike <= 15) {
    return isWet
      ? 'Mild but rainy — hoodie or jumper plus a light rain jacket.'
      : 'Hoodie or light jacket weather — comfortable with a layer.';
  }
  if (feelsLike <= 20) {
    return isWet
      ? 'Warm with showers — t-shirt + packable light rain layer.'
      : 'Pleasant t-shirt or light long-sleeve weather.';
  }
  return isWet
    ? 'Warm & humid with rain risk — shorts/t-shirt + umbrella.'
    : 'Shorts & t-shirt weather — warm and dry outside.';
}

async function fetchUkWeather(cityKey = 'loughborough') {
  const key = UK_CITIES[cityKey] ? cityKey : 'loughborough';
  const city = UK_CITIES[key];

  const cached = weatherCache.get(key);
  if (cached && Date.now() - cached.fetchedAt < WEATHER_TTL_MS) {
    return cached.data;
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Europe%2FLondon&forecast_days=3`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather HTTP ${res.status}`);
    const raw = await res.json();

    const code = raw.current?.weather_code ?? 2;
    const temp = Math.round(raw.current?.temperature_2m ?? 11);
    const feelsLike = Math.round(raw.current?.apparent_temperature ?? 9);
    const windKmh = Math.round(raw.current?.wind_speed_10m ?? 14);
    const condition = WMO_CODES[code] || 'Variable Clouds';
    const high = Math.round(raw.daily?.temperature_2m_max?.[0] ?? 13);
    const low = Math.round(raw.daily?.temperature_2m_min?.[0] ?? 6);
    const rainChance = raw.daily?.precipitation_probability_max?.[0] ?? 20;

    const data = {
      cityKey: key,
      location: city.name,
      temp,
      feelsLike,
      humidity: raw.current?.relative_humidity_2m ?? 75,
      windKmh,
      condition,
      high,
      low,
      rainChance,
      clothingNote: generateClothingNote(temp, feelsLike, rainChance, windKmh, condition)
    };

    weatherCache.set(key, { data, fetchedAt: Date.now() });
    return data;
  } catch (err) {
    return {
      cityKey: key,
      location: city.name,
      temp: 10,
      feelsLike: 8,
      humidity: 78,
      windKmh: 15,
      condition: 'Partly Cloudy',
      high: 12,
      low: 6,
      rainChance: 25,
      clothingNote: 'Cold outside — bring a warm jacket or hoodie.'
    };
  }
}

module.exports = {
  fetchNewsByCategory,
  fetchUkWeather
};
