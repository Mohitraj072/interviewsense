# InterviewSense 🎙️

> AI-powered mock interview platform with voice input, Gemini-powered evaluation, and detailed performance analytics.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-blue?style=for-the-badge)](https://interviewsense-app.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/Mohitraj072/interviewsense)

---

## 🚀 Live Demo

**Frontend:** https://interviewsense-app.vercel.app  
**Backend API:** https://interviewsense-ai-0zeq.onrender.com/api/health

---

## ✨ Features

- 🎤 **Voice and Text Interviews** — Practice speaking aloud with real-time browser speech recognition or type answers in text mode.
- 🎯 **Questions Tailored to a Pasted Job Description** — Paste any job description to dynamically generate interview questions tailored to the specific skills, tools, and responsibilities.
- ⚡ **Instant Feedback and Scoring** — Receive comprehensive evaluations, constructive feedback, scoring, and ideal answers immediately after answering.
- 📊 **Speaking Analytics** — Real-time pacing insights (Words Per Minute) and filler word detection ("um", "uh", "like", "you know", etc.) for voice answers with actionable delivery verdicts.
- 📈 **Progress Tracking** — Track past interview sessions, category performance trends, and key strengths and improvement areas over time.
- 🌓 **Dark & Light Mode** — Seamless theme toggle with a responsive interface designed for desktop and mobile viewports.

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

## ⚙️ How It Works

1. **Configure Interview**: Choose your interview domain, difficulty level, and format (voice or text), or paste a target job description to tailor the questions.
2. **Practice in Real Time**: Answer interview questions using your microphone or keyboard. Speech recognition captures spoken answers and tracks timing.
3. **AI Evaluation & Analytics**: Gemini evaluates responses across core competencies, while pacing and filler word detection analyze speaking delivery.
4. **Performance Report**: Review your Skill Competency Radar, strengths, areas for growth, speaking analytics, and per-question feedback.

---

## 💻 Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/Mohitraj072/interviewsense.git
cd interviewsense
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate
pip install -r requirements.txt
python app.py
```

### Required Environment Variables

#### Frontend (`frontend/.env`)
- `VITE_API_URL`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

#### Backend (`backend/.env`)
- `GEMINI_API_KEY`
- `FRONTEND_URL`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/generate-questions` | Generate interview questions |
| POST | `/api/interview/start` | Start a new interview session |
| POST | `/api/interview/next` | Evaluate answer + get next question |
| POST | `/api/interview/end` | End session + generate report |
| POST | `/api/report/generate` | Generate full performance report |

---

## 📄 License

MIT License — feel free to fork and build on this!
