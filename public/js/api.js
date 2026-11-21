const API = {
  async request(url, options = {}) {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Request failed (${res.status})`);
    }
    return data;
  },

  getOverview() {
    return this.request('/api/overview');
  },

  // Live Pulse: News & Weather
  getNews(category = 'uk') {
    return this.request(`/api/pulse/news?category=${encodeURIComponent(category)}`);
  },
  getWeather(city = 'loughborough') {
    return this.request(`/api/pulse/weather?city=${encodeURIComponent(city)}`);
  },

  // Tasks
  getTasks(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/api/tasks${qs ? '?' + qs : ''}`);
  },
  createTask(payload) {
    return this.request('/api/tasks', { method: 'POST', body: JSON.stringify(payload) });
  },
  updateTask(id, payload) {
    return this.request(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  deleteTask(id) {
    return this.request(`/api/tasks/${id}`, { method: 'DELETE' });
  },

  // Calendar Events & .ics Feeds
  getEvents(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/api/calendar/events${qs ? '?' + qs : ''}`);
  },
  createEvent(payload) {
    return this.request('/api/calendar/events', { method: 'POST', body: JSON.stringify(payload) });
  },
  updateEvent(id, payload) {
    return this.request(`/api/calendar/events/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  deleteEvent(id) {
    return this.request(`/api/calendar/events/${id}`, { method: 'DELETE' });
  },
  getFeeds() {
    return this.request('/api/calendar/feeds');
  },
  addUrlFeed(payload) {
    return this.request('/api/calendar/feeds/url', { method: 'POST', body: JSON.stringify(payload) });
  },
  addFileFeed(payload) {
    return this.request('/api/calendar/feeds/file', { method: 'POST', body: JSON.stringify(payload) });
  },
  syncFeed(id) {
    return this.request(`/api/calendar/feeds/${id}/sync`, { method: 'POST' });
  },
  deleteFeed(id) {
    return this.request(`/api/calendar/feeds/${id}`, { method: 'DELETE' });
  },

  // Courses & Assignments
  getCourses() {
    return this.request('/api/courses');
  },
  createCourse(payload) {
    return this.request('/api/courses', { method: 'POST', body: JSON.stringify(payload) });
  },
  deleteCourse(id) {
    return this.request(`/api/courses/${id}`, { method: 'DELETE' });
  },
  getAssignments(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/api/courses/assignments${qs ? '?' + qs : ''}`);
  },
  createAssignment(payload) {
    return this.request('/api/courses/assignments', { method: 'POST', body: JSON.stringify(payload) });
  },
  updateAssignment(id, payload) {
    return this.request(`/api/courses/assignments/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  deleteAssignment(id) {
    return this.request(`/api/courses/assignments/${id}`, { method: 'DELETE' });
  },

  // Notes
  getNotes(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/api/notes${qs ? '?' + qs : ''}`);
  },
  createNote(payload) {
    return this.request('/api/notes', { method: 'POST', body: JSON.stringify(payload) });
  },
  updateNote(id, payload) {
    return this.request(`/api/notes/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  deleteNote(id) {
    return this.request(`/api/notes/${id}`, { method: 'DELETE' });
  },

  // Bookmarks
  getBookmarks() {
    return this.request('/api/bookmarks');
  },
  createBookmark(payload) {
    return this.request('/api/bookmarks', { method: 'POST', body: JSON.stringify(payload) });
  },
  deleteBookmark(id) {
    return this.request(`/api/bookmarks/${id}`, { method: 'DELETE' });
  }
};

const Utils = {
  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  formatTime(isoStr) {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  },

  formatShortDate(isoStr) {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
  },

  formatDateTime(isoStr) {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '';
    return `${this.formatShortDate(isoStr)}, ${this.formatTime(isoStr)}`;
  },

  timeAgo(isoStr) {
    if (!isoStr) return '';
    const diffSec = Math.max(0, Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000));
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    return `${diffDays}d ago`;
  },

  relativeCountdown(isoStr) {
    if (!isoStr) return { text: 'No date', urgent: false };
    const target = new Date(isoStr).getTime();
    const diffMs = target - Date.now();
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMs < 0) {
      const overdueDays = Math.abs(diffDays);
      return {
        text: overdueDays <= 1 ? 'Overdue' : `${overdueDays}d overdue`,
        urgent: true
      };
    }
    if (diffHours < 24) {
      return { text: diffHours <= 1 ? 'Due in <1h' : `Due in ${diffHours}h`, urgent: true };
    }
    if (diffDays <= 3) {
      return { text: `${diffDays}d left`, urgent: true };
    }
    return { text: `${diffDays}d left`, urgent: false };
  },

  toLocalInputDateTime(dateObj = new Date()) {
    const d = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000);
    return d.toISOString().slice(0, 16);
  },

  renderMarkdown(mdText) {
    if (!mdText) return '<p class="text-muted">Empty note.</p>';
    let html = this.escapeHtml(mdText);

    html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre><code>${code.trim()}</code></pre>`;
    });

    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    html = html.replace(/^- \[x\] (.+)$/gim, '<li><strong>[Done]</strong> $1</li>');
    html = html.replace(/^- \[ \] (.+)$/gm, '<li><strong>[Todo]</strong> $1</li>');
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, '');

    return html
      .split(/\n{2,}/)
      .map((block) => {
        const trimmed = block.trim();
        if (!trimmed) return '';
        if (/^<(h1|h2|h3|pre|ul|blockquote)/.test(trimmed)) return trimmed;
        return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;
      })
      .join('\n');
  }
};
