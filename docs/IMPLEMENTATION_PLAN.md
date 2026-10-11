# Neurodivergent Career Exchange (NCE) — Master Implementation Plan

**Date:** 2026-10-10  
**Target Architecture:** React 18 + Vite + TypeScript + Tailwind CSS (`frontend/`) & Node.js + Express + TypeScript + MongoDB/Mongoose (`backend/`)

---

## 1. Repository Audit & Root-Cause Analysis of P0 Blockers

### 1.1 Current Codebase Audit Summary
- **Backend (`backend/src/`)**:
  - Express server on port `5001` (configurable via `PORT`).
  - Automatic fallback from external `MONGODB_URI` to `mongodb-memory-server` with automatic demo data seeding (`seedData.ts`) on fresh startup.
  - Existing Mongoose models: `User`, `CandidateProfile`, `EmployerProfile`, `Job`, `Application`, `AssessmentQuestion`, `AssessmentResult`, `Interview`, `Resource`.
  - Existing controllers: `authController`, `candidateController`, `employerController`, `jobController`, `applicationController`, `assessmentController`, `interviewController`, `resourceController`, `adminController`.
- **Frontend (`frontend/src/`)**:
  - React Router v6 SPA with role-protected routes (`CANDIDATE`, `EMPLOYER`, `ADMIN`) and public routes (`/`, `/jobs`, `/jobs/:id`, `/resources`, `/placed-candidates`, `/login`, `/register`).
  - Context providers: `AuthContext` (JWT bearer token in `localStorage`) and `AccessibilityContext` (persisted UI preferences).

### 1.2 Root Cause of Live Registration 404 Issue (P0)
**Symptom Reported:** Live registration fails with HTTP `404` in production (Vercel frontend + Render backend) even when `/api/health` returns `200 OK`.

**Root Causes Identified During Audit:**
1. **Route Prefix Mismatch Between Health Check (`/api/health`) and v1 API Routes (`/api/v1/*`)**:
   - In `backend/src/index.ts`, the health check was mounted at `/api/health`, while all authentication and resource routes were exclusively mounted under `/api/v1/auth`, `/api/v1/jobs`, etc.
   - In `frontend/src/services/api.ts`:
     ```ts
     const API_BASE = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');
     ```
   - When `VITE_API_URL` in Vercel is configured as `https://neurodivergent-career-exchange.onrender.com` or `https://neurodivergent-career-exchange.onrender.com/api` (without `/v1`), `api.register()` sends `POST .../auth/register` or `POST .../api/auth/register`—which hits Express's catch-all `404` handler!
2. **Missing Vercel SPA & Proxy Rewrite Configuration (`vercel.json`)**:
   - Neither `/` nor `frontend/` contained a `vercel.json`. Refreshing `/register` or `/login` directly on Vercel, or leaving `VITE_API_URL` unset so requests go to `/api/v1/auth/register` on the Vercel domain, results in a Vercel `404 NOT_FOUND`.
3. **Restrictive Single-Origin CORS Configuration**:
   - `backend/src/index.ts` used `origin: process.env.FRONTEND_URL || 'http://localhost:5173'`. Any trailing slash in `FRONTEND_URL` or Vercel preview deployment URL (`*.vercel.app`) was rejected by CORS.

**P0 Resolution Strategy:**
- **Frontend (`frontend/src/services/api.ts`)**: Implement `resolveApiBaseUrl()` that intelligently normalizes any `VITE_API_URL` / `VITE_API_BASE_URL` value (`https://host`, `https://host/api`, `https://host/api/v1`, or `/api/v1`) so requests always target `/api/v1/...` accurately.
- **Backend (`backend/src/index.ts`)**: Mount the API router at `/api/v1`, `/api`, AND root fallback paths (`/auth`, `/jobs`, etc.), and expose health checks at `/`, `/health`, `/api/health`, and `/api/v1/health`. Upgrade CORS to allow `localhost`, configured `FRONTEND_URL`, and `*.vercel.app` origins.
- **Deployment Config (`vercel.json` & `frontend/vercel.json`)**: Add SPA fallback rewrites so all client routes (`/register`, `/login`, `/candidate/*`, etc.) resolve cleanly.

---

## 2. Prioritized Implementation Roadmap (30 Selected Features)

### P0 — Critical Foundations & Registration/Auth Fixes
- [x] **P0-1: API Base URL Auto-Normalization & Multi-Prefix Backend Mounting** (`frontend/src/services/api.ts`, `backend/src/index.ts`)
- [x] **P0-2: Vercel SPA Routing Configuration & Multi-Origin CORS Support** (`vercel.json`, `frontend/vercel.json`, `backend/src/index.ts`)
- [x] **P0-3: WCAG 2.2 SC 3.3.8 Accessible Authentication & Registration Diagnostics** (Feature #33 — Show/hide password toggle, password manager & paste support, clear role selection, live API connection badge, and zero-friction demo quick-fill on `RegisterPage.tsx` and `LoginPage.tsx`)

### P1 — High-Impact Neuroinclusive Differentiators
- [x] **P1-1: Candidate-Controlled Matching Weight Sliders** (Feature #3 — Custom weights for Skills, Environment, Strengths, Experience, and Accommodations persisted in `CandidateProfile.matchingWeights` and dynamically applied in `MatchingService.ts` and `CandidateJobsPage.tsx`)
- [x] **P1-2: Multi-Factor Explainable Job Match Engine Upgrade** (Feature #1 — Enhanced `MatchingService` returning matched skills, missing skills, transferable skill bonuses, sensory alignment notes, and custom weight reflection)
- [x] **P1-3: Skill-Gap Analysis & Actionable Learning Bridge** (Feature #4 — `GET /api/v1/candidates/skill-gap/:jobId` + interactive Skill-Gap & Recommended Learning panel on `JobDetailPage.tsx`)
- [x] **P1-4: Sensory & Cognitive Work-Style Profile** (Feature #7 — Granular noise tolerance, lighting sensitivity, interruption tolerance, multitasking preference, meeting load cap, and sensory triggers in `CandidateProfile` & `CandidateProfilePage.tsx`)
- [x] **P1-5: Private Accommodation Planner / Health Adjustment Passport** (Feature #9 — Stage-organized planner for `interviewStage`, `offerStage`, and `dayOneOnboarding` in `CandidateProfile`, private by default with printable/downloadable personal summary)
- [x] **P1-6: Stage-Gate Privacy & Disclosure Control Matrix** (Feature #19 — Candidate controls when accommodations, sensory profile, and assessment scores are disclosed: `AT_APPLICATION`, `AT_INTERVIEW`, `POST_OFFER`, or `PRIVATE`)
- [x] **P1-7: Guided Step-by-Step Candidate Onboarding Wizard** (Feature #12 — Interactive 4-step guided wizard mode on `CandidateProfilePage.tsx` with progress bar, save-and-resume, and zero time pressure)
- [x] **P1-8: Accessible CV / Portfolio Smart Text Parser & Importer** (Feature #14 — `POST /api/v1/candidates/parse-cv` + modal in `CandidateProfilePage.tsx` that extracts technical skills, cognitive strengths, experience level, and portfolio links from pasted resume text or uploaded `.txt`/`.md` files)
- [x] **P1-9: Plain-Language Job Translator & Essential vs. Preferred Requirement Separator** (Feature #13 — `Job` model fields `plainLanguageSummary`, `essentialRequirements`, `preferredRequirements` + one-click "Plain-Language View" toggle on `JobDetailPage.tsx`)
- [x] **P1-10: Work-Sample & Task-Based Assessment Alternative** (Feature #18 — `Job.workSampleTask` and `Application.submissionType` / `workSampleSubmission` allowing candidates to submit a practical untimed task response instead of a traditional cover letter)
- [x] **P1-11: Neuroinclusive Job-Posting Quality Checker & Bias Linter** (Feature #24 — `POST /api/v1/jobs/analyze-inclusivity` + real-time inclusivity score, bias phrase detector, requirement overload warning, and auto-generated plain-language summary on `EmployerJobCreatePage.tsx` & `EmployerJobEditPage.tsx`)
- [x] **P1-12: Employer Accommodation Readiness & Day-1 Onboarding Checklist** (Feature #26 — Interactive per-candidate accommodation provisioning checklist in `EmployerApplicationsPage.tsx`)
- [x] **P1-13: Structured Interview Rubric & Bias-Free Evaluation Scorecard + Question Bank** (Features #16 & #28 — Role-specific inclusive question bank generator and 4-criterion objective rubric scorecard with anti-bias reminders in `EmployerInterviewsPage.tsx`)
- [x] **P1-14: Advanced Typography, Spacing, Read-Aloud TTS & Focus Mode** (Features #31, #32, #36 — Line/letter spacing controls, Web Speech API Read-Aloud assistant, and Distraction-Free Focus Mode in `AccessibilityContext.tsx`, `AccessibilityDrawer.tsx`, and `JobDetailPage.tsx`)
- [x] **P1-15: Candidate Data Sovereignty (JSON Export & Account Deletion)** (Feature #39 — `GET /api/v1/candidates/export-data` & `DELETE /api/v1/candidates/account` + Privacy & Data Sovereignty panel in `CandidateProfilePage.tsx`)
- [x] **P1-16: In-App Accessibility Issue & Barrier Reporter** (Feature #40 — WCAG 2.2 SC 3.2.6 consistent help/reporting widget in `AccessibilityDrawer.tsx` backed by `POST /api/v1/feedback/accessibility` and Admin review table in `AdminDashboard.tsx`)

### P2 — Secondary Workflow & Analytics Enhancements
- [x] **P2-1: Transferable Skills & Cognitive Equivalency Mapper** (Feature #5 — Maps academic, hobby, or non-linear experiences into recognized job skills in `CandidateProfilePage.tsx` and `MatchingService.ts`)
- [x] **P2-2: Interactive Career Pathway & Role Transition Explorer** (Feature #6 — Visual career progression tracks with sensory/environment compatibility on `ResourcesPage.tsx`)
- [x] **P2-3: Transparent Application Progress Tracker with Next-Step SLAs** (Feature #21 — 5-stage visual progress bar with plain-language "What Happens Next" and expected response window on `CandidateApplicationsPage.tsx`)
- [x] **P2-4: Candidate Constructive Feedback Request & Structured Employer Delivery** (Feature #22 — One-click candidate feedback request on `CandidateApplicationsPage.tsx` and structured strengths-first feedback form on `EmployerApplicationsPage.tsx`)
- [x] **P2-5: Candidate Interview Preparation Kit & Time-Zone/Calendar Assistant** (Features #15 & #20 — Interactive pre-interview readiness checklist, time-zone display, sensory break buffer badge, and `.ics` calendar download on `CandidateInterviewsPage.tsx`)
- [x] **P2-6: Employer Inclusive Hiring Funnel & Accommodation Demand Analytics** (Feature #30 — Stage conversion funnel and top requested accommodations breakdown on `EmployerDashboard.tsx`)
- [x] **P2-7: Interactive Career Readiness & Learning Milestone Tracker** (Feature #35 — Checkable career readiness roadmap and completed resource tracking on `ResourcesPage.tsx`)
- [x] **P2-8: Admin Job Inclusivity Audit & Accessibility Report Management** (Features #38 & #40 — Admin moderation view showing job inclusivity scores and user-submitted accessibility reports on `AdminDashboard.tsx`)

### P3 — Polish, Seed Data Enrichment & Documentation
- [x] **P3-1: Enrich Seed Data** (`backend/src/utils/seedData.ts`) with plain-language job summaries, essential vs. preferred requirements, practical work-sample tasks, sensory profiles, and accommodation planner examples.
- [x] **P3-2: Complete Documentation Suite** (`docs/FEATURE_RESEARCH.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/FEATURES_IMPLEMENTED.md`, `docs/TESTING_REPORT.md`, `README.md`).
