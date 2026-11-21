const State = {
  activeView: 'overview',
  tasks: [],
  assignments: [],
  courses: [],
  events: [],
  feeds: [],
  notes: [],
  bookmarks: [],

  // Live Pulse Data
  weather: null,
  weatherCity: localStorage.getItem('gabrielius_city') || 'loughborough',
  newsItems: [],
  newsCategory: 'uk', // 'uk' | 'world' | 'tech'
  newsLoading: false,
  uiZoom: Number(localStorage.getItem('gabrielius_zoom')) || 100,
  sidebarCollapsed: localStorage.getItem('gabrielius_sidebar_collapsed') === '1',

  // View-specific state
  calendarDate: new Date(2026, 10, 16),
  calendarMode: 'timetable',
  taskFilterStatus: 'active',
  taskFilterCourse: '',
  courseFilterId: '',
  selectedNoteId: null,
  noteCourseFilter: 'all',
  noteViewMode: 'split'
};

// SVG Icons (Crisp, zero emojis)
const Icons = {
  check: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  star: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
  starFilled: `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
  trash: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
  plus: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
  sync: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`,
  external: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`,
  calendar: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
  target: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`,
  clock: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
  mail: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
  note: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`,
  bookmark: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>`,
  globe: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
  activity: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`,
  chevronLeft: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`,
  chevronRight: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`,
  settings: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`
};

const VIEW_METADATA = {
  overview: { title: 'Daily Briefing' },
  news: { title: 'News Wire' },
  calendar: { title: 'Schedule' },
  courses: { title: 'Modules' },
  tasks: { title: 'Tasks' },
  notes: { title: 'Notes' }
};

function showToast(message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3500);
}

function updateClock() {
  const now = new Date();
  const clockEl = document.getElementById('sidebar-clock');
  const dateEl = document.getElementById('sidebar-date');
  if (clockEl) {
    clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });
  }
}

async function switchWeatherCity(city) {
  State.weatherCity = city;
  localStorage.setItem('gabrielius_city', city);
  try {
    const w = await API.getWeather(city);
    State.weather = w;
    if (State.activeView === 'overview') renderActiveView();
  } catch (err) {
    showToast(`Weather error: ${err.message}`);
  }
}

async function refreshAllData() {
  try {
    const data = await API.getOverview();
    State.tasks = data.tasks || [];
    State.assignments = data.assignments || [];
    State.courses = data.courses || [];
    State.events = data.events || [];
    State.feeds = data.feeds || [];
    State.notes = data.notes || [];
    State.bookmarks = data.bookmarks || [];

    if (!State.selectedNoteId && State.notes.length > 0) {
      State.selectedNoteId = State.notes[0].id;
    }

    updateSidebarBadges();
    renderActiveView();

    // Asynchronously load live Weather & News if not loaded yet
    if (!State.weather) {
      API.getWeather(State.weatherCity).then((w) => {
        State.weather = w;
        if (State.activeView === 'overview') renderActiveView();
      }).catch(() => {});
    }
    if (State.newsItems.length === 0) {
      loadLiveNews(State.newsCategory);
    }
  } catch (err) {
    showToast(`Failed to load data: ${err.message}`);
  }
}

async function loadLiveNews(category) {
  State.newsCategory = category;
  State.newsLoading = true;
  if (State.activeView === 'news') {
    renderActiveView();
  }
  try {
    const items = await API.getNews(category);
    State.newsItems = items || [];
  } catch (err) {
    showToast(`News feed error: ${err.message}`);
  } finally {
    State.newsLoading = false;
    if (State.activeView === 'news') {
      renderActiveView();
    }
  }
}

function updateSidebarBadges() {
  const pendingTasks = State.tasks.filter((t) => t.status !== 'done').length;
  const pendingDeadlines = State.assignments.filter((a) => a.status !== 'submitted').length;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const todayEvents = State.events.filter((e) => {
    const st = new Date(e.start_time);
    return st >= todayStart && st <= todayEnd;
  }).length;

  document.getElementById('nav-badge-tasks').textContent = pendingTasks;
  document.getElementById('nav-badge-deadlines').textContent = pendingDeadlines;
  document.getElementById('nav-badge-events').textContent = todayEvents;
}

function switchView(viewName) {
  State.activeView = viewName;
  document.querySelectorAll('.nav-btn[data-view]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });

  const meta = VIEW_METADATA[viewName] || VIEW_METADATA.overview;
  const titleEl = document.getElementById('topbar-title');
  if (titleEl) titleEl.textContent = meta.title;

  renderActiveView();
}

function renderActiveView() {
  const root = document.getElementById('view-root');
  switch (State.activeView) {
    case 'overview':
      renderOverview(root);
      break;
    case 'news':
      renderNewsDeskView(root);
      break;
    case 'calendar':
      renderCalendarView(root);
      break;
    case 'courses':
      renderCoursesView(root);
      break;
    case 'tasks':
      renderTasksView(root);
      break;
    case 'notes':
      renderNotesView(root);
      break;
    default:
      renderOverview(root);
  }
}

/* ==========================================================================
   NEWS MEDIA CARD HELPER (CLEAN RSS HEADLINES + IMAGES)
   ========================================================================== */
function renderNewsMediaCard(item, showDesc = false) {
  const thumbHtml = item.image
    ? `<div class="news-thumb-wrap">
         <img src="${Utils.escapeHtml(item.image)}" alt="" class="news-thumb-img" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentElement.innerHTML='<span class=\\'news-thumb-fallback\\'>${Utils.escapeHtml(item.source.slice(0, 6))}</span>'" />
       </div>`
    : `<div class="news-thumb-wrap">
         <span class="news-thumb-fallback">${Utils.escapeHtml(item.source.slice(0, 6))}</span>
       </div>`;

  return `
    <div class="news-media-card">
      ${thumbHtml}
      <div class="news-body">
        <div>
          <div class="news-meta">
            <span class="news-source">${Utils.escapeHtml(item.source)}</span>
            <span class="news-time">${Utils.timeAgo(item.publishedAt)}</span>
          </div>
          <a href="${Utils.escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer" style="text-decoration:none; color:inherit;">
            <div class="news-headline">${Utils.escapeHtml(item.title)}</div>
          </a>
          ${showDesc && item.description ? `<div class="news-desc">${Utils.escapeHtml(item.description)}</div>` : ''}
        </div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   1. DAILY BRIEFING OVERVIEW (GREETING + WEATHER + TASKS + SCHEDULE + DEADLINES + NOTES + LINKS)
   ========================================================================== */
function renderOverview(root) {
  const totalTasks = State.tasks.length;
  const completedTasks = State.tasks.filter((t) => t.status === 'done').length;
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const priorityTasks = State.tasks
    .filter((t) => t.status !== 'done')
    .slice(0, 5);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const horizonEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4, 23, 59, 59);
  const upcomingEvents = State.events
    .filter((e) => {
      const st = new Date(e.start_time);
      return st >= todayStart && st <= horizonEnd;
    })
    .slice(0, 5);

  const activeAssignments = State.assignments
    .filter((a) => a.status !== 'submitted');

  const pinnedNote = State.notes.find((n) => n.pinned === 1) || State.notes[0];

  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const activeTaskCount = State.tasks.filter((t) => t.status !== 'done').length;
  const pendingDeadlineCount = activeAssignments.length;

  const w = State.weather || {
    cityKey: State.weatherCity,
    location: State.weatherCity === 'london' ? 'London' : 'Loughborough',
    temp: 11,
    feelsLike: 9,
    condition: 'Loading...',
    high: 13,
    low: 6,
    rainChance: 20,
    windKmh: 14,
    clothingNote: 'Bring a hoodie or light jacket'
  };

  root.innerHTML = `
    <!-- Top Personal Briefing Strip: Greeting + Weather -->
    <div class="life-briefing-grid">
      <!-- 1. Editorial Greeting Card -->
      <div class="briefing-card">
        <div>
          <div class="editorial-greeting">${greeting}, Gabrielius.</div>
          <div class="editorial-sub">
            ${now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
        <div class="mini-stats-row">
          <div class="mini-stat">
            <span class="mini-stat-num">${activeTaskCount}</span>
            <span class="mini-stat-label">tasks</span>
          </div>
          <div class="mini-stat">
            <span class="mini-stat-num">${upcomingEvents.length}</span>
            <span class="mini-stat-label">events</span>
          </div>
          <div class="mini-stat">
            <span class="mini-stat-num">${pendingDeadlineCount}</span>
            <span class="mini-stat-label">deadlines</span>
          </div>
        </div>
      </div>

      <!-- 2. Live Weather Card (Loughborough | London + Clothing Advice) -->
      <div class="briefing-card">
        <div class="weather-top">
          <div>
            <div class="segmented-control" style="margin-bottom:6px;">
              <button class="seg-btn ${State.weatherCity === 'loughborough' ? 'active' : ''}" onclick="switchWeatherCity('loughborough')">Loughborough</button>
              <button class="seg-btn ${State.weatherCity === 'london' ? 'active' : ''}" onclick="switchWeatherCity('london')">London</button>
            </div>
            <div class="weather-cond">${Utils.escapeHtml(w.condition)} · Feels ${w.feelsLike}°C</div>
          </div>
          <div class="weather-temp">${w.temp}°C</div>
        </div>
        <div class="weather-advice-box">
          <span>${Utils.escapeHtml(w.clothingNote || 'Bring a hoodie or light jacket')}</span>
        </div>
        <div class="weather-meta-row">
          <span>H: ${w.high}° / L: ${w.low}°</span>
          <span>Rain: ${w.rainChance}%</span>
          <span>Wind: ${w.windKmh} km/h</span>
        </div>
      </div>
    </div>

    <div class="bento-grid">
      <!-- Tasks (Col 7) -->
      <div class="panel col-7">
        <div class="panel-header">
          <div class="panel-title-wrap">
            ${Icons.target}
            <span class="panel-title">Tasks</span>
          </div>
          <div class="progress-wrap">
            <span style="font-size:12px; color:var(--text-muted); font-family:var(--font-mono);">${completedTasks}/${totalTasks}</span>
            <div class="progress-track">
              <div class="progress-fill" style="width:${completionPct}%"></div>
            </div>
          </div>
        </div>
        <div class="panel-body">
          <form class="quick-capture-bar" id="overview-quick-task-form">
            <input type="text" class="input" id="overview-quick-task-input" placeholder="Add task..." required />
            <select class="select" id="overview-quick-task-priority" style="width:115px;">
              <option value="high">High</option>
              <option value="critical">Critical</option>
              <option value="medium" selected>Medium</option>
              <option value="low">Low</option>
            </select>
            <button type="submit" class="btn btn-primary">Add</button>
          </form>

          <div class="item-list">
            ${priorityTasks.length === 0 ? `<div class="empty-state">All caught up.</div>` : priorityTasks.map((t) => renderTaskRowHtml(t)).join('')}
          </div>
        </div>
      </div>

      <!-- Upcoming Schedule (Col 5) -->
      <div class="panel col-5">
        <div class="panel-header">
          <div class="panel-title-wrap">
            ${Icons.calendar}
            <span class="panel-title">Schedule</span>
          </div>
          <button class="btn btn-sm" onclick="switchView('calendar')">Timetable</button>
        </div>
        <div class="panel-body">
          <div class="item-list">
            ${upcomingEvents.length === 0
              ? `<div class="empty-state">No upcoming events.</div>`
              : upcomingEvents.map((ev) => `
                <div class="schedule-item" style="border-left-color: ${Utils.escapeHtml(ev.color || '#e07a5f')}">
                  <div class="schedule-time">
                    <div style="font-weight:600; color:var(--text-primary);">${Utils.formatShortDate(ev.start_time)}</div>
                    <div style="color:var(--text-muted)">${ev.all_day ? 'All Day' : `${Utils.formatTime(ev.start_time)} - ${Utils.formatTime(ev.end_time)}`}</div>
                  </div>
                  <div class="schedule-info">
                    <div class="schedule-title">${Utils.escapeHtml(ev.title)}</div>
                    <div class="schedule-sub">
                      ${ev.location ? `${Utils.escapeHtml(ev.location)}` : Utils.escapeHtml(ev.category || '')}
                    </div>
                  </div>
                </div>
              `).join('')
            }
          </div>
        </div>
      </div>

      <!-- Coursework Deadlines (Col 6) -->
      <div class="panel col-6">
        <div class="panel-header">
          <div class="panel-title-wrap">
            ${Icons.clock}
            <span class="panel-title">Coursework Deadlines</span>
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            <button class="btn btn-sm" onclick="openAssignmentModal()">+ Deadline</button>
            <button class="btn btn-sm" onclick="switchView('courses')">Modules</button>
          </div>
        </div>
        <div class="panel-body">
          <div class="item-list">
            ${activeAssignments.length === 0
              ? `<div class="empty-state">No pending coursework deadlines.</div>`
              : activeAssignments.map((a) => {
                const cd = Utils.relativeCountdown(a.due_date);
                return `
                  <div class="task-row">
                    <div class="task-left">
                      ${a.course_code ? `<span class="badge" style="background:${a.course_color}22; color:${a.course_color};">${Utils.escapeHtml(a.course_code)}</span>` : ''}
                      <div style="min-width:0;">
                        <div class="task-title">${Utils.escapeHtml(a.title)}</div>
                        <div style="font-size:11.5px; color:var(--text-muted);">${Utils.formatDateTime(a.due_date)}</div>
                      </div>
                    </div>
                    <span class="badge ${cd.urgent ? 'badge-critical' : 'badge-medium'}">${cd.text}</span>
                  </div>
                `;
              }).join('')
            }
          </div>
        </div>
      </div>

      <!-- Quick Scratchpad (Col 6) -->
      <div class="panel col-6">
        <div class="panel-header">
          <div class="panel-title-wrap">
            ${Icons.note}
            <span class="panel-title">Scratchpad</span>
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            <span id="scratchpad-status" style="font-size:11.5px; color:var(--text-muted); font-family:var(--font-mono);">Saved</span>
            <button class="btn btn-sm" onclick="switchView('notes')">Notes</button>
          </div>
        </div>
        <div class="panel-body">
          <textarea class="textarea" id="overview-scratchpad" style="min-height:140px; font-family:var(--font-mono); font-size:13px;" placeholder="Quick notes...">${pinnedNote ? Utils.escapeHtml(pinnedNote.content) : ''}</textarea>
        </div>
      </div>

      <!-- Quick Links (Col 12) -->
      <div class="panel col-12">
        <div class="panel-header">
          <div class="panel-title-wrap">
            ${Icons.bookmark}
            <span class="panel-title">Quick Links</span>
          </div>
          <button class="btn btn-sm" onclick="openBookmarkModal()">+ Link</button>
        </div>
        <div class="panel-body">
          <div class="bookmarks-grid">
            ${State.bookmarks.map((b) => `
              <div class="bookmark-card">
                <a href="${Utils.escapeHtml(b.url)}" target="_blank" rel="noopener noreferrer" style="text-decoration:none; color:inherit; flex:1; min-width:0;">
                  <div class="bookmark-title">${Utils.escapeHtml(b.title)}</div>
                  <div class="bookmark-cat">${Utils.escapeHtml(b.category)}</div>
                </a>
                <div style="display:flex; align-items:center; gap:4px;">
                  <a href="${Utils.escapeHtml(b.url)}" target="_blank" rel="noopener noreferrer" class="icon-btn" title="Open">${Icons.external}</a>
                  <button class="icon-btn" title="Remove" onclick="deleteBookmarkItem(${b.id})">${Icons.trash}</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  // Bind Quick Task Form
  const quickForm = document.getElementById('overview-quick-task-form');
  if (quickForm) {
    quickForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = document.getElementById('overview-quick-task-input');
      const prio = document.getElementById('overview-quick-task-priority').value;
      if (!input.value.trim()) return;
      try {
        await API.createTask({
          title: input.value.trim(),
          priority: prio,
          is_top_priority: prio === 'critical' || prio === 'high' ? 1 : 0
        });
        input.value = '';
        await refreshAllData();
        showToast('Task added');
      } catch (err) {
        showToast(err.message);
      }
    });
  }

  // Bind Auto-saving Scratchpad
  const scratchEl = document.getElementById('overview-scratchpad');
  if (scratchEl && pinnedNote) {
    let saveTimer = null;
    scratchEl.addEventListener('input', () => {
      const statusEl = document.getElementById('scratchpad-status');
      if (statusEl) statusEl.textContent = 'Saving...';
      clearTimeout(saveTimer);
      saveTimer = setTimeout(async () => {
        try {
          await API.updateNote(pinnedNote.id, { content: scratchEl.value });
          pinnedNote.content = scratchEl.value;
          if (statusEl) statusEl.textContent = 'Saved';
        } catch (err) {
          if (statusEl) statusEl.textContent = 'Error';
        }
      }, 600);
    });
  }
}

/* ==========================================================================
   1B. DEDICATED NEWS WIRE VIEW (BBC / SKY / GUARDIAN RSS)
   ========================================================================== */
function renderNewsDeskView(root) {
  root.innerHTML = `
    <div class="calendar-toolbar">
      <div class="segmented-control">
        <button class="seg-btn ${State.newsCategory === 'uk' ? 'active' : ''}" onclick="loadLiveNews('uk')">UK</button>
        <button class="seg-btn ${State.newsCategory === 'world' ? 'active' : ''}" onclick="loadLiveNews('world')">World</button>
        <button class="seg-btn ${State.newsCategory === 'tech' ? 'active' : ''}" onclick="loadLiveNews('tech')">Tech</button>
      </div>
      <button class="btn btn-sm" onclick="loadLiveNews('${State.newsCategory}')">${Icons.sync} <span>Refresh</span></button>
    </div>

    <div class="bento-grid">
      ${State.newsItems.length === 0
        ? `<div class="panel col-12"><div class="empty-state">Loading news...</div></div>`
        : State.newsItems.map((item) => `
          <div class="panel col-6">
            <div class="panel-body">
              ${renderNewsMediaCard(item, true)}
            </div>
          </div>
        `).join('')
      }
    </div>
  `;
}

function renderTaskRowHtml(t) {
  const isDone = t.status === 'done';
  return `
    <div class="task-row ${isDone ? 'done' : ''}">
      <div class="task-left">
        <button class="check-btn ${isDone ? 'checked' : ''}" onclick="toggleTaskDone(${t.id}, '${t.status}')" title="Toggle completed">
          ${isDone ? Icons.check : ''}
        </button>
        ${t.course_code ? `<span class="badge" style="background:${t.course_color}22; color:${t.course_color};">${Utils.escapeHtml(t.course_code)}</span>` : `<span class="badge badge-low">Life</span>`}
        <div style="min-width:0; flex:1;">
          <div class="task-title">${Utils.escapeHtml(t.title)}</div>
          ${t.description ? `<div style="font-size:11px; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${Utils.escapeHtml(t.description)}</div>` : ''}
        </div>
      </div>
      <div class="task-meta">
        ${t.due_date ? `<span style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono);">${Utils.formatShortDate(t.due_date)}</span>` : ''}
        <span class="badge badge-${Utils.escapeHtml(t.priority)}">${Utils.escapeHtml(t.priority)}</span>
        <button class="icon-btn ${t.is_top_priority ? 'active-star' : ''}" onclick="toggleTaskSpotlight(${t.id}, ${t.is_top_priority})" title="Pin to top priority">
          ${t.is_top_priority ? Icons.starFilled : Icons.star}
        </button>
        <button class="icon-btn" onclick="deleteTaskItem(${t.id})" title="Delete task">
          ${Icons.trash}
        </button>
      </div>
    </div>
  `;
}

async function toggleTaskDone(id, currentStatus) {
  const nextStatus = currentStatus === 'done' ? 'todo' : 'done';
  await API.updateTask(id, { status: nextStatus });
  await refreshAllData();
}

async function toggleTaskSpotlight(id, currentTop) {
  await API.updateTask(id, { is_top_priority: currentTop ? 0 : 1 });
  await refreshAllData();
}

async function deleteTaskItem(id) {
  await API.deleteTask(id);
  await refreshAllData();
  showToast('Task removed');
}

async function deleteBookmarkItem(id) {
  await API.deleteBookmark(id);
  await refreshAllData();
}

/* ==========================================================================
   2. CALENDAR & UNIVERSITY TIMETABLE VIEW
   ========================================================================== */
function renderCalendarView(root) {
  const year = State.calendarDate.getFullYear();
  const month = State.calendarDate.getMonth();

  const dayOfWeek = (State.calendarDate.getDay() + 6) % 7;
  const weekMonday = new Date(
    State.calendarDate.getFullYear(),
    State.calendarDate.getMonth(),
    State.calendarDate.getDate() - dayOfWeek
  );
  const weekFriday = new Date(weekMonday.getFullYear(), weekMonday.getMonth(), weekMonday.getDate() + 4);

  const headerLabel = State.calendarMode === 'timetable'
    ? `Week of ${Utils.formatShortDate(weekMonday.toISOString())} – ${Utils.formatShortDate(weekFriday.toISOString())} ${weekMonday.getFullYear()}`
    : State.calendarDate.toLocaleDateString([], { month: 'long', year: 'numeric' });

  root.innerHTML = `
    <div class="calendar-toolbar">
      <div style="display:flex; align-items:center; gap:10px;">
        <button class="btn" onclick="navigateCalendarStep(-1)">${Icons.chevronLeft}</button>
        <h2 style="font-family:var(--font-serif); font-size:18px; font-weight:600; min-width:215px; text-align:center;">${headerLabel}</h2>
        <button class="btn" onclick="navigateCalendarStep(1)">${Icons.chevronRight}</button>
        <button class="btn btn-sm" onclick="resetCalendarToday()">Current Week</button>
      </div>

      <div style="display:flex; align-items:center; gap:10px;">
        <div class="segmented-control">
          <button class="seg-btn ${State.calendarMode === 'timetable' ? 'active' : ''}" onclick="setCalendarMode('timetable')">Weekly Timetable</button>
          <button class="seg-btn ${State.calendarMode === 'month' ? 'active' : ''}" onclick="setCalendarMode('month')">Month Grid</button>
          <button class="seg-btn ${State.calendarMode === 'agenda' ? 'active' : ''}" onclick="setCalendarMode('agenda')">Agenda List</button>
        </div>
        <button class="btn" onclick="openIcsFeedsModal()">${Icons.sync} <span>iCal Feeds (${State.feeds.length})</span></button>
        <button class="btn btn-primary" onclick="openEventModal()">${Icons.plus} <span>Add Event</span></button>
      </div>
    </div>

    <div id="calendar-body"></div>
  `;

  const bodyEl = document.getElementById('calendar-body');
  if (State.calendarMode === 'timetable') {
    renderWeekTimetable(bodyEl, weekMonday);
  } else if (State.calendarMode === 'month') {
    renderMonthGrid(bodyEl, year, month);
  } else {
    renderAgendaList(bodyEl);
  }
}

function renderWeekTimetable(container, weekMonday) {
  const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  let gridHtml = `<div class="tt-header-cell">Day / Time</div>`;
  for (const h of hours) {
    const hStr = String(h).padStart(2, '0') + ':00';
    const hEndStr = String(h + 1).padStart(2, '0') + ':00';
    gridHtml += `<div class="tt-header-cell">${hStr}-${hEndStr}</div>`;
  }

  for (let dIdx = 0; dIdx < 5; dIdx++) {
    const dayDate = new Date(weekMonday.getFullYear(), weekMonday.getMonth(), weekMonday.getDate() + dIdx);
    const dayStart = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 0, 0, 0);
    const dayEnd = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 23, 59, 59);

    const dayEvents = State.events.filter((ev) => {
      const st = new Date(ev.start_time);
      return st >= dayStart && st <= dayEnd;
    });

    gridHtml += `
      <div class="tt-day-label">
        <span>${dayNames[dIdx]}</span>
        <span class="tt-day-sub">${Utils.formatShortDate(dayDate.toISOString())}</span>
      </div>
    `;

    let hIdx = 0;
    while (hIdx < hours.length) {
      const slotHour = hours[hIdx];
      const matchingEvents = dayEvents.filter((ev) => {
        const st = new Date(ev.start_time);
        return st.getHours() === slotHour;
      });

      if (matchingEvents.length > 0) {
        const primaryEv = matchingEvents[0];
        const st = new Date(primaryEv.start_time);
        const et = new Date(primaryEv.end_time);
        const durationHours = Math.max(1, Math.round((et - st) / 3600000));
        const spanCols = Math.min(durationHours, hours.length - hIdx);

        gridHtml += `
          <div class="tt-slot" style="grid-column: span ${spanCols};">
            ${matchingEvents.map((ev) => `
              <div class="tt-event-card" style="border-left-color: ${Utils.escapeHtml(ev.color || '#e07a5f')};" onclick="inspectCalendarEvent(${ev.id})">
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="tt-code">${Utils.escapeHtml(ev.course_code || ev.category || 'Session')}</span>
                    <span style="font-family:var(--font-mono); font-size:10px; color:var(--text-muted);">${Utils.formatTime(ev.start_time)}-${Utils.formatTime(ev.end_time)}</span>
                  </div>
                  <div class="tt-title">${Utils.escapeHtml(ev.title)}</div>
                  ${ev.description ? `<div class="tt-meta">${Utils.escapeHtml(ev.description)}</div>` : ''}
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
                  ${ev.location ? `<span class="tt-room">${Utils.escapeHtml(ev.location)}</span>` : '<span></span>'}
                  <span style="font-size:10px; color:var(--text-muted);">${Utils.escapeHtml(ev.category || '')}</span>
                </div>
              </div>
            `).join('')}
          </div>
        `;
        hIdx += spanCols;
      } else {
        const slotIso = Utils.toLocalInputDateTime(new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), slotHour, 0));
        gridHtml += `<div class="tt-slot" onclick="openEventModal('${slotIso}')" title="Click to add event at ${slotHour}:00"></div>`;
        hIdx++;
      }
    }
  }

  container.innerHTML = `
    <div class="timetable-ondemand-bar">
      <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
        <span class="badge badge-medium">ON DEMAND</span>
        <strong>COC104 — Algorithm Analysis</strong>
        <span style="color:var(--text-secondary);">Dr Robert Mercas</span>
        <span style="color:var(--text-muted); font-family:var(--font-mono); font-size:11.5px;">Lecture · Weeks: Sem 1: 1 - 6, 8 - 11</span>
      </div>
      <a href="https://learn.lboro.ac.uk" target="_blank" rel="noopener noreferrer" class="btn btn-sm">Go to Learn ${Icons.external}</a>
    </div>

    <div class="timetable-wrapper">
      <div class="timetable-grid">
        ${gridHtml}
      </div>
    </div>
  `;
}

function renderMonthGrid(container, year, month) {
  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const gridStartDate = new Date(year, month, 1 - startDayOffset);

  const today = new Date();
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const combinedItems = [
    ...State.events.map((e) => ({
      id: e.id,
      isEvent: true,
      title: e.title,
      start_time: e.start_time,
      end_time: e.end_time,
      color: e.color || '#e07a5f'
    })),
    ...State.assignments
      .filter((a) => a.status !== 'submitted')
      .map((a) => ({
        id: `assign-${a.id}`,
        isAssignment: true,
        title: `[DUE] ${a.course_code ? a.course_code + ': ' : ''}${a.title}`,
        start_time: a.due_date,
        end_time: a.due_date,
        color: '#ef4444'
      }))
  ];

  let cellsHtml = dayNames.map((d) => `<div class="cal-day-header">${d}</div>`).join('');

  for (let i = 0; i < 42; i++) {
    const cellDate = new Date(gridStartDate.getFullYear(), gridStartDate.getMonth(), gridStartDate.getDate() + i);
    const isCurrentMonth = cellDate.getMonth() === month;
    const isToday =
      cellDate.getDate() === today.getDate() &&
      cellDate.getMonth() === today.getMonth() &&
      cellDate.getFullYear() === today.getFullYear();

    const dayStart = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate(), 0, 0, 0);
    const dayEnd = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate(), 23, 59, 59);

    const dayEvents = combinedItems.filter((ev) => {
      const st = new Date(ev.start_time);
      return st >= dayStart && st <= dayEnd;
    });

    const dateIso = Utils.toLocalInputDateTime(new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate(), 10, 0));

    cellsHtml += `
      <div class="cal-cell ${isCurrentMonth ? '' : 'outside'} ${isToday ? 'today' : ''}" onclick="openEventModal('${dateIso}')">
        <div class="cal-date-num">${cellDate.getDate()}</div>
        ${dayEvents.slice(0, 4).map((ev) => `
          <div class="cal-pill" style="background-color:${Utils.escapeHtml(ev.color)};" onclick="event.stopPropagation(); ${ev.isEvent ? `inspectCalendarEvent(${ev.id})` : `switchView('courses')`}" title="${Utils.escapeHtml(ev.title)}">
            ${Utils.formatTime(ev.start_time)} ${Utils.escapeHtml(ev.title)}
          </div>
        `).join('')}
        ${dayEvents.length > 4 ? `<div style="font-size:10.5px; color:var(--text-muted); padding-left:4px;">+${dayEvents.length - 4} more</div>` : ''}
      </div>
    `;
  }

  container.innerHTML = `<div class="cal-month-grid">${cellsHtml}</div>`;
}

function renderAgendaList(container) {
  const sorted = [...State.events].sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  if (sorted.length === 0) {
    container.innerHTML = `<div class="panel"><div class="empty-state">No events scheduled.</div></div>`;
    return;
  }

  container.innerHTML = `
    <div class="panel">
      <div class="panel-header">
        <span class="panel-title">All Scheduled Sessions &amp; Personal Events (${sorted.length})</span>
      </div>
      <div class="panel-body">
        <div class="item-list">
          ${sorted.map((ev) => `
            <div class="schedule-item" style="border-left-color:${Utils.escapeHtml(ev.color || '#e07a5f')};">
              <div class="schedule-time" style="min-width:145px;">
                <div style="font-weight:600; color:var(--text-primary)">${Utils.formatShortDate(ev.start_time)}</div>
                <div>${ev.all_day ? 'All Day' : `${Utils.formatTime(ev.start_time)} - ${Utils.formatTime(ev.end_time)}`}</div>
              </div>
              <div class="schedule-info">
                <div class="schedule-title">${Utils.escapeHtml(ev.title)}</div>
                <div class="schedule-sub">
                  ${ev.location ? `${Utils.escapeHtml(ev.location)} · ` : ''}${Utils.escapeHtml(ev.category || 'Session')}
                </div>
              </div>
              <button class="icon-btn" onclick="deleteEventItem(${ev.id})" title="Delete event">${Icons.trash}</button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function navigateCalendarStep(delta) {
  if (State.calendarMode === 'timetable') {
    State.calendarDate = new Date(
      State.calendarDate.getFullYear(),
      State.calendarDate.getMonth(),
      State.calendarDate.getDate() + delta * 7
    );
  } else {
    State.calendarDate = new Date(State.calendarDate.getFullYear(), State.calendarDate.getMonth() + delta, 1);
  }
  renderActiveView();
}

function resetCalendarToday() {
  State.calendarDate = new Date(2026, 10, 16);
  renderActiveView();
}

function setCalendarMode(mode) {
  State.calendarMode = mode;
  renderActiveView();
}

async function deleteEventItem(id) {
  await API.deleteEvent(id);
  await refreshAllData();
  showToast('Event removed');
}

function inspectCalendarEvent(id) {
  const ev = State.events.find((e) => e.id === id);
  if (!ev) return;

  openModal(`
    <div class="modal-header">
      <span class="modal-title">${Utils.escapeHtml(ev.title)}</span>
      <button class="icon-btn" onclick="closeModal()">X</button>
    </div>
    <div class="modal-body">
      <div style="display:flex; gap:8px; align-items:center;">
        <span class="badge badge-medium">${Utils.escapeHtml(ev.category || 'Event')}</span>
        <span style="font-family:var(--font-mono); font-size:12px; color:var(--text-secondary);">
          ${Utils.formatDateTime(ev.start_time)} — ${Utils.formatTime(ev.end_time)}
        </span>
      </div>
      ${ev.location ? `<div><strong>Location:</strong> <span style="color:var(--text-secondary);">${Utils.escapeHtml(ev.location)}</span></div>` : ''}
      ${ev.description ? `<div style="white-space:pre-wrap; color:var(--text-secondary); font-size:13px; background:var(--bg-subtle); padding:12px; border-radius:8px; border:1px solid var(--border-hairline);">${Utils.escapeHtml(ev.description)}</div>` : ''}
    </div>
    <div class="modal-footer">
      <button class="btn btn-danger" onclick="deleteEventItem(${ev.id}); closeModal();">Delete Event</button>
      <button class="btn" onclick="closeModal()">Close</button>
    </div>
  `);
}

/* ==========================================================================
   3. COURSES & COURSEWORK DEADLINES VIEW
   ========================================================================== */
function renderCoursesView(root) {
  const filteredAssignments = State.courseFilterId
    ? State.assignments.filter((a) => String(a.course_id) === String(State.courseFilterId))
    : State.assignments;

  root.innerHTML = `
    <div class="bento-grid">
      <div class="panel col-12">
        <div class="panel-header">
          <div class="panel-title-wrap">
            <span class="panel-title">Loughborough Part C Modules (${State.courses.length})</span>
          </div>
          <div style="display:flex; gap:8px;">
            ${State.courseFilterId ? `<button class="btn btn-sm" onclick="filterCoursesBy('')">Show All Modules</button>` : ''}
            <button class="btn btn-sm btn-primary" onclick="openCourseModal()">${Icons.plus} <span>Add Module</span></button>
          </div>
        </div>
        <div class="panel-body">
          <div class="module-cards-grid">
            ${State.courses.map((c) => `
              <div class="module-card" style="border-top: 3.5px solid ${Utils.escapeHtml(c.color)};" onclick="filterCoursesBy('${c.id}')">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                  <span class="badge" style="background:${c.color}22; color:${c.color}; font-weight:700;">${Utils.escapeHtml(c.code)}</span>
                  <button class="icon-btn" onclick="event.stopPropagation(); deleteCourseItem(${c.id})" title="Delete module">${Icons.trash}</button>
                </div>
                <div style="font-family:var(--font-serif); font-size:17px; font-weight:600; margin-top:10px; color:var(--text-primary);">${Utils.escapeHtml(c.name)}</div>
                <div style="font-size:12px; color:var(--text-secondary); margin-top:4px;">
                  ${c.instructor ? `${Utils.escapeHtml(c.instructor)}` : ''}
                </div>
                ${c.location ? `<div style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono); margin-top:6px;">${Utils.escapeHtml(c.location)}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="panel col-12">
        <div class="panel-header">
          <div class="panel-title-wrap">
            ${Icons.clock}
            <span class="panel-title">Coursework &amp; Project Deliverables (${filteredAssignments.length})</span>
          </div>
          <button class="btn btn-primary btn-sm" onclick="openAssignmentModal()">${Icons.plus} <span>Add Deadline</span></button>
        </div>
        <div class="panel-body">
          <div class="item-list">
            ${filteredAssignments.length === 0
              ? `<div class="empty-state">No assessments recorded for this filter.</div>`
              : filteredAssignments.map((a) => {
                  const cd = Utils.relativeCountdown(a.due_date);
                  const isSubmitted = a.status === 'submitted';
                  return `
                    <div class="task-row ${isSubmitted ? 'done' : ''}">
                      <div class="task-left">
                        ${a.course_code ? `<span class="badge" style="background:${a.course_color}22; color:${a.course_color};">${Utils.escapeHtml(a.course_code)}</span>` : ''}
                        <div style="min-width:0; flex:1;">
                          <div class="task-title">${Utils.escapeHtml(a.title)}</div>
                          <div style="font-size:11.5px; color:var(--text-muted);">
                            ${Utils.escapeHtml(a.type)} · Due: ${Utils.formatDateTime(a.due_date)}
                            ${a.description ? ` — ${Utils.escapeHtml(a.description)}` : ''}
                          </div>
                        </div>
                      </div>
                      <div class="task-meta">
                        <select class="select" style="width:130px; padding:4px 8px; font-size:11.5px;" onchange="updateAssignmentStatus(${a.id}, this.value)">
                          <option value="not_started" ${a.status === 'not_started' ? 'selected' : ''}>Not Started</option>
                          <option value="in_progress" ${a.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                          <option value="review" ${a.status === 'review' ? 'selected' : ''}>Final Review</option>
                          <option value="submitted" ${a.status === 'submitted' ? 'selected' : ''}>Submitted</option>
                        </select>
                        <span class="badge ${isSubmitted ? 'badge-low' : cd.urgent ? 'badge-critical' : 'badge-medium'}">
                          ${isSubmitted ? 'Submitted' : cd.text}
                        </span>
                        <button class="icon-btn" onclick="deleteAssignmentItem(${a.id})" title="Delete deadline">${Icons.trash}</button>
                      </div>
                    </div>
                  `;
                }).join('')
            }
          </div>
        </div>
      </div>
    </div>
  `;
}

function filterCoursesBy(courseId) {
  State.courseFilterId = courseId;
  renderActiveView();
}

async function updateAssignmentStatus(id, status) {
  await API.updateAssignment(id, { status });
  await refreshAllData();
  showToast('Status updated');
}

async function deleteCourseItem(id) {
  await API.deleteCourse(id);
  await refreshAllData();
  showToast('Module deleted');
}

async function deleteAssignmentItem(id) {
  await API.deleteAssignment(id);
  await refreshAllData();
  showToast('Deadline removed');
}

/* ==========================================================================
   4. TASKS & LIFE QUEUE VIEW
   ========================================================================== */
function renderTasksView(root) {
  const filtered = State.tasks.filter((t) => {
    if (State.taskFilterStatus === 'active' && t.status === 'done') return false;
    if (State.taskFilterStatus === 'done' && t.status !== 'done') return false;
    if (State.taskFilterCourse && String(t.course_id) !== String(State.taskFilterCourse)) return false;
    return true;
  });

  root.innerHTML = `
    <div class="panel">
      <div class="panel-header">
        <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
          <div class="segmented-control">
            <button class="seg-btn ${State.taskFilterStatus === 'active' ? 'active' : ''}" onclick="setTaskFilter('active')">Active (${State.tasks.filter((t) => t.status !== 'done').length})</button>
            <button class="seg-btn ${State.taskFilterStatus === 'done' ? 'active' : ''}" onclick="setTaskFilter('done')">Completed (${State.tasks.filter((t) => t.status === 'done').length})</button>
            <button class="seg-btn ${State.taskFilterStatus === 'all' ? 'active' : ''}" onclick="setTaskFilter('all')">All (${State.tasks.length})</button>
          </div>
          <select class="select" style="width:200px; padding:5px 10px; font-size:12px;" onchange="setTaskCourseFilter(this.value)">
            <option value="">All Life &amp; Uni Categories</option>
            ${State.courses.map((c) => `<option value="${c.id}" ${String(State.taskFilterCourse) === String(c.id) ? 'selected' : ''}>${Utils.escapeHtml(c.code)} - ${Utils.escapeHtml(c.name)}</option>`).join('')}
          </select>
        </div>
        <button class="btn btn-primary btn-sm" onclick="openTaskModal()">${Icons.plus} <span>New Task</span></button>
      </div>
      <div class="panel-body">
        <div class="item-list">
          ${filtered.length === 0
            ? `<div class="empty-state">No tasks match the current filter.</div>`
            : filtered.map((t) => renderTaskRowHtml(t)).join('')
          }
        </div>
      </div>
    </div>
  `;
}

function setTaskFilter(status) {
  State.taskFilterStatus = status;
  renderActiveView();
}

function setTaskCourseFilter(courseId) {
  State.taskFilterCourse = courseId;
  renderActiveView();
}

/* ==========================================================================
   5. JOURNAL & MODULE NOTES WORKSPACE
   ========================================================================== */
function renderNotesView(root) {
  const filteredNotes = State.notes.filter((n) => {
    if (State.noteCourseFilter === 'all') return true;
    if (State.noteCourseFilter === 'general') return n.course_id === null;
    return String(n.course_id) === String(State.noteCourseFilter);
  });

  const activeNote =
    filteredNotes.find((n) => n.id === State.selectedNoteId) ||
    filteredNotes[0] ||
    null;

  root.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
      <div style="display:flex; gap:8px; align-items:center;">
        <select class="select" style="width:240px;" onchange="setNoteCourseFilter(this.value)">
          <option value="all" ${State.noteCourseFilter === 'all' ? 'selected' : ''}>All Journal &amp; Module Notes (${State.notes.length})</option>
          <option value="general" ${State.noteCourseFilter === 'general' ? 'selected' : ''}>Personal Journal / Scratchpad</option>
          ${State.courses.map((c) => `<option value="${c.id}" ${String(State.noteCourseFilter) === String(c.id) ? 'selected' : ''}>${Utils.escapeHtml(c.code)} - ${Utils.escapeHtml(c.name)}</option>`).join('')}
        </select>
      </div>
      <div style="display:flex; gap:8px;">
        <div class="segmented-control">
          <button class="seg-btn ${State.noteViewMode === 'split' ? 'active' : ''}" onclick="setNoteViewMode('split')">Split Editor</button>
          <button class="seg-btn ${State.noteViewMode === 'preview' ? 'active' : ''}" onclick="setNoteViewMode('preview')">Reader View</button>
        </div>
        <button class="btn btn-sm btn-primary" onclick="createNewNoteItem()">${Icons.plus} <span>New Note</span></button>
      </div>
    </div>

    <div class="split-pane">
      <div class="panel">
        <div class="pane-scroll">
          ${filteredNotes.length === 0
            ? `<div class="empty-state">No notes in this section.</div>`
            : filteredNotes.map((n) => `
              <div class="email-list-item ${activeNote && activeNote.id === n.id ? 'active' : ''}" onclick="selectNoteItem(${n.id})">
                <div class="email-sender-row">
                  <span>${n.course_code ? `<span class="badge" style="background:${n.course_color}22; color:${n.course_color}; font-size:10px; padding:1px 6px;">${Utils.escapeHtml(n.course_code)}</span>` : `<span class="badge badge-low" style="font-size:10px; padding:1px 6px;">Personal</span>`}</span>
                  <span style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono);">${Utils.formatShortDate(n.updated_at)}</span>
                </div>
                <div class="email-subject" style="font-weight:600; color:var(--text-primary); margin-top:4px;">${Utils.escapeHtml(n.title)}</div>
                <div class="email-snippet">${Utils.escapeHtml(n.content.slice(0, 100))}</div>
              </div>
            `).join('')
          }
        </div>
      </div>

      <div class="panel">
        ${!activeNote
          ? `<div class="empty-state">Select or create a note.</div>`
          : `
            <div class="panel-header">
              <input type="text" class="input" id="active-note-title" value="${Utils.escapeHtml(activeNote.title)}" style="font-weight:600; font-size:14px; max-width:380px;" />
              <div style="display:flex; gap:8px; align-items:center;">
                <span id="note-save-indicator" style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono);">Saved</span>
                <button class="btn btn-sm" onclick="toggleNotePin(${activeNote.id}, ${activeNote.pinned})">
                  ${activeNote.pinned ? 'Pinned to Briefing' : 'Pin to Briefing'}
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteNoteItem(${activeNote.id})">Delete</button>
              </div>
            </div>
            <div class="panel-body" style="display:grid; grid-template-columns:${State.noteViewMode === 'split' ? '1fr 1fr' : '1fr'}; gap:16px; height:100%; overflow:hidden;">
              ${State.noteViewMode !== 'preview' ? `
                <textarea class="textarea" id="active-note-content" style="height:100%; font-family:var(--font-mono); font-size:12.5px; resize:none;">${Utils.escapeHtml(activeNote.content)}</textarea>
              ` : ''}
              <div class="markdown-body pane-scroll" id="active-note-preview" style="background:var(--bg-subtle); padding:18px; border-radius:var(--radius-sm); border:1px solid var(--border-hairline);">
                ${Utils.renderMarkdown(activeNote.content)}
              </div>
            </div>
          `
        }
      </div>
    </div>
  `;

  if (activeNote) {
    const titleEl = document.getElementById('active-note-title');
    const contentEl = document.getElementById('active-note-content');
    const previewEl = document.getElementById('active-note-preview');
    const statusEl = document.getElementById('note-save-indicator');
    let timer = null;

    const triggerSave = () => {
      if (statusEl) statusEl.textContent = 'Saving...';
      if (previewEl && contentEl) {
        previewEl.innerHTML = Utils.renderMarkdown(contentEl.value);
      }
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const newTitle = titleEl ? titleEl.value : activeNote.title;
        const newContent = contentEl ? contentEl.value : activeNote.content;
        await API.updateNote(activeNote.id, { title: newTitle, content: newContent });
        activeNote.title = newTitle;
        activeNote.content = newContent;
        if (statusEl) statusEl.textContent = 'Saved';
      }, 500);
    };

    if (titleEl) titleEl.addEventListener('input', triggerSave);
    if (contentEl) contentEl.addEventListener('input', triggerSave);
  }
}

function setNoteCourseFilter(val) {
  State.noteCourseFilter = val;
  renderActiveView();
}

function setNoteViewMode(mode) {
  State.noteViewMode = mode;
  renderActiveView();
}

function selectNoteItem(id) {
  State.selectedNoteId = id;
  renderActiveView();
}

async function createNewNoteItem() {
  const courseId = State.noteCourseFilter !== 'all' && State.noteCourseFilter !== 'general'
    ? Number(State.noteCourseFilter)
    : null;
  const created = await API.createNote({
    title: 'Untitled Entry',
    course_id: courseId,
    content: '# Notes\n\n- '
  });
  State.selectedNoteId = created.id;
  await refreshAllData();
}

async function toggleNotePin(id, currentPin) {
  await API.updateNote(id, { pinned: currentPin ? 0 : 1 });
  await refreshAllData();
  showToast(currentPin ? 'Note unpinned' : 'Note pinned to Daily Briefing');
}

async function deleteNoteItem(id) {
  await API.deleteNote(id);
  State.selectedNoteId = null;
  await refreshAllData();
  showToast('Note deleted');
}

/* ==========================================================================
   MODAL WORKFLOWS
   ========================================================================== */
function openModal(html) {
  const backdrop = document.getElementById('modal-backdrop');
  const card = document.getElementById('modal-card');
  card.innerHTML = html;
  backdrop.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-backdrop').classList.add('hidden');
}

function openIcsFeedsModal() {
  openModal(`
    <div class="modal-header">
      <span class="modal-title">Calendar (.ics / iCal) Sync</span>
      <button class="icon-btn" onclick="closeModal()">X</button>
    </div>
    <div class="modal-body">
      <div style="font-size:12.5px; color:var(--text-secondary); background:var(--bg-subtle); padding:10px 12px; border-radius:8px; border:1px solid var(--border-hairline);">
        Paste any <strong>iCal / .ics feed URL</strong> (Loughborough, Google Calendar, Apple iCloud, Outlook) or upload a local <code>.ics</code> file.
      </div>

      <form id="form-add-ics-url" style="display:flex; flex-direction:column; gap:10px;">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Feed Label</label>
            <input type="text" class="input" id="ics-name" placeholder="e.g. Personal / Uni Calendar" required />
          </div>
          <div class="form-group">
            <label class="form-label">Accent Color</label>
            <input type="color" class="input" id="ics-color" value="#e07a5f" style="height:36px; padding:3px;" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">iCal Subscription URL (https:// or webcal://)</label>
          <div style="display:flex; gap:8px;">
            <input type="text" class="input" id="ics-url" placeholder="https://.../calendar/feed.ics" required />
            <button type="submit" class="btn btn-primary">Sync URL</button>
          </div>
        </div>
      </form>

      <div style="border-top:1px solid var(--border-hairline); padding-top:12px;">
        <label class="form-label" style="display:block; margin-bottom:6px;">Or Upload a Local .ics File</label>
        <input type="file" accept=".ics,text/calendar" class="input" id="ics-file-input" />
      </div>

      <div style="border-top:1px solid var(--border-hairline); padding-top:12px;">
        <div class="form-label" style="margin-bottom:8px;">Active Calendar Feeds (${State.feeds.length})</div>
        <div class="item-list">
          ${State.feeds.map((f) => `
            <div class="task-row">
              <div class="task-left">
                <span style="width:10px; height:10px; border-radius:50%; background:${Utils.escapeHtml(f.color)}; display:inline-block;"></span>
                <div>
                  <div class="task-title">${Utils.escapeHtml(f.name)} (${f.event_count} events)</div>
                  <div style="font-size:11px; color:var(--text-muted);">Synced: ${f.last_synced_at || 'Pre-loaded'}</div>
                </div>
              </div>
              <div class="task-meta">
                ${f.source_type === 'url' ? `<button class="btn btn-sm" onclick="resyncFeedItem(${f.id})">Sync</button>` : ''}
                <button class="icon-btn" onclick="deleteFeedItem(${f.id})">${Icons.trash}</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn" onclick="closeModal()">Done</button>
    </div>
  `);

  document.getElementById('form-add-ics-url').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('ics-name').value;
    const url = document.getElementById('ics-url').value;
    const color = document.getElementById('ics-color').value;
    try {
      showToast('Fetching .ics feed...');
      await API.addUrlFeed({ name, url, color });
      await refreshAllData();
      openIcsFeedsModal();
      showToast('Calendar feed synced');
    } catch (err) {
      showToast(err.message);
    }
  });

  document.getElementById('ics-file-input').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    const name = document.getElementById('ics-name').value || file.name.replace(/\.ics$/i, '');
    const color = document.getElementById('ics-color').value || '#52b788';
    try {
      await API.addFileFeed({ name, ics_content: text, color });
      await refreshAllData();
      openIcsFeedsModal();
      showToast(`Imported events from ${file.name}`);
    } catch (err) {
      showToast(err.message);
    }
  });
}

async function resyncFeedItem(id) {
  try {
    await API.syncFeed(id);
    await refreshAllData();
    openIcsFeedsModal();
    showToast('Feed re-synced');
  } catch (err) {
    showToast(err.message);
  }
}

async function deleteFeedItem(id) {
  await API.deleteFeed(id);
  await refreshAllData();
  openIcsFeedsModal();
  showToast('Calendar feed removed');
}

function openEventModal(defaultStartIso) {
  const startVal = defaultStartIso || Utils.toLocalInputDateTime(new Date());
  const endObj = new Date(new Date(startVal).getTime() + 3600000);
  const endVal = Utils.toLocalInputDateTime(endObj);

  openModal(`
    <div class="modal-header">
      <span class="modal-title">Add Schedule Event</span>
      <button class="icon-btn" onclick="closeModal()">X</button>
    </div>
    <form id="form-create-event">
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Event Title</label>
          <input type="text" class="input" id="ev-title" placeholder="e.g. Gym Session, Dinner with Friends, Study Block" required />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Category</label>
            <select class="select" id="ev-category">
              <option value="Personal" selected>Personal / Life</option>
              <option value="Meeting">Meeting</option>
              <option value="Lecture">Lecture</option>
              <option value="Lab">Lab / Practical</option>
              <option value="Seminar">Workshop / Seminar</option>
              <option value="Exam">Exam</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Location</label>
            <input type="text" class="input" id="ev-location" placeholder="e.g. Holywell Gym / Town / Room" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Start Date &amp; Time</label>
            <input type="datetime-local" class="input" id="ev-start" value="${startVal}" required />
          </div>
          <div class="form-group">
            <label class="form-label">End Date &amp; Time</label>
            <input type="datetime-local" class="input" id="ev-end" value="${endVal}" required />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Course Module (If Uni)</label>
            <select class="select" id="ev-course">
              <option value="">Personal / Non-Uni</option>
              ${State.courses.map((c) => `<option value="${c.id}">${Utils.escapeHtml(c.code)} - ${Utils.escapeHtml(c.name)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Color</label>
            <input type="color" class="input" id="ev-color" value="#e07a5f" style="height:36px; padding:3px;" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Notes</label>
          <textarea class="textarea" id="ev-desc" style="min-height:65px;"></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Save Event</button>
      </div>
    </form>
  `);

  document.getElementById('form-create-event').addEventListener('submit', async (e) => {
    e.preventDefault();
    await API.createEvent({
      title: document.getElementById('ev-title').value,
      category: document.getElementById('ev-category').value,
      location: document.getElementById('ev-location').value,
      start_time: new Date(document.getElementById('ev-start').value).toISOString(),
      end_time: new Date(document.getElementById('ev-end').value).toISOString(),
      course_id: document.getElementById('ev-course').value || null,
      color: document.getElementById('ev-color').value,
      description: document.getElementById('ev-desc').value
    });
    closeModal();
    await refreshAllData();
    showToast('Event added to schedule');
  });
}

function openTaskModal() {
  openModal(`
    <div class="modal-header">
      <span class="modal-title">New Life or Uni Task</span>
      <button class="icon-btn" onclick="closeModal()">X</button>
    </div>
    <form id="form-create-task">
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Task Title</label>
          <input type="text" class="input" id="tk-title" placeholder="What needs to get done?" required />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Priority</label>
            <select class="select" id="tk-priority">
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium" selected>Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Category / Module</label>
            <select class="select" id="tk-course">
              <option value="">Personal / Life</option>
              ${State.courses.map((c) => `<option value="${c.id}">${Utils.escapeHtml(c.code)} - ${Utils.escapeHtml(c.name)}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Due Date (Optional)</label>
            <input type="datetime-local" class="input" id="tk-due" />
          </div>
          <div class="form-group" style="justify-content:flex-end;">
            <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:13px; padding-bottom:8px;">
              <input type="checkbox" id="tk-top" checked />
              <span>Pin to Daily Briefing</span>
            </label>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Notes</label>
          <textarea class="textarea" id="tk-desc" style="min-height:65px;"></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Create Task</button>
      </div>
    </form>
  `);

  document.getElementById('form-create-task').addEventListener('submit', async (e) => {
    e.preventDefault();
    const dueVal = document.getElementById('tk-due').value;
    await API.createTask({
      title: document.getElementById('tk-title').value,
      priority: document.getElementById('tk-priority').value,
      course_id: document.getElementById('tk-course').value || null,
      due_date: dueVal ? new Date(dueVal).toISOString() : null,
      is_top_priority: document.getElementById('tk-top').checked ? 1 : 0,
      description: document.getElementById('tk-desc').value
    });
    closeModal();
    await refreshAllData();
    showToast('Task added');
  });
}

function openCourseModal() {
  openModal(`
    <div class="modal-header">
      <span class="modal-title">Add Module</span>
      <button class="icon-btn" onclick="closeModal()">X</button>
    </div>
    <form id="form-create-course">
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Module Code</label>
            <input type="text" class="input" id="cr-code" placeholder="e.g. COC104" required />
          </div>
          <div class="form-group">
            <label class="form-label">Badge Color</label>
            <input type="color" class="input" id="cr-color" value="#e07a5f" style="height:36px; padding:3px;" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Module Name</label>
          <input type="text" class="input" id="cr-name" placeholder="e.g. Algorithm Analysis" required />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Lecturer</label>
            <input type="text" class="input" id="cr-inst" placeholder="e.g. Dr Robert Mercas" />
          </div>
          <div class="form-group">
            <label class="form-label">Room / Building</label>
            <input type="text" class="input" id="cr-loc" placeholder="e.g. CC012 (James France)" />
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Save Module</button>
      </div>
    </form>
  `);

  document.getElementById('form-create-course').addEventListener('submit', async (e) => {
    e.preventDefault();
    await API.createCourse({
      code: document.getElementById('cr-code').value,
      name: document.getElementById('cr-name').value,
      instructor: document.getElementById('cr-inst').value,
      location: document.getElementById('cr-loc').value,
      color: document.getElementById('cr-color').value
    });
    closeModal();
    await refreshAllData();
    showToast('Module added');
  });
}

function openAssignmentModal() {
  const defaultDue = Utils.toLocalInputDateTime(new Date(Date.now() + 7 * 86400000));
  openModal(`
    <div class="modal-header">
      <span class="modal-title">Add Coursework or Exam Deadline</span>
      <button class="icon-btn" onclick="closeModal()">X</button>
    </div>
    <form id="form-create-assignment">
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Assessment Title</label>
          <input type="text" class="input" id="as-title" placeholder="e.g. 26COC118_CW_Project" required />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Module</label>
            <select class="select" id="as-course">
              ${State.courses.map((c) => `<option value="${c.id}">${Utils.escapeHtml(c.code)} - ${Utils.escapeHtml(c.name)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Assessment Type</label>
            <select class="select" id="as-type">
              <option value="Coursework">Coursework</option>
              <option value="Exam">Exam</option>
              <option value="Lab">Assessed Lab</option>
              <option value="Project">Project</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Submission Deadline</label>
            <input type="datetime-local" class="input" id="as-due" value="${defaultDue}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Module Weight (%)</label>
            <input type="number" class="input" id="as-weight" value="25" min="0" max="100" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Notes</label>
          <textarea class="textarea" id="as-desc" style="min-height:65px;"></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Save Deadline</button>
      </div>
    </form>
  `);

  document.getElementById('form-create-assignment').addEventListener('submit', async (e) => {
    e.preventDefault();
    await API.createAssignment({
      title: document.getElementById('as-title').value,
      course_id: document.getElementById('as-course').value || null,
      type: document.getElementById('as-type').value,
      due_date: new Date(document.getElementById('as-due').value).toISOString(),
      weight: Number(document.getElementById('as-weight').value) || 0,
      description: document.getElementById('as-desc').value
    });
    closeModal();
    await refreshAllData();
    showToast('Deadline added');
  });
}

function openBookmarkModal() {
  openModal(`
    <div class="modal-header">
      <span class="modal-title">Add Quick Launch Link</span>
      <button class="icon-btn" onclick="closeModal()">X</button>
    </div>
    <form id="form-create-bookmark">
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Title</label>
          <input type="text" class="input" id="bm-title" placeholder="e.g. YouTube, Reddit, Gym Portal" required />
        </div>
        <div class="form-group">
          <label class="form-label">URL</label>
          <input type="text" class="input" id="bm-url" placeholder="https://..." required />
        </div>
        <div class="form-group">
          <label class="form-label">Category</label>
          <select class="select" id="bm-cat">
            <option value="Life">Life &amp; Media</option>
            <option value="University">University</option>
            <option value="Email">Email</option>
            <option value="Development">Development</option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Add Link</button>
      </div>
    </form>
  `);

  document.getElementById('form-create-bookmark').addEventListener('submit', async (e) => {
    e.preventDefault();
    await API.createBookmark({
      title: document.getElementById('bm-title').value,
      url: document.getElementById('bm-url').value,
      category: document.getElementById('bm-cat').value
    });
    closeModal();
    await refreshAllData();
    showToast('Link added');
  });
}

function applyVisualTheme(themeName) {
  const valid = ['espresso', 'editorial', 'nordic'].includes(themeName) ? themeName : 'espresso';
  document.documentElement.setAttribute('data-theme', valid);
  localStorage.setItem('gabrielius_theme', valid);
  document.querySelectorAll('.theme-btn[data-theme-opt]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.themeOpt === valid);
  });
}

function applyUiZoom(zoomPct) {
  const clamped = Math.max(85, Math.min(135, zoomPct));
  State.uiZoom = clamped;
  localStorage.setItem('gabrielius_zoom', String(clamped));
  const scale = clamped / 100;
  document.documentElement.style.setProperty('--ui-zoom', String(scale));
  document.documentElement.style.zoom = `${clamped}%`;
  const lbl = document.getElementById('zoom-level-label');
  if (lbl) lbl.textContent = `${clamped}%`;
}

function applySidebarCollapse(collapsed) {
  State.sidebarCollapsed = collapsed;
  localStorage.setItem('gabrielius_sidebar_collapsed', collapsed ? '1' : '0');
  const shell = document.getElementById('app-shell');
  if (shell) shell.classList.toggle('sidebar-collapsed', collapsed);
  const collapseBtn = document.getElementById('btn-collapse-sidebar');
  if (collapseBtn) {
    collapseBtn.innerHTML = collapsed ? Icons.chevronRight : Icons.chevronLeft;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('gabrielius_theme') || 'espresso';
  applyVisualTheme(savedTheme);

  // Restore saved UI Zoom & Sidebar Collapse state
  applyUiZoom(State.uiZoom);
  applySidebarCollapse(State.sidebarCollapsed);

  document.querySelectorAll('.theme-btn[data-theme-opt]').forEach((btn) => {
    btn.addEventListener('click', () => applyVisualTheme(btn.dataset.themeOpt));
  });

  const btnCollapse = document.getElementById('btn-collapse-sidebar');
  if (btnCollapse) {
    btnCollapse.addEventListener('click', () => applySidebarCollapse(!State.sidebarCollapsed));
  }

  const btnZoomIn = document.getElementById('btn-zoom-in');
  const btnZoomOut = document.getElementById('btn-zoom-out');
  const zoomLabel = document.getElementById('zoom-level-label');
  if (btnZoomIn) btnZoomIn.addEventListener('click', () => applyUiZoom(State.uiZoom + 5));
  if (btnZoomOut) btnZoomOut.addEventListener('click', () => applyUiZoom(State.uiZoom - 5));
  if (zoomLabel) {
    zoomLabel.style.cursor = 'pointer';
    zoomLabel.title = 'Click to reset to 100%';
    zoomLabel.addEventListener('click', () => applyUiZoom(100));
  }

  updateClock();
  setInterval(updateClock, 1000);

  document.querySelectorAll('.nav-btn[data-view]').forEach((btn) => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  document.getElementById('btn-global-ics').addEventListener('click', openIcsFeedsModal);
  document.getElementById('btn-global-event').addEventListener('click', () => openEventModal());
  document.getElementById('btn-global-task').addEventListener('click', openTaskModal);

  document.getElementById('modal-backdrop').addEventListener('click', (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  refreshAllData();
});
