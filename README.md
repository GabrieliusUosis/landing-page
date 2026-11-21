# Academic & Engineering Command Center

A local-first full-stack personal dashboard designed for university modules, iCal/ICS timetable synchronization, coursework deadlines, prioritized tasks, per-course Markdown notes, live UK weather, and RSS news.

## Architecture

- **Backend (`server/`)**: Node.js + Express REST API backed by Node's native `node:sqlite` (`data/command_center.sqlite` in WAL mode).
- **iCalendar RFC 5545 Engine (`server/services/icsParser.js`)**: Parses university `.ics` feeds (`https://` or `webcal://`) and local `.ics` files, including multi-line unfolding, `RRULE` recurring weekly lectures, and automatic event categorization.
- **News & Weather Service (`server/services/newsAndWeather.js`)**: Aggregates BBC, Sky News, and The Guardian RSS feeds (`UK`, `World`, `Tech`) and fetches live UK forecasts via Open-Meteo.
- **Frontend (`public/`)**: Responsive, zero-dependency modular JavaScript application with custom SVG iconography and switchable visual themes (`Espresso`, `Paper`, `Nordic`).

## Quick Start

1. Double-click **`Launch-Dashboard.bat`** to start the background server and open the dashboard in a standalone desktop application window.
2. Or start from a terminal:
   ```powershell
   npm.cmd start
   ```
   Then open `http://localhost:3847`.

## Connecting Your University Calendar (`.ics`)

1. In your university portal (Canvas, Blackboard, Moodle, TimeEdit, Celcat, or Outlook), copy your private **iCal / `.ics` feed link** (or download the `.ics` file).
2. In the Command Center top bar, click **iCal**.
3. Paste the URL and click **Sync URL**, or choose a local `.ics` file to import.
4. You can also test immediately using `data/sample_uni_timetable.ics`.
