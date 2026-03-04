<div align="center">

<br/>

# 🎙️ AI Interview Agent

### *Intelligent. Adaptive. Deeply Analytical.*

An advanced, fully-automated AI mock interview platform that conducts dynamic, context-aware voice and text interviews — parsing real job descriptions and candidate resumes to generate precision-targeted questions, track conversational metrics, and deliver actionable performance insights.

<br/>

[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

<br/>

</div>

---

## 🧠 What It Does

AI Interview Agent simulates a real interview experience with an AI that **knows your resume and the job description** — not just generic interview scripts. Every question is contextually generated, every response is evaluated, and every session ends with a comprehensive performance breakdown.

Whether you're preparing for a senior engineering role, a product management position, or an executive interview, the agent adapts in real time to your answers, probing deeper where it matters most.

---

## ✨ Features

### 🎤 Multimodal Interview Modes
Conduct interviews through **Real-Time Voice** powered by Vapi, or engage in **interactive Chat mode** — seamlessly switching between modalities to fit your preparation style.

### 📄 Context-Aware Question Generation
The agent ingests your **resume** and the **job description** to synthesize highly specific, non-generic questions. No boilerplate "tell me about yourself" loops — just targeted, intelligent dialogue.

### ⚡ Microsecond Voice Performance
Built on **Deepgram** transcriptions and **ElevenLabs** voice models routed through Vapi, delivering instant interruption handling and natural conversational pacing that mirrors real interview dynamics.

### 📊 Comprehensive Performance Analytics
Every session auto-generates a **6-Factor Performance Report** covering:

| Factor | Description |
|---|---|
| 💪 **Strengths** | What you did exceptionally well |
| ⚠️ **Weaknesses** | Areas requiring targeted improvement |
| 🗣️ **Communication** | Clarity, conciseness, and articulation |
| 🧩 **Behavioral** | STAR method adherence and storytelling quality |
| 🔍 **Gaps** | Missed opportunities or knowledge blind spots |
| 🎯 **Confidence** | Tone, pacing, and decisiveness indicators |

### 🛡️ Offline / Dev Resilience
Gracefully falls back to **local storage routing** when the Supabase backend is unavailable — ensuring uninterrupted practice sessions regardless of connectivity.

---

## 🚀 Tech Stack

<div align="center">

### Frontend

<code><img height="40" src="https://user-images.githubusercontent.com/25181517/183897015-94a058a6-b86e-4e42-a37f-bf92061753e5.png" alt="React"/></code>&nbsp;&nbsp;
<code><img height="40" src="https://user-images.githubusercontent.com/25181517/183890598-19a0ac2d-e88a-4005-a8df-1ee36782fde1.png" alt="TypeScript"/></code>&nbsp;&nbsp;
<code><img height="40" src="https://github.com/marwin1991/profile-technology-icons/assets/62091613/b40892ef-efb8-4b0e-a6b5-d1cfc2f3fc35" alt="Vite"/></code>&nbsp;&nbsp;
<code><img height="40" src="https://user-images.githubusercontent.com/25181517/192158954-f88b5814-d510-4564-b285-dff7d6400dad.png" alt="HTML"/></code>&nbsp;&nbsp;
<code><img height="40" src="https://user-images.githubusercontent.com/25181517/189716630-f5c71d2b-6def-4537-8e6d-74d3d2dbb28c.png" alt="Tailwind CSS"/></code>

**React 18 · TypeScript · Vite · Tailwind CSS · Radix UI · Framer Motion**

<br/>

### Backend & Data

<code><img height="40" src="https://user-images.githubusercontent.com/25181517/189716855-2c69ca7a-5149-4647-936d-780610911353.png" alt="Supabase"/></code>

**Supabase** — Authentication, PostgreSQL database, real-time subscriptions

<br/>

### AI & Voice Pipeline

| Service | Role |
|---|---|
| 🤖 **Groq** (Llama 3.3 70B & DeepSeek) | Interview intelligence & question generation |
| 🎙️ **Vapi Web SDK** | Real-time voice interview orchestration |
| 🔊 **ElevenLabs** | Natural, expressive AI voice synthesis |
| 📝 **Deepgram** | Low-latency speech transcription |
| 📄 **PDF.js** | Resume parsing & document ingestion |
| 📑 **jsPDF** | Performance report generation & export |

</div>

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                  React Frontend                  │
│         (Vite · TypeScript · Tailwind)           │
├──────────────┬──────────────────────────────────┤
│  Voice Mode  │           Chat Mode               │
│    (Vapi)    │        (Groq / LLM)               │
├──────────────┴──────────────────────────────────┤
│          Context Engine                          │
│    Resume Parser (PDF.js) + JD Analyzer          │
├─────────────────────────────────────────────────┤
│       Supabase (Auth · Database · Storage)       │
│       Local Storage Fallback (Offline Mode)      │
└─────────────────────────────────────────────────┘
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the project root with the following keys:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GROQ_API_KEY=your_groq_api_key
VITE_VAPI_PUBLIC_KEY=your_vapi_public_key
```

---

## 🗺️ Roadmap

- [ ] Multi-language interview support
- [ ] Interviewer persona customization (technical, behavioral, executive)
- [ ] Team/cohort analytics dashboard
- [ ] Calendar-based interview scheduling with reminders
- [ ] Integration with LinkedIn job postings for auto JD parsing

---

<div align="center">

*Built for candidates who don't just want to practice — they want to master it.*

</div>
