const path = require('node:path');
const fs = require('node:fs');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'command_center.sqlite');
const db = new DatabaseSync(DB_PATH);

db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      instructor TEXT DEFAULT '',
      location TEXT DEFAULT '',
      color TEXT DEFAULT '#3b82f6',
      semester TEXT DEFAULT 'Semester 1',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER,
      title TEXT NOT NULL,
      type TEXT DEFAULT 'Coursework',
      weight REAL DEFAULT 0,
      due_date TEXT NOT NULL,
      status TEXT DEFAULT 'not_started',
      description TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'todo',
      is_top_priority INTEGER DEFAULT 0,
      course_id INTEGER,
      due_date TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS calendar_feeds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT DEFAULT '',
      source_type TEXT DEFAULT 'url',
      color TEXT DEFAULT '#6366f1',
      last_synced_at TEXT,
      event_count INTEGER DEFAULT 0,
      enabled INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS calendar_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      feed_id INTEGER,
      external_uid TEXT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      location TEXT DEFAULT '',
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      all_day INTEGER DEFAULT 0,
      category TEXT DEFAULT 'Personal',
      color TEXT DEFAULT '#3b82f6',
      course_id INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (feed_id) REFERENCES calendar_feeds(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER,
      title TEXT NOT NULL,
      content TEXT DEFAULT '',
      pinned INTEGER DEFAULT 0,
      updated_at TEXT DEFAULT (datetime('now')),
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      category TEXT DEFAULT 'University',
      shortcut_key TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0
    );
  `);

  seedInitialDataIfNeeded();
}

function seedInitialDataIfNeeded() {
  const courseCount = db.prepare('SELECT COUNT(*) as count FROM courses').get().count;
  if (courseCount > 0) return;

  // Insert Loughborough University Part C Computer Science (COUB01) Modules
  const insertCourse = db.prepare(
    'INSERT INTO courses (code, name, instructor, location, color, semester) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const coc104 = insertCourse.run(
    'COC104',
    'Algorithm Analysis',
    'Dr Robert Mercas',
    'CC012 (James France)',
    '#3b82f6',
    'Sem 1 (2026/27)'
  ).lastInsertRowid;

  const coc105 = insertCourse.run(
    'COC105',
    'Cloud Computing',
    'Dr Fung Po Tso, Owen Bell',
    'WAVB01 (Wavy Top) / N001, N003 (Haslegrave)',
    '#10b981',
    'Sem 1 (2026/27)'
  ).lastInsertRowid;

  const coc118 = insertCourse.run(
    'COC118',
    'Human-Computer Interaction',
    'Dr Sara Saravi',
    'DLC003 (DigiLab Central)',
    '#8b5cf6',
    'Sem 1 (2026/27)'
  ).lastInsertRowid;

  const coc196 = insertCourse.run(
    'COC196',
    'Distributed Systems',
    'Dr Lin Guan',
    'U005 (Brockington Ext) / SCH001 (Schofield)',
    '#f59e0b',
    'Sem 1 (2026/27)'
  ).lastInsertRowid;

  const coz250 = insertCourse.run(
    'COZ250',
    'Part C Final Year Project (26COZ250META)',
    'Project Supervisor',
    'Friday 11:30 Weekly Meeting',
    '#ec4899',
    'Sem 1 & 2 (2026/27)'
  ).lastInsertRowid;

  // Insert actual Learn Timeline Deadlines
  const insertAssignment = db.prepare(
    'INSERT INTO assignments (course_id, title, type, weight, due_date, status, description) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );

  // Wednesday, 13 January 2027 at 11:00
  const jan13_1100 = new Date(2027, 0, 13, 11, 0, 0).toISOString();

  insertAssignment.run(
    coc118,
    '26COC118_CW_Project_26/27',
    'Coursework',
    50,
    jan13_1100,
    'in_progress',
    'Human-Computer Interaction Coursework Project submission via Loughborough Learn.'
  );

  insertAssignment.run(
    coz250,
    'January Deliverable Submission Point 26/27',
    'Project',
    25,
    jan13_1100,
    'in_progress',
    '26COZ250META - All Part C and Part D Projects January deliverable submission on Learn.'
  );

  // Recurring Timetable Generation starting Week 8 (Monday 16 Nov 2026) through Week 13 (w/c 21 Dec 2026)
  // Plus earlier weeks so the full November/December calendar is populated accurately
  const insertFeed = db.prepare(
    `INSERT INTO calendar_feeds (name, url, source_type, color, last_synced_at, event_count, enabled)
     VALUES (?, ?, 'file', ?, datetime('now'), ?, 1)`
  );
  const feedId = insertFeed.run(
    'Loughborough Timetable (COUB01 Part C - Sem 1)',
    'Loughborough University Timetabling',
    '#6366f1',
    0
  ).lastInsertRowid;

  const insertEvent = db.prepare(
    `INSERT INTO calendar_events (
      feed_id, external_uid, title, description, location,
      start_time, end_time, all_day, category, color, course_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  // Base Monday of Sem 1 Week 8: 16 Nov 2026
  // Generate across weeks -2 to +5 relative to 16 Nov 2026 (covers Nov & Dec 2026)
  const baseMonday = new Date(2026, 10, 16, 0, 0, 0); // Month 10 = November
  let eventCounter = 0;

  const makeTime = (weekOffset, dayOffset, hour, minute = 0) => {
    const d = new Date(
      baseMonday.getFullYear(),
      baseMonday.getMonth(),
      baseMonday.getDate() + weekOffset * 7 + dayOffset,
      hour,
      minute,
      0
    );
    return d.toISOString();
  };

  for (let wk = -2; wk <= 5; wk++) {
    const semWeekNum = 8 + wk; // Week 8 is wk = 0

    // Weeks 1-6, 8-11 standard teaching weeks (plus week 13 for Cloud Computing)
    const isStandardTeachingWeek = (semWeekNum >= 1 && semWeekNum <= 6) || (semWeekNum >= 8 && semWeekNum <= 11);
    const isCloudExtraWeek = semWeekNum === 13;

    // 1. MONDAY 16:00 - 18:00: COC118 Human-Computer Interaction (Lecture)
    if (isStandardTeachingWeek) {
      insertEvent.run(
        feedId,
        `lboro-coc118-mon-wk${semWeekNum}`,
        'COC118 Human-Computer Interaction (Lecture)',
        'Dr Sara Saravi · Weeks: Sem 1: 1-6, 8-11',
        'DLC003 (DigiLab Central)',
        makeTime(wk, 0, 16, 0),
        makeTime(wk, 0, 18, 0),
        0,
        'Lecture',
        '#8b5cf6',
        coc118
      );
      eventCounter++;
    }

    // 2. TUESDAY 10:00 - 12:00: COC105 Cloud Computing (Lecture)
    if (isStandardTeachingWeek || isCloudExtraWeek) {
      insertEvent.run(
        feedId,
        `lboro-coc105-tue-wk${semWeekNum}`,
        'COC105 Cloud Computing (Lecture)',
        'Dr Fung Po Tso, Owen Bell · Weeks: Sem 1: 1-6, 8-11, 13',
        'WAVB01 (Wavy Top)',
        makeTime(wk, 1, 10, 0),
        makeTime(wk, 1, 12, 0),
        0,
        'Lecture',
        '#10b981',
        coc105
      );
      eventCounter++;
    }

    // 3. TUESDAY 14:00 - 16:00: COC196 Distributed Systems (Lecture)
    if (isStandardTeachingWeek) {
      insertEvent.run(
        feedId,
        `lboro-coc196-tue-wk${semWeekNum}`,
        'COC196 Distributed Systems (Lecture)',
        'Dr Lin Guan · Weeks: Sem 1: 1-6, 8-11',
        'U005 (Brockington Extension)',
        makeTime(wk, 1, 14, 0),
        makeTime(wk, 1, 16, 0),
        0,
        'Lecture',
        '#f59e0b',
        coc196
      );
      eventCounter++;
    }

    // 4. WEDNESDAY 12:00 - 13:00: COC196 Distributed Systems (Workshop)
    if (isStandardTeachingWeek) {
      insertEvent.run(
        feedId,
        `lboro-coc196-wed-wk${semWeekNum}`,
        'COC196 Distributed Systems (Workshop)',
        'Dr Lin Guan · Weeks: Sem 1: 1-3, 5-6, 8-11',
        'SCH001 (Schofield)',
        makeTime(wk, 2, 12, 0),
        makeTime(wk, 2, 13, 0),
        0,
        'Seminar',
        '#f59e0b',
        coc196
      );
      eventCounter++;
    }

    // 5. THURSDAY 09:00 - 10:00: COC104 Algorithm Analysis (Workshop)
    if (semWeekNum >= 8 && semWeekNum <= 11) {
      insertEvent.run(
        feedId,
        `lboro-coc104-thu-wk${semWeekNum}`,
        'COC104 Algorithm Analysis (Workshop)',
        'Dr Robert Mercas · Weeks: Sem 1: 8-11',
        'CC012 (James France)',
        makeTime(wk, 3, 9, 0),
        makeTime(wk, 3, 10, 0),
        0,
        'Seminar',
        '#3b82f6',
        coc104
      );
      eventCounter++;
    }

    // 6. THURSDAY 12:00 - 13:00: COC105 Cloud Computing (Practical S1_Lab1)
    if (isStandardTeachingWeek || isCloudExtraWeek) {
      insertEvent.run(
        feedId,
        `lboro-coc105-thu-wk${semWeekNum}`,
        'COC105 Cloud Computing (Practical - S1_Lab1)',
        'Dr Fung Po Tso, Owen Bell · Weeks: Sem 1: 1-6, 8-11, 13',
        'N001, N003 (Haslegrave)',
        makeTime(wk, 3, 12, 0),
        makeTime(wk, 3, 13, 0),
        0,
        'Lab',
        '#10b981',
        coc105
      );
      eventCounter++;
    }

    // 7. FRIDAY 11:30 - 12:30: Weekly Friday Meeting (Every Friday)
    insertEvent.run(
      null,
      `weekly-friday-meeting-wk${semWeekNum}`,
      'Weekly Friday Meeting',
      'Recurring Friday 11:30 meeting',
      'Campus / Online',
      makeTime(wk, 4, 11, 30),
      makeTime(wk, 4, 12, 30),
      0,
      'Meeting',
      '#ec4899',
      coz250
    );

    // 8. FRIDAY 14:00 - 15:00: COC104 Algorithm Analysis
    if (isStandardTeachingWeek) {
      insertEvent.run(
        feedId,
        `lboro-coc104-fri-wk${semWeekNum}`,
        'COC104 Algorithm Analysis (Session)',
        'Dr Robert Mercas',
        'Campus',
        makeTime(wk, 4, 14, 0),
        makeTime(wk, 4, 15, 0),
        0,
        'Lecture',
        '#3b82f6',
        coc104
      );
      eventCounter++;
    }

    // 9. FRIDAY 16:00 - 18:00: COC118 Human-Computer Interaction (S1_Labgrp2)
    if (isStandardTeachingWeek) {
      insertEvent.run(
        feedId,
        `lboro-coc118-fri-wk${semWeekNum}`,
        'COC118 Human-Computer Interaction (Lab - S1_Labgrp2)',
        'Dr Sara Saravi',
        'DigiLab / Lab',
        makeTime(wk, 4, 16, 0),
        makeTime(wk, 4, 18, 0),
        0,
        'Lab',
        '#8b5cf6',
        coc118
      );
      eventCounter++;
    }
  }

  db.prepare('UPDATE calendar_feeds SET event_count = ? WHERE id = ?').run(eventCounter, feedId);

  // Tasks tailored to the user's actual modules & deadlines
  const insertTask = db.prepare(
    'INSERT INTO tasks (title, description, priority, status, is_top_priority, course_id, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  insertTask.run(
    'Watch COC104 Algorithm Analysis On-Demand Lecture (Week 8)',
    'Dr Robert Mercas - On Demand lecture on Loughborough Learn before Thursday 09:00 Workshop in CC012',
    'high',
    'todo',
    1,
    coc104,
    makeTime(0, 3, 9, 0)
  );
  insertTask.run(
    'Work on 26COC118_CW_Project_26/27 (HCI Coursework)',
    'Prepare deliverables for Dr Sara Saravi module assessment',
    'high',
    'in_progress',
    1,
    coc118,
    jan13_1100
  );
  insertTask.run(
    'Prepare progress update for Friday 11:30 Meeting & January Deliverable',
    '26COZ250META Part C Project progress review',
    'critical',
    'todo',
    1,
    coz250,
    makeTime(0, 4, 11, 30)
  );
  insertTask.run(
    'Complete COC105 Cloud Computing Lab 1 exercises',
    'Thursday 12:00-13:00 practical in N001/N003 (Haslegrave)',
    'medium',
    'todo',
    0,
    coc105,
    makeTime(0, 3, 12, 0)
  );
  insertTask.run(
    'Review COC196 Distributed Systems Workshop sheet',
    'Wednesday 12:00-13:00 in SCH001 (Schofield) with Dr Lin Guan',
    'medium',
    'todo',
    0,
    coc196,
    makeTime(0, 2, 12, 0)
  );

  // Seed initial notes for the actual modules
  const insertNote = db.prepare(
    'INSERT INTO notes (course_id, title, content, pinned) VALUES (?, ?, ?, ?)'
  );
  insertNote.run(
    null,
    'Sem 1 Week 8 Overview & Reminders',
    `# Loughborough CS Part C — Quick Scratchpad\n\n## Weekly Routine\n- **On Demand:** \`COC104\` Algorithm Analysis Lecture (Dr Robert Mercas — Learn)\n- **Monday 16:00–18:00:** \`COC118\` HCI Lecture — DLC003 (DigiLab Central)\n- **Tuesday 10:00–12:00:** \`COC105\` Cloud Computing Lecture — WAVB01 (Wavy Top)\n- **Tuesday 14:00–16:00:** \`COC196\` Distributed Systems Lecture — U005 (Brockington Ext)\n- **Wednesday 12:00–13:00:** \`COC196\` Distributed Systems Workshop — SCH001 (Schofield)\n- **Thursday 09:00–10:00:** \`COC104\` Algorithm Analysis Workshop — CC012 (James France)\n- **Thursday 12:00–13:00:** \`COC105\` Cloud Computing Practical (S1_Lab1) — N001/N003 (Haslegrave)\n- **Friday 11:30–12:30:** Weekly Friday Meeting\n- **Friday 14:00–15:00:** \`COC104\` Algorithm Analysis Session\n- **Friday 16:00–18:00:** \`COC118\` HCI Lab (S1_Labgrp2)\n\n## Upcoming Key Deadlines (Wed 13 Jan 2027, 11:00)\n- [ ] \`26COC118_CW_Project_26/27\` (Human-Computer Interaction)\n- [ ] \`January Deliverable Submission Point 26/27\` (26COZ250META Part C Project)`,
    1
  );
  insertNote.run(
    coc104,
    'COC104 Algorithm Analysis — Workshop & On-Demand Notes',
    `# COC104: Algorithm Analysis (Dr Robert Mercas)\n\n## Schedule\n- **On-Demand Lecture:** Loughborough Learn (Weeks 1–6, 8–11)\n- **Workshop:** Thursday 09:00–10:00 in \`CC012 (James France)\`\n- **Friday Session:** Friday 14:00–15:00\n\n## Topics & Complexity Notes\n- Asymptotic notation, recurrence relations, and amortization.`,
    0
  );
  insertNote.run(
    coc118,
    'COC118 Human-Computer Interaction — CW Project Notes',
    `# COC118: Human-Computer Interaction (Dr Sara Saravi)\n\n## Assessment\n- **Deliverable:** \`26COC118_CW_Project_26/27\`\n- **Due:** Wednesday, 13 January 2027 at 11:00\n\n## Sessions\n- **Lecture:** Monday 16:00–18:00 in \`DLC003 (DigiLab Central)\`\n- **Lab (S1_Labgrp2):** Friday 16:00–18:00`,
    0
  );

  // Seed Loughborough University & Quick Launch Bookmarks
  const insertBookmark = db.prepare(
    'INSERT INTO bookmarks (title, url, category, shortcut_key, sort_order) VALUES (?, ?, ?, ?, ?)'
  );
  insertBookmark.run('Loughborough Learn (VLE)', 'https://learn.lboro.ac.uk', 'University', '1', 1);
  insertBookmark.run('Loughborough Timetabling', 'https://timetables.lboro.ac.uk', 'University', '2', 2);
  insertBookmark.run('Loughborough Outlook 365', 'https://outlook.office.com/mail/', 'Email', '3', 3);
  insertBookmark.run('Proton Mail Inbox', 'https://mail.proton.me/u/0/inbox', 'Email', '4', 4);
  insertBookmark.run('Gmail Inbox', 'https://mail.google.com/mail/u/0/#inbox', 'Email', '5', 5);
  insertBookmark.run('GitHub Repositories', 'https://github.com', 'Development', '6', 6);
}

initializeDatabase();

module.exports = {
  db
};
