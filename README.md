# 🎙️ AI Interview Agent

An advanced, fully-automated AI mock interview platform that conducts dynamic,
context-aware voice and text interviews. It parses job descriptions and
candidate resumes to generate personalized, probing questions, tracks
conversational metrics, and provides deeply analytical performance feedback.

## 🚀 Tech Stack

<div align="center">
	<code><img width="50" src="https://user-images.githubusercontent.com/25181517/192158954-f88b5814-d510-4564-b285-dff7d6400dad.png" alt="HTML" title="HTML"/></code>
	<code><img width="50" src="https://user-images.githubusercontent.com/25181517/189716630-f5c71d2b-6def-4537-8e6d-74d3d2dbb28c.png" alt="Tailwind CSS" title="Tailwind CSS"/></code>
	<code><img width="50" src="https://user-images.githubusercontent.com/25181517/183897015-94a058a6-b86e-4e42-a37f-bf92061753e5.png" alt="React" title="React"/></code>
	<code><img width="50" src="https://user-images.githubusercontent.com/25181517/183890598-19a0ac2d-e88a-4005-a8df-1ee36782fde1.png" alt="TypeScript" title="TypeScript"/></code>
  <code><img width="50" src="https://github.com/marwin1991/profile-technology-icons/assets/62091613/b40892ef-efb8-4b0e-a6b5-d1cfc2f3fc35" alt="Vite" title="Vite"/></code>
	<code><img width="50" src="https://user-images.githubusercontent.com/25181517/189716855-2c69ca7a-5149-4647-936d-780610911353.png" alt="Supabase" title="Supabase"/></code>
</div>

- **Frontend Engine:** React 18, Vite, TypeScript
- **Styling & UI:** Tailwind CSS, Radix UI, Framer Motion
- **Authentication & Database:** Supabase
- **Language Models:** Groq (Llama 3.3 70B & Deepseek)
- **Voice AI Pipeline:** Vapi (Web SDK)
- **Document Parsing:** PDF.js
- **Reporting:** jsPDF

## ✨ Features

- **Multimodal Interviews:** Conduct interviews via Real-Time Voice (Vapi) or
  interactive Chat modes.
- **Context-Aware AI:** The agent analyzes the attached candidate Resume and
  specific Job Description to generate highly specific, non-generic questions.
- **Microsecond Voice Performance:** Implements Deepgram transcriptions and
  ElevenLabs voice models routed through Vapi for instant interruptions and
  conversational pacing.
- **Comprehensive Analytics:** Automatically generates a 6-factor performance
  report (Strengths, Weaknesses, Communication, Behavioral, Gaps, Confidence)
  after the interview concludes.
- **Offline / Dev Resilience:** Gracefully falls back to local storage routing
  if the Supabase backend goes offline, ensuring users never lose access to
  their practice data.

## ⚙️ Local Setup

1. **Clone & Install:**
   ```powershell
   git clone <your-repo-url>
   cd interview_assistant
   npm install
   ```

2. **Environment Variables:** Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GROQ_API_KEY=your_groq_api_key
   VITE_VAPI_PUBLIC_KEY=your_vapi_public_key
   ```

3. **Run Development Server:**
   ```powershell
   npm run dev
   ```
