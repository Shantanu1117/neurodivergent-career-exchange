# Implemented Features Log — Neurodivergent Career Exchange (NCE)

**Date:** 2026-10-10  
**Repository:** `neurodivergent-career-exchange`  
**Total Enhancements Implemented:** 30 Production Features + P0 Live Registration & SPA Routing Reliability Fix

---

## 0. P0 Production Fix: Registration 404 & Vercel/Render Routing Resilience

- **Root Cause Solved:**
  1. Missing `vercel.json` caused Vercel SPA deep links (`/register`, `/login`, `/jobs/:id`) to return HTTP 404 on direct page loads or refreshes.
  2. `VITE_API_URL` environment variable variations across Vercel/Render (e.g., `https://backend.onrender.com` vs `https://backend.onrender.com/api` vs `https://backend.onrender.com/api/v1`) caused `POST /auth/register` to hit an unmounted Express path and return 404.
- **Files Modified / Created:**
  - `vercel.json` & `frontend/vercel.json` (SPA rewrite rule `/(.*) -> /index.html`)
  - `frontend/src/services/api.ts` (`resolveApiBaseUrl()` auto-normalizer + descriptive status error diagnostics)
  - `backend/src/index.ts` (Mounted `apiRouter` simultaneously on `/api/v1`, `/api`, and `/` fallback; exposed health checks on `/`, `/health`, `/api/health`, `/api/v1/health`; dynamic CORS support for `*.vercel.app` and `FRONTEND_URL`).

---

## 1. Category A — Neuroinclusive Matching, Career Discovery & AI/Smart Guidance

| Feature # | Feature Title | Files Modified | Endpoints / UI Components |
| :--- | :--- | :--- | :--- |
| **#1** | **Multi-Dimensional Explainable Match Score Breakdown** | `backend/src/services/matchingService.ts`, `frontend/src/components/common/MatchBreakdownModal.tsx` | `GET /api/v1/jobs`, `GET /api/v1/jobs/:id` — Returns 5-dimension breakdown (`skillsMatch`, `environmentMatch`, `strengthsMatch`, `experienceMatch`, `accommodationsMatch`) and human-readable `matchReasons`. |
| **#2** | **Cognitive Strengths Radar & 6-Track Career Assessment** | `backend/src/controllers/assessmentController.ts`, `frontend/src/pages/candidate/CandidateAssessmentPage.tsx` | `GET /api/v1/assessments/questions`, `POST /api/v1/assessments/submit` — Interactive 18-question strengths assessment mapping candidates across 6 neuro-inclusive tech tracks. |
| **#3** | **Candidate-Controlled Matching Weight Sliders** | `backend/src/models/CandidateProfile.ts`, `backend/src/services/matchingService.ts`, `frontend/src/pages/candidate/CandidateJobsPage.tsx` | Interactive 5-slider priority tuner (`skills`, `environment`, `strengths`, `accommodations`, `experience`) with real-time normalization (`wSkills`, `wEnv`, `wStrengths`, `wExp`, `wAcc`) and profile persistence. |
| **#4** | **Skill-Gap Analysis & Actionable Learning Bridge** | `backend/src/controllers/candidateController.ts`, `backend/src/routes/candidateRoutes.ts`, `frontend/src/pages/public/JobDetailPage.tsx` | `GET /api/v1/candidates/skill-gap/:jobId` — Displays matched core skills, growth opportunities, readiness percentage, and recommended learning guides on every job detail page. |
| **#5** | **Sensory & Cognitive Work-Style Compatibility Engine** | `backend/src/models/CandidateProfile.ts`, `backend/src/services/matchingService.ts`, `frontend/src/pages/candidate/CandidateProfilePage.tsx` | Matches candidate `sensoryProfile` (`auditorySensitivity`, `visualStimulationPreference`, `socialConcurrencyTolerance`, `contextSwitchingStyle`, `predictabilityNeeds`) against job `sensoryEnvironment`. |
| **#6** | **Interactive Career Pathway & Role Transition Explorer** | `frontend/src/pages/public/ResourcesPage.tsx` | Interactive 3-tier progression explorer (`Entry-Level -> Mid-Level -> Senior Specialist`) across QA Automation, Data Audit, and Cybersecurity with aligned strengths and salary bands. |
| **#9** | **Non-Linear Experience & Transferable Skills Mapper** | `backend/src/models/CandidateProfile.ts`, `backend/src/services/matchingService.ts`, `frontend/src/pages/candidate/CandidateProfilePage.tsx` | Allows candidates to map non-traditional projects, special interests, and community leadership into verified technical/analytical skills that count directly toward job match scores. |

---

## 2. Category B — Low-Anxiety Candidate Onboarding, Profiling & Self-Advocacy

| Feature # | Feature Title | Files Modified | Endpoints / UI Components |
| :--- | :--- | :--- | :--- |
| **#7** | **Chunked, Save-Anytime Onboarding Wizard** | `frontend/src/pages/candidate/CandidateProfilePage.tsx` | 4-Step Guided Low-Anxiety Onboarding Wizard (`1. Core Skills -> 2. Sensory & Focus -> 3. Adjustment Passport -> 4. Privacy & Stage-Gate Disclosure`) with instant step jumps and zero time limits. |
| **#8** | **Interactive "How I Work Best" Workplace Manual Builder** | `frontend/src/pages/candidate/CandidateProfilePage.tsx`, `frontend/src/pages/employer/EmployerApplicationsPage.tsx` | Dedicated candidate manual section surfaced prominently in the employer ATS drawer. |
| **#11** | **Non-Diagnostic Needs-Based Accommodation Selector** | `frontend/src/pages/candidate/CandidateProfilePage.tsx` | Needs-based accommodation selection requiring zero medical labels or clinical diagnoses. |
| **#12** | **Smart Resume/Portfolio Skill & Strength Extractor** | `backend/src/controllers/candidateController.ts`, `frontend/src/pages/candidate/CandidateProfilePage.tsx` | `POST /api/v1/candidates/parse-cv` — Deterministic parser that extracts technical skills, cognitive strengths, and transferable skills from pasted CV/portfolio text in 1 click. |
| **#13** | **Plain-Language Job Summaries & Essential ("Must-Have") vs. Bonus ("Nice-to-Have") Split** | `backend/src/models/Job.ts`, `backend/src/controllers/jobController.ts`, `frontend/src/pages/public/JobDetailPage.tsx`, `frontend/src/pages/employer/EmployerJobCreatePage.tsx` | W3C COGA plain-language summary toggle on every job page + explicit separation of Essential Day-1 skills from 100% optional Bonus skills. |
| **#14** | **Private Accommodation Planner ("Health Adjustment Passport")** | `backend/src/models/CandidateProfile.ts`, `frontend/src/pages/candidate/CandidateProfilePage.tsx` | Stage-categorized adjustment planner (`Application`, `Interview`, `Onboarding`, `Daily Workplace`) with 1-click portable JSON passport download. |

---

## 3. Category C — Inclusive Application, Interview & Assessment Workflows

| Feature # | Feature Title | Files Modified | Endpoints / UI Components |
| :--- | :--- | :--- | :--- |
| **#15** | **Predictable Interview Process & Advance Question Sharing** | `frontend/src/pages/candidate/CandidateInterviewsPage.tsx`, `frontend/src/pages/public/JobDetailPage.tsx` | Displays full multi-stage interview timelines, advance session agendas, advance interview questions, and an interactive low-anxiety Pre-Interview Readiness Checklist. |
| **#16** | **Structured Bias-Free Interview Rubric Scorecard** | `backend/src/models/Interview.ts`, `backend/src/controllers/interviewController.ts`, `frontend/src/pages/employer/EmployerInterviewsPage.tsx` | `PATCH /api/v1/interviews/:id/status` — 4-dimension objective rubric (`technicalExecution`, `problemSolvingClarity`, `asyncCommunication`, `taskCompletionQuality`) replacing eye-contact/small-talk scoring. |
| **#17** | **Alternative Interview Modality Selector** | `backend/src/models/Application.ts`, `frontend/src/pages/public/JobDetailPage.tsx` | Candidates select `WRITTEN_ASYNC`, `TAKE_HOME_TASK`, `VIDEO` (camera-optional), `PHONE`, or `FLEXIBLE` when applying. |
| **#18** | **Work-Sample / Task-Based Assessment Engine** | `backend/src/models/Job.ts`, `backend/src/models/Application.ts`, `frontend/src/pages/public/JobDetailPage.tsx`, `frontend/src/pages/employer/EmployerApplicationsPage.tsx` | Employers attach scoped 25-minute work-sample prompts to jobs; candidates submit practical walkthroughs or artifact URLs directly in the application modal. |
| **#19** | **Granular Stage-Gate Disclosure Controls** | `backend/src/models/CandidateProfile.ts`, `frontend/src/pages/candidate/CandidateProfilePage.tsx` | Candidates choose exactly when their accommodation passport is unlocked (`APPLICATION`, `INTERVIEW`, `OFFER`, `POST_HIRE`, or `NEVER`) and which sub-sections are visible. |
| **#20** | **Time-Zone Aware Scheduling, Sensory Break Buffers & `.ics` Export** | `backend/src/models/Interview.ts`, `frontend/src/pages/candidate/CandidateInterviewsPage.tsx`, `frontend/src/pages/employer/EmployerApplicationsPage.tsx` | Explicit `sensoryBreakMinutes` buffer (e.g., +10m/+15m), time-zone display, and 1-click `.ics` calendar file download. |
| **#21** | **Predictable Application Status Stepper & SLA Next-Step Guide** | `frontend/src/pages/candidate/CandidateApplicationsPage.tsx` | 5-stage visual progress bar (`Applied -> In Review -> Shortlisted -> Interview/Task -> Offer`) with plain-language SLA expectations for every stage. |
| **#22** | **Post-Application Constructive Feedback Loop** | `backend/src/controllers/applicationController.ts`, `frontend/src/pages/candidate/CandidateApplicationsPage.tsx`, `frontend/src/pages/employer/EmployerApplicationsPage.tsx` | `POST /api/v1/applications/:id/request-feedback` & `POST /api/v1/applications/:id/feedback` — Candidates request feedback in 1 click; employers send structured strengths & growth areas. |

---

## 4. Category D — Employer Neuroinclusivity Toolkit & Bias Reduction

| Feature # | Feature Title | Files Modified | Endpoints / UI Components |
| :--- | :--- | :--- | :--- |
| **#24** | **Neuroinclusive Job-Posting Quality Checker & Bias Linter** | `backend/src/controllers/jobController.ts`, `frontend/src/pages/employer/EmployerJobCreatePage.tsx` | `POST /api/v1/jobs/analyze-inclusivity` — Scores job postings `0–100`, flags ableist/exclusionary tropes ("rockstar", "fast-paced high-pressure", "eye contact"), and highlights inclusive strengths. |
| **#25** | **Employer Neuro-Inclusivity Verification Badge** | `backend/src/controllers/adminController.ts`, `frontend/src/components/common/JobCard.tsx` | `PATCH /api/v1/admin/employers/:id/verify` — Verified badge displayed on employer profiles and job cards. |
| **#26** | **Employer Accommodation Readiness & Day-1 Checklist** | `backend/src/controllers/applicationController.ts`, `frontend/src/pages/employer/EmployerApplicationsPage.tsx` | `PATCH /api/v1/applications/:id/checklist` — Interactive per-candidate checklist (`PENDING -> APPROVED -> COMPLETED`) synced between employer ATS and candidate application tracker. |
| **#28** | **Neuroinclusive Interview Question Bank Generator** | `frontend/src/pages/employer/EmployerApplicationsPage.tsx` | 1-click role-specific literal question generator inside the employer interview scheduler. |
| **#29** | **Sensory & Cognitive Load Transparency Cards** | `backend/src/models/Job.ts`, `frontend/src/pages/public/JobDetailPage.tsx`, `frontend/src/pages/employer/EmployerJobCreatePage.tsx` | Displays `noiseLevel`, `meetingLoad`, `communicationStyle`, and `teamAutonomy` on every job listing. |
| **#30** | **Inclusive Hiring Funnel & Accommodation Demand Analytics** | `backend/src/controllers/employerController.ts`, `frontend/src/pages/employer/EmployerDashboard.tsx` | `GET /api/v1/employers/dashboard-stats` — Visualizes stage-by-stage conversion funnel and most-requested workplace adjustments. |

---

## 5. Category E & F — Sensory Comfort, WCAG 2.2 Accessibility & Data Sovereignty

| Feature # | Feature Title | Files Modified | Endpoints / UI Components |
| :--- | :--- | :--- | :--- |
| **#31** | **Multi-Axis Sensory & Typography Comfort Drawer (WCAG 2.2 SC 1.4.12)** | `frontend/src/context/AccessibilityContext.tsx`, `frontend/src/components/layout/AccessibilityDrawer.tsx`, `frontend/src/index.css` | Persistent controls for Theme (`Light/Dark`), Font Size (`Normal/Large/X-Large`), Line Spacing (`Standard/Relaxed/Loose`), Letter Spacing (`Normal/Wide`), High Contrast, Reduced Motion, and Dyslexia-Friendly Font. |
| **#32** | **Integrated Text-to-Speech (TTS) Read-Aloud Assistant** | `frontend/src/context/AccessibilityContext.tsx`, `frontend/src/components/layout/AccessibilityDrawer.tsx`, `frontend/src/pages/public/JobDetailPage.tsx` | Zero-dependency Web Speech API reader with adjustable speech rate (`0.85x`, `1.0x`, `1.15x`) in the global drawer and on every Job Detail page. |
| **#33** | **Accessible Authentication (WCAG 2.2 SC 3.3.8)** | `frontend/src/pages/public/LoginPage.tsx`, `frontend/src/pages/public/RegisterPage.tsx` | Show/Hide password toggles, password manager `autoComplete`, 1-click demo autofill, and live backend connection health indicator. |
| **#35** | **Career Readiness & Learning Milestone Tracker** | `frontend/src/pages/public/ResourcesPage.tsx` | Interactive completion tracker for self-advocacy and technical playbooks synced to candidate profiles. |
| **#36** | **Distraction-Free Focus Mode** | `frontend/src/context/AccessibilityContext.tsx`, `frontend/src/index.css`, `frontend/src/components/layout/AccessibilityDrawer.tsx` | Hides decorative ambient elements and secondary chrome (`body.focus-mode-active`) for single-task concentration. |
| **#39** | **Candidate Data Sovereignty: Export & Delete Account (GDPR)** | `backend/src/controllers/candidateController.ts`, `frontend/src/pages/candidate/CandidateProfilePage.tsx` | `GET /api/v1/candidates/export-data` & `DELETE /api/v1/candidates/account` — 1-click portable JSON archive download and full cascade account deletion. |
| **#40** | **In-App Accessibility & Sensory Barrier Reporter (WCAG 2.2 SC 3.2.6)** | `backend/src/models/AccessibilityReport.ts`, `backend/src/controllers/adminController.ts`, `frontend/src/components/layout/AccessibilityDrawer.tsx`, `frontend/src/pages/admin/AdminDashboard.tsx` | `POST /api/v1/feedback/accessibility` — Built into the persistent Accessibility Drawer and triaged in the Admin WCAG Compliance Center. |
