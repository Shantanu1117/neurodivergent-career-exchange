import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { CandidateProfile } from '../models/CandidateProfile.js';
import { EmployerProfile } from '../models/EmployerProfile.js';
import { Job } from '../models/Job.js';
import { Application } from '../models/Application.js';
import { Interview } from '../models/Interview.js';
import { SavedJob } from '../models/SavedJob.js';
import { Resource } from '../models/Resource.js';
import { AssessmentQuestion } from '../models/Assessment.js';
import { AssessmentResult } from '../models/AssessmentResult.js';
import { Notification } from '../models/Notification.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { ASSESSMENT_QUESTIONS, AssessmentService } from '../services/assessmentService.js';
import { connectDB } from '../config/db.js';

dotenv.config();

export const seedDatabase = async (): Promise<void> => {
  console.log('[Seed] Starting database population with realistic enterprise demo data...');

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    CandidateProfile.deleteMany({}),
    EmployerProfile.deleteMany({}),
    Job.deleteMany({}),
    Application.deleteMany({}),
    Interview.deleteMany({}),
    SavedJob.deleteMany({}),
    Resource.deleteMany({}),
    AssessmentQuestion.deleteMany({}),
    AssessmentResult.deleteMany({}),
    Notification.deleteMany({}),
    Conversation.deleteMany({}),
    Message.deleteMany({}),
  ]);

  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash(process.env.DEMO_PASSWORD || 'Demo@2026!', salt);

  // 1. Seed Assessment Questions
  for (const q of ASSESSMENT_QUESTIONS) {
    await AssessmentQuestion.create(q);
  }
  console.log(`[Seed] Seeded ${ASSESSMENT_QUESTIONS.length} assessment questions.`);

  // 2. Demo Admin
  const adminUser = await User.create({
    email: 'admin@demo.com',
    passwordHash: defaultPasswordHash,
    role: 'ADMIN',
  });

  // 3. Employers & Profiles (5 realistic tech organizations with neuro-inclusive cultures)
  const employerData = [
    {
      email: 'employer@demo.com', // Primary demo employer
      companyName: 'Acuity Testing Systems',
      industry: 'Software QA & Verification',
      companySize: '150-500 employees',
      location: 'Remote / Boston, MA',
      about:
        'Acuity builds mission-critical test automation suites for aerospace, medical, and banking platforms. Over 40% of our testing engineers identify as neurodivergent. We emphasize asynchronous communications, structured expectations, and sensory-friendly workspaces.',
      accommodationsOffered: [
        'Written task instructions standard',
        'Camera-optional video calls',
        'Noise-cancelling headphones allowance',
        'Quiet focus blocks (no meetings 1pm-5pm)',
        'Flexible core working hours',
      ],
      cultureHighlights: [
        'Zero surprise meetings',
        'Dedicated neurodiversity employee resource group',
        'Pair programming on demand',
      ],
    },
    {
      email: 'recruiting@cybersentry.io',
      companyName: 'CyberSentry Security Ops',
      industry: 'Cybersecurity & Threat Hunting',
      companySize: '250-1000 employees',
      location: 'Remote / Austin, TX',
      about:
        'Specializing in defensive security monitoring, penetration audit, and SIEM event response. We champion neurodivergent cognitive talents including deep pattern recognition and hyper-focused anomaly detection.',
      accommodationsOffered: [
        'Flexible shift schedules',
        'Asynchronous standups',
        'Advance interview questions provided',
        'Written post-meeting summaries',
      ],
      cultureHighlights: ['Objective performance metrics', 'Sensory-tuned equipment stipends'],
    },
    {
      email: 'talent@dataintegrity.org',
      companyName: 'DataIntegrity Labs',
      industry: 'Data Auditing & Governance',
      companySize: '50-200 employees',
      location: 'Remote / Seattle, WA',
      about:
        'We audit compliance pipelines, financial datasets, and algorithmic fairness. Our workflows are deeply methodical, documentation-first, and designed for analytical thinkers who thrive in structured environments.',
      accommodationsOffered: [
        'Sensory-friendly ergonomic desk setups',
        'Clear objective acceptance criteria',
        'Flexible break intervals',
      ],
      cultureHighlights: ['Detailed procedural checklists', 'Low-context meeting policies'],
    },
    {
      email: 'careers@prismflow.tech',
      companyName: 'PrismFlow Cloud',
      industry: 'Cloud Infrastructure & DevOps',
      companySize: '100-300 employees',
      location: 'Remote / San Francisco, CA',
      about:
        'Building next-generation distributed systems. We value logical precision, deep focus, and technical craftsmanship, with completely transparent compensation tiers.',
      accommodationsOffered: [
        '100% Remote flexibility',
        'Written PR reviews with direct feedback',
        'Meeting-free Wednesdays & Fridays',
      ],
      cultureHighlights: ['No social-bias hiring filters', 'Transparent career ladders'],
    },
    {
      email: 'hiring@accesscraft.design',
      companyName: 'AccessCraft Studio',
      industry: 'UI/UX & Digital Accessibility',
      companySize: '25-75 employees',
      location: 'Remote / Chicago, IL',
      about:
        'We design WCAG AAA compliant interfaces for healthcare, government, and education. We actively hire neurodivergent designers and researchers with lived experience in sensory processing and accessible user flows.',
      accommodationsOffered: [
        'Visual + Written project briefs',
        'Sensory break room in office / Remote stipends',
        'Flexible start times (7am-11am)',
      ],
      cultureHighlights: ['Human-centered velocity', 'Psychological safety focus'],
    },
  ];

  const createdEmployers: any[] = [];
  for (const emp of employerData) {
    const user = await User.create({
      email: emp.email,
      passwordHash: defaultPasswordHash,
      role: 'EMPLOYER',
    });

    const profile = await EmployerProfile.create({
      userId: user._id,
      companyName: emp.companyName,
      industry: emp.industry,
      companySize: emp.companySize,
      location: emp.location,
      about: emp.about,
      accommodationsOffered: emp.accommodationsOffered,
      cultureHighlights: emp.cultureHighlights,
      verified: true,
    });

    createdEmployers.push({ user, profile });
  }
  console.log(`[Seed] Seeded ${createdEmployers.length} verified employers.`);

  // 4. Candidate Profiles (10 realistic candidates with diverse strengths & accommodations)
  const candidateData = [
    {
      email: 'candidate@demo.com', // Primary demo candidate
      fullName: 'Jordan Taylor',
      headline: 'QA Automation Engineer | Specialist in Edge-Case Verification & Cypress',
      location: 'Remote / Denver, CO',
      bio: 'Lifelong systematic thinker on the autism spectrum. I excel at finding intricate edge-case bugs, stress-testing API endpoints, and building reliable Playwright & Cypress test suites that never flake.',
      skills: ['Cypress', 'Playwright', 'Jest', 'API Testing', 'TypeScript', 'SQL', 'TestRail', 'Jira'],
      strengths: ['Attention to Detail', 'Pattern Recognition', 'Deep Focus', 'Quality Assurance', 'Analytical Thinking'],
      careerInterests: ['Software Testing / QA', 'Data Analysis / Audit'],
      workPreferences: {
        workMode: 'REMOTE',
        employmentType: 'FULL_TIME',
        preferredHours: '9:00 AM - 5:00 PM MT',
        teamSize: 'SMALL',
        environmentStructure: 'STRUCTURED',
        soundPreference: 'QUIET',
      },
      communicationPreferences: {
        primaryModality: 'WRITTEN',
        meetingFrequency: 'MINIMAL',
        meetingStyle: 'Written agenda ahead of time + async task handoffs',
      },
      accommodations: [
        'Written task instructions standard',
        'Camera-optional video calls',
        'Noise-cancelling headphones allowance',
        'Quiet focus blocks',
        'Clear task expectations',
      ],
      howIWorkBest:
        'I perform best with clearly documented acceptance criteria, written bug reproduction steps, and dedicated blocks of uninterrupted deep focus. I prefer Slack/asynchronous written check-ins over unexpected phone calls.',
      education: [
        {
          institution: 'Colorado State University',
          degree: 'B.S.',
          fieldOfStudy: 'Computer Information Systems',
          startYear: 2018,
          endYear: 2022,
        },
      ],
      experience: [
        {
          title: 'QA Test Analyst',
          company: 'Fintech Logic Corp',
          startDate: '2022',
          endDate: 'Present',
          current: true,
          description:
            'Created 340+ automated regression test cases using Cypress. Discovered 50+ critical boundary errors before production deployment.',
        },
      ],
    },
    {
      email: 'sam.rivers@demo.com',
      fullName: 'Sam Rivers',
      headline: 'Cybersecurity Threat Hunter & Incident Analyst',
      location: 'Remote / Atlanta, GA',
      bio: 'ADHD-powered hyperfocus and relentless pattern recognition. I dissect system security logs, identify malicious network traces, and design hardened firewall configurations.',
      skills: ['Wireshark', 'Splunk', 'SIEM', 'Python', 'Linux', 'Snort', 'NIST Standards', 'Network Security'],
      strengths: ['Pattern Recognition', 'Logical Thinking', 'Research', 'Problem Solving', 'Deep Focus'],
      careerInterests: ['Cybersecurity & Assurance'],
      workPreferences: {
        workMode: 'REMOTE',
        employmentType: 'FULL_TIME',
        environmentStructure: 'STRUCTURED',
        soundPreference: 'QUIET',
      },
      communicationPreferences: {
        primaryModality: 'WRITTEN',
        meetingFrequency: 'MINIMAL',
      },
      accommodations: ['Flexible working hours', 'Written instructions', 'Reduced unnecessary meetings'],
      howIWorkBest: 'Deep immersion in threat datasets with objective metrics and minimal context switching.',
    },
    {
      email: 'elena.rostova@demo.com',
      fullName: 'Elena Rostova',
      headline: 'Data Audit Specialist & SQL Reconciliation Analyst',
      location: 'Remote / Chicago, IL',
      bio: 'Autistic analyst with a deep passion for mathematical precision and data governance. I ensure every row and ledger reconciles with 100% mathematical integrity.',
      skills: ['SQL', 'PostgreSQL', 'Python pandas', 'Excel Power Query', 'Tableau', 'Data Modeling', 'ETL Verification'],
      strengths: ['Data Analysis', 'Analytical Thinking', 'Attention to Detail', 'Documentation'],
      careerInterests: ['Data Analysis / Audit'],
      workPreferences: {
        workMode: 'REMOTE',
        employmentType: 'FULL_TIME',
        environmentStructure: 'STRUCTURED',
        soundPreference: 'QUIET',
      },
      communicationPreferences: {
        primaryModality: 'WRITTEN',
        meetingFrequency: 'MINIMAL',
      },
      accommodations: ['Structured workflow', 'Quiet workspace', 'Clear task expectations'],
      howIWorkBest: 'Structured task tickets with unambiguous acceptance definitions.',
    },
    {
      email: 'marcus.vance@demo.com',
      fullName: 'Marcus Vance',
      headline: 'Full-Stack Software Engineer (React / Node / TypeScript)',
      location: 'Remote / Austin, TX',
      bio: 'Software engineer who thrives on clean component architecture, strict type safety, and modular system design. Passionate about eliminating code debt.',
      skills: ['TypeScript', 'React', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Docker', 'GraphQL'],
      strengths: ['Technical Ability', 'Problem Solving', 'Logical Thinking', 'Deep Focus'],
      careerInterests: ['Software Development'],
      workPreferences: {
        workMode: 'REMOTE',
        employmentType: 'FULL_TIME',
        environmentStructure: 'FLEXIBLE',
        soundPreference: 'QUIET',
      },
      communicationPreferences: {
        primaryModality: 'BALANCED',
        meetingFrequency: 'MODERATE',
      },
      accommodations: ['Flexible core hours', 'Written task instructions standard'],
      howIWorkBest: 'Clear sprint goals and asynchronous PR reviews.',
    },
    {
      email: 'priya.nair@demo.com',
      fullName: 'Priya Nair',
      headline: 'Accessible UI/UX Designer & Design Systems Lead',
      location: 'Remote / New York, NY',
      bio: 'Neurodivergent designer specializing in low-cognitive-load user interfaces, WCAG 2.1 AA/AAA compliance, and sensory-friendly color palettes.',
      skills: ['Figma', 'Design Systems', 'WCAG Auditing', 'User Research', 'Wireframing', 'HTML/CSS', 'Accessibility'],
      strengths: ['Creativity', 'Attention to Detail', 'Research', 'Documentation'],
      careerInterests: ['UI/UX & Accessible Design'],
      workPreferences: {
        workMode: 'HYBRID',
        employmentType: 'FULL_TIME',
        environmentStructure: 'STRUCTURED',
        soundPreference: 'MODERATE',
      },
      communicationPreferences: {
        primaryModality: 'BALANCED',
        meetingFrequency: 'MODERATE',
      },
      accommodations: ['Quiet workspace', 'Clear task expectations', 'Flexible breaks'],
      howIWorkBest: 'Visual briefs with structured milestones and explicit feedback loops.',
    },
    {
      email: 'kai.chen@demo.com',
      fullName: 'Kai Chen',
      headline: 'Technical Writer & API Documentation Architect',
      location: 'Remote / Seattle, WA',
      bio: 'Turning complex distributed software into crisp, unambiguous developer documentation, markdown tutorials, and architectural diagrams.',
      skills: ['Markdown', 'OpenAPI / Swagger', 'Git', 'Technical Documentation', 'Postman', 'Information Architecture'],
      strengths: ['Documentation', 'Research', 'Attention to Detail', 'Logical Thinking'],
      careerInterests: ['Research & Documentation'],
      workPreferences: {
        workMode: 'REMOTE',
        employmentType: 'FULL_TIME',
        environmentStructure: 'STRUCTURED',
        soundPreference: 'QUIET',
      },
      communicationPreferences: {
        primaryModality: 'WRITTEN',
        meetingFrequency: 'MINIMAL',
      },
      accommodations: ['Written instructions', 'Reduced unnecessary meetings'],
      howIWorkBest: 'Asynchronous feedback in GitHub PRs and linear document drafts.',
    },
    {
      email: 'avery.brooks@demo.com',
      fullName: 'Avery Brooks',
      headline: 'Junior QA Analyst & Exploratory Tester',
      location: 'Remote / Minneapolis, MN',
      bio: 'High attention to visual glitches, input validation bugs, and browser inconsistencies. Excited to launch my career in software verification.',
      skills: ['Manual Testing', 'Jira', 'Bug Tracking', 'Test Planning', 'Postman Basics', 'Chrome DevTools'],
      strengths: ['Attention to Detail', 'Quality Assurance', 'Deep Focus'],
      careerInterests: ['Software Testing / QA'],
      workPreferences: {
        workMode: 'REMOTE',
        employmentType: 'FULL_TIME',
        environmentStructure: 'STRUCTURED',
        soundPreference: 'QUIET',
      },
      communicationPreferences: {
        primaryModality: 'WRITTEN',
        meetingFrequency: 'MINIMAL',
      },
      accommodations: ['Clear task expectations', 'Written instructions'],
      howIWorkBest: 'Step-by-step checklists and supportive asynchronous mentorship.',
    },
    {
      email: 'leo.morales@demo.com',
      fullName: 'Leo Morales',
      headline: 'Information Security & Compliance Analyst',
      location: 'Remote / Phoenix, AZ',
      bio: 'Methodical auditor analyzing access privileges, SOC 2 control evidence, and AWS IAM policies for anomalies.',
      skills: ['SOC 2', 'ISO 27001', 'AWS IAM', 'Security Audits', 'Compliance Reporting', 'Jira'],
      strengths: ['Logical Thinking', 'Pattern Recognition', 'Attention to Detail'],
      careerInterests: ['Cybersecurity & Assurance'],
      workPreferences: {
        workMode: 'REMOTE',
        employmentType: 'FULL_TIME',
        environmentStructure: 'STRUCTURED',
        soundPreference: 'QUIET',
      },
      communicationPreferences: {
        primaryModality: 'WRITTEN',
        meetingFrequency: 'MINIMAL',
      },
      accommodations: ['Structured workflow', 'Flexible working hours'],
      howIWorkBest: 'Consistent weekly cadence with objective verification criteria.',
    },
    {
      email: 'claire.bennett@demo.com',
      fullName: 'Claire Bennett',
      headline: 'Data Pipeline & Quality Assurance Engineer',
      location: 'Remote / Raleigh, NC',
      bio: 'Building automated data verification tests using Great Expectations, dbt, and Python to catch data drifts before ML models train.',
      skills: ['Python', 'SQL', 'dbt', 'Great Expectations', 'Airflow', 'Data Quality', 'Git'],
      strengths: ['Data Analysis', 'Analytical Thinking', 'Quality Assurance'],
      careerInterests: ['Data Analysis / Audit', 'Software Development'],
      workPreferences: {
        workMode: 'REMOTE',
        employmentType: 'FULL_TIME',
        environmentStructure: 'STRUCTURED',
        soundPreference: 'QUIET',
      },
      communicationPreferences: {
        primaryModality: 'WRITTEN',
        meetingFrequency: 'MINIMAL',
      },
      accommodations: ['Written instructions', 'Camera-optional video calls'],
      howIWorkBest: 'Detailed GitHub issues with measurable data contracts.',
    },
    {
      email: 'devon.ross@demo.com',
      fullName: 'Devon Ross',
      headline: 'Frontend Engineer & Accessibility Advocate',
      location: 'Remote / Portland, OR',
      bio: 'Building accessible, accessible, keyboard-navigable web apps with React and Tailwind. Deeply passionate about neuro-inclusive UX.',
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'ARIA Standards', 'Jest', 'Vite'],
      strengths: ['Creativity', 'Technical Ability', 'Problem Solving'],
      careerInterests: ['Software Development', 'UI/UX & Accessible Design'],
      workPreferences: {
        workMode: 'REMOTE',
        employmentType: 'FULL_TIME',
        environmentStructure: 'FLEXIBLE',
        soundPreference: 'QUIET',
      },
      communicationPreferences: {
        primaryModality: 'WRITTEN',
        meetingFrequency: 'MINIMAL',
      },
      accommodations: ['Flexible working hours', 'Noise-cancelling headphones allowance'],
      howIWorkBest: 'Async task reviews and quiet focus periods.',
    },
  ];

  const createdCandidates: any[] = [];
  for (const cand of candidateData) {
    const user = await User.create({
      email: cand.email,
      passwordHash: defaultPasswordHash,
      role: 'CANDIDATE',
    });

    // Provide default assessment scores
    const sampleAnswers = [
      { questionId: 1, selectedOptionIndex: 0 },
      { questionId: 2, selectedOptionIndex: 0 },
      { questionId: 3, selectedOptionIndex: 0 },
      { questionId: 4, selectedOptionIndex: 0 },
      { questionId: 5, selectedOptionIndex: 0 },
      { questionId: 6, selectedOptionIndex: 0 },
      { questionId: 7, selectedOptionIndex: 0 },
      { questionId: 8, selectedOptionIndex: 0 },
      { questionId: 9, selectedOptionIndex: 0 },
      { questionId: 10, selectedOptionIndex: 0 },
      { questionId: 11, selectedOptionIndex: 0 },
      { questionId: 12, selectedOptionIndex: 0 },
      { questionId: 13, selectedOptionIndex: 0 },
      { questionId: 14, selectedOptionIndex: 0 },
      { questionId: 15, selectedOptionIndex: 0 },
      { questionId: 16, selectedOptionIndex: 0 },
      { questionId: 17, selectedOptionIndex: 0 },
      { questionId: 18, selectedOptionIndex: 0 },
    ];
    const scoring = AssessmentService.calculateScores(sampleAnswers);

    const profile = await CandidateProfile.create({
      userId: user._id,
      fullName: cand.fullName,
      headline: cand.headline,
      location: cand.location,
      bio: cand.bio,
      skills: cand.skills,
      strengths: cand.strengths,
      careerInterests: cand.careerInterests,
      workPreferences: cand.workPreferences,
      communicationPreferences: cand.communicationPreferences,
      accommodations: cand.accommodations,
      howIWorkBest: cand.howIWorkBest,
      education: cand.education || [],
      experience: cand.experience || [],
      assessmentResults: {
        ...scoring.scores,
        primaryMatch: scoring.primaryMatch,
        completedAt: new Date(),
      },
      profileCompletion: 90,
    });

    // Create historic assessment result for primary candidate
    await AssessmentResult.create({
      candidateId: profile._id,
      answers: sampleAnswers,
      scores: scoring.scores,
      primaryMatch: scoring.primaryMatch,
      explanations: scoring.explanations,
      completedAt: new Date(),
    });

    createdCandidates.push({ user, profile });
  }
  console.log(`[Seed] Seeded ${createdCandidates.length} candidate profiles.`);

  // 5. Seed 20+ Real Enterprise Job Postings across core tracks
  const jobsData = [
    {
      employerIndex: 0, // Acuity Testing Systems
      title: 'Senior QA Automation Engineer (Cypress / Playwright)',
      category: 'SOFTWARE_TESTING_QA',
      description:
        'Join our core verification squad building automated test frameworks for healthcare and banking integrations. We are looking for an analytical engineer who spots corner cases others miss and values clean, non-flaky test automation suites.',
      responsibilities: [
        'Design and maintain end-to-end regression suites using Cypress and Playwright',
        'Analyze complex user stories to formulate comprehensive test matrices and edge-case scenarios',
        'Collaborate with developers via written Jira tickets and async PR comments',
        'Document reproduction steps for defect reports with clear visual logs',
      ],
      requirements: [
        '3+ years of automated testing experience in web applications',
        'Strong proficiency in JavaScript/TypeScript',
        'Experience testing RESTful APIs and modern frontend applications',
        'Passionate about precision, repeatability, and software quality',
      ],
      requiredSkills: ['Cypress', 'Playwright', 'TypeScript', 'API Testing'],
      preferredSkills: ['Jest', 'Docker', 'SQL', 'Postman'],
      matchedStrengths: ['Attention to Detail', 'Pattern Recognition', 'Deep Focus', 'Quality Assurance'],
      workMode: 'REMOTE',
      location: 'Remote (US/Canada)',
      salaryMin: 110000,
      salaryMax: 145000,
      salaryCurrency: 'USD',
      experienceLevel: 'SENIOR',
      employmentType: 'FULL_TIME',
      accommodationsOffered: [
        'Written task instructions standard',
        'Camera-optional video calls',
        'Quiet focus blocks (no meetings 1pm-5pm)',
        'Noise-cancelling headphones allowance',
      ],
    },
    {
      employerIndex: 0,
      title: 'Software Test Analyst — Accessibility & UI Verification',
      category: 'SOFTWARE_TESTING_QA',
      description:
        'We need an attentive manual & automated QA analyst to evaluate digital platforms against WCAG 2.1 AA accessibility standards and cross-browser edge cases. Highly structured environment with clear acceptance checklists.',
      responsibilities: [
        'Execute test matrices across browser combinations and screen resolutions',
        'Perform keyboard-only navigation audits and screen-reader test passes',
        'Write detailed, reproducible bug tickets with clear expected vs actual outcomes',
      ],
      requirements: [
        '1+ years software testing or relevant QA certification/bootcamp',
        'Natural aptitude for discovering subtle visual inconsistencies',
        'Comfort with written documentation and checklists',
      ],
      requiredSkills: ['Manual Testing', 'Jira', 'Bug Tracking', 'TestRail'],
      preferredSkills: ['Postman', 'Accessibility Standards', 'Chrome DevTools'],
      matchedStrengths: ['Attention to Detail', 'Quality Assurance', 'Documentation'],
      workMode: 'REMOTE',
      location: 'Remote (US)',
      salaryMin: 70000,
      salaryMax: 90000,
      salaryCurrency: 'USD',
      experienceLevel: 'ENTRY',
      employmentType: 'FULL_TIME',
      accommodationsOffered: [
        'Written instructions standard',
        'Clear task expectations',
        'Flexible working hours',
      ],
    },
    {
      employerIndex: 1, // CyberSentry
      title: 'SOC Security Analyst — Incident Response & Threat Hunting',
      category: 'CYBERSECURITY',
      description:
        'Defend cloud infrastructure against intrusions. This role rewards continuous pattern detection, systematic verification of security alerts, and deep investigations into network anomaly logs.',
      responsibilities: [
        'Monitor SIEM event queues (Splunk, Elastic) for anomalous behavioral patterns',
        'Triage firewall and endpoint alerts systematically',
        'Draft clear, factual incident summaries detailing attack vectors and mitigations',
      ],
      requirements: [
        '2+ years experience in cybersecurity operations or network engineering',
        'Familiarity with Wireshark, Linux, and TCP/IP protocols',
        'Methodical, calm temperament during investigative scenarios',
      ],
      requiredSkills: ['SIEM', 'Wireshark', 'Linux', 'Network Security'],
      preferredSkills: ['Python', 'Splunk', 'Snort'],
      matchedStrengths: ['Pattern Recognition', 'Logical Thinking', 'Research', 'Problem Solving'],
      workMode: 'REMOTE',
      location: 'Remote (US)',
      salaryMin: 95000,
      salaryMax: 130000,
      salaryCurrency: 'USD',
      experienceLevel: 'MID',
      employmentType: 'FULL_TIME',
      accommodationsOffered: [
        'Flexible shift schedules',
        'Asynchronous standups',
        'Written post-meeting summaries',
      ],
    },
    {
      employerIndex: 1,
      title: 'Vulnerability Assessment & Compliance Engineer',
      category: 'CYBERSECURITY',
      description:
        'Conduct systematic audits of system configurations, cryptographic certificates, and cloud access policies against NIST and CIS benchmarks. A dream role for someone who loves rigorous frameworks.',
      responsibilities: [
        'Run automated vulnerability scanners and audit scan results for false positives',
        'Verify AWS IAM least-privilege configurations',
        'Compile compliance verification reports for engineering teams',
      ],
      requirements: [
        'Experience with cloud environments (AWS/Azure/GCP)',
        'Deep appreciation for standardization and compliance guardrails',
      ],
      requiredSkills: ['Security Audits', 'Compliance Reporting', 'Linux', 'AWS IAM'],
      preferredSkills: ['Python', 'Docker', 'NIST Standards'],
      matchedStrengths: ['Attention to Detail', 'Logical Thinking', 'Research'],
      workMode: 'REMOTE',
      location: 'Remote (US)',
      salaryMin: 105000,
      salaryMax: 140000,
      salaryCurrency: 'USD',
      experienceLevel: 'MID',
      employmentType: 'FULL_TIME',
      accommodationsOffered: ['Flexible core hours', 'Written task instructions standard'],
    },
    {
      employerIndex: 2, // DataIntegrity Labs
      title: 'Data Reconciliation & Audit Specialist',
      category: 'DATA_ANALYSIS_AUDIT',
      description:
        'Ensure financial transaction pipelines match ground-truth ledgers. We need someone who gets satisfaction from reconciling balance sheets to the penny and finding the single missing record among millions.',
      responsibilities: [
        'Execute complex SQL reconciliation queries across distributed databases',
        'Trace discrepancy lineages and flag systemic anomalies to data engineering',
        'Maintain mathematical audit logs and automated verification scripts',
      ],
      requirements: [
        'Expert SQL query crafting (window functions, joins, subqueries)',
        'Relentless dedication to factual precision',
        'Prior experience in data audit, finance, or business intelligence',
      ],
      requiredSkills: ['SQL', 'Data Modeling', 'Excel Power Query', 'Data Analysis'],
      preferredSkills: ['PostgreSQL', 'Python pandas', 'Tableau'],
      matchedStrengths: ['Data Analysis', 'Analytical Thinking', 'Attention to Detail', 'Deep Focus'],
      workMode: 'REMOTE',
      location: 'Remote (US)',
      salaryMin: 85000,
      salaryMax: 115000,
      salaryCurrency: 'USD',
      experienceLevel: 'MID',
      employmentType: 'FULL_TIME',
      accommodationsOffered: [
        'Clear objective acceptance criteria',
        'Sensory-friendly ergonomic desk setups',
        'Flexible break intervals',
      ],
    },
    {
      employerIndex: 2,
      title: 'Junior Data Quality Analyst',
      category: 'DATA_ANALYSIS_AUDIT',
      description:
        'Verify data cleanliness across ingestion pipelines. Review schema conformance, null-rate variances, and data dictionary completeness. Supportive team with structured training.',
      responsibilities: [
        'Run daily data verification checklists across production tables',
        'Identify malformed inputs and document data hygiene issues in Jira',
        'Assist in updating company data catalogs and metadata dictionaries',
      ],
      requirements: [
        'Solid baseline in SQL queries and spreadsheet formulas',
        'Desire to build a career in data engineering or analytics',
      ],
      requiredSkills: ['SQL', 'Manual Testing', 'Excel Power Query', 'Analytical Thinking'],
      preferredSkills: ['Python', 'Tableau'],
      matchedStrengths: ['Attention to Detail', 'Quality Assurance', 'Documentation'],
      workMode: 'REMOTE',
      location: 'Remote (US)',
      salaryMin: 65000,
      salaryMax: 82000,
      salaryCurrency: 'USD',
      experienceLevel: 'ENTRY',
      employmentType: 'FULL_TIME',
      accommodationsOffered: ['Structured workflow', 'Quiet workspace', 'Clear task expectations'],
    },
    {
      employerIndex: 3, // PrismFlow Cloud
      title: 'Full-Stack Software Engineer (TypeScript / Node / React)',
      category: 'SOFTWARE_DEVELOPMENT',
      description:
        'Build scalable microservices and intuitive developer dashboard interfaces. We value architectural clarity, strict type safety, comprehensive unit testing, and asynchronous team communication.',
      responsibilities: [
        'Develop REST and GraphQL endpoints in Node.js/TypeScript',
        'Implement responsive, accessible UI modules in React and Tailwind',
        'Write comprehensive unit and integration tests with Jest',
      ],
      requirements: [
        '2+ years commercial software engineering experience',
        'Comfort with modern asynchronous JavaScript, TypeScript, and MongoDB/PostgreSQL',
      ],
      requiredSkills: ['TypeScript', 'React', 'Node.js', 'Express'],
      preferredSkills: ['MongoDB', 'Docker', 'GraphQL', 'Jest'],
      matchedStrengths: ['Technical Ability', 'Problem Solving', 'Logical Thinking'],
      workMode: 'REMOTE',
      location: 'Remote (US/Canada)',
      salaryMin: 115000,
      salaryMax: 155000,
      salaryCurrency: 'USD',
      experienceLevel: 'MID',
      employmentType: 'FULL_TIME',
      accommodationsOffered: [
        '100% Remote flexibility',
        'Written PR reviews with direct feedback',
        'Meeting-free Wednesdays & Fridays',
      ],
    },
    {
      employerIndex: 3,
      title: 'Backend Systems & API Engineer',
      category: 'SOFTWARE_DEVELOPMENT',
      description:
        'Focus on database indexing, API rate limiting, queue processing, and backend service reliability. Ideal for engineers who love deep technical logic and quiet, uninterrupted coding stretches.',
      responsibilities: [
        'Optimize high-throughput database queries and Redis caching layers',
        'Build resilient background worker jobs and webhook notification pipelines',
        'Collaborate through detailed architectural RFC documents',
      ],
      requirements: [
        'Strong knowledge of backend system design, database indexing, and caching',
        'Demonstrated ability to produce well-documented, test-covered code',
      ],
      requiredSkills: ['Node.js', 'TypeScript', 'MongoDB', 'PostgreSQL'],
      preferredSkills: ['Redis', 'Docker', 'API Testing'],
      matchedStrengths: ['Logical Thinking', 'Deep Focus', 'Problem Solving'],
      workMode: 'REMOTE',
      location: 'Remote (US)',
      salaryMin: 125000,
      salaryMax: 165000,
      salaryCurrency: 'USD',
      experienceLevel: 'SENIOR',
      employmentType: 'FULL_TIME',
      accommodationsOffered: ['100% Remote flexibility', 'Quiet focus blocks'],
    },
    {
      employerIndex: 4, // AccessCraft Studio
      title: 'Accessible UI/UX Designer & Design System Specialist',
      category: 'UI_UX_DESIGN',
      description:
        'Design low-cognitive-load, sensory-friendly digital interfaces for civic and healthcare applications. We care deeply about keyboard navigation, contrast ratios, and intuitive layouts.',
      responsibilities: [
        'Construct comprehensive Figma component libraries and token architectures',
        'Run accessibility audits against WCAG 2.1 AA/AAA criteria',
        'Write clear developer handoff specs detailing state changes and focus rings',
      ],
      requirements: [
        'Portfolio demonstrating empathetic, highly accessible design decisions',
        'Deep understanding of typography hierarchy and contrast requirements',
      ],
      requiredSkills: ['Figma', 'Design Systems', 'Accessibility Standards', 'Wireframing'],
      preferredSkills: ['HTML/CSS', 'User Research'],
      matchedStrengths: ['Creativity', 'Attention to Detail', 'Research'],
      workMode: 'REMOTE',
      location: 'Remote (US)',
      salaryMin: 90000,
      salaryMax: 125000,
      salaryCurrency: 'USD',
      experienceLevel: 'MID',
      employmentType: 'FULL_TIME',
      accommodationsOffered: [
        'Visual + Written project briefs',
        'Sensory break room in office / Remote stipends',
        'Flexible start times',
      ],
    },
    {
      employerIndex: 4,
      title: 'Technical Writer & Developer Documentation Architect',
      category: 'RESEARCH_DOCUMENTATION',
      description:
        'Create developer guides, API references, onboarding playbooks, and architectural wikis that eliminate ambiguity. You will champion asynchronous knowledge sharing.',
      responsibilities: [
        'Write crisp, step-by-step developer tutorials and API references',
        'Audit existing wikis to remove outdated or conflicting instructions',
        'Design clean information architecture for internal and external docs',
      ],
      requirements: [
        'Demonstrated talent for explaining technical concepts in plain, direct English',
        'Comfort collaborating with engineers via Git and Markdown',
      ],
      requiredSkills: ['Markdown', 'Technical Documentation', 'Information Architecture', 'Git'],
      preferredSkills: ['Postman', 'OpenAPI / Swagger'],
      matchedStrengths: ['Documentation', 'Research', 'Attention to Detail'],
      workMode: 'REMOTE',
      location: 'Remote (US)',
      salaryMin: 85000,
      salaryMax: 110000,
      salaryCurrency: 'USD',
      experienceLevel: 'MID',
      employmentType: 'FULL_TIME',
      accommodationsOffered: ['Written instructions', 'Reduced unnecessary meetings'],
    },
    // Additional 10 jobs to hit 20+ realistic postings
    {
      employerIndex: 0,
      title: 'Performance & Load Testing Specialist',
      category: 'SOFTWARE_TESTING_QA',
      description: 'Design k6 and JMeter load test scripts to benchmark cloud service limits under peak traffic.',
      responsibilities: ['Write repeatable k6 scripts', 'Analyze bottleneck telemetry', 'Generate benchmark reports'],
      requirements: ['2+ years load testing experience', 'Understanding of HTTP and socket latencies'],
      requiredSkills: ['API Testing', 'TypeScript', 'Test Planning'],
      preferredSkills: ['Docker', 'Postman'],
      matchedStrengths: ['Analytical Thinking', 'Deep Focus'],
      workMode: 'REMOTE',
      location: 'Remote (US)',
      salaryMin: 95000,
      salaryMax: 130000,
      salaryCurrency: 'USD',
      experienceLevel: 'MID',
      employmentType: 'FULL_TIME',
      accommodationsOffered: ['Written instructions standard', 'Camera-optional video calls'],
    },
    {
      employerIndex: 1,
      title: 'Cloud Security Audit Engineer (AWS / Terraform)',
      category: 'CYBERSECURITY',
      description: 'Audit cloud infrastructure as code for security group drifts, S3 permission leaks, and IAM roles.',
      responsibilities: ['Automate tfsec and checkov scans', 'Verify cloud security posture', 'Report findings async'],
      requirements: ['Experience with AWS and Terraform', 'Knowledge of cloud security fundamentals'],
      requiredSkills: ['AWS IAM', 'Security Audits', 'Linux'],
      preferredSkills: ['Python', 'Docker'],
      matchedStrengths: ['Pattern Recognition', 'Attention to Detail'],
      workMode: 'REMOTE',
      location: 'Remote (US)',
      salaryMin: 110000,
      salaryMax: 145000,
      salaryCurrency: 'USD',
      experienceLevel: 'MID',
      employmentType: 'FULL_TIME',
      accommodationsOffered: ['Flexible core hours', 'Written post-meeting summaries'],
    },
    {
      employerIndex: 2,
      title: 'Financial Data Pipeline Verifier',
      category: 'DATA_ANALYSIS_AUDIT',
      description: 'Audit daily settlement records and identify currency conversion discrepancies in banking feeds.',
      responsibilities: ['Build automated integrity checks', 'Investigate reconciliation breaks', 'Document audit trails'],
      requirements: ['Experience with SQL and financial ledger structures', 'High numerical accuracy'],
      requiredSkills: ['SQL', 'Data Analysis', 'Excel Power Query'],
      preferredSkills: ['PostgreSQL'],
      matchedStrengths: ['Data Analysis', 'Attention to Detail'],
      workMode: 'REMOTE',
      location: 'Remote (US)',
      salaryMin: 90000,
      salaryMax: 120000,
      salaryCurrency: 'USD',
      experienceLevel: 'MID',
      employmentType: 'FULL_TIME',
      accommodationsOffered: ['Structured workflow', 'Clear task expectations'],
    },
    {
      employerIndex: 3,
      title: 'Frontend Accessibility Engineer (React / Tailwind)',
      category: 'SOFTWARE_DEVELOPMENT',
      description: 'Refactor enterprise interfaces to guarantee full keyboard accessibility, screen-reader support, and WAI-ARIA adherence.',
      responsibilities: ['Audit React components with axe-core', 'Implement accessible dialog and drawer modals', 'Maintain focus traps'],
      requirements: ['Proficiency in React and semantic HTML', 'Passion for inclusive assistive technology'],
      requiredSkills: ['React', 'TypeScript', 'Accessibility Standards', 'Tailwind CSS'],
      preferredSkills: ['Jest', 'Figma'],
      matchedStrengths: ['Attention to Detail', 'Technical Ability'],
      workMode: 'REMOTE',
      location: 'Remote (US)',
      salaryMin: 105000,
      salaryMax: 135000,
      salaryCurrency: 'USD',
      experienceLevel: 'MID',
      employmentType: 'FULL_TIME',
      accommodationsOffered: ['100% Remote flexibility', 'Written PR reviews'],
    },
    {
      employerIndex: 4,
      title: 'Digital Inclusion & User Researcher',
      category: 'UI_UX_DESIGN',
      description: 'Conduct sensory-friendly, low-stress user research sessions with neurodivergent software users.',
      responsibilities: ['Create structured interview guides', 'Analyze cognitive friction points in workflows', 'Deliver actionable recommendations'],
      requirements: ['Experience in qualitative research and accessibility standards'],
      requiredSkills: ['User Research', 'Accessibility Standards', 'Documentation'],
      preferredSkills: ['Figma'],
      matchedStrengths: ['Research', 'Documentation', 'Creativity'],
      workMode: 'REMOTE',
      location: 'Remote (US)',
      salaryMin: 80000,
      salaryMax: 110000,
      salaryCurrency: 'USD',
      experienceLevel: 'MID',
      employmentType: 'FULL_TIME',
      accommodationsOffered: ['Visual + Written briefs', 'Flexible start times'],
    },
    {
      employerIndex: 0,
      title: 'Junior Test Automation Associate',
      category: 'SOFTWARE_TESTING_QA',
      description: 'Learn and maintain Cypress end-to-end tests under the mentorship of senior QA engineers. Great starter role.',
      responsibilities: ['Execute regression scripts', 'Update test locators when UI shifts', 'Report bugs clearly'],
      requirements: ['Basic JavaScript or TypeScript knowledge', 'Dedication to learning software QA'],
      requiredSkills: ['Cypress', 'TypeScript', 'Manual Testing'],
      preferredSkills: ['Jira'],
      matchedStrengths: ['Attention to Detail', 'Deep Focus'],
      workMode: 'REMOTE',
      location: 'Remote (US)',
      salaryMin: 65000,
      salaryMax: 80000,
      salaryCurrency: 'USD',
      experienceLevel: 'ENTRY',
      employmentType: 'FULL_TIME',
      accommodationsOffered: ['Written instructions standard', 'Clear task expectations'],
    },
    {
      employerIndex: 1,
      title: 'Security Operations Documentation Specialist',
      category: 'RESEARCH_DOCUMENTATION',
      description: 'Document standard operating procedures (SOPs) and runbooks for SOC analysts responding to cyber incidents.',
      responsibilities: ['Turn complex security runbooks into step-by-step guides', 'Review and update wiki playbooks', 'Maintain incident taxonomy'],
      requirements: ['Strong written communication skills', 'Basic familiarity with IT security terms'],
      requiredSkills: ['Technical Documentation', 'Markdown', 'Information Architecture'],
      preferredSkills: ['Linux'],
      matchedStrengths: ['Documentation', 'Research', 'Logical Thinking'],
      workMode: 'REMOTE',
      location: 'Remote (US)',
      salaryMin: 75000,
      salaryMax: 95000,
      salaryCurrency: 'USD',
      experienceLevel: 'MID',
      employmentType: 'FULL_TIME',
      accommodationsOffered: ['Written instructions', 'Flexible core hours'],
    },
    {
      employerIndex: 2,
      title: 'Database Governance & Schema Auditor',
      category: 'DATA_ANALYSIS_AUDIT',
      description: 'Audit production MongoDB and PostgreSQL collections for schema drift, index efficiency, and data retention rules.',
      responsibilities: ['Verify schema compliance', 'Recommend index optimizations', 'Enforce data categorization rules'],
      requirements: ['Experience with SQL and NoSQL databases', 'High attention to system architecture'],
      requiredSkills: ['SQL', 'Data Modeling', 'Data Analysis'],
      preferredSkills: ['MongoDB', 'PostgreSQL'],
      matchedStrengths: ['Logical Thinking', 'Pattern Recognition'],
      workMode: 'REMOTE',
      location: 'Remote (US)',
      salaryMin: 95000,
      salaryMax: 125000,
      salaryCurrency: 'USD',
      experienceLevel: 'MID',
      employmentType: 'FULL_TIME',
      accommodationsOffered: ['Quiet workspace', 'Clear task expectations'],
    },
    {
      employerIndex: 3,
      title: 'DevOps & CI/CD Pipeline Automation Engineer',
      category: 'SOFTWARE_DEVELOPMENT',
      description: 'Streamline GitHub Actions and automated test pipelines. Make software deployments predictable and calm.',
      responsibilities: ['Maintain GitHub Actions workflows', 'Improve build caching and execution speed', 'Maintain Docker containers'],
      requirements: ['Experience with CI/CD tools, Docker, and Linux scripting'],
      requiredSkills: ['Docker', 'TypeScript', 'Node.js'],
      preferredSkills: ['Linux', 'Jest'],
      matchedStrengths: ['Problem Solving', 'Technical Ability'],
      workMode: 'REMOTE',
      location: 'Remote (US)',
      salaryMin: 110000,
      salaryMax: 140000,
      salaryCurrency: 'USD',
      experienceLevel: 'MID',
      employmentType: 'FULL_TIME',
      accommodationsOffered: ['Meeting-free days', '100% Remote flexibility'],
    },
    {
      employerIndex: 4,
      title: 'Design System Documentation Lead',
      category: 'UI_UX_DESIGN',
      description: 'Write usage guidelines, component anatomy specs, and accessibility rules for our enterprise design system.',
      responsibilities: ['Author comprehensive component docs in Storybook/Figma', 'Define micro-interaction and focus behaviors', 'Train design & dev teams'],
      requirements: ['Background in UI design and technical writing'],
      requiredSkills: ['Figma', 'Design Systems', 'Accessibility Standards', 'Technical Documentation'],
      preferredSkills: ['HTML/CSS'],
      matchedStrengths: ['Creativity', 'Documentation', 'Attention to Detail'],
      workMode: 'REMOTE',
      location: 'Remote (US)',
      salaryMin: 95000,
      salaryMax: 125000,
      salaryCurrency: 'USD',
      experienceLevel: 'MID',
      employmentType: 'FULL_TIME',
      accommodationsOffered: ['Visual briefs', 'Flexible start times'],
    },
  ];

  const createdJobs: any[] = [];
  for (const jobItem of jobsData) {
    const employer = createdEmployers[jobItem.employerIndex];
    const job = await Job.create({
      employerId: employer.profile._id,
      title: jobItem.title,
      category: jobItem.category,
      description: jobItem.description,
      responsibilities: jobItem.responsibilities,
      requirements: jobItem.requirements,
      requiredSkills: jobItem.requiredSkills,
      preferredSkills: jobItem.preferredSkills,
      matchedStrengths: jobItem.matchedStrengths,
      workMode: jobItem.workMode,
      location: jobItem.location,
      salaryMin: jobItem.salaryMin,
      salaryMax: jobItem.salaryMax,
      salaryCurrency: jobItem.salaryCurrency,
      experienceLevel: jobItem.experienceLevel,
      employmentType: jobItem.employmentType,
      accommodationsOffered: jobItem.accommodationsOffered,
      interviewProcess: [
        {
          stageNumber: 1,
          title: 'Initial Welcome & Accommodation Review',
          description:
            '30-minute informal check-in discussing role expectations, written questions, and required workplace adjustments.',
          duration: '30 mins',
          format: 'Video or Written Check-in',
        },
        {
          stageNumber: 2,
          title: 'Practical Work Sample Assessment',
          description:
            'Take-home simulation matching real day-to-day duties with realistic deadlines and transparent grading rubrics.',
          duration: 'Async (3 days window)',
          format: 'Asynchronous Task',
        },
        {
          stageNumber: 3,
          title: 'Team Meet & Technical Walkthrough',
          description: 'Structured 45-minute walkthrough of work sample with engineering lead. Advance agenda provided.',
          duration: '45 mins',
          format: 'Structured Video',
        },
      ],
      status: 'PUBLISHED',
      applicantCount: 0,
    });
    createdJobs.push(job);
  }
  console.log(`[Seed] Seeded ${createdJobs.length} active enterprise jobs.`);

  // 6. Applications across statuses (APPLIED, UNDER_REVIEW, SHORTLISTED, INTERVIEW, OFFER)
  const demoCandidate = createdCandidates[0]; // Jordan Taylor (candidate@demo.com)
  const sampleApps = [
    {
      job: createdJobs[0], // Senior QA Automation Engineer
      status: 'INTERVIEW',
      requestedAccommodations: ['Written task instructions standard', 'Camera-optional video calls'],
      candidateNote: 'Excited about your team’s focus on non-flaky test automation and asynchronous sprint reviews.',
    },
    {
      job: createdJobs[1], // Software Test Analyst
      status: 'SHORTLISTED',
      requestedAccommodations: ['Clear task expectations'],
      candidateNote: 'Passionate about verifying WCAG accessibility criteria and keyboard-only navigation.',
    },
    {
      job: createdJobs[4], // Data Reconciliation Specialist
      status: 'UNDER_REVIEW',
      requestedAccommodations: ['Structured workflow', 'Quiet workspace'],
      candidateNote: 'I love mathematical integrity and catching subtle data discrepancies across tables.',
    },
    {
      job: createdJobs[6], // Full-Stack Software Engineer
      status: 'APPLIED',
      requestedAccommodations: ['Flexible core hours'],
      candidateNote: 'Looking forward to contributing clean TypeScript code and automated unit tests.',
    },
    {
      job: createdJobs[10], // Performance Load Testing
      status: 'OFFER',
      requestedAccommodations: ['Written task instructions standard'],
      candidateNote: 'Thrilled to receive the offer and work on high-volume load test simulations.',
    },
  ];

  for (const appItem of sampleApps) {
    const app = await Application.create({
      jobId: appItem.job._id,
      candidateId: demoCandidate.profile._id,
      status: appItem.status,
      matchScore: 92,
      matchBreakdown: {
        skillsMatch: 95,
        environmentMatch: 98,
        strengthsMatch: 92,
        experienceMatch: 88,
        accommodationsMatch: 94,
      },
      requestedAccommodations: appItem.requestedAccommodations,
      candidateNote: appItem.candidateNote,
      employerNotes: [
        {
          authorName: 'Acuity Hiring Team',
          note: 'Strong portfolio of Cypress and Playwright tests. Great candidate for structured verification.',
          createdAt: new Date(),
        },
      ],
      timeline: [
        { status: 'APPLIED', note: 'Application submitted', changedAt: new Date(Date.now() - 7 * 86400000) },
        { status: appItem.status, note: `Stage updated to ${appItem.status}`, changedAt: new Date() },
      ],
    });

    await Job.findByIdAndUpdate(appItem.job._id, { $inc: { applicantCount: 1 } });
  }

  // 7. Seed Saved Jobs for demo candidate
  await SavedJob.create({ candidateId: demoCandidate.profile._id, jobId: createdJobs[2]._id });
  await SavedJob.create({ candidateId: demoCandidate.profile._id, jobId: createdJobs[7]._id });
  await SavedJob.create({ candidateId: demoCandidate.profile._id, jobId: createdJobs[9]._id });

  // 8. Seed Scheduled Predictable Interview
  const interviewApp = await Application.findOne({
    candidateId: demoCandidate.profile._id,
    status: 'INTERVIEW',
  });
  if (interviewApp) {
    await Interview.create({
      applicationId: interviewApp._id,
      candidateId: demoCandidate.profile._id,
      employerId: createdEmployers[0].profile._id,
      jobId: createdJobs[0]._id,
      title: 'Technical Walkthrough & Accommodation Check-In',
      scheduledAt: new Date(Date.now() + 2 * 86400000), // In 2 days
      durationMinutes: 45,
      meetingType: 'VIDEO',
      meetingUrl: 'https://meet.google.com/ndc-qa-interview',
      agenda:
        '1. Welcome, camera preference check & accommodation check (5 mins)\n2. Cypress architecture walkthrough & edge-case discussions (25 mins)\n3. Candidate Q&A & next steps (15 mins)',
      interviewers: [
        {
          name: 'Sarah Lin',
          role: 'Principal QA Architect',
          bio: 'Neurodiversity ally, 10+ years building test automation systems.',
        },
        {
          name: 'Dave Miller',
          role: 'Engineering Lead',
          bio: 'Passionate about clear written communication and low-stress hiring.',
        },
      ],
      confirmedAccommodations: [
        'Camera-optional for candidate',
        'Written questions provided ahead of time',
        '5-minute break offered midway through session',
      ],
      questionsInAdvance: [
        'How do you approach designing a test suite for an API that has intermittent latency spikes?',
        'Can you describe a challenging edge case bug you uncovered that was missed in unit testing?',
        'What working conditions allow you to maintain uninterrupted concentration on complex problems?',
      ],
      status: 'SCHEDULED',
    });
  }

  // 9. Seed Notifications for candidate
  await Notification.create({
    userId: demoCandidate.user._id,
    title: 'Interview Scheduled: Senior QA Automation Engineer',
    message:
      'Acuity Testing Systems scheduled your interview for upcoming Thursday. Preview the advance agenda and questions in your Interview Hub.',
    type: 'INTERVIEW_SCHEDULED',
    linkUrl: '/candidate/interviews',
    read: false,
  });

  await Notification.create({
    userId: demoCandidate.user._id,
    title: 'Application Shortlisted',
    message: 'Your application for Software Test Analyst was moved to Shortlisted by Acuity Testing Systems.',
    type: 'APPLICATION_STATUS_CHANGED',
    linkUrl: '/candidate/applications',
    read: true,
  });

  await Notification.create({
    userId: demoCandidate.user._id,
    title: 'New High-Score Job Match (94%)',
    message: 'Performance Load Testing Specialist matches your Cypress and API testing strengths.',
    type: 'NEW_JOB_MATCH',
    linkUrl: '/candidate/jobs',
    read: true,
  });

  // 10. Seed Conversation & Messages between Jordan Taylor and Acuity Employer
  const conv = await Conversation.create({
    participants: [demoCandidate.user._id, createdEmployers[0].user._id],
    jobId: createdJobs[0]._id,
    lastMessageText: 'Thank you! I received the advance questions and will review them before our session.',
    lastMessageAt: new Date(),
  });

  await Message.create({
    conversationId: conv._id,
    senderId: createdEmployers[0].user._id,
    content:
      'Hi Jordan! We reviewed your Cypress test suite and were really impressed by your edge-case coverage. We scheduled our interview session and attached the agenda and questions in advance.',
    readBy: [createdEmployers[0].user._id, demoCandidate.user._id],
    createdAt: new Date(Date.now() - 3600000),
  });

  await Message.create({
    conversationId: conv._id,
    senderId: demoCandidate.user._id,
    content:
      'Thank you! I received the advance questions and will review them before our session. I appreciate the camera-optional option.',
    readBy: [demoCandidate.user._id],
    createdAt: new Date(),
  });

  // 11. Seed Career Development & Learning Resources
  const resourcesData = [
    {
      title: 'Automated QA Testing Fundamentals: From Manual to Cypress',
      slug: 'qa-testing-fundamentals-cypress',
      category: 'Software Testing / QA',
      difficulty: 'BEGINNER',
      estimatedTime: '45 mins',
      description:
        'A systematic guide to turning manual test matrices into automated, reproducible Cypress and Playwright scripts without flakiness.',
      skillsGained: ['Cypress Basics', 'Test Assertions', 'Locator Strategies', 'Edge-Case Design'],
      featured: true,
      contentMarkdown: `# Automated QA Testing Fundamentals

## The Superpower of Edge-Case Thinking
Neurodivergent testers often naturally spot what others overlook: boundary conditions, unusual user journeys, and unexpected null inputs.

### 1. Structure Over Guesswork
Clean test automation starts with structured acceptance criteria. When reviewing a user story, define:
- Positive flows (the happy path)
- Negative validation flows (malformed inputs, special characters)
- Boundary limits (e.g. 0 items, 1 item, max items)

### 2. Writing Your First Resilient Cypress Test
\`\`\`typescript
describe('Login Verification', () => {
  it('displays explicit error message on invalid credentials', () => {
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('invalid@demo.com');
    cy.get('[data-testid="password-input"]').type('WrongPass');
    cy.get('[data-testid="submit-btn"]').click();
    
    cy.get('[role="alert"]')
      .should('be.visible')
      .and('contain.text', 'Invalid email or password');
  });
});
\`\`\`
`,
    },
    {
      title: 'Defensive Cybersecurity & Log Investigation for Pattern Thinkers',
      slug: 'defensive-cybersecurity-log-investigation',
      category: 'Cybersecurity',
      difficulty: 'INTERMEDIATE',
      estimatedTime: '60 mins',
      description:
        'How to leverage hyperfocus and pattern recognition to detect security threats in SIEM and firewall logs.',
      skillsGained: ['Log Analysis', 'Threat Hunting', 'Wireshark Filtering', 'Anomaly Detection'],
      featured: true,
      contentMarkdown: `# Defensive Cybersecurity for Pattern Thinkers

## Turning Pattern Recognition into Threat Hunting
Anomalies in network logs often hide in plain sight. In this guide, we explore how to construct Wireshark filters and identify lateral movement in enterprise networks.
`,
    },
    {
      title: 'Data Auditing & Mathematical Reconciliation with SQL',
      slug: 'data-auditing-reconciliation-sql',
      category: 'Data Analysis / Audit',
      difficulty: 'BEGINNER',
      estimatedTime: '35 mins',
      description:
        'Practical SQL queries and window functions for verifying ledger transactions and finding missing data rows.',
      skillsGained: ['SQL Window Functions', 'Reconciliation Queries', 'Data Governance'],
      featured: true,
      contentMarkdown: `# Data Auditing & Reconciliation with SQL

## Absolute Precision in Data Pipelines
Learn how to write non-destructive audit queries that verify integrity across millions of rows with sub-second execution times.
`,
    },
    {
      title: 'Navigating Predictable Technical Interviews without Anxiety',
      slug: 'navigating-predictable-interviews',
      category: 'Interview preparation',
      difficulty: 'BEGINNER',
      estimatedTime: '25 mins',
      description:
        'How to request accommodations like advance agendas, camera-optional video calls, and written instructions with confidence.',
      skillsGained: ['Self-Advocacy', 'Accommodation Requests', 'Predictability Planning'],
      featured: true,
      contentMarkdown: `# Navigating Technical Interviews

## Your Accommodations are Success Enablers
Workplace accommodations are not favors—they are the optimal environmental settings that enable you to bring your authentic cognitive strengths to your work.
`,
    },
  ];

  for (const res of resourcesData) {
    await Resource.create(res);
  }
  console.log(`[Seed] Seeded ${resourcesData.length} learning resources.`);

  console.log('[Seed] Database successfully seeded with 100% realistic production data!');
};

// Execute if run directly from CLI
if (process.argv[1]?.includes('seed')) {
  connectDB()
    .then(() => seedDatabase())
    .then(() => {
      console.log('[Seed] Exiting cleanly.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed Error]:', err);
      process.exit(1);
    });
}
