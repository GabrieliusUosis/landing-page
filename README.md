# Academic & Engineering Command Center

A local-first full-stack personal dashboard designed for university modules, iCal/ICS timetable synchronization, coursework deadlines, prioritized tasks, per-course Markdown notes, and a unified multi-provider email hub (Outlook 365, Gmail, and Proton Mail).

## Architecture

- **Backend (`server/`)**: Node.js + Express REST API backed by Node's native `node:sqlite` (`data/command_center.sqlite` in WAL mode).
- **iCalendar RFC 5545 Engine (`server/services/icsParser.js`)**: Parses university `.ics` feeds (`https://` or `webcal://`) and local `.ics` files, including multi-line unfolding, `RRULE` recurring weekly lectures, and automatic event categorization.
- **Multi-Account Email Service (`server/services/emailService.js`)**: Connects via `imapflow` and `mailparser` to Gmail (`imap.gmail.com:993`), Outlook 365 (`outlook.office365.com:993`), and Proton Mail Local Bridge (`127.0.0.1:1143`).
- **Frontend (`public/`)**: Responsive, zero-dependency modular JavaScript application with custom SVG iconography and a dark engineering theme.

## Quick Start

1. Double-click **`Launch-Dashboard.bat`** to start the background server and open the dashboard in a standalone desktop application window.
2. Or start from a terminal:
   ```powershell
   npm.cmd start
   ```
   Then open `http://localhost:3847`.

## Connecting Your University Calendar (`.ics`)

1. In your university portal (Canvas, Blackboard, Moodle, TimeEdit, Celcat, or Outlook), copy your private **iCal / `.ics` feed link** (or download the `.ics` file).
2. In the Command Center top bar, click **Link Uni iCal (.ics)**.
3. Paste the URL and click **Sync URL**, or choose a local `.ics` file to import.
4. You can also test immediately using `data/sample_uni_timetable.ics`.
