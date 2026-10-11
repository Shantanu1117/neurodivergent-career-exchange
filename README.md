# Neurodivergent Career Exchange (NCE)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-24-green.svg)](https://nodejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248.svg)](https://mongoosejs.com/)
[![WCAG 2.2](https://img.shields.io/badge/Accessibility-WCAG%202.2%20AA%2FAAA%20%2B%20W3C%20COGA-emerald.svg)](https://www.w3.org/TR/WCAG22/)

> **A Strengths-First, Sensory-Accessible Employment Platform connecting Autistic, ADHD, Dyslexic, and Neurodivergent Professionals with Inclusive Employers.**

---

## 📚 Engineering & Product Documentation (`docs/`)

- **[`docs/FEATURE_RESEARCH.md`](./docs/FEATURE_RESEARCH.md)** — Comprehensive research of **40 candidate features** across Categories A–F with authoritative citations (W3C WCAG 2.2, W3C COGA, Mentra, Inclusively, Specialisterne, and UK DWP Rapid Evidence Assessment).
- **[`docs/IMPLEMENTATION_PLAN.md`](./docs/IMPLEMENTATION_PLAN.md)** — Repository architecture audit, **P0 Registration 404 Root-Cause Analysis**, and prioritized P0–P3 engineering roadmap.
- **[`docs/FEATURES_IMPLEMENTED.md`](./docs/FEATURES_IMPLEMENTED.md)** — Complete implementation log mapping all **30 implemented production features** to modified files, Mongoose models, API routes, and React components.
- **[`docs/TESTING_REPORT.md`](./docs/TESTING_REPORT.md)** — Build verification (`tsc` + `vite build`) and **18/18 automated end-to-end HTTP integration test results**.

---

## 🌟 Executive Summary & Mission

Traditional hiring processes rely on unstructured interviews, ambiguous social cues, high-stimulus assessment centers, and rigid workplace expectations. These systemic barriers lead to an estimated **30–40% chronic underemployment rate among neurodivergent adults**, despite exceptional cognitive capabilities in technical precision, pattern recognition, systematic verification, and deep problem-solving.

**Neurodivergent Career Exchange (NCE)** bridges this gap by shifting the paradigm from *deficit-based medical disclosure* to *strengths-first cognitive alignment*.

---

## 🚀 30 Advanced Neuro-Inclusive Features Implemented

### Category A — Neuroinclusive Matching, Career Discovery & Smart Guidance
1. **Multi-Dimensional Explainable Match Score Breakdown** (`Skills`, `Environment`, `Strengths`, `Experience`, `Accommodations`)
2. **Cognitive Strengths Radar & 6-Track Career Assessment** (18 non-diagnostic questions)
3. **Candidate-Controlled Matching Weight Sliders** (Live priority sliders on the job search page with profile persistence)
4. **Skill-Gap Analysis & Actionable Learning Bridge** (`GET /api/v1/candidates/skill-gap/:jobId` on every Job Detail page)
5. **Sensory & Cognitive Work-Style Compatibility Engine** (Auditory sensitivity, visual stimulation, social concurrency, context switching, predictability)
6. **Interactive Career Pathway & Role Transition Explorer** (3-tier progressions from Entry-Level to Senior Specialist)
7. **Non-Linear Experience & Transferable Skills Mapper** (Translates non-traditional projects & special interests into verified skills)

### Category B — Low-Anxiety Candidate Onboarding, Profiling & Self-Advocacy
8. **4-Step Chunked, Save-Anytime Onboarding Wizard**
9. **Interactive "How I Work Best" Workplace Manual Builder**
10. **Non-Diagnostic Needs-Based Accommodation Selector**
11. **Smart CV/Portfolio Skill & Strength Extractor** (`POST /api/v1/candidates/parse-cv` — 1-click resume/portfolio parser)
12. **Plain-Language Job Summaries & Essential ("Must-Have") vs. Bonus ("Nice-to-Have") Requirements Split** (W3C COGA standard)
13. **Private Accommodation Planner ("Health Adjustment Passport")** (Stage-by-stage planner with 1-click portable JSON download)

### Category C — Inclusive Application, Interview & Assessment Workflows
14. **Predictable Interview Process & Low-Anxiety Pre-Interview Readiness Checklist**
15. **Structured Bias-Free Interview Rubric Scorecard** (4 objective skill dimensions replacing eye-contact/small-talk scoring)
16. **Alternative Interview Modality Selector** (`WRITTEN_ASYNC`, `TAKE_HOME_TASK`, `VIDEO` camera-optional, `PHONE`, `FLEXIBLE`)
17. **Work-Sample / Task-Based Assessment Engine** (Resume-alternative practical task prompts & artifact submission)
18. **Granular Stage-Gate Disclosure Controls** (`APPLICATION`, `INTERVIEW`, `OFFER`, `POST_HIRE`, `NEVER`)
19. **Time-Zone Aware Scheduling, Sensory Break Buffers (`+10m/+15m`) & `.ics` Calendar Invite Export**
20. **Predictable 5-Stage Application Progress Stepper & Expected SLA Next-Step Guide**
21. **Post-Application Constructive Feedback Loop** (1-click candidate feedback request + structured employer feedback modal)

### Category D — Employer Neuroinclusivity Toolkit & Bias Reduction
22. **Live Neuroinclusive Job-Posting Quality Checker & Bias Linter** (`POST /api/v1/jobs/analyze-inclusivity` — flags ableist/exclusionary tropes and scores 0–100)
23. **Employer Neuro-Inclusivity Verification Badge**
24. **Employer Accommodation Readiness & Day-1 Checklist** (`PATCH /api/v1/applications/:id/checklist` — `PENDING -> APPROVED -> COMPLETED`)
25. **Neuroinclusive Interview Question Bank Generator** (1-click literal question bank by career track)
26. **Sensory & Cognitive Load Transparency Cards** (Noise level, meeting load, communication style, task structure)
27. **Inclusive Hiring Funnel & Accommodation Demand Analytics**

### Category E & F — Sensory Comfort, WCAG 2.2 Accessibility & Data Sovereignty
28. **Multi-Axis Sensory & Typography Comfort Drawer (WCAG 2.2 SC 1.4.12)** (Light/Dark theme, Font Size, Line Spacing, Letter Spacing, Dyslexia Font, High Contrast, Reduced Motion)
29. **Integrated Text-to-Speech (TTS) Read-Aloud Assistant** (Zero-dependency Web Speech API reader with `0.85x / 1.0x / 1.15x` rate control)
30. **Accessible Authentication (WCAG 2.2 SC 3.3.8), Distraction-Free Focus Mode, GDPR Portable Data Export (`GET /api/v1/candidates/export-data`), Cascade Account Deletion (`DELETE /api/v1/candidates/account`), & In-App Accessibility Barrier Reporter (`POST /api/v1/feedback/accessibility`)**

---

## 🔑 Pre-Seeded Demo Accounts

| Role | Email Address | Password | Profile Highlights |
| :--- | :--- | :--- | :--- |
| **Candidate** | `candidate@demo.com` | `Demo@2026!` | Jordan Taylor (QA Automation Engineer, 96% QA / Data fit) |
| **Employer** | `employer@demo.com` | `Demo@2026!` | NeuroTech Labs (Verified Inclusive Employer, 4 active jobs) |
| **Admin** | `admin@demo.com` | `Demo@2026!` | System SuperAdmin (Full moderation, analytics & WCAG report triage) |

---

## 💻 Local Development Setup

### 1. Install Dependencies
```bash
# Install root, backend, and frontend dependencies
cd backend && npm install
cd ../frontend && npm install
```

### 2. Run Backend & Frontend Dev Servers
**Terminal 1 — Backend (`http://localhost:5001`):**
```bash
cd backend
npm run dev
```
*Connects to `MONGODB_URI` if set, or automatically launches an embedded in-memory MongoDB instance with pre-seeded enterprise demo data on port `5001`.*

**Terminal 2 — Frontend (`http://localhost:5173`):**
```bash
cd frontend
npm run dev
```
*Vite proxies `/api` requests automatically to `http://localhost:5001`.*

---

## 🌐 Production Deployment Guide (Vercel + Render)

### 1. Backend Deployment (Render)
- **Root Directory:** `backend`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Environment Variables:**
  - `PORT`: `5001` (or Render default `10000`)
  - `JWT_SECRET`: `<your-production-jwt-secret>`
  - `MONGODB_URI`: `<your-mongodb-atlas-connection-string>` (optional; falls back to embedded in-memory MongoDB if omitted)
  - `FRONTEND_URL`: `https://neurodivergent-career-exchange.vercel.app`

> **Routing Resilience:** The backend mounts its API router at `/api/v1`, `/api`, and `/` simultaneously, and exposes health checks at `/`, `/health`, `/api/health`, and `/api/v1/health`.

### 2. Frontend Deployment (Vercel)
- **Root Directory:** `frontend` (Both `/` and `/frontend` include `vercel.json` with SPA rewrite rules `/(.*) -> /index.html` so direct links to `/register`, `/login`, and `/jobs/:id` never return 404).
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables:**
  - `VITE_API_URL`: `https://<your-render-backend>.onrender.com/api/v1` (Note: `resolveApiBaseUrl()` in `frontend/src/services/api.ts` automatically normalizes any URL format, whether it ends in `/`, `/api`, or `/api/v1`).

---

## 📄 License
MIT License. Built for neuro-inclusive career advancement.
