/**
 * RFC 5545 iCalendar (.ics) Parser & Feed Synchronizer
 * Supports university timetable feeds (Canvas, Blackboard, Moodle, TimeEdit, Celcat, Outlook 365, Google Calendar)
 */

function unfoldIcsLines(rawText) {
  // RFC 5545 Section 3.1: Lines starting with a single space or tab are continuations of the previous line
  return rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n[ \t]/g, '');
}

function unescapeIcsText(str) {
  if (!str) return '';
  return str
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
    .trim();
}

function parseIcsDate(rawVal, params = '') {
  if (!rawVal) return null;
  const val = rawVal.trim();

  // Date-only format: YYYYMMDD (All-day event)
  if (/^\d{8}$/.test(val)) {
    const year = parseInt(val.slice(0, 4), 10);
    const month = parseInt(val.slice(4, 6), 10) - 1;
    const day = parseInt(val.slice(6, 8), 10);
    const d = new Date(year, month, day, 0, 0, 0);
    return { iso: d.toISOString(), allDay: 1, dateObj: d };
  }

  // DateTime format: YYYYMMDDTHHMMSS or YYYYMMDDTHHMMSSZ
  const match = val.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    const hour = parseInt(match[4], 10);
    const min = parseInt(match[5], 10);
    const sec = parseInt(match[6], 10);
    const isUtc = Boolean(match[7]);

    const d = isUtc
      ? new Date(Date.UTC(year, month, day, hour, min, sec))
      : new Date(year, month, day, hour, min, sec);

    return { iso: d.toISOString(), allDay: 0, dateObj: d };
  }

  const fallback = new Date(val);
  if (!isNaN(fallback.getTime())) {
    return { iso: fallback.toISOString(), allDay: 0, dateObj: fallback };
  }
  return null;
}

function inferCategory(summary, description) {
  const combined = `${summary} ${description}`.toLowerCase();
  if (/\b(exam|examination|midterm|final test|assessment)\b/.test(combined)) return 'Exam';
  if (/\b(lab|laboratory|practical|workshop)\b/.test(combined)) return 'Lab';
  if (/\b(seminar|tutorial|recitation|small group)\b/.test(combined)) return 'Seminar';
  if (/\b(due|deadline|submission|coursework|assignment)\b/.test(combined)) return 'Deadline';
  if (/\b(lecture|lec|class|module)\b/.test(combined)) return 'Lecture';
  return 'Lecture';
}

function expandRecurringEvents(baseEvent, rruleStr) {
  if (!rruleStr) return [baseEvent];

  const rules = {};
  rruleStr.split(';').forEach((part) => {
    const [k, v] = part.split('=');
    if (k && v) rules[k.toUpperCase()] = v.toUpperCase();
  });

  const freq = rules.FREQ;
  if (freq !== 'WEEKLY' && freq !== 'DAILY') {
    return [baseEvent];
  }

  const interval = parseInt(rules.INTERVAL || '1', 10) || 1;
  const maxCount = Math.min(parseInt(rules.COUNT || '24', 10) || 24, 52);
  let untilDate = null;
  if (rules.UNTIL) {
    const parsedUntil = parseIcsDate(rules.UNTIL);
    if (parsedUntil) untilDate = parsedUntil.dateObj;
  }

  const startObj = new Date(baseEvent.start_time);
  const endObj = new Date(baseEvent.end_time);
  const durationMs = endObj.getTime() - startObj.getTime();
  const stepDays = freq === 'WEEKLY' ? 7 * interval : 1 * interval;

  const instances = [];
  for (let i = 0; i < maxCount; i++) {
    const instStart = new Date(startObj.getTime() + i * stepDays * 86400000);
    if (untilDate && instStart > untilDate) break;
    const instEnd = new Date(instStart.getTime() + durationMs);

    instances.push({
      ...baseEvent,
      external_uid: `${baseEvent.external_uid}_r${i}`,
      start_time: instStart.toISOString(),
      end_time: instEnd.toISOString()
    });
  }

  return instances;
}

function parseIcsContent(rawContent, defaultColor = '#6366f1') {
  const unfolded = unfoldIcsLines(rawContent);
  const lines = unfolded.split('\n');

  const events = [];
  let inEvent = false;
  let current = {};

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.toUpperCase() === 'BEGIN:VEVENT') {
      inEvent = true;
      current = {};
      continue;
    }

    if (line.toUpperCase() === 'END:VEVENT') {
      inEvent = false;
      if (current.start && current.summary) {
        const startParsed = current.start;
        let endParsed = current.end;
        if (!endParsed) {
          const fallbackEnd = new Date(
            startParsed.dateObj.getTime() + (startParsed.allDay ? 86400000 : 3600000)
          );
          endParsed = { iso: fallbackEnd.toISOString(), allDay: startParsed.allDay };
        }

        const baseEvent = {
          external_uid: current.uid || `ics-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          title: current.summary,
          description: current.description || '',
          location: current.location || '',
          start_time: startParsed.iso,
          end_time: endParsed.iso,
          all_day: startParsed.allDay,
          category: inferCategory(current.summary, current.description || ''),
          color: defaultColor
        };

        const expanded = expandRecurringEvents(baseEvent, current.rrule);
        events.push(...expanded);
      }
      continue;
    }

    if (!inEvent) continue;

    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const propFull = line.slice(0, colonIdx);
    const propVal = line.slice(colonIdx + 1);
    const [propName, ...paramParts] = propFull.split(';');
    const key = propName.toUpperCase();
    const params = paramParts.join(';');

    if (key === 'SUMMARY') {
      current.summary = unescapeIcsText(propVal);
    } else if (key === 'DESCRIPTION') {
      current.description = unescapeIcsText(propVal);
    } else if (key === 'LOCATION') {
      current.location = unescapeIcsText(propVal);
    } else if (key === 'UID') {
      current.uid = propVal.trim();
    } else if (key === 'DTSTART') {
      current.start = parseIcsDate(propVal, params);
    } else if (key === 'DTEND') {
      current.end = parseIcsDate(propVal, params);
    } else if (key === 'RRULE') {
      current.rrule = propVal.trim();
    }
  }

  return events;
}

async function fetchAndParseIcsUrl(feedUrl, color = '#6366f1') {
  const normalizedUrl = feedUrl.trim().replace(/^webcal:\/\//i, 'https://');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(normalizedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'UniCommandCenter/1.0 (Calendar Sync)',
        Accept: 'text/calendar, text/plain, */*'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const rawText = await response.text();
    if (!rawText.includes('BEGIN:VCALENDAR')) {
      throw new Error('URL did not return a valid iCalendar (.ics) file.');
    }

    return parseIcsContent(rawText, color);
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  parseIcsContent,
  fetchAndParseIcsUrl
};
