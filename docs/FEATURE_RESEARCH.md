# Neurodivergent Career Exchange (NCE) — Feature Research & Evidence Catalog

**Document Version:** 2.0  
**Research & Access Date:** 2026-10-10  
**Scope:** 40 Researched Enhancements Across 6 Strategic Domains (Categories A–F)  
**Target Platform:** Neurodivergent Career Exchange (`frontend/` React + TypeScript + Tailwind CSS, `backend/` Node.js + Express + TypeScript + MongoDB)

---

## 1. Primary Evidence & External Reference Sources

All features evaluated in this document are grounded in current accessibility standards, inclusive recruitment evidence, and production neurodiversity employment platforms accessed and verified on **2026-10-10**:

1. **W3C Web Content Accessibility Guidelines (WCAG) 2.2 Recommendation**  
   - **URL:** https://www.w3.org/TR/WCAG22/ & https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/  
   - **Accessed:** 2026-10-10  
   - **Key Insights Applied:** 9 new success criteria in WCAG 2.2 including *2.4.11 Focus Not Obscured (Minimum)*, *2.4.13 Focus Appearance*, *2.5.7 Dragging Movements*, *2.5.8 Target Size (Minimum 24×24 CSS px)*, *3.2.6 Consistent Help*, *3.3.7 Redundant Entry*, and *3.3.8 Accessible Authentication (Minimum — no cognitive function tests, full support for password managers and copy/paste)*.

2. **W3C Cognitive Accessibility at W3C (COGA) & "Making Content Usable for People with Cognitive and Learning Disabilities"**  
   - **URL:** https://www.w3.org/WAI/cognitive/ & https://www.w3.org/TR/coga-usable/  
   - **Accessed:** 2026-10-10  
   - **Key Insights Applied:** Adaptable text spacing and typography, plain-language summaries alongside complex text, predictable multi-step flows with progress indicators, avoidance of arbitrary timers (Guideline 2.2), reduced visual clutter ("Focus Mode"), and multimodal delivery (Text-to-Speech / Read-Aloud).

3. **Mentra — Neurodiverse Employment Platform & Microsoft Accessibility Case Study**  
   - **URL:** https://blogs.microsoft.com/accessibility/mentra-is-reimagining-neurodiverse-employment/ & https://www.mentra.com/employers  
   - **Accessed:** 2026-10-10  
   - **Key Insights Applied:** Multi-dimensional matching across 75+ data points covering cognitive strengths, environmental sensitivities, and career aptitudes; "reverse job fair" pre-vetted matching (achieving 79% interview rate and 97% retention); neuro-inclusive company profiles; and personalized career companion guidance.

4. **Inclusively — Workplace Accommodations & "Success Enablers" Platform**  
   - **URL:** https://www.inclusively.com/  
   - **Accessed:** 2026-10-10  
   - **Key Insights Applied:** Reframing accommodations as proactive "Success Enablers" (e.g., written instructions, noise-canceling equipment, flexible start times, camera-optional meetings) decoupled from medical diagnoses; candidate-controlled disclosure stages; and aggregated employer accommodation analytics.

5. **Specialisterne — Task-Based Assessment & Neurodivergent Talent Integration**  
   - **URL:** https://www.specialisterne.com/  
   - **Accessed:** 2026-10-10  
   - **Key Insights Applied:** Replacing high-stress unstructured social interviews with practical work-sample tasks, asynchronous technical demonstrations, and structured employer onboarding checklists.

6. **UK Department for Work and Pensions (DWP) / Institute for Employment Studies — Rapid Evidence Assessment (Sept 2026)**  
   - **Title:** *Supporting employers to recruit disabled people and people with health conditions: Rapid Evidence Assessment*  
   - **URL:** https://www.gov.uk/government/publications/supporting-employers-to-recruit-disabled-people-and-people-with-health-conditions/supporting-employers-to-recruit-disabled-people-and-people-with-health-conditions-rapid-evidence-assessment  
   - **Accessed:** 2026-10-10  
   - **Key Insights Applied:** Empirical evidence confirming that structured recruitment rubrics, advance sharing of interview questions, explicit separation of essential vs. preferred criteria, removal of biased "culture fit" requirements, and Health Adjustment Passports significantly reduce hiring bias and improve neurodivergent candidate outcomes.

---

## 2. Comprehensive Catalog of 40 Researched Features

### Category A: Core Career Matching & Strengths Intelligence

#### Feature 1: Multi-Factor Explainable Job Match Engine
- **Category:** A — Core Career Matching & Strengths Intelligence
- **Problem Solved:** Traditional job boards show opaque percentage scores or keyword matches without explaining *why* a role fits a candidate's sensory, communication, and technical profile.
- **Target User:** Candidate, Employer
- **Competitor / Standard Reference:** Mentra 75-data-point matching engine (https://www.mentra.com/employers, accessed 2026-10-10)
- **Existing Codebase Status:** **Partially Present** (`MatchingService.ts` computes 5 sub-scores and `matchExplanation`, but lacks weight customization, transferable skills credit, and sensory alignment breakdown).
- **Implementation Complexity:** Medium
- **Dependencies:** `backend/src/services/matchingService.ts`, `frontend/src/pages/candidate/CandidateJobsPage.tsx`
- **Privacy / Accessibility / Security:** Explainability must never expose private candidate medical notes to employers; explanations are generated deterministically.
- **Recommended Priority:** **P1 (Implement / Enhance)**

#### Feature 2: Strengths-Based Candidate Profile Builder
- **Category:** A — Core Career Matching & Strengths Intelligence
- **Problem Solved:** Standard resumes penalize non-linear career histories or employment gaps common among neurodivergent professionals while ignoring cognitive strengths like hyperfocus, pattern recognition, and quality auditing.
- **Target User:** Candidate
- **Competitor / Standard Reference:** Mentra & Specialisterne Strengths Assessment (https://www.specialisterne.com/, accessed 2026-10-10)
- **Existing Codebase Status:** **Partially Present** (`CandidateProfile` has `strengths` and `howIWorkBest`, needs richer cognitive strengths taxonomy and guided prompts).
- **Implementation Complexity:** Low
- **Dependencies:** `CandidateProfile.ts`, `CandidateProfilePage.tsx`
- **Privacy / Accessibility / Security:** Candidate controls whether strengths profile is visible to employers.
- **Recommended Priority:** **P1 (Implement / Enhance)**

#### Feature 3: Candidate-Controlled Matching Weight Sliders
- **Category:** A — Core Career Matching & Strengths Intelligence
- **Problem Solved:** Every neurodivergent job seeker prioritizes different factors—one candidate may prioritize sensory environment and remote work (50% weight), while another prioritizes technical skill alignment (60% weight). Fixed platform weights remove candidate agency.
- **Target User:** Candidate
- **Competitor / Standard Reference:** W3C COGA Personalization & User Control (https://www.w3.org/WAI/cognitive/, accessed 2026-10-10)
- **Existing Codebase Status:** **Missing** (`MatchingService.ts` hardcodes 30% skills, 25% environment, 20% strengths, 15% experience, 10% accommodations).
- **Implementation Complexity:** Medium
- **Dependencies:** `CandidateProfile` model (`matchingWeights`), `MatchingService.ts`, `CandidateJobsPage.tsx`
- **Privacy / Accessibility / Security:** Accessible range sliders with keyboard support (WCAG 2.2 2.5.7/2.5.8) and automatic normalization to 100%.
- **Recommended Priority:** **P1 (Implement)**

#### Feature 4: Skill-Gap Analysis & Actionable Learning Bridge
- **Category:** A — Core Career Matching & Strengths Intelligence
- **Problem Solved:** Neurodivergent candidates often self-select out of applying if they lack 1–2 listed skills (literal interpretation of job requirements). Showing exact matched vs. missing skills paired with direct learning resources builds confidence.
- **Target User:** Candidate
- **Competitor / Standard Reference:** UK DWP Rapid Evidence Assessment on applicant self-selection &Mentra skill bridging (accessed 2026-10-10)
- **Existing Codebase Status:** **Missing** (`MatchingService` only returns a numeric `skillsMatch` percentage without listing matched/missing skills or linking to `Resource` items).
- **Implementation Complexity:** Medium
- **Dependencies:** `candidateController.ts`, `MatchingService.ts`, `JobDetailPage.tsx`
- **Privacy / Accessibility / Security:** Framed constructively ("Growth Opportunities") to prevent rejection sensitivity dysphoria (RSD).
- **Recommended Priority:** **P1 (Implement)**

#### Feature 5: Transferable Skills & Cognitive Equivalency Mapper
- **Category:** A — Core Career Matching & Strengths Intelligence
- **Problem Solved:** Candidates transitioning from non-traditional backgrounds, academic research, QA hobbies, or self-taught projects struggle to translate everyday strengths into enterprise skill taxonomies.
- **Target User:** Candidate
- **Competitor / Standard Reference:** Specialisterne talent conversion model (https://www.specialisterne.com/, accessed 2026-10-10)
- **Existing Codebase Status:** **Missing**
- **Implementation Complexity:** Medium
- **Dependencies:** `CandidateProfile.ts` (`transferableSkills`), `MatchingService.ts`, `CandidateProfilePage.tsx`
- **Privacy / Accessibility / Security:** Deterministic mapping of life/academic experiences to technical competencies.
- **Recommended Priority:** **P2 (Implement)**

#### Feature 6: Interactive Career Pathway & Role Transition Explorer
- **Category:** A — Core Career Matching & Strengths Intelligence
- **Problem Solved:** Candidates often know their cognitive strengths (e.g., high attention to detail, systematic debugging) but do not know which career tracks (e.g., Manual QA -> Automation Engineer -> Security Auditor) best align with their sensory and communication profile.
- **Target User:** Candidate
- **Competitor / Standard Reference:** Mentra Career Exploration & W3C COGA Clear Visual Hierarchies (accessed 2026-10-10)
- **Existing Codebase Status:** **Partially Present** (`AssessmentPage.tsx` shows basic category recommendations, but there is no interactive pathway progression explorer on Jobs/Resources).
- **Implementation Complexity:** Medium
- **Dependencies:** `ResourcesPage.tsx`, `CandidateJobsPage.tsx`
- **Privacy / Accessibility / Security:** Keyboard-navigable pathway cards with clear salary and environment expectations.
- **Recommended Priority:** **P2 (Implement)**

---

### Category B: Neuroinclusive Candidate Experience

#### Feature 7: Sensory & Cognitive Work-Style Profile
- **Category:** B — Neuroinclusive Candidate Experience
- **Problem Solved:** Open-plan offices, fluorescent lighting, frequent unannounced interruptions, and camera-on mandates are primary drivers of neurodivergent burnout, yet standard job portals never capture sensory tolerances.
- **Target User:** Candidate
- **Competitor / Standard Reference:** Mentra Environmental Sensitivity Profile (https://blogs.microsoft.com/accessibility/mentra-is-reimagining-neurodiverse-employment/, accessed 2026-10-10)
- **Existing Codebase Status:** **Partially Present** (`workPreferences.sensoryNeeds` is a basic string array; lacks structured ratings for noise tolerance, lighting sensitivity, interruption tolerance, multitasking preference, and meeting load).
- **Implementation Complexity:** Medium
- **Dependencies:** `CandidateProfile.ts`, `CandidateProfilePage.tsx`, `MatchingService.ts`
- **Privacy / Accessibility / Security:** Strictly framed around workplace environment preferences—zero medical diagnosis questions.
- **Recommended Priority:** **P1 (Implement)**

#### Feature 8: Communication & Collaboration Preference Matrix
- **Category:** B — Neuroinclusive Candidate Experience
- **Problem Solved:** Mismatched expectations around synchronous calls vs. written Slack/email updates cause avoidable friction during onboarding and performance reviews.
- **Target User:** Candidate, Employer
- **Competitor / Standard Reference:** Inclusively Success Enablers & W3C COGA Communication Guidelines (accessed 2026-10-10)
- **Existing Codebase Status:** **Partially Present** (`communicationPreferences` exists in `CandidateProfile.ts` and `CandidateProfilePage.tsx`).
- **Implementation Complexity:** Low
- **Dependencies:** `CandidateProfile.ts`, `CandidateProfilePage.tsx`
- **Privacy / Accessibility / Security:** Candidate-controlled visibility.
- **Recommended Priority:** **P1 (Enhance)**

#### Feature 9: Private Accommodation Planner ("Health Adjustment Passport")
- **Category:** B — Neuroinclusive Candidate Experience
- **Problem Solved:** Candidates need a private workspace to plan which workplace adjustments they need during interviews vs. after receiving a job offer vs. on Day 1—without automatically exposing this list to every employer browsing their profile.
- **Target User:** Candidate
- **Competitor / Standard Reference:** UK Gov Health Adjustment Passport (https://www.gov.uk/government/publications/supporting-employers-to-recruit-disabled-people-and-people-with-health-conditions/, accessed 2026-10-10) & Inclusively Success Enablers
- **Existing Codebase Status:** **Missing** (Current `accommodations.needed` is a flat list with a single boolean toggle).
- **Implementation Complexity:** Medium
- **Dependencies:** `CandidateProfile.ts` (`accommodationPlanner`), `CandidateProfilePage.tsx`
- **Privacy / Accessibility / Security:** **Private by default**; organized by stage (`interviewStage`, `offerStage`, `dayOneOnboarding`) with exportable personal summary.
- **Recommended Priority:** **P1 (Implement)**

#### Feature 10: Low-Stimulus / Sensory-Safe UI Mode
- **Category:** B — Neuroinclusive Candidate Experience
- **Problem Solved:** High-contrast neon colors, animated backgrounds, and dense layouts can trigger visual overload or migraines for photosensitive and autistic users.
- **Target User:** Candidate, Employer, Public Visitor
- **Competitor / Standard Reference:** W3C WCAG 2.2 (2.3.1 / 2.2.2) & COGA Sensory Overload Mitigation (accessed 2026-10-10)
- **Existing Codebase Status:** **Partially Present** (`AccessibilityContext.tsx` has `lowStimulation` and `reducedMotion`, plus dark mode).
- **Implementation Complexity:** Low
- **Dependencies:** `AccessibilityContext.tsx`, `AccessibilityDrawer.tsx`, `index.css`
- **Privacy / Accessibility / Security:** Stored in `localStorage` for instant persistence before authentication.
- **Recommended Priority:** **P1 (Enhance)**

#### Feature 11: Save-and-Resume Multi-Step Flows with Redundant-Entry Prevention
- **Category:** B — Neuroinclusive Candidate Experience
- **Problem Solved:** Executive dysfunction and working-memory differences mean long forms frequently get abandoned if progress isn't saved automatically or if users have to re-enter profile data on every application.
- **Target User:** Candidate
- **Competitor / Standard Reference:** W3C WCAG 2.2 Success Criterion 3.3.7 *Redundant Entry* (https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/, accessed 2026-10-10)
- **Existing Codebase Status:** **Partially Present** (`AssessmentPage.tsx` saves partial progress to backend, but job applications and onboarding wizard need auto-saved drafts and pre-filled profile data).
- **Implementation Complexity:** Medium
- **Dependencies:** `CandidateProfilePage.tsx`, `JobDetailPage.tsx`
- **Privacy / Accessibility / Security:** Local draft auto-save with clear "Draft Saved" status indicator.
- **Recommended Priority:** **P1 (Implement)**

#### Feature 12: Guided Step-by-Step Candidate Onboarding Wizard
- **Category:** B — Neuroinclusive Candidate Experience
- **Problem Solved:** Presenting a massive 50-field profile page immediately after registration overwhelms candidates with ADHD or executive function challenges.
- **Target User:** Candidate
- **Competitor / Standard Reference:** W3C COGA Objective 3 "Use Clear and Understandable Content / Step-by-Step Processes" (accessed 2026-10-10)
- **Existing Codebase Status:** **Missing** (`CandidateProfilePage.tsx` uses tabs, but lacks a guided step-by-step onboarding wizard with completion percentage and bite-sized steps).
- **Implementation Complexity:** Medium
- **Dependencies:** `CandidateProfilePage.tsx`, `CandidateDashboard.tsx`
- **Privacy / Accessibility / Security:** Every step is skippable; no countdown timers; clear progress bar.
- **Recommended Priority:** **P1 (Implement)**

#### Feature 13: Plain-Language Job Description Translator & Requirement Separator
- **Category:** B — Neuroinclusive Candidate Experience
- **Problem Solved:** Corporate job descriptions filled with idioms ("wear many hats", "rockstar ninja", "fast-paced environment") and bundled requirements confuse literal thinkers and deter qualified neurodivergent applicants.
- **Target User:** Candidate, Employer
- **Competitor / Standard Reference:** UK DWP Rapid Evidence Assessment & W3C COGA Plain Language Guidelines (accessed 2026-10-10)
- **Existing Codebase Status:** **Missing** (`Job` model has a single `requirements: string[]` and `description: string`).
- **Implementation Complexity:** Medium
- **Dependencies:** `Job.ts` (`plainLanguageSummary`, `essentialRequirements`, `preferredRequirements`), `JobDetailPage.tsx`, `EmployerJobCreatePage.tsx`
- **Privacy / Accessibility / Security:** Deterministic plain-language translation fallback automatically simplifies corporate jargon and separates Essential ("Must-Have") from Preferred ("Nice-to-Have") criteria.
- **Recommended Priority:** **P1 (Implement)**

#### Feature 14: Accessible CV / Portfolio Smart Text Parser & Importer
- **Category:** B — Neuroinclusive Candidate Experience
- **Problem Solved:** Manually retyping skills, roles, and strengths from an existing resume or GitHub/portfolio summary violates WCAG 2.2 3.3.7 (Redundant Entry) and creates high cognitive friction.
- **Target User:** Candidate
- **Competitor / Standard Reference:** WCAG 2.2 3.3.7 Redundant Entry & Mentra Resume Parser (accessed 2026-10-10)
- **Existing Codebase Status:** **Missing**
- **Implementation Complexity:** Medium
- **Dependencies:** `POST /api/v1/candidates/parse-cv` in `candidateController.ts`, `CandidateProfilePage.tsx`
- **Privacy / Accessibility / Security:** Deterministic server-side extraction of skills, experience level, strengths, and links from pasted resume text or uploaded `.txt`/`.md`/`.json` files without sending PII to third-party LLMs; candidate reviews and edits all extracted fields before saving.
- **Recommended Priority:** **P1 (Implement)**

---

### Category C: Inclusive Hiring & Interview Workflows

#### Feature 15: Candidate Interview Preparation & Advance Question Kit
- **Category:** C — Inclusive Hiring & Interview Workflows
- **Problem Solved:** Surprise interview questions test rapid social improvisation rather than job competence. Providing the interview format, exact agenda, and advance questions eliminates unnecessary anxiety.
- **Target User:** Candidate, Employer
- **Competitor / Standard Reference:** UK DWP Rapid Evidence Assessment & Specialisterne Inclusive Interview Practices (accessed 2026-10-10)
- **Existing Codebase Status:** **Partially Present** (`Interview` model has `agenda` and `questionsInAdvance`, but lacks an interactive Candidate Interview Prep Checklist and anxiety-reducing walkthrough).
- **Implementation Complexity:** Low
- **Dependencies:** `CandidateInterviewsPage.tsx`, `Interview.ts`
- **Privacy / Accessibility / Security:** Candidate can request missing advance questions with one click.
- **Recommended Priority:** **P1 (Enhance)**

#### Feature 16: Structured Interview Rubric & Bias-Free Evaluation Scorecard
- **Category:** C — Inclusive Hiring & Interview Workflows
- **Problem Solved:** Unstructured interviews frequently penalize neurodivergent candidates for lack of eye contact, flat affect, or pause times rather than evaluating technical and problem-solving competency.
- **Target User:** Employer
- **Competitor / Standard Reference:** UK DWP Rapid Evidence Assessment (Sept 2026) — strong causal evidence for structured rubrics reducing disability bias (accessed 2026-10-10)
- **Existing Codebase Status:** **Missing** (`EmployerInterviewsPage.tsx` only collects free-text `notes`).
- **Implementation Complexity:** Medium
- **Dependencies:** `Interview.ts` (`evaluationRubric`), `interviewController.ts`, `EmployerInterviewsPage.tsx`
- **Privacy / Accessibility / Security:** Explicit anti-bias warning banner reminding interviewers not to score eye contact, body language, or small talk.
- **Recommended Priority:** **P1 (Implement)**

#### Feature 17: Asynchronous & Multi-Format Interview Mode Selector
- **Category:** C — Inclusive Hiring & Interview Workflows
- **Problem Solved:** Live video calls are overwhelming for many candidates with auditory processing differences or speech differences.
- **Target User:** Candidate, Employer
- **Competitor / Standard Reference:** Inclusively & Specialisterne alternative assessment formats (accessed 2026-10-10)
- **Existing Codebase Status:** **Partially Present** (`Job.ts` and `Interview.ts` support `WRITTEN_ASYNC`, ` PRACTICAL_TASK`, `VIDEO_CALL_CAMERA_OFF`, etc.).
- **Implementation Complexity:** Low
- **Dependencies:** `JobDetailPage.tsx`, `CandidateInterviewsPage.tsx`
- **Privacy / Accessibility / Security:** Ensures candidates can select their preferred format at application time.
- **Recommended Priority:** **P1 (Enhance)**

#### Feature 18: Work-Sample & Task-Based Assessment Alternative
- **Category:** C — Inclusive Hiring & Interview Workflows
- **Problem Solved:** Traditional cover letters and screening calls measure self-promotion rather than actual role skill (e.g., finding bugs, analyzing a dataset, auditing security logs).
- **Target User:** Candidate, Employer
- **Competitor / Standard Reference:** Specialisterne Practical Task Assessment Model (https://www.specialisterne.com/, accessed 2026-10-10)
- **Existing Codebase Status:** **Missing** (`Application.ts` only has `coverNote` and `requestedAccommodations`).
- **Implementation Complexity:** Medium
- **Dependencies:** `Job.ts` (`workSampleTask`), `Application.ts` (`submissionType`, `workSampleSubmission`), `JobDetailPage.tsx`, `EmployerApplicationsPage.tsx`
- **Privacy / Accessibility / Security:** Untimed, practical work-sample option so candidates can demonstrate ability directly instead of writing a traditional cover letter.
- **Recommended Priority:** **P1 (Implement)**

#### Feature 19: Stage-Gate Privacy & Disclosure Control Matrix
- **Category:** C — Inclusive Hiring & Interview Workflows
- **Problem Solved:** Candidates fear bias if their accommodation needs are visible during initial resume screening, yet want those accommodations automatically shared once an interview is scheduled or an offer is made.
- **Target User:** Candidate
- **Competitor / Standard Reference:** Inclusively Stage-Controlled Disclosure & UK Gov Access to Work (accessed 2026-10-10)
- **Existing Codebase Status:** **Partially Present** (`CandidateProfile.privacySettings` has basic booleans, but lacks stage-based disclosure rules: `AT_APPLICATION`, `AT_INTERVIEW`, `POST_OFFER`, `NEVER`).
- **Implementation Complexity:** Medium
- **Dependencies:** `CandidateProfile.ts` (`disclosurePreferences`), `CandidateProfilePage.tsx`
- **Privacy / Accessibility / Security:** Enforces privacy-by-design and granular candidate consent.
- **Recommended Priority:** **P1 (Implement)**

#### Feature 20: Time-Zone Aware, Buffer-Protected Interview Scheduler
- **Category:** C — Inclusive Hiring & Interview Workflows
- **Problem Solved:** Back-to-back interviews without sensory decompression breaks or ambiguous time zones cause executive function errors and missed meetings.
- **Target User:** Candidate, Employer
- **Competitor / Standard Reference:** W3C COGA Time Management & Predictability Guidelines (accessed 2026-10-10)
- **Existing Codebase Status:** **Partially Present** (`EmployerInterviewsPage.tsx` schedules interviews, but lacks explicit time-zone selection, sensory break buffer configuration, and downloadable `.ics` calendar details).
- **Implementation Complexity:** Low
- **Dependencies:** `Interview.ts`, `EmployerInterviewsPage.tsx`, `CandidateInterviewsPage.tsx`
- **Privacy / Accessibility / Security:** Clear local time display and one-click calendar export.
- **Recommended Priority:** **P2 (Implement)**

#### Feature 21: Transparent Application Progress Tracker with Expected SLA Next Steps
- **Category:** C — Inclusive Hiring & Interview Workflows
- **Problem Solved:** "Hiring black holes" and ambiguous statuses ("Under Review") create severe uncertainty and anxiety for neurodivergent job seekers who thrive on predictable timelines.
- **Target User:** Candidate
- **Competitor / Standard Reference:** W3C COGA Predictable Processes & Mentra Candidate Portal (accessed 2026-10-10)
- **Existing Codebase Status:** **Partially Present** (`CandidateApplicationsPage.tsx` shows status badges, but lacks a visual 5-step progress stepper explaining *what happens next* and expected response timelines).
- **Implementation Complexity:** Low
- **Dependencies:** `CandidateApplicationsPage.tsx`, `Application.ts`
- **Privacy / Accessibility / Security:** Provides plain-language explanation of every stage (`APPLIED` -> `REVIEWING` -> `INTERVIEW_STAGE` -> `OFFER` -> `PLACED`).
- **Recommended Priority:** **P1 (Implement)**

#### Feature 22: Candidate Constructive Feedback Request & Structured Delivery
- **Category:** C — Inclusive Hiring & Interview Workflows
- **Problem Solved:** When neurodivergent candidates are rejected or interviewed without concrete feedback, they cannot tell if the gap was technical or communication-related.
- **Target User:** Candidate, Employer
- **Competitor / Standard Reference:** Specialisterne & UK DWP Inclusive Recruitment Feedback Loops (accessed 2026-10-10)
- **Existing Codebase Status:** **Missing**
- **Implementation Complexity:** Medium
- **Dependencies:** `Application.ts` (`feedbackRequested`, `structuredFeedback`), `applicationController.ts`, `CandidateApplicationsPage.tsx`, `EmployerApplicationsPage.tsx`
- **Privacy / Accessibility / Security:** Structured, strengths-affirming feedback template (Strengths Demonstrated, Growth Areas, Recommended Resources).
- **Recommended Priority:** **P2 (Implement)**

---

### Category D: Employer & Recruiter Capabilities

#### Feature 23: Employer Neuro-Inclusivity Maturity & Environment Profile
- **Category:** D — Employer & Recruiter Capabilities
- **Problem Solved:** Candidates need to know an employer's actual neurodivergent ERGs, sensory office setup, and manager training level before investing energy in applying.
- **Target User:** Employer, Candidate
- **Competitor / Standard Reference:** Mentra Neuro-Inclusive Company Profiles (https://www.mentra.com/employers, accessed 2026-10-10)
- **Existing Codebase Status:** **Present** (`EmployerProfile.ts` and `EmployerProfilePage.tsx` capture `inclusivityScore`, `accommodationsOffered`, `sensoryFriendlySpaces`, `ergs`, and `neurodiversityStatement`).
- **Implementation Complexity:** Low
- **Dependencies:** `EmployerProfile.ts`, `EmployerProfilePage.tsx`
- **Privacy / Accessibility / Security:** Publicly verifiable on job cards.
- **Recommended Priority:** **P2 (Already Present / Polish)**

#### Feature 24: Neuroinclusive Job-Posting Quality Checker & Bias Linter
- **Category:** D — Employer & Recruiter Capabilities
- **Problem Solved:** Employers unintentionally include exclusionary phrases ("must be an extroverted team player", "thrive in chaotic high-pressure environments", "excellent eye contact", excessive 10+ bullet requirement lists) in job postings.
- **Target User:** Employer
- **Competitor / Standard Reference:** UK DWP Rapid Evidence Assessment (Sept 2026) & W3C COGA Plain Language (accessed 2026-10-10)
- **Existing Codebase Status:** **Missing**
- **Implementation Complexity:** Medium
- **Dependencies:** `POST /api/v1/jobs/analyze-inclusivity` in `jobController.ts`, `EmployerJobCreatePage.tsx`, `EmployerJobEditPage.tsx`
- **Privacy / Accessibility / Security:** Deterministic rule-based linguistic analyzer that scores job postings (0–100), flags exclusionary phrases with concrete neuroinclusive replacements, warns on requirement overload, and auto-generates a plain-language summary.
- **Recommended Priority:** **P1 (Implement)**

#### Feature 25: Candidate Shortlisting with Multi-Factor Match Explainability
- **Category:** D — Employer & Recruiter Capabilities
- **Problem Solved:** Recruiters need to see *why* a candidate is a strong match across technical skills, cognitive strengths, and workplace environment compatibility without manual spreadsheet comparison.
- **Target User:** Employer
- **Competitor / Standard Reference:** Mentra Pre-Vetted Talent Shortlist (accessed 2026-10-10)
- **Existing Codebase Status:** **Present** (`EmployerCandidatesPage.tsx` and `EmployerApplicationsPage.tsx` display `matchScore` and 5-factor breakdown).
- **Implementation Complexity:** Low
- **Dependencies:** `EmployerApplicationsPage.tsx`, `EmployerCandidatesPage.tsx`
- **Privacy / Accessibility / Security:** Respects candidate privacy/disclosure settings; never auto-rejects any candidate.
- **Recommended Priority:** **P2 (Already Present / Enhance)**

#### Feature 26: Employer Accommodation Readiness & Day-1 Onboarding Checklist
- **Category:** D — Employer & Recruiter Capabilities
- **Problem Solved:** Even well-intentioned hiring managers often forget to provision requested accommodations (e.g., quiet desk location, written onboarding guide, noise-canceling headphones, buddy assignment) before the candidate's first interview or first day.
- **Target User:** Employer
- **Competitor / Standard Reference:** Inclusively Retain Platform & Specialisterne Onboarding Playbook (accessed 2026-10-10)
- **Existing Codebase Status:** **Missing**
- **Implementation Complexity:** Medium
- **Dependencies:** `Application.ts` (`accommodationChecklist`), `EmployerApplicationsPage.tsx`
- **Privacy / Accessibility / Security:** Interactive checklist generated directly from the candidate's consented accommodation requests.
- **Recommended Priority:** **P1 (Implement)**

#### Feature 27: Recruiter Collaboration Notes & Structured Stage Pipeline
- **Category:** D — Employer & Recruiter Capabilities
- **Problem Solved:** Hiring teams need structured pipeline management (`APPLIED` -> `REVIEWING` -> `SHORTLISTED` -> `INTERVIEW_STAGE` -> `OFFER` -> `PLACED`) with audit timestamps and shared notes.
- **Target User:** Employer
- **Competitor / Standard Reference:** Modern inclusive ATS workflows (accessed 2026-10-10)
- **Existing Codebase Status:** **Present** (`Application.ts` has `employerNotes` and `history`; `EmployerApplicationsPage.tsx` manages stages).
- **Implementation Complexity:** Low
- **Dependencies:** `EmployerApplicationsPage.tsx`
- **Privacy / Accessibility / Security:** Role-restricted to the owning employer.
- **Recommended Priority:** **P2 (Enhance with Feedback & Checklist)**

#### Feature 28: Neuroinclusive Interview Question Bank & Kit Generator
- **Category:** D — Employer & Recruiter Capabilities
- **Problem Solved:** Hiring managers often don't know how to phrase concrete, behavioral/task-based interview questions instead of abstract hypothetical questions ("Where do you see yourself in 5 years?").
- **Target User:** Employer
- **Competitor / Standard Reference:** Specialisterne & UK DWP Structured Interview Guidance (accessed 2026-10-10)
- **Existing Codebase Status:** **Missing**
- **Implementation Complexity:** Low
- **Dependencies:** `EmployerInterviewsPage.tsx`
- **Privacy / Accessibility / Security:** One-click insertion of role-specific, literal, strengths-focused interview agendas and advance questions when scheduling an interview.
- **Recommended Priority:** **P1 (Implement)**

#### Feature 29: Job sensory & Cognitive Load Transparency Card
- **Category:** D — Employer & Recruiter Capabilities
- **Problem Solved:** Candidates need clear visibility into sensory conditions (noise level, lighting, meeting load, interrupt frequency) directly on job listings.
- **Target User:** Employer, Candidate
- **Competitor / Standard Reference:** Mentra Environmental Compatibility (accessed 2026-10-10)
- **Existing Codebase Status:** **Partially Present** (`Job.ts` has `workEnvironment`, enhanced with clear sensory badges on `JobDetailPage.tsx`).
- **Implementation Complexity:** Low
- **Dependencies:** `JobDetailPage.tsx`, `EmployerJobCreatePage.tsx`
- **Privacy / Accessibility / Security:** Standardized environmental tags.
- **Recommended Priority:** **P1 (Enhance)**

#### Feature 30: Employer Inclusive Hiring Funnel & Accommodation Demand Analytics
- **Category:** D — Employer & Recruiter Capabilities
- **Problem Solved:** Employers lack visibility into which stages of their hiring funnel have drop-offs and which accommodations are most frequently requested across applicants so they can proactively budget and standardize those accommodations.
- **Target User:** Employer
- **Competitor / Standard Reference:** Inclusively Employer Insights & Accommodation Analytics (https://www.inclusively.com/, accessed 2026-10-10)
- **Existing Codebase Status:** **Partially Present** (`EmployerDashboard.tsx` has basic counts, but lacks conversion funnel percentages and aggregated accommodation demand analytics).
- **Implementation Complexity:** Medium
- **Dependencies:** `employerController.ts`, `EmployerDashboard.tsx`
- **Privacy / Accessibility / Security:** Aggregated statistics only—preserves individual privacy while informing organizational readiness.
- **Recommended Priority:** **P2 (Implement)**

---

### Category E: Accessibility, Wellbeing & Learning

#### Feature 31: Advanced Typography, Spacing & Dyslexia-Friendly Reading Controls
- **Category:** E — Accessibility, Wellbeing & Learning
- **Problem Solved:** Dense text blocks with tight line height or narrow letter spacing impair reading fluency for users with dyslexia, ADHD, or visual crowding sensitivity.
- **Target User:** All Users
- **Competitor / Standard Reference:** W3C WCAG 2.2 SC 1.4.12 *Text Spacing* & W3C COGA Typography Guidelines (https://www.w3.org/TR/WCAG22/#text-spacing, accessed 2026-10-10)
- **Existing Codebase Status:** **Partially Present** (`AccessibilityContext.tsx` has `fontSize` and `dyslexiaFont`, but lacks `lineSpacing` [normal/relaxed/loose] and `letterSpacing` [normal/wide] controls).
- **Implementation Complexity:** Low
- **Dependencies:** `AccessibilityContext.tsx`, `AccessibilityDrawer.tsx`, `index.css`
- **Privacy / Accessibility / Security:** Persisted in `localStorage` and applied globally via CSS classes/variables.
- **Recommended Priority:** **P1 (Implement)**

#### Feature 32: Built-In Read-Aloud (Text-to-Speech) & Simplified View Assistant
- **Category:** E — Accessibility, Wellbeing & Learning
- **Problem Solved:** Long job descriptions and learning guides cause reading fatigue for users with dyslexia, ADHD, or auditory learning preferences.
- **Target User:** Candidate, All Users
- **Competitor / Standard Reference:** W3C COGA Multimodal Content Delivery & WAI-Adapt (https://www.w3.org/WAI/cognitive/, accessed 2026-10-10)
- **Existing Codebase Status:** **Missing**
- **Implementation Complexity:** Medium
- **Dependencies:** `AccessibilityContext.tsx`, `AccessibilityDrawer.tsx`, `JobDetailPage.tsx`, `ResourcesPage.tsx`
- **Privacy / Accessibility / Security:** Uses native browser `window.speechSynthesis` (Web Speech API) with zero external data transmission, play/pause/stop controls, and adjustable speech rate.
- **Recommended Priority:** **P1 (Implement)**

#### Feature 33: WCAG 2.2 Target Size (24×24px), Focus Appearance & Accessible Auth
- **Category:** E — Accessibility, Wellbeing & Learning
- **Problem Solved:** Small icon buttons, obscured focus rings, and authentication forms that block password pasting or lack visibility toggles violate WCAG 2.2 AA criteria.
- **Target User:** All Users
- **Competitor / Standard Reference:** W3C WCAG 2.2 SC 2.4.11, 2.4.13, 2.5.8, and 3.3.8 (https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/, accessed 2026-10-10)
- **Existing Codebase Status:** **Partially Present** (`LoginPage.tsx` and `RegisterPage.tsx` lack show/hide password toggles, explicit paste-allowed accessible auth attributes, and backend connectivity verification badge).
- **Implementation Complexity:** Low
- **Dependencies:** `LoginPage.tsx`, `RegisterPage.tsx`, `index.css`
- **Privacy / Accessibility / Security:** Complies with WCAG 2.2 SC 3.3.8 (Accessible Authentication Minimum) by supporting password managers, copy/paste, and show/hide password toggles without cognitive puzzles.
- **Recommended Priority:** **P0 (Implement)**

#### Feature 34: Neurodivergent Workplace Self-Advocacy & Playbook Library
- **Category:** E — Accessibility, Wellbeing & Learning
- **Problem Solved:** Candidates and employers need practical, actionable guides on sensory regulation, requesting accommodations, and conducting neuro-inclusive interviews.
- **Target User:** Candidate, Employer
- **Competitor / Standard Reference:** Inclusively & Specialisterne Resource Centers (accessed 2026-10-10)
- **Existing Codebase Status:** **Present** (`ResourcesPage.tsx` and `Resource.ts` model with read modal).
- **Implementation Complexity:** Low
- **Dependencies:** `ResourcesPage.tsx`
- **Privacy / Accessibility / Security:** Supports Read-Aloud TTS and category filtering.
- **Recommended Priority:** **P2 (Enhance with TTS & Milestones)**

#### Feature 35: Interactive Career Readiness & Learning Milestone Tracker
- **Category:** E — Accessibility, Wellbeing & Learning
- **Problem Solved:** Self-paced career preparation feels overwhelming without structured, checkable milestones and progress tracking across technical, interview, and self-advocacy goals.
- **Target User:** Candidate
- **Competitor / Standard Reference:** W3C COGA Goal Breakdown & Mentra Career Readiness (accessed 2026-10-10)
- **Existing Codebase Status:** **Missing**
- **Implementation Complexity:** Low
- **Dependencies:** `ResourcesPage.tsx`, `CandidateProfile.ts` (`learningMilestones`)
- **Privacy / Accessibility / Security:** Syncs with candidate profile and `localStorage` so candidates can track completed articles and career readiness tasks.
- **Recommended Priority:** **P2 (Implement)**

#### Feature 36: Focus-Friendly / Distraction-Free Application Mode
- **Category:** E — Accessibility, Wellbeing & Learning
- **Problem Solved:** Busy sidebars, notification badges, and multi-column layouts distract candidates with ADHD when they are trying to complete a job application or assessment.
- **Target User:** Candidate
- **Competitor / Standard Reference:** W3C COGA Objective 5 "Help Users Focus" (https://www.w3.org/TR/coga-usable/, accessed 2026-10-10)
- **Existing Codebase Status:** **Missing**
- **Implementation Complexity:** Low
- **Dependencies:** `AccessibilityContext.tsx` (`focusMode`), `CandidateLayout.tsx`, `JobDetailPage.tsx`
- **Privacy / Accessibility / Security:** Dims non-essential chrome/navigation or collapses distractions so the user can focus on one task at a time.
- **Recommended Priority:** **P1 (Implement)**

---

### Category F: Trust, Safety, Admin & Platform Quality

#### Feature 37: Employer Inclusivity Verification & Trust Badge Workflow
- **Category:** F — Trust, Safety, Admin & Platform Quality
- **Problem Solved:** Neurodivergent candidates need assurance that employers claiming to be "neuro-inclusive" have actually been reviewed for inclusive practices and accommodation commitments.
- **Target User:** Admin, Employer, Candidate
- **Competitor / Standard Reference:** Mentra & Inclusively Verified Employer Partner standards (accessed 2026-10-10)
- **Existing Codebase Status:** **Present** (`AdminDashboard.tsx` and `adminController.ts` support employer verification toggle and trust badge).
- **Implementation Complexity:** Low
- **Dependencies:** `AdminDashboard.tsx`, `adminController.ts`
- **Privacy / Accessibility / Security:** Role-guarded to `ADMIN` users.
- **Recommended Priority:** **P2 (Already Present / Maintain)**

#### Feature 38: Job Moderation & Inclusivity Audit Queue
- **Category:** F — Trust, Safety, Admin & Platform Quality
- **Problem Solved:** Platform administrators need visibility into job postings' inclusivity scores and the ability to moderate or remove non-compliant listings.
- **Target User:** Admin
- **Competitor / Standard Reference:** Inclusive Job Board Governance Standards (accessed 2026-10-10)
- **Existing Codebase Status:** **Partially Present** (`AdminDashboard.tsx` lists jobs and toggles status; can be enhanced with Inclusivity Linter score visibility).
- **Implementation Complexity:** Low
- **Dependencies:** `AdminDashboard.tsx`, `adminController.ts`
- **Privacy / Accessibility / Security:** Role-guarded to `ADMIN`.
- **Recommended Priority:** **P2 (Enhance)**

#### Feature 39: Candidate Data Sovereignty: JSON Data Export & Self-Service Account Deletion
- **Category:** F — Trust, Safety, Admin & Platform Quality
- **Problem Solved:** Workplace accommodation preferences and sensory profiles are deeply personal. Candidates must have full GDPR/privacy-compliant ownership to export all their stored data in machine-readable JSON or permanently delete their account and associated profile/applications at any time.
- **Target User:** Candidate
- **Competitor / Standard Reference:** GDPR Article 17 (Right to Erasure) & Article 20 (Right to Data Portability); W3C Privacy Principles (accessed 2026-10-10)
- **Existing Codebase Status:** **Missing**
- **Implementation Complexity:** Medium
- **Dependencies:** `GET /api/v1/candidates/export-data` & `DELETE /api/v1/candidates/account` in `candidateController.ts`, `CandidateProfilePage.tsx`
- **Privacy / Accessibility / Security:** Requires explicit confirmation before deletion; cascades cleanup across `User`, `CandidateProfile`, `Application`, and `AssessmentResult`.
- **Recommended Priority:** **P1 (Implement)**

#### Feature 40: In-App Accessibility Issue & Barrier Reporter
- **Category:** F — Trust, Safety, Admin & Platform Quality
- **Problem Solved:** WCAG 2.2 Success Criterion 3.2.6 (*Consistent Help*) emphasizes providing a consistent mechanism for users to report accessibility barriers or get help across every page of an application.
- **Target User:** All Users, Admin
- **Competitor / Standard Reference:** W3C WCAG 2.2 SC 3.2.6 *Consistent Help* (https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/, accessed 2026-10-10)
- **Existing Codebase Status:** **Missing**
- **Implementation Complexity:** Medium
- **Dependencies:** `AccessibilityReport` model or admin store, `POST /api/v1/feedback/accessibility`, `GET /api/v1/admin/accessibility-reports`, `AccessibilityDrawer.tsx`, `AdminDashboard.tsx`
- **Privacy / Accessibility / Security:** Accessible from the persistent Accessibility Drawer on every route; viewable and resolvable by Admins in `AdminDashboard.tsx`.
- **Recommended Priority:** **P1 (Implement)**

---

## 3. Summary Matrix of All 40 Researched Features

| # | Feature Name | Category | Existing Status | Complexity | Priority | Selected for Implementation |
|---|---|---|---|---|---|---|
| 1 | Multi-Factor Explainable Job Match Engine | A | Partial | Medium | P1 | Yes (Enhanced) |
| 2 | Strengths-Based Candidate Profile Builder | A | Partial | Low | P1 | Yes (Enhanced) |
| 3 | Candidate-Controlled Matching Weight Sliders | A | Missing | Medium | P1 | **Yes (New)** |
| 4 | Skill-Gap Analysis & Actionable Learning Bridge | A | Missing | Medium | P1 | **Yes (New)** |
| 5 | Transferable Skills & Cognitive Equivalency Mapper | A | Missing | Medium | P2 | **Yes (New)** |
| 6 | Interactive Career Pathway & Role Transition Explorer | A | Partial | Medium | P2 | **Yes (New)** |
| 7 | Sensory & Cognitive Work-Style Profile | B | Partial | Medium | P1 | **Yes (New/Enhanced)** |
| 8 | Communication & Collaboration Preference Matrix | B | Partial | Low | P1 | Yes (Enhanced) |
| 9 | Private Accommodation Planner (Adjustment Passport) | B | Missing | Medium | P1 | **Yes (New)** |
| 10 | Low-Stimulus / Sensory-Safe UI Mode | B | Partial | Low | P1 | Yes (Enhanced) |
| 11 | Save-and-Resume Flows & Redundant-Entry Prevention | B | Partial | Medium | P1 | **Yes (Enhanced)** |
| 12 | Guided Step-by-Step Candidate Onboarding Wizard | B | Missing | Medium | P1 | **Yes (New)** |
| 13 | Plain-Language Job Translator & Requirement Separator | B | Missing | Medium | P1 | **Yes (New)** |
| 14 | Accessible CV / Portfolio Smart Text Parser | B | Missing | Medium | P1 | **Yes (New)** |
| 15 | Candidate Interview Prep & Advance Question Kit | C | Partial | Low | P1 | **Yes (Enhanced)** |
| 16 | Structured Interview Rubric & Bias-Free Scorecard | C | Missing | Medium | P1 | **Yes (New)** |
| 17 | Asynchronous & Multi-Format Interview Selector | C | Partial | Low | P1 | Yes (Enhanced) |
| 18 | Work-Sample & Task-Based Assessment Alternative | C | Missing | Medium | P1 | **Yes (New)** |
| 19 | Stage-Gate Privacy & Disclosure Control Matrix | C | Partial | Medium | P1 | **Yes (New/Enhanced)** |
| 20 | Time-Zone Aware, Buffer-Protected Interview Scheduler | C | Partial | Low | P2 | **Yes (New)** |
| 21 | Transparent Application Tracker with Next-Step SLAs | C | Partial | Low | P1 | **Yes (New/Enhanced)** |
| 22 | Candidate Constructive Feedback Request & Delivery | C | Missing | Medium | P2 | **Yes (New)** |
| 23 | Employer Neuro-Inclusivity Maturity Profile | D | Present | Low | P2 | Yes (Verified) |
| 24 | Neuroinclusive Job-Posting Quality Checker & Linter | D | Missing | Medium | P1 | **Yes (New)** |
| 25 | Candidate Shortlisting with Match Explainability | D | Present | Low | P2 | Yes (Verified) |
| 26 | Employer Accommodation Readiness & Day-1 Checklist | D | Missing | Medium | P1 | **Yes (New)** |
| 27 | Recruiter Collaboration Notes & Stage Pipeline | D | Present | Low | P2 | Yes (Enhanced) |
| 28 | Neuroinclusive Interview Question Bank & Kit Generator | D | Missing | Low | P1 | **Yes (New)** |
| 29 | Job Sensory & Cognitive Load Transparency Card | D | Partial | Low | P1 | **Yes (Enhanced)** |
| 30 | Employer Inclusive Funnel & Accommodation Analytics | D | Partial | Medium | P2 | **Yes (New)** |
| 31 | Advanced Typography, Line/Letter Spacing & Dyslexia Mode | E | Partial | Low | P1 | **Yes (New/Enhanced)** |
| 32 | Built-In Read-Aloud (TTS) & Simplified View Assistant | E | Missing | Medium | P1 | **Yes (New)** |
| 33 | WCAG 2.2 Target Size, Focus & Accessible Auth | E | Partial | Low | P0 | **Yes (New/P0)** |
| 34 | Neurodivergent Workplace Self-Advocacy Library | E | Present | Low | P2 | Yes (Enhanced) |
| 35 | Interactive Career Readiness & Milestone Tracker | E | Missing | Low | P2 | **Yes (New)** |
| 36 | Focus-Friendly / Distraction-Free Application Mode | E | Missing | Low | P1 | **Yes (New)** |
| 37 | Employer Inclusivity Verification & Trust Badge | F | Present | Low | P2 | Yes (Verified) |
| 38 | Job Moderation & Inclusivity Audit Queue | F | Partial | Low | P2 | Yes (Enhanced) |
| 39 | Candidate JSON Data Export & Account Deletion | F | Missing | Medium | P1 | **Yes (New)** |
| 40 | In-App Accessibility Issue & Barrier Reporter | F | Missing | Medium | P1 | **Yes (New)** |
