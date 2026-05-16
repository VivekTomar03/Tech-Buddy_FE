# TechBuddy AI — Mock Interview Platform

An AI-powered mock interview platform that simulates realistic technical interviews with adaptive questioning, live coding rounds, voice input, and detailed performance reports.

---

## Tech Stack

### Frontend
- **React 18** + **Vite**
- **Material UI (MUI v9)** — component library
- **Zustand** — auth state management
- **React Router v6** — client-side routing
- **Recharts** — performance trend charts
- **Monaco Editor** — in-browser code editor (DSA / machine coding rounds)
- **Web Speech API** — speech-to-text (mic input) + text-to-speech (AI voice)
- **Axios** — HTTP client with JWT interceptor
- **Lucide React** — icons

### Backend
- **Node.js** + **Express**
- **MongoDB** + **Mongoose**
- **JWT** — authentication (30-day tokens)
- **Groq SDK** (`llama-3.3-70b-versatile`) — primary AI model
- **Google GenAI** (`gemini-2.5-flash`) — fallback AI model
- **CORS** — cross-origin support

---

## Project Structure

```
techBuddyInterview/
├── frontend/
│   ├── src/
│   │   ├── api/          # axios instance with JWT interceptor
│   │   ├── components/   # Navbar, ProtectedRoute
│   │   ├── pages/        # All 7 pages
│   │   ├── store/        # Zustand auth store
│   │   └── App.jsx       # Routes + theme
│   ├── netlify.toml      # Netlify deploy config
│   └── vite.config.js
└── backend/
    ├── controllers/      # Auth + Interview logic
    ├── middleware/        # JWT protect middleware
    ├── models/           # User + Interview schemas
    ├── routes/           # API route definitions
    ├── utils/            # aiService.js (Groq + Gemini)
    └── server.js         # Express entry point
```

---

## Pages

| Page | Route | Description |
|------|-------|-------------|
| LandingPage | `/` | Marketing homepage with features, testimonials, CTA |
| LoginPage | `/login` | User login |
| SignupPage | `/signup` | User registration |
| Dashboard | `/dashboard` | Interview history, stats, performance charts |
| InterviewSetup | `/setup` | Configure and start a new interview |
| LiveInterview | `/interview/:id` | Live AI interview — chat + coding editor |
| ReportPage | `/report/:id` | Post-interview performance report |

---

## Backend API

Base URL: `https://tech-buddy-be.onrender.com/api`

### Auth Routes — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login, returns JWT token |
| GET | `/auth/me` | Yes | Get current logged-in user |

#### Register — `POST /auth/register`
```json
// Request
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}

// Response
{
  "success": true,
  "token": "eyJhbGci..."
}
```

#### Login — `POST /auth/login`
```json
// Request
{
  "email": "john@example.com",
  "password": "secret123"
}

// Response
{
  "success": true,
  "token": "eyJhbGci..."
}
```

---

### Interview Routes — `/api/interviews`

All interview routes require `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/interviews` | Start a new interview |
| GET | `/interviews` | Get all interviews for logged-in user |
| GET | `/interviews/:id` | Get single interview by ID |
| POST | `/interviews/:id/answer` | Submit candidate answer, get next question |
| POST | `/interviews/:id/end` | End interview, generate AI report |

---

#### Start Interview — `POST /interviews`
```json
// Request
{
  "candidateName": "John Doe",
  "companyName": "Google",
  "topics": ["React", "JavaScript", "DSA"],
  "experienceLevel": "Intermediate",
  "duration": 30,
  "includeCoding": true
}

// Response
{
  "success": true,
  "data": { ...interviewObject },
  "aiResponse": {
    "type": "question",
    "phase": "intro",
    "question": "Hi, I'm Buddy — please introduce yourself...",
    "subject": "Introduction",
    "difficulty": "easy",
    "followUp": false,
    "openEditor": false
  }
}
```

---

#### Submit Answer — `POST /interviews/:id/answer`
```json
// Request
{
  "answer": "React hooks are functions that let you use state and lifecycle features..."
}

// Response (normal question)
{
  "success": true,
  "isEnded": false,
  "nextQuestion": "Can you explain the difference between useMemo and useCallback?",
  "aiResponse": {
    "type": "question",
    "phase": "theory",
    "subject": "React",
    "difficulty": "medium",
    "followUp": false,
    "openEditor": false
  }
}

// Response (AI decides interview is complete)
{
  "success": true,
  "isEnded": true,
  "report": { ...reportObject }
}
```

---

#### End Interview — `POST /interviews/:id/end`
```json
// Response
{
  "success": true,
  "data": { ...interviewObject },
  "report": {
    "type": "final_report",
    "overallScore": 75,
    "communicationScore": 70,
    "problemSolvingScore": 80,
    "technicalScore": 75,
    "strongAreas": ["Strong React fundamentals", "Good async understanding"],
    "weakAreas": ["DSA optimization needs work"],
    "subjectBreakdown": [
      { "subject": "React", "score": 82 },
      { "subject": "JavaScript", "score": 71 }
    ],
    "recommendation": "Startup Ready",
    "improvementPlan": [
      "Practice graph and DP problems on LeetCode",
      "Study system design fundamentals"
    ]
  }
}
```

---

## AI Service Flow

```
submitAnswer()
    │
    ▼
buildConversationMessages(topics, difficulty, transcript)
    │  — maps transcript → Groq user/assistant turns
    │  — merges consecutive same-role messages (Groq strict alternation)
    │  — prepends context note as first user message
    ▼
callGroq(INTERVIEW_SYSTEM, messages)   ← primary
    │  fails?
    ▼
callGoogle(INTERVIEW_SYSTEM, lastMsg)  ← fallback
    │
    ▼
normaliseQuestion(raw) or normaliseFinalReport(raw)
    │
    ▼
Returns typed object → controller saves to DB → sends to frontend
```

```
endInterview()
    │
    ▼
generateReport(topics, transcript)
    │  — builds plain-text transcript string
    │  — sends to Groq with REPORT_SYSTEM prompt
    │  — explicitly asks for final_report JSON
    ▼
normaliseFinalReport(raw) → saved to interview document
```

---

## AI Response Types

### During Interview
```json
{
  "type": "question",
  "phase": "intro | theory | dsa | machine_coding | system_design | followup",
  "question": "Question text here",
  "subject": "React",
  "difficulty": "easy | medium | hard",
  "followUp": false,
  "openEditor": false
}
```
`openEditor: true` triggers the Monaco code editor in the frontend.

### End of Interview
```json
{
  "type": "final_report",
  "overallScore": 75,
  "communicationScore": 70,
  "problemSolvingScore": 80,
  "technicalScore": 75,
  "strongAreas": ["..."],
  "weakAreas": ["..."],
  "subjectBreakdown": [{ "subject": "React", "score": 82 }],
  "recommendation": "Startup Ready | MNC Ready | Not Ready | ...",
  "improvementPlan": ["..."]
}
```

---

## MongoDB Schema

### User
```
name         String  required
email        String  required, unique
password     String  hashed (bcrypt)
createdAt    Date
```

### Interview
```
userId           ObjectId  ref: User
companyName      String
candidateName    String
topics           [String]
experienceLevel  String    (Beginner | Intermediate | Advanced)
status           String    (Scheduled | In Progress | Completed)
codingRound      Boolean
transcript       [{
  role           String    (interviewer | candidate)
  content        String
  meta: {
    phase        String
    subject      String
    difficulty   String
    openEditor   Boolean
  }
  timestamp      Date
}]
score                Number
communicationScore   Number
problemSolvingScore  Number
technicalScore       Number
recommendation       String
strongAreas          [String]
weakAreas            [String]
improvementPlan      [String]
subjectBreakdown     [Object]
analysis             Object  (full report JSON)
createdAt            Date
```

---

## Environment Variables

### Backend (`.env`)
```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
```

### Frontend (`.env`)
```
VITE_API_URL=https://tech-buddy-be.onrender.com/api
```

---

## Local Development

### Backend
```bash
cd backend
npm install
npm run dev     # nodemon server.js on port 5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev     # Vite dev server on port 5173
```

---

## Deployment

### Backend — Render
- Build command: `npm install`
- Start command: `node server.js`
- Set all backend env vars in Render → Environment tab

### Frontend — Netlify
- Build command: `npm run build`
- Publish directory: `dist`
- Set `VITE_API_URL` in Netlify → Site Settings → Environment Variables
- `netlify.toml` handles SPA redirects automatically
