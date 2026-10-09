# InterviewSense 🎙️

> AI-powered mock interview platform with voice input, Gemini-powered evaluation, and detailed performance analytics.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-blue?style=for-the-badge)](https://interviewsense-app.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/Mohitraj072/interviewsense-ai)

---

## 🚀 Live Demo

**Frontend:** https://interviewsense-app.vercel.app  
**Backend API:** https://interviewsense-ai-0zeq.onrender.com/api/health

---

## ✨ Features

- 🎤 **Voice Input** — Real-time speech-to-text with live transcription and filler word detection
- 🤖 **AI Question Generation** — Google Gemini generates personalized questions by domain and difficulty
- 📄 **Resume Upload** — Upload your PDF resume and get questions tailored to your experience
- 📊 **Detailed Reports** — Radar chart, score breakdown, strengths, improvements, and study plan
- 🔐 **Firebase Auth** — Google login and email/password authentication
- 💾 **Firestore Storage** — All interviews and reports saved and accessible from dashboard
- 📈 **Dashboard Analytics** — Average score, best score, streak tracker, and interview history

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS 3 |
| Backend | Flask (Python) + Gunicorn |
| AI | Google Gemini |
| Auth + DB | Firebase Auth + Firestore |
| Deployment | Vercel (frontend) + Render (backend) |

---

## 📋 Interview Modes

| Type | Domains | Difficulty |
|---|---|---|
| Technical | DSA, Web Dev, OS, DBMS, System Design, OOPs | Easy / Medium / Hard |
| HR | Behavioral, Situational | Easy / Medium / Hard |
| Mixed | Technical + HR combined | Easy / Medium / Hard |

---

## 🏗️ Project Structure

```
interviewsense-ai/
├── frontend/                  # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/        # Shared UI components
│   │   └── pages/
│   │       ├── Landing.jsx
│   │       ├── Dashboard.jsx
│   │       ├── Interview.jsx
│   │       └── Report.jsx
│   └── vite.config.js
└── backend/                   # Flask Python API
    ├── routes/
    │   ├── interview.py
    │   └── report.py
    ├── prompts/
    ├── app.py
    ├── Procfile
    └── requirements.txt
```

---

## ⚡ Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/Mohitraj072/interviewsense-ai.git
cd interviewsense-ai
```

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env    # Fill in your Firebase config + backend URL
npm run dev             # Runs on http://localhost:5173
```

### 3. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
cp .env.example .env    # Fill in your Gemini API key
python app.py           # Runs on http://localhost:5000
```

### 4. Environment Variables

**Frontend** (`.env`):
```
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Backend** (`.env`):
```
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:5173
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/generate-questions` | Generate interview questions |
| POST | `/api/interview/start` | Start a new interview session |
| POST | `/api/interview/next` | Evaluate answer + get next question |
| POST | `/api/interview/end` | End session + generate report |
| POST | `/api/resume/extract` | Upload resume for personalized questions |
| POST | `/api/report/generate` | Generate full performance report |

---

## 📸 Screenshots

> Landing page → Interview screen → AI-powered report with radar chart

---

## 🧑‍💻 Built By

**Mohit Raj** — 2nd year BTech student  
Built in a single day as a full-stack AI project.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=flat&logo=linkedin)](https://www.linkedin.com/in/mohitraj07)


---

## 📄 License

MIT License — feel free to fork and build on this!
