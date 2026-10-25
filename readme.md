# Athena — Desktop Examination & Proctoring Application

A fully functional desktop examination and automated proctoring application built with Electron, React, and Vite. Developed as an independent project for the Desktop Application course at Newton School of Technology, ADY Patil University.

## 📌 About the Project

Athena is a secure, proctored examination platform that runs as a native desktop application. It handles the complete exam lifecycle — from student setup and permission verification, through the live exam experience with anti-cheating safeguards, to detailed performance analytics and session audit reporting at the end.

## 🎯 Objectives

- Develop a fully functional desktop examination application.
- Implement automated proctoring to ensure academic integrity.
- Create a clean, intuitive, and responsive user interface.
- Apply modular React component architecture and state management.
- Understand Electron's main/renderer process model and IPC communication.
- Build a maintainable, scalable codebase with proper separation of concerns.

## ✨ Features

### 🔐 Setup & Permissions
- Webcam access request with live camera preview verification.
- Fullscreen / Kiosk mode lockdown before the exam starts.
- Electron native exam rules dialog with Accept / Cancel flow.
- Prerequisite validation — "Go To Test" is disabled until camera is configured.

### 📝 Exam Engine
- 10-question curated MCQ bank with categories and explanations.
- Live 60-minute countdown timer with three urgency stages:
  - 🟢 Normal → 🟡 Warning (< 5 minutes) → 🔴 Critical / Blinking (< 1 minute).
- Auto-submit when timer expires.
- Previous / Next navigation and direct question jumping.
- Mark for Review toggle and Clear Selection option per question.

### 🗺️ Question Palette
- Visual grid of all question numbers (1–10) with color-coded status chips:
  - 🟢 Answered | 🟠 Marked for Review | 🟣 Answered & Marked | ⚪ Unanswered | 🔵 Current
- Live counters: Answered, Marked, Remaining.
- One-click jump to any question in the palette.

### 🛡️ Automated Proctoring (Anti-Cheating)
- **Window Focus Detection** — Alt+Tab / app switching triggers a strike.
- **3-Strike Policy** — 3 focus violations cause automatic exam termination.
- **Clipboard Lockdown** — Copy, Cut, and Paste are fully blocked.
- **Context Menu Disabled** — Right-click is prevented throughout the exam.
- **Shortcut Blocking** — Dev Tools (F12, Cmd+Opt+I), Refresh (F5, Cmd+R) are intercepted.
- **Text Selection Disabled** — Question content cannot be selected or copied.
- **Webcam Snapshots** — Periodic photos captured every 5 seconds to `electron/cameraFeed/`.
- **New Tab / Popup Blocking** — Electron prevents opening any external windows.
- Floating toast notifications for minor blocked actions.
- Urgent modal dialogs for focus loss violations with remaining strike count.

### 📊 Results & Analytics
- **Letter Grade Badge** — A+ (90%+), A (75%+), B (60%+), C (45%+), F.
- **4 Core Metrics** — Correct, Incorrect, Skipped, Time Taken.
- **Category Proficiency Breakdown** — Per-subject progress bars (strength vs weakness).
- **Proctoring Integrity Audit** — Clean session badge or flagged incident log with timestamps.
- **Detailed Question Review** — Every question with your answer, the correct answer, and an explanation.
- **Export JSON Report** — Download a complete timestamped assessment transcript.
- **Print Report** — Print-optimized CSS for clean PDF report generation.
- **Exit App** button safely closes Kiosk mode and quits the application.

### ⚙️ Developer Ergonomics
- Single-command launch: `npm run app` starts Vite + Electron simultaneously.
- `wait-on` ensures Electron waits until the Vite dev server is fully ready.
- Automatic fallback to `dist/` build if Vite server is not running.
- Session logs saved automatically to `electron/cameraFeed/session-logs.json`.

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Electron** | Native desktop window, IPC, Kiosk mode, file system access |
| **React 19** | Modular UI components and state management |
| **Vite** | Lightning-fast dev server and production bundler |
| **JavaScript (ESM)** | Application logic and hooks |
| **HTML5 & CSS3** | Structure and responsive styling |
| **concurrently** | Parallel dev script runner |
| **wait-on** | Process synchronization (waits for Vite before launching Electron) |
| **Git & GitHub** | Version control |

## ⚙️ Installation and Setup

### Prerequisites

- Node.js (v18 or above)
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/dishi2310/Athena.git
```

### 2. Navigate to the project directory

```bash
cd Athena
```

### 3. Install dependencies

```bash
npm install
```

### 4. Run the application

Start both the Vite development server and Electron desktop window simultaneously with a single command:

```bash
npm run app
```

> The Electron window opens automatically once the Vite server is ready at `http://localhost:5173`.

**Other available commands:**

```bash
npm run dev      # Start only the Vite dev server (browser preview at localhost:5173)
npm run build    # Build the production React bundle into dist/
npm run start    # Launch Electron only (requires dev server or built dist/)
npm run lint     # Run ESLint checks
```

## 📂 Project Structure

```text
Athena/
├── electron/
│   ├── main.cjs               # Main process: window, IPC, kiosk, session log saving
│   ├── preload.cjs            # Context bridge: exposes secure electronAPI to renderer
│   └── cameraFeed/            # Proctoring webcam captures (.jpeg) + session-logs.json
├── src/
│   ├── components/
│   │   ├── CameraMonitor.jsx       # Webcam stream lifecycle + background snapshots
│   │   ├── SetupScreen.jsx         # Camera & fullscreen permission checklist UI
│   │   ├── ExamScreen.jsx          # Live exam: timer, questions, navigation, proctoring
│   │   ├── QuestionPalette.jsx     # Visual question matrix with status color coding
│   │   ├── ProctoringAlerts.jsx    # Focus loss modal + floating action toast alerts
│   │   └── ResultScreen.jsx        # Score, grade, analytics, integrity report, review
│   ├── data/
│   │   └── mockQuestions.js        # 10 MCQ questions with categories & explanations
│   ├── hooks/
│   │   └── useProctoring.js        # Anti-cheating hook (blur, clipboard, shortcuts)
│   ├── assets/
│   ├── App.jsx                     # Root state machine: setup → in-progress → completed
│   ├── App.css                     # All component styles (1300+ lines)
│   ├── index.css                   # Global base typography and layout
│   └── main.jsx                    # React entry point
├── public/
│   └── favicon.svg
├── index.html
├── package.json
├── vite.config.mjs
└── readme.md
```

## 🔮 Possible Future Enhancements

- **Student Login** — Name and roll number entry before the setup screen.
- **Dynamic Question Bank** — Load questions from a JSON file, CSV, or external API.
- **Multiple Question Types** — True/False and fill-in-the-blank alongside MCQ.
- **Backend Submission** — POST results and proctoring logs to a remote server/database.
- **App Packaging** — Bundle as a `.dmg` (macOS) or `.exe` (Windows) installer using `electron-builder`.
- **Face Detection** — Integrate ML-based face presence verification using the webcam feed.

## 👩‍💻 Developer

**Dishi Mukati**  
Newton School of Technology  
ADY Patil University, Pune

## 📄 License

This project is developed for educational purposes as part of the Desktop Application course curriculum.
