# TechBuddy — AI mock technical interviews

An AI interviewer that plans questions for your topics, asks follow-ups based on your answers, runs your code against real test cases in the browser, and scores you from what you actually said.

Two repositories:

| Repo | Folder | Hosting |
|---|---|---|
| Frontend (this repo) | `frontend/` | Netlify |
| Backend | `backend/` | Render |

---

## Frontend

**Stack:** React 19 · Vite 8 · Tailwind CSS v4 · TanStack Query · Zustand · React Router 7 · Recharts · Monaco Editor · sonner · Web Speech API · Pyodide

```
src/
├── App.jsx                     routes (pages are lazy-loaded)
├── index.css                   design tokens (light + dark), Tailwind theme
├── lib/                        api client (401 → logout), theme, formatters, score bands
├── store/useAuthStore.js       session
├── components/
│   ├── layout/                 AppShell (navbar), AuthLayout, Logo, ThemeToggle
│   └── ui/                     Button, fields, Switch/Segmented/Badge/Card/Dialog, Score, feedback
├── features/
│   ├── interview/
│   │   ├── Chat.jsx, Composer.jsx, ProgressRail.jsx, CodePanel.jsx
│   │   ├── voice/              useSpeechRecognition (auto-restart, backoff), useSpeechSynthesis (chunked)
│   │   └── runner/             JS/TS worker (sucrase), test comparators, runCode()
│   └── dashboard/TrendChart.jsx
└── pages/                      Landing, Login, Signup, Dashboard, Setup, Interview, Report, Settings, NotFound
public/runners/py-worker.js     Python runner (Pyodide, loaded from jsDelivr on first use)
```

### Pages

| Route | Page |
|---|---|
| `/` | Landing |
| `/login`, `/signup` | Auth |
| `/dashboard` | Stats from completed reports, score trend, subjects, interview history |
| `/setup` | Company, topics, level, duration, coding round, voice mode |
| `/interview/:id` | Live interview: chat, mic, code editor, timer, End button |
| `/report/:id` | Scores, subjects, coding results, feedback, question-by-question, transcript |
| `/settings` | Profile, your own Groq/Gemini keys, theme |

Responsive from 375px: below 1024px the interview switches to Chat / Code / Progress tabs.

### Code runner

- **JavaScript / TypeScript:** run in a module Web Worker (TypeScript stripped with sucrase). Each run gets a fresh worker; it is terminated after 5 s per test, so infinite loops can't freeze the tab.
- **Python:** Pyodide in `public/runners/py-worker.js`. The first run downloads the runtime (~10 MB); the worker stays warm afterwards.
- **Java / C++:** not executed; the interviewer reviews the code.

"Run examples" runs the visible examples; "Submit" runs every test (including hidden ones) and sends the code + results to the interviewer.

### Environment

| File | `VITE_API_URL` |
|---|---|
| `.env.development` | `http://localhost:5000/api` |
| `.env.production` | `https://tech-buddy-be.onrender.com/api` |

On Netlify you can also set `VITE_API_URL` in Site settings → Environment variables.

### Scripts

```bash
npm install
npm run dev       # http://localhost:5173 (talks to the local backend)
npm run build     # production build in dist/
npm run lint
```

`netlify.toml` handles SPA redirects.

---

## Backend (summary)

**Stack:** Node 18+ · Express 5 · MongoDB / Mongoose 9 · JWT · Groq + Gemini · express-rate-limit · `node --test`

How an interview works:

1. **Plan** — one AI call drafts easy / medium / hard questions per theory topic (pitched at the company and level). Coding problems come from a curated bank of 18 problems whose test cases are verified against reference solutions.
2. **Turns** — the server tracks the current question, follow-ups (max 2), adaptive difficulty, the time limit and when to end. Each AI call gets only the rules, the current state, short notes on earlier answers and the last 3 exchanges (~1k tokens, flat over the interview).
3. **Report** — every answer gets a 0–10 score and a note. Report numbers are weighted averages of those plus real test results; the AI only writes the feedback text (rule-based fallback). Nothing is invented when the AI is down — the API returns `503` with a retry hint.

AI keys: `GROQ_API_KEYS` / `GEMINI_API_KEYS` (comma-separated, each from a different Groq org / Google project — limits are per org/project, not per key). Users can add their own keys in Settings (stored AES-256-GCM encrypted); those are tried first.

### Backend environment (`backend/.env`, see `.env.example`)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/techbuddy
JWT_SECRET=<long random string>
KEYS_ENCRYPTION_SECRET=<long random string, keep stable>
GROQ_API_KEYS=key1,key2,key3
GEMINI_API_KEYS=key1,key2,key3
CLIENT_ORIGINS=http://localhost:5173,https://<your-netlify-site>.netlify.app
DAILY_INTERVIEW_LIMIT=10
```

### API

| Method | Endpoint | |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | rate-limited |
| GET | `/api/auth/me` | |
| POST | `/api/interviews` | start (plans the interview) |
| GET | `/api/interviews` | list (no transcripts) |
| GET | `/api/interviews/stats` | dashboard numbers |
| GET / DELETE | `/api/interviews/:id` | |
| POST | `/api/interviews/:id/answer` | `{ answer }` or `{ code, language, tests }` |
| POST | `/api/interviews/:id/end` | end now and build the report |
| POST | `/api/interviews/:id/report/retry` | rewrite feedback text with the AI |
| GET | `/api/settings` | profile + masked keys |
| PATCH | `/api/settings/profile` | |
| POST / DELETE | `/api/settings/ai-keys[/:keyId]` | add (verified) / remove a key |

```bash
cd backend
npm install
npm run dev      # nodemon
npm test         # 57 tests, AI mocked
```

### Deploy

- **Render (backend):** build `npm install`, start `node server.js`; set the variables above, with `CLIENT_ORIGINS` = your Netlify URL.
- **Netlify (frontend):** build `npm run build`, publish `dist`.
