import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';
import {
  BookOpen,
  Award,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Play,
  RotateCcw,
  Layers,
  ShieldCheck,
  Code2,
  Database,
  Palette,
  FileText,
  Bug,
  Check,
  XCircle,
  Trophy,
  ChevronRight,
} from 'lucide-react';

export type QuizDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

interface QuizQuestion {
  id: string;
  question: string;
  codeOrContext?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface CourseTrackBlock {
  id: string;
  stepNumber: string;
  title: string;
  shortTitle: string;
  jobCategory: string;
  badgeColor: string;
  iconName: 'bug' | 'shield' | 'database' | 'code' | 'palette' | 'file';
  summary: string;
  modules: string[];
  levels: Record<
    QuizDifficulty,
    {
      levelLabel: string;
      xpReward: number;
      duration: string;
      lessonSummary: string;
      questions: QuizQuestion[];
    }
  >;
}

const COURSE_SEQUENCE_BLOCKS: CourseTrackBlock[] = [
  {
    id: 'qa-testing',
    stepNumber: '01',
    title: 'Software Testing & QA Automation',
    shortTitle: 'QA & Automation',
    jobCategory: 'SOFTWARE_TESTING_QA',
    badgeColor: 'from-brand-600 to-indigo-600',
    iconName: 'bug',
    summary:
      'Master edge-case discovery, deterministic E2E test suites with Playwright/Cypress, and API contract validation.',
    modules: [
      'Boundary Value & Equivalence Partitioning',
      'Deterministic Selectors & Non-Flaky Waits',
      'REST API Status & Schema Assertions',
    ],
    levels: {
      BEGINNER: {
        levelLabel: 'Level 1: QA Foundations & Edge Cases',
        xpReward: 150,
        duration: '5 mins • 3 Questions',
        lessonSummary:
          'Focuses on boundary value analysis, reproducible bug reporting, and verifying input constraints.',
        questions: [
          {
            id: 'qa-b-1',
            question:
              'A form field accepts integer ages from 18 to 65 inclusive. Using Boundary Value Analysis, which set of test inputs provides the strongest edge-case coverage?',
            options: [
              '25, 35, 45, 55',
              '17, 18, 65, 66',
              '0, 50, 100',
              '18 and 65 only',
            ],
            correctIndex: 1,
            explanation:
              'Boundary Value Analysis tests the exact minimum/maximum edges (18, 65) and the immediate invalid neighbors (17, 66) where off-by-one bugs occur.',
          },
          {
            id: 'qa-b-2',
            question:
              'What is the most critical element to include in a written bug report so an engineer can fix it asynchronously without a meeting?',
            options: [
              'A general statement that the page crashed',
              'Deterministic step-by-step reproduction instructions, expected vs. actual results, and environment details',
              'The name of the developer who wrote the feature',
              'Only a screenshot without steps',
            ],
            correctIndex: 1,
            explanation:
              'Clear reproduction steps paired with expected vs. actual behavior eliminate ambiguity and enable asynchronous resolution.',
          },
          {
            id: 'qa-b-3',
            question:
              'Which HTTP status code indicates that a POST request successfully created a new resource on the server?',
            options: ['201 Created', '204 No Content', '400 Bad Request', '302 Found'],
            correctIndex: 0,
            explanation:
              'HTTP 201 Created is the standard REST status code confirming a new resource was persisted.',
          },
        ],
      },
      INTERMEDIATE: {
        levelLabel: 'Level 2: E2E Automation & Playwright/Cypress',
        xpReward: 300,
        duration: '7 mins • 3 Questions',
        lessonSummary:
          'Covers resilient DOM locators, eliminating flaky hard-coded sleeps, and network interception.',
        questions: [
          {
            id: 'qa-i-1',
            question:
              'Which selector strategy is most resilient to CSS styling refactors in automated Playwright or Cypress tests?',
            codeOrContext: '<button class="btn-lg bg-blue-500" data-testid="submit-application" role="button">Submit</button>',
            options: [
              'page.locator(".btn-lg.bg-blue-500")',
              'page.getByRole("button", { name: "Submit" }) or getByTestId("submit-application")',
              'page.locator("div > div > button:nth-child(2)")',
              'page.locator("xpath=//button[1]")',
            ],
            correctIndex: 1,
            explanation:
              'Accessible role locators (getByRole) and explicit data-testid attributes decouple tests from fragile CSS classes and DOM nesting.',
          },
          {
            id: 'qa-i-2',
            question:
              'Why is `waitForTimeout(5000)` considered an anti-pattern in automated UI testing?',
            options: [
              'It makes tests both slower than necessary when responses are fast and flaky when CI servers are under heavy load',
              'It is not supported in TypeScript',
              'It clears browser cookies automatically',
              'It only works in headless mode',
            ],
            correctIndex: 0,
            explanation:
              'Web-first assertions and explicit network/element state waits adapt dynamically, whereas fixed sleeps waste time or fail on slow runners.',
          },
          {
            id: 'qa-i-3',
            question:
              'When testing a checkout flow in isolation without charging a real credit card gateway, what technique should you use?',
            options: [
              'Skip testing the checkout button',
              'Mock/intercept the payment API route and return a deterministic JSON fixture',
              'Use a real corporate credit card in CI',
              'Disable HTTPS in production',
            ],
            correctIndex: 1,
            explanation:
              'Network route interception (stubbing/mocking) lets you test both 200 OK and 500 error UI states deterministically.',
          },
        ],
      },
      ADVANCED: {
        levelLabel: 'Level 3: Principal SDET & CI Architecture',
        xpReward: 500,
        duration: '10 mins • 3 Questions',
        lessonSummary:
          'Evaluates contract testing, parallel shard isolation, and accessibility regression gates.',
        questions: [
          {
            id: 'qa-a-1',
            question:
              'When running 400 E2E tests across 8 parallel CI workers, tests intermittently fail due to shared user state. What is the best architectural fix?',
            options: [
              'Run all 400 tests sequentially on 1 worker',
              'Provision isolated test accounts/tenants per worker shard or seed state via API per test',
              'Add 10-second delays between every test',
              'Delete the failing tests',
            ],
            correctIndex: 1,
            explanation:
              'State isolation per worker or per test guarantees hermetic, parallelizable execution without race conditions.',
          },
          {
            id: 'qa-a-2',
            question:
              'Which automated tool can be embedded directly into Playwright/Cypress to catch WCAG 2.2 accessibility regressions on every pull request?',
            options: ['@axe-core/playwright (axe-core)', 'eslint-plugin-import', 'webpack-bundle-analyzer', 'nodemon'],
            correctIndex: 0,
            explanation:
              'axe-core scans the rendered DOM for contrast, ARIA, and label violations automatically during E2E runs.',
          },
          {
            id: 'qa-a-3',
            question:
              'What is the primary advantage of Consumer-Driven Contract Testing (e.g., Pact) between microservices?',
            options: [
              'It replaces all unit tests',
              'It verifies that a provider API still satisfies every consumer payload expectation without spinning up the entire distributed fleet',
              'It encrypts database backups',
              'It minifies frontend CSS',
            ],
            correctIndex: 1,
            explanation:
              'Contract tests catch breaking schema changes immediately in fast CI pipelines before deployment.',
          },
        ],
      },
    },
  },
  {
    id: 'cybersecurity',
    stepNumber: '02',
    title: 'Cybersecurity & Threat Hunting',
    shortTitle: 'Cybersecurity',
    jobCategory: 'CYBERSECURITY',
    badgeColor: 'from-teal-600 to-emerald-600',
    iconName: 'shield',
    summary:
      'Channel deep focus and anomaly detection into SIEM log triage, OWASP vulnerability auditing, and incident response.',
    modules: [
      'SIEM Log Triage & Anomaly Detection',
      'OWASP Top 10 & API Security',
      'Zero-Trust IAM & Incident Playbooks',
    ],
    levels: {
      BEGINNER: {
        levelLabel: 'Level 1: SecOps & Threat Triage Foundations',
        xpReward: 150,
        duration: '5 mins • 3 Questions',
        lessonSummary: 'Covers authentication security, phishing indicators, and least-privilege access.',
        questions: [
          {
            id: 'sec-b-1',
            question:
              'Which security principle states that a user or service account should only be granted the minimum permissions required to perform its task?',
            options: [
              'Security by Obscurity',
              'Principle of Least Privilege (PoLP)',
              'Open Access Model',
              'Perimeter Trust',
            ],
            correctIndex: 1,
            explanation:
              'The Principle of Least Privilege limits blast radius if credentials or tokens are ever compromised.',
          },
          {
            id: 'sec-b-2',
            question:
              'While reviewing authentication logs, you see 450 failed login attempts from a single IP within 30 seconds followed by 1 HTTP 200 success. What attack pattern is this?',
            options: [
              'SQL Injection',
              'Credential Stuffing / Brute-Force Attack',
              'DNS Cache Poisoning',
              'Cross-Site Scripting (XSS)',
            ],
            correctIndex: 1,
            explanation:
              'High-velocity failed logins followed by a successful authentication is a classic signature of credential stuffing.',
          },
          {
            id: 'sec-b-3',
            question: 'Why should passwords be stored using salted bcrypt/Argon2 hashes instead of SHA-256?',
            options: [
              'bcrypt/Argon2 are purposefully work-factor slow and salted, resisting GPU rainbow-table and brute-force cracking',
              'SHA-256 produces shorter strings',
              'bcrypt can be decrypted back into plaintext',
              'Argon2 does not require a database',
            ],
            correctIndex: 0,
            explanation:
              'Adaptive password hashing functions like Argon2 and bcrypt include per-user salts and configurable computational cost.',
          },
        ],
      },
      INTERMEDIATE: {
        levelLabel: 'Level 2: Application Security & OWASP Auditing',
        xpReward: 300,
        duration: '7 mins • 3 Questions',
        lessonSummary: 'Tests SQL injection prevention, XSS mitigation, and JWT verification.',
        questions: [
          {
            id: 'sec-i-1',
            question: 'How do you completely prevent SQL Injection in a backend database query?',
            codeOrContext: 'SELECT * FROM users WHERE email = ?',
            options: [
              'Use parameterized queries / prepared statements so user input is treated strictly as data, never executable SQL',
              'Strip spaces from the input string on the frontend',
              'Use HTTP POST instead of GET',
              'Hide the database port',
            ],
            correctIndex: 0,
            explanation:
              'Parameterized queries separate the SQL command structure from user-supplied parameters at the driver level.',
          },
          {
            id: 'sec-i-2',
            question:
              'An API endpoint `/api/orders/1045` returns order details without checking if order `1045` belongs to the currently authenticated user. What OWASP vulnerability is this?',
            options: [
              'Broken Object Level Authorization (BOLA / IDOR)',
              'Server-Side Request Forgery (SSRF)',
              'Buffer Overflow',
              'Clickjacking',
            ],
            correctIndex: 0,
            explanation:
              'BOLA / IDOR occurs when an endpoint trusts a resource ID from the URL without verifying ownership against the session user.',
          },
          {
            id: 'sec-i-3',
            question: 'Which HTTP cookie flags protect a session token from being stolen via XSS or sent over unencrypted HTTP?',
            options: [
              'HttpOnly; Secure; SameSite=Strict',
              'Public; Max-Age=999999',
              'Allow-All; CrossOrigin',
              'Cache-Control: public',
            ],
            correctIndex: 0,
            explanation:
              'HttpOnly blocks JavaScript access (`document.cookie`), Secure enforces HTTPS, and SameSite mitigates CSRF.',
          },
        ],
      },
      ADVANCED: {
        levelLabel: 'Level 3: Detection Engineering & Forensics',
        xpReward: 500,
        duration: '10 mins • 3 Questions',
        lessonSummary: 'Focuses on lateral movement detection, SSRF cloud metadata protection, and SIEM rules.',
        questions: [
          {
            id: 'sec-a-1',
            question:
              'In cloud environments (AWS/GCP), why is a Server-Side Request Forgery (SSRF) vulnerability targeting `169.254.169.254` critical?',
            options: [
              'It restarts the DNS server',
              'It queries the instance metadata service (IMDS) and can exfiltrate temporary IAM role credentials',
              'It deletes CSS stylesheets',
              'It only affects local printers',
            ],
            correctIndex: 1,
            explanation:
              '169.254.169.254 is the cloud Instance Metadata Service; enforcing IMDSv2 hop limits and outbound allowlists prevents credential theft.',
          },
          {
            id: 'sec-a-2',
            question:
              'Which indicator in endpoint telemetry strongly suggests an attacker is performing DNS tunneling for data exfiltration?',
            options: [
              'High-entropy, unusually long subdomain queries to a single external domain at regular intervals',
              'Standard A-record lookups for google.com',
              'A 404 response on a static image',
              'Normal NTP time sync traffic',
            ],
            correctIndex: 0,
            explanation:
              'DNS tunneling encodes exfiltrated payloads into high-entropy subdomain labels routed to an attacker-controlled authoritative nameserver.',
          },
          {
            id: 'sec-a-3',
            question:
              'When designing a Zero-Trust service-to-service architecture, how should internal microservices authenticate each other?',
            options: [
              'Trust any request coming from the internal VPC IP range',
              'Enforce mutual TLS (mTLS) with short-lived cryptographic workload identities (e.g., SPIFFE) and fine-grained authorization policies',
              'Share a single static API key across all 50 services',
              'Disable authentication inside the cluster',
            ],
            correctIndex: 1,
            explanation:
              'Zero-Trust never assumes network locality equals trust; mTLS and workload identity verify every service-to-service call.',
          },
        ],
      },
    },
  },
  {
    id: 'data-audit',
    stepNumber: '03',
    title: 'Data Analysis & Integrity Audit',
    shortTitle: 'Data & SQL Audit',
    jobCategory: 'DATA_ANALYSIS_AUDIT',
    badgeColor: 'from-indigo-600 to-purple-600',
    iconName: 'database',
    summary:
      'Leverage mathematical precision to reconcile datasets, write high-performance SQL queries, and audit pipeline integrity.',
    modules: [
      'SQL Aggregations, Joins & Window Functions',
      'Null Handling & Schema Reconciliation',
      'Statistical Anomaly & Drift Detection',
    ],
    levels: {
      BEGINNER: {
        levelLabel: 'Level 1: SQL & Data Hygiene Foundations',
        xpReward: 150,
        duration: '5 mins • 3 Questions',
        lessonSummary: 'Covers SQL filtering, NULL behavior, and duplicate detection.',
        questions: [
          {
            id: 'dat-b-1',
            question: 'In SQL, which clause is used to filter grouped rows AFTER an aggregate function like `COUNT(*)` is computed?',
            options: ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'],
            correctIndex: 1,
            explanation:
              'WHERE filters individual rows before grouping, whereas HAVING filters aggregated groups produced by GROUP BY.',
          },
          {
            id: 'dat-b-2',
            question: 'What does the expression `NULL = NULL` evaluate to in standard SQL?',
            options: ['TRUE', 'FALSE', 'UNKNOWN (falsy unless checked with IS NULL)', '0'],
            correctIndex: 2,
            explanation:
              'In SQL three-valued logic, NULL represents an unknown value, so comparisons must use `IS NULL` or `IS NOT NULL`.',
          },
          {
            id: 'dat-b-3',
            question:
              'When auditing a financial ledger table, which SQL query finds `transaction_id` values that appear more than once?',
            options: [
              'SELECT transaction_id, COUNT(*) FROM ledger GROUP BY transaction_id HAVING COUNT(*) > 1;',
              'SELECT DISTINCT transaction_id FROM ledger;',
              'DELETE FROM ledger;',
              'SELECT * FROM ledger LIMIT 1;',
            ],
            correctIndex: 0,
            explanation:
              'Grouping by the unique identifier and filtering with `HAVING COUNT(*) > 1` pinpoints exact duplicate keys.',
          },
        ],
      },
      INTERMEDIATE: {
        levelLabel: 'Level 2: Window Functions & Pipeline Joins',
        xpReward: 300,
        duration: '7 mins • 3 Questions',
        lessonSummary: 'Tests LEFT JOIN vs INNER JOIN reconciliation and SQL window functions.',
        questions: [
          {
            id: 'dat-i-1',
            question:
              'You want to find all `customers` who have NEVER placed an order in the `orders` table. Which query pattern is most direct?',
            options: [
              'SELECT c.id FROM customers c INNER JOIN orders o ON c.id = o.customer_id;',
              'SELECT c.id FROM customers c LEFT JOIN orders o ON c.id = o.customer_id WHERE o.id IS NULL;',
              'SELECT c.id FROM customers c CROSS JOIN orders o;',
              'SELECT COUNT(*) FROM orders;',
            ],
            correctIndex: 1,
            explanation:
              'A LEFT JOIN preserves all customers and `WHERE o.id IS NULL` isolates the orphan records with zero matching orders.',
          },
          {
            id: 'dat-i-2',
            question:
              'Which SQL window function assigns a unique sequential rank (1, 2, 3...) to rows within a partition without collapsing the rows?',
            options: ['ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC)', 'SUM(salary)', 'GROUP BY dept', 'DISTINCT'],
            correctIndex: 0,
            explanation:
              'ROW_NUMBER() OVER (...) computes per-partition rankings while keeping every detail row intact.',
          },
          {
            id: 'dat-i-3',
            question:
              'A dataset of employee salaries has 99 values between $70k–$110k and 1 data-entry error of $95,000,000. Which metric is more robust against this outlier?',
            options: ['Mean (Average)', 'Median (50th Percentile)', 'Sum', 'Maximum'],
            correctIndex: 1,
            explanation:
              'The median is order-based and unaffected by extreme single-record outliers, whereas the mean is heavily skewed.',
          },
        ],
      },
      ADVANCED: {
        levelLabel: 'Level 3: Data Governance & Idempotent Pipelines',
        xpReward: 500,
        duration: '10 mins • 3 Questions',
        lessonSummary: 'Evaluates idempotent ETL design, Slowly Changing Dimensions, and data contracts.',
        questions: [
          {
            id: 'dat-a-1',
            question: 'What does it mean for a daily ETL data pipeline job to be "idempotent"?',
            options: [
              'Running the pipeline once or re-running it 5 times for the same date partition produces the exact same target table state without duplicating rows',
              'It runs without logging',
              'It only processes CSV files',
              'It deletes the production database on failure',
            ],
            correctIndex: 0,
            explanation:
              'Idempotent pipelines use MERGE/upsert or partition overwrite semantics so retries never double-count records.',
          },
          {
            id: 'dat-a-2',
            question:
              'In data warehousing, which Slowly Changing Dimension (SCD) type preserves full historical versions of a record using `valid_from` and `valid_to` timestamps?',
            options: ['SCD Type 0', 'SCD Type 1 (Overwrite)', 'SCD Type 2 (Historical Row Versioning)', 'SCD Type 404'],
            correctIndex: 2,
            explanation:
              'SCD Type 2 inserts a new versioned row with effective date ranges so point-in-time historical audits remain accurate.',
          },
          {
            id: 'dat-a-3',
            question:
              'Why is a composite B-Tree index on `(organization_id, created_at)` effective for a query filtering `WHERE organization_id = 42 ORDER BY created_at DESC`?',
            options: [
              'The leftmost prefix matches the equality filter (`organization_id`) and the second column is already pre-sorted for the `created_at` range/order scan',
              'Indexes make tables use zero disk space',
              'B-Tree indexes only work on boolean columns',
              'It bypasses SQL syntax checking',
            ],
            correctIndex: 0,
            explanation:
              'Following the equality-then-sort column rule allows the database engine to seek directly to organization 42 and read rows in sorted order without a file sort.',
          },
        ],
      },
    },
  },
  {
    id: 'software-dev',
    stepNumber: '04',
    title: 'Software Engineering & Systems',
    shortTitle: 'Software Engineering',
    jobCategory: 'SOFTWARE_DEVELOPMENT',
    badgeColor: 'from-blue-600 to-indigo-600',
    iconName: 'code',
    summary:
      'Build strongly-typed TypeScript applications, predictable React state architectures, and resilient Node.js APIs.',
    modules: [
      'TypeScript Type Safety & Generics',
      'React Rendering & State Immutability',
      'Asynchronous Node.js & API Resilience',
    ],
    levels: {
      BEGINNER: {
        levelLabel: 'Level 1: TypeScript & Modern JS Foundations',
        xpReward: 150,
        duration: '5 mins • 3 Questions',
        lessonSummary: 'Covers array immutability, promises, and TypeScript union types.',
        questions: [
          {
            id: 'dev-b-1',
            question: 'Which JavaScript array method returns a NEW array of transformed items without mutating the original array?',
            options: ['Array.prototype.push()', 'Array.prototype.splice()', 'Array.prototype.map()', 'Array.prototype.sort()'],
            correctIndex: 2,
            explanation:
              '`.map()` is pure and returns a new array of the same length, preserving state immutability in React.',
          },
          {
            id: 'dev-b-2',
            question: 'In TypeScript, what is the advantage of `unknown` over `any` for untrusted API payloads?',
            options: [
              '`unknown` requires explicit type narrowing or validation before you can call methods or access properties on the value',
              '`unknown` automatically encrypts the variable',
              '`unknown` is faster at runtime',
              'There is no difference',
            ],
            correctIndex: 0,
            explanation:
              '`any` disables all type checking, whereas `unknown` enforces runtime type guards before property access.',
          },
          {
            id: 'dev-b-3',
            question: 'What happens if an `async` function throws an unhandled error inside a `try` block?',
            options: [
              'Execution jumps to the `catch` block and returns a rejected Promise if not re-handled',
              'The browser tab closes immediately',
              'It silently returns `true`',
              'It restarts the computer',
            ],
            correctIndex: 0,
            explanation:
              'Async functions wrap return values and thrown exceptions in Promises, routing errors inside `try` to `catch`.',
          },
        ],
      },
      INTERMEDIATE: {
        levelLabel: 'Level 2: React & Full-Stack API Engineering',
        xpReward: 300,
        duration: '7 mins • 3 Questions',
        lessonSummary: 'Tests React effect cleanup, REST idempotency, and race condition prevention.',
        questions: [
          {
            id: 'dev-i-1',
            question:
              'Why should a `useEffect` hook that registers a `window.addEventListener` return a cleanup function?',
            options: [
              'To remove the listener when the component unmounts or dependencies change, preventing memory leaks and duplicate handlers',
              'To make the CSS load faster',
              'React requires every function to return a string',
              'To clear localStorage',
            ],
            correctIndex: 0,
            explanation:
              'Returning `() => window.removeEventListener(...)` ensures old listeners are disposed cleanly across re-renders and unmounts.',
          },
          {
            id: 'dev-i-2',
            question:
              'When firing 3 independent API requests (`getProfile`, `getJobs`, `getNotifications`), how can you run them concurrently instead of sequentially?',
            options: [
              'Await each one on separate lines one after another',
              'Use `await Promise.all([getProfile(), getJobs(), getNotifications()])`',
              'Use a `while(true)` loop',
              'Use `setTimeout`',
            ],
            correctIndex: 1,
            explanation:
              '`Promise.all` dispatches all 3 network requests in parallel, reducing total latency to the slowest single request.',
          },
          {
            id: 'dev-i-3',
            question: 'Which HTTP method is designed to be idempotent for replacing or updating a specific resource at `/api/profile`?',
            options: ['POST', 'PUT', 'CONNECT', 'TRACE'],
            correctIndex: 1,
            explanation:
              'PUT is idempotent by specification: sending the same update payload multiple times results in the same resource state.',
          },
        ],
      },
      ADVANCED: {
        levelLabel: 'Level 3: Distributed Systems & Performance',
        xpReward: 500,
        duration: '10 mins • 3 Questions',
        lessonSummary: 'Covers optimistic concurrency control, N+1 query elimination, and backpressure.',
        questions: [
          {
            id: 'dev-a-1',
            question: 'What is the "N+1 Query Problem" in an API endpoint and how do you solve it?',
            options: [
              'Fetching a list of N parent records in 1 query and then executing N separate database queries inside a loop for each child; solved via batch `$in` lookup or `.populate()` / SQL JOIN',
              'Adding 1 to every integer in JSON',
              'Having more than 1 frontend page',
              'Using TypeScript interfaces',
            ],
            correctIndex: 0,
            explanation:
              'Batching child lookups into a single `$in` or JOIN query reduces database round-trips from N+1 down to 1 or 2.',
          },
          {
            id: 'dev-a-2',
            question:
              'Two recruiters click "Approve" on the same application record at the exact same millisecond. How does Optimistic Concurrency Control prevent lost updates?',
            options: [
              'Include a version number (`__v` or `updatedAt`) in the update filter so the second write detects a version mismatch rather than silently overwriting',
              'Disable the database',
              'Clear the browser cache',
              'Use CSS `pointer-events: none` only',
            ],
            correctIndex: 0,
            explanation:
              'Atomic compare-and-swap on a document version key guarantees conflicting concurrent updates are detected safely.',
          },
          {
            id: 'dev-a-3',
            question:
              'When an upstream webhook floods your Node.js server with 10,000 events per second, what pattern protects downstream workers from exhaustion?',
            options: [
              'Acknowledge receipt quickly into a durable message queue with bounded worker concurrency and exponential backoff',
              'Spawn 10,000 synchronous database connections simultaneously',
              'Log the entire payload to console synchronously',
              'Turn off rate limiting',
            ],
            correctIndex: 0,
            explanation:
              'Decoupling ingestion via a queue with controlled consumer concurrency applies backpressure and prevents database saturation.',
          },
        ],
      },
    },
  },
  {
    id: 'ui-ux-accessibility',
    stepNumber: '05',
    title: 'Accessible UI/UX & Design Systems',
    shortTitle: 'UI/UX & WCAG',
    jobCategory: 'UI_UX_DESIGN',
    badgeColor: 'from-purple-600 to-pink-600',
    iconName: 'palette',
    summary:
      'Design low-cognitive-load interfaces, W3C COGA neuro-inclusive user flows, and WCAG 2.2 AA/AAA design systems.',
    modules: [
      'WCAG 2.2 Contrast, Focus & Target Size',
      'W3C COGA Cognitive Accessibility',
      'Semantic HTML & Screen Reader ARIA',
    ],
    levels: {
      BEGINNER: {
        levelLabel: 'Level 1: WCAG & Visual Clarity Foundations',
        xpReward: 150,
        duration: '5 mins • 3 Questions',
        lessonSummary: 'Covers WCAG AA contrast ratios, semantic buttons, and sensory motion control.',
        questions: [
          {
            id: 'ux-b-1',
            question: 'What is the minimum WCAG 2.2 Level AA color contrast ratio required for normal body text?',
            options: ['1.5 : 1', '4.5 : 1', '2.0 : 1', '10 : 1'],
            correctIndex: 1,
            explanation:
              'WCAG 2.2 Level AA requires at least 4.5:1 for normal text (and 3:1 for large text) to ensure readability.',
          },
          {
            id: 'ux-b-2',
            question:
              'Why should interactive actions use a native `<button>` element instead of `<div onClick={...}>`?',
            options: [
              'Native `<button>` elements automatically provide keyboard focus (`Tab`), `Enter`/`Space` activation, and screen reader role announcement',
              '`<div>` elements cannot be styled with CSS',
              '`<button>` makes network requests faster',
              'React does not allow `onClick` on `<div>`',
            ],
            correctIndex: 0,
            explanation:
              'Semantic HTML provides built-in keyboard navigation and assistive technology semantics out of the box.',
          },
          {
            id: 'ux-b-3',
            question:
              'Under W3C Cognitive Accessibility (COGA) guidelines, why should auto-playing background videos or animations include a visible pause/motion toggle?',
            options: [
              'Continuous peripheral motion can trigger vestibular discomfort, sensory overload, or attention fragmentation for neurodivergent users',
              'To save server disk space',
              'Because videos cannot loop in HTML5',
              'Only for mobile phones',
            ],
            correctIndex: 0,
            explanation:
              'WCAG 2.2.2 (Pause, Stop, Hide) and W3C COGA emphasize user control over moving visual stimuli to prevent sensory overload.',
          },
        ],
      },
      INTERMEDIATE: {
        levelLabel: 'Level 2: ARIA Semantics & Keyboard Ergonomics',
        xpReward: 300,
        duration: '7 mins • 3 Questions',
        lessonSummary: 'Tests modal focus management, ARIA live regions, and form error clarity.',
        questions: [
          {
            id: 'ux-i-1',
            question: 'When a modal dialog opens on screen, where should keyboard focus be placed and how should `Escape` behave?',
            options: [
              'Focus should move inside the modal (trapped within the dialog while open), and pressing `Escape` should close the modal and restore focus to the trigger button',
              'Focus should stay behind the backdrop on the page footer',
              'Keyboard navigation should be disabled completely',
              'Focus should jump to the browser address bar',
            ],
            correctIndex: 0,
            explanation:
              'Proper dialog focus management prevents keyboard users from tabbing into background elements hidden behind the overlay.',
          },
          {
            id: 'ux-i-2',
            question:
              'Which ARIA attribute announces dynamic status updates (such as "Application saved!") to screen readers without stealing keyboard focus?',
            options: ['aria-live="polite" (or role="status")', 'aria-hidden="true"', 'tabindex="-1"', 'display="none"'],
            correctIndex: 0,
            explanation:
              '`aria-live="polite"` queues spoken announcements at the next graceful pause without interrupting the user’s current focus.',
          },
          {
            id: 'ux-i-3',
            question:
              'How does splitting long forms into clear steps with auto-save help candidates with ADHD or executive-function differences?',
            options: [
              'It reduces working-memory load, prevents accidental data loss if distracted, and provides clear progress feedback',
              'It makes the database schema smaller',
              'It hides required fields',
              'It removes validation',
            ],
            correctIndex: 0,
            explanation:
              'Chunking information and persisting drafts directly addresses W3C COGA executive-function and memory guidelines.',
          },
        ],
      },
      ADVANCED: {
        levelLabel: 'Level 3: Design Systems & WCAG 2.2 AAA Architecture',
        xpReward: 500,
        duration: '10 mins • 3 Questions',
        lessonSummary: 'Evaluates design tokens, prefers-reduced-motion integration, and WCAG 2.2 target sizes.',
        questions: [
          {
            id: 'ux-a-1',
            question:
              'In a multi-theme design system (Light, Dark, High-Contrast), why should components reference semantic tokens (e.g., `surface-primary`, `text-muted`) instead of raw hex codes?',
            options: [
              'Semantic tokens allow switching contrast ratios and color palettes globally without rewriting individual component styles',
              'Browsers cannot render hex codes',
              'Semantic tokens compress images',
              'Hex codes only work in light mode',
            ],
            correctIndex: 0,
            explanation:
              'Decoupling intent (semantic token) from raw value enables instant high-contrast and dark-mode adaptation across the app.',
          },
          {
            id: 'ux-a-2',
            question:
              'What new requirement did WCAG 2.2 introduce under Success Criterion 2.5.8 (Target Size Minimum)?',
            options: [
              'Interactive pointer targets should be at least 24×24 CSS pixels (or have sufficient spacing) to prevent accidental activation',
              'All buttons must be 500px wide',
              'Touchscreens are no longer supported',
              'Links cannot use underlines',
            ],
            correctIndex: 0,
            explanation:
              'WCAG 2.2 SC 2.5.8 establishes a 24×24 CSS pixel minimum target size (or spacing equivalent) to aid motor accuracy.',
          },
          {
            id: 'ux-a-3',
            question:
              'How should an animation controller behave when `(prefers-reduced-motion: reduce)` or a user’s in-app "Reduce Motion" setting is active?',
            options: [
              'Immediately skip or revert spatial movement/parallax animations while preserving full content visibility and state clarity',
              'Hide all text content on the page',
              'Play animations at 2x speed',
              'Log the user out',
            ],
            correctIndex: 0,
            explanation:
              'Respecting OS and in-app reduced-motion preferences ensures zero vestibular triggers while keeping 100% of information accessible.',
          },
        ],
      },
    },
  },
  {
    id: 'research-docs',
    stepNumber: '06',
    title: 'Technical Documentation & Research',
    shortTitle: 'Technical Docs',
    jobCategory: 'RESEARCH_DOCUMENTATION',
    badgeColor: 'from-amber-600 to-teal-600',
    iconName: 'file',
    summary:
      'Transform complex engineering systems into crystal-clear API references, OpenAPI specs, and runbooks that eliminate ambiguity.',
    modules: [
      'Unambiguous Technical Writing & Plain Language',
      'OpenAPI / Swagger & Docs-as-Code',
      'Information Architecture & Runbooks',
    ],
    levels: {
      BEGINNER: {
        levelLabel: 'Level 1: Clear Technical Writing Foundations',
        xpReward: 150,
        duration: '5 mins • 3 Questions',
        lessonSummary: 'Focuses on active voice, unambiguous instructions, and structured prerequisites.',
        questions: [
          {
            id: 'doc-b-1',
            question: 'Which sentence is clearest and easiest to follow in a developer setup guide?',
            options: [
              'The configuration file should probably be edited by the user before the server is started up.',
              '1. Copy `.env.example` to `.env`. 2. Set `PORT=5001`. 3. Run `npm run dev` to start the server.',
              'Just configure the environment variables as usual.',
              'Start it after doing the setup stuff.',
            ],
            correctIndex: 1,
            explanation:
              'Numbered, imperative, concrete steps with exact filenames and commands leave zero room for guesswork.',
          },
          {
            id: 'doc-b-2',
            question: 'Why should every tutorial or runbook list "Prerequisites" at the very top of the document?',
            options: [
              'So readers can verify required tools, versions, and permissions before investing time in step 1',
              'To make the page longer',
              'Because Markdown requires it',
              'To hide the main instructions',
            ],
            correctIndex: 0,
            explanation:
              'Upfront prerequisites prevent mid-tutorial blockers and reduce frustration.',
          },
          {
            id: 'doc-b-3',
            question: 'In Markdown, what is the benefit of specifying the language identifier on fenced code blocks (e.g., ```bash or ```json)?',
            options: [
              'It enables accurate syntax highlighting and helps screen readers/parsers identify the code context',
              'It executes the code on the server',
              'It deletes comments',
              'It hides the code block on mobile',
            ],
            correctIndex: 0,
            explanation:
              'Language tags provide visual syntax highlighting and semantic metadata for documentation tooling.',
          },
        ],
      },
      INTERMEDIATE: {
        levelLabel: 'Level 2: API Documentation & Docs-as-Code',
        xpReward: 300,
        duration: '7 mins • 3 Questions',
        lessonSummary: 'Covers OpenAPI schemas, error code tables, and Git-based documentation workflows.',
        questions: [
          {
            id: 'doc-i-1',
            question: 'What makes an API endpoint reference truly useful to developers integrating it for the first time?',
            options: [
              'Listing only the URL path',
              'Providing a complete, copy-pasteable request example, parameter types/constraints, and realistic 200 + 4xx response JSON payloads',
              'Using abstract prose without examples',
              'Linking to the company homepage',
            ],
            correctIndex: 1,
            explanation:
              'Concrete request/response payloads and error schemas allow developers to integrate and debug without guessing.',
          },
          {
            id: 'doc-i-2',
            question: 'What is the core philosophy of "Docs-as-Code"?',
            options: [
              'Treating documentation with the same workflow as source code: versioned in Git, reviewed via Pull Requests, and linted/deployed in CI',
              'Writing documentation only inside binary files',
              'Never updating documentation after launch',
              'Removing all human explanations',
            ],
            correctIndex: 0,
            explanation:
              'Docs-as-Code keeps technical documentation synchronized with engineering changes in the same PR lifecycle.',
          },
          {
            id: 'doc-i-3',
            question: 'In the Diátaxis documentation framework, what is the difference between a "Tutorial" and a "Reference Guide"?',
            options: [
              'A Tutorial is a step-by-step learning experience for beginners, while a Reference Guide provides exhaustive, lookup-oriented technical specifications',
              'They are identical',
              'A Reference Guide has no headings',
              'A Tutorial is only for senior architects',
            ],
            correctIndex: 0,
            explanation:
              'Separating learning-oriented Tutorials from lookup-oriented References keeps both concise and predictable.',
          },
        ],
      },
      ADVANCED: {
        levelLabel: 'Level 3: Knowledge Architecture & Automated Specs',
        xpReward: 500,
        duration: '10 mins • 3 Questions',
        lessonSummary: 'Evaluates OpenAPI CI validation, incident runbooks, and cognitive information architecture.',
        questions: [
          {
            id: 'doc-a-1',
            question: 'How can you prevent API documentation examples from drifting out of sync with the actual backend implementation?',
            options: [
              'Generate or validate the OpenAPI specification against live integration test responses in the CI pipeline',
              'Ask developers to remember to update Wiki pages once a year',
              'Disable API versioning',
              'Use screenshots of terminal windows instead of text',
            ],
            correctIndex: 0,
            explanation:
              'Automated schema contract checks in CI guarantee that documented payloads match real API behavior.',
          },
          {
            id: 'doc-a-2',
            question:
              'When authoring an Incident Response Runbook for on-call engineers, why is a "Verification & Rollback" section mandatory for every remediation command?',
            options: [
              'During high-stress incidents, engineers need an explicit check to confirm whether the fix worked and a safe command to revert if it worsened the state',
              'To satisfy word-count minimums',
              'Because runbooks are only read after the incident is over',
              'To replace monitoring dashboards',
            ],
            correctIndex: 0,
            explanation:
              'Explicit verification and rollback steps eliminate high-stakes guesswork during production incidents.',
          },
          {
            id: 'doc-a-3',
            question:
              'How does progressive disclosure (e.g., Plain-Language Summary at the top + expandable deep-dive specs below) improve documentation accessibility?',
            options: [
              'It allows readers to grasp the core mental model immediately without being overwhelmed, while keeping full technical depth one click away',
              'It deletes advanced content permanently',
              'It prevents search engines from indexing the page',
              'It requires users to log in twice',
            ],
            correctIndex: 0,
            explanation:
              'Progressive disclosure serves both quick-scanning readers and deep-diving specialists without cognitive overload.',
          },
        ],
      },
    },
  },
];

export interface EarnedQuizBadge {
  courseId: string;
  courseTitle: string;
  level: QuizDifficulty;
  scorePct: number;
  xp: number;
  completedAt: string;
}

interface CourseQuizHubProps {
  recommendedCategory?: string;
}

export const CourseQuizHub: React.FC<CourseQuizHubProps> = ({ recommendedCategory }) => {
  const { success } = useToast();

  const [selectedCourseId, setSelectedCourseId] = useState<string>(COURSE_SEQUENCE_BLOCKS[0].id);
  const [selectedLevel, setSelectedLevel] = useState<QuizDifficulty>('BEGINNER');
  const [quizActive, setQuizActive] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  const [earnedBadges, setEarnedBadges] = useState<EarnedQuizBadge[]>(() => {
    try {
      const saved = localStorage.getItem('nce_course_quiz_badges');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Pre-select the course matching the candidate's primary assessment result if provided
  useEffect(() => {
    if (!recommendedCategory) return;
    const lower = recommendedCategory.toLowerCase();
    const matched = COURSE_SEQUENCE_BLOCKS.find(
      (b) =>
        lower.includes(b.shortTitle.toLowerCase()) ||
        b.title.toLowerCase().includes(lower) ||
        (lower.includes('qa') && b.id === 'qa-testing') ||
        (lower.includes('cyber') && b.id === 'cybersecurity') ||
        (lower.includes('data') && b.id === 'data-audit') ||
        (lower.includes('software') && b.id === 'software-dev') ||
        (lower.includes('ui') && b.id === 'ui-ux-accessibility') ||
        (lower.includes('doc') && b.id === 'research-docs')
    );
    if (matched) {
      setSelectedCourseId(matched.id);
    }
  }, [recommendedCategory]);

  const activeCourse =
    COURSE_SEQUENCE_BLOCKS.find((c) => c.id === selectedCourseId) || COURSE_SEQUENCE_BLOCKS[0];
  const activeLevelData = activeCourse.levels[selectedLevel];

  const handleSelectCourseAndLevel = (courseId: string, level: QuizDifficulty, autoStart = false) => {
    setSelectedCourseId(courseId);
    setSelectedLevel(level);
    setUserAnswers({});
    setQuizSubmitted(false);
    setQuizActive(autoStart);
  };

  const handleSelectAnswer = (questionId: string, optionIdx: number) => {
    if (quizSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleGradeQuiz = () => {
    const questions = activeLevelData.questions;
    let correctCount = 0;
    questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const scorePct = Math.round((correctCount / questions.length) * 100);
    setQuizSubmitted(true);

    const newBadge: EarnedQuizBadge = {
      courseId: activeCourse.id,
      courseTitle: activeCourse.shortTitle,
      level: selectedLevel,
      scorePct,
      xp: scorePct >= 66 ? activeLevelData.xpReward : Math.round(activeLevelData.xpReward * 0.5),
      completedAt: new Date().toISOString(),
    };

    const filtered = earnedBadges.filter(
      (b) => !(b.courseId === activeCourse.id && b.level === selectedLevel)
    );
    const updated = [newBadge, ...filtered];
    setEarnedBadges(updated);
    localStorage.setItem('nce_course_quiz_badges', JSON.stringify(updated));

    // Also sync milestone slug to backend profile if logged in
    const milestoneKey = `quiz:${activeCourse.id}:${selectedLevel}:${scorePct}%`;
    api.updateCandidateProfile({ learningMilestones: updated.map((b) => `${b.courseId}-${b.level}`) }).catch(() => {});

    if (scorePct >= 66) {
      success(
        `Congratulations! You scored ${scorePct}% on ${activeCourse.shortTitle} (${selectedLevel}) and unlocked +${newBadge.xp} XP!`
      );
    } else {
      success(`Quiz completed (${scorePct}%). Review the explanations below and retry anytime!`);
    }
    void milestoneKey;
  };

  const renderCourseIcon = (iconName: CourseTrackBlock['iconName']) => {
    switch (iconName) {
      case 'bug':
        return <Bug className="w-5 h-5" />;
      case 'shield':
        return <ShieldCheck className="w-5 h-5" />;
      case 'database':
        return <Database className="w-5 h-5" />;
      case 'code':
        return <Code2 className="w-5 h-5" />;
      case 'palette':
        return <Palette className="w-5 h-5" />;
      case 'file':
        return <FileText className="w-5 h-5" />;
    }
  };

  const totalXp = earnedBadges.reduce((sum, b) => sum + b.xp, 0);

  const getBadgeForCourseLevel = (courseId: string, level: QuizDifficulty) =>
    earnedBadges.find((b) => b.courseId === courseId && b.level === level);

  const allQuestionsAnswered = activeLevelData.questions.every(
    (q) => userAnswers[q.id] !== undefined
  );

  const currentCorrectCount = activeLevelData.questions.filter(
    (q) => userAnswers[q.id] === q.correctIndex
  ).length;
  const currentScorePct = Math.round(
    (currentCorrectCount / activeLevelData.questions.length) * 100
  );

  return (
    <div className="space-y-8">
      {/* Section Header + Earned XP Summary */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
            <Layers className="w-3.5 h-3.5" />
            <span>Interactive Course Roadmap & Multi-Level Skill Quizzes</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Click Any Course Block → Select Your Level → Take the Field Quiz
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Practice real-world technical scenarios at your own pace with zero countdown timers. Earn
            verified skill badges across Foundation, Practitioner, and Specialist levels to boost your job
            readiness!
          </p>
        </div>

        {/* XP & Badges Counter */}
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/15 shrink-0">
          <div className="w-11 h-11 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-200 block">
              Verified Quiz Progress
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-white">{earnedBadges.length} / 18 Levels</span>
              <span className="text-xs font-bold text-emerald-400">({totalXp} XP)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sequence of 6 Course Blocks (Connected Roadmap Grid) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Step 1: Choose a Field Course Block in the Sequence (01 → 06)
          </span>
          <span className="text-xs text-brand-600 dark:text-indigo-400 font-semibold">
            Click any block below to load its 3-Level Quiz
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {COURSE_SEQUENCE_BLOCKS.map((block) => {
            const isSelected = block.id === selectedCourseId;
            const completedLevelsCount = (['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as QuizDifficulty[]).filter(
              (lvl) => Boolean(getBadgeForCourseLevel(block.id, lvl))
            ).length;

            return (
              <div
                key={block.id}
                onClick={() => handleSelectCourseAndLevel(block.id, selectedLevel, false)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectCourseAndLevel(block.id, selectedLevel, false);
                  }
                }}
                className={`cursor-pointer rounded-2xl p-5 border transition-all flex flex-col justify-between text-left ${
                  isSelected
                    ? 'bg-brand-50/90 dark:bg-indigo-950/70 border-brand-600 dark:border-indigo-400 ring-2 ring-brand-500/25 shadow-card'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-brand-300 dark:hover:border-slate-700 shadow-subtle'
                }`}
              >
                <div className="space-y-3">
                  {/* Block Top Bar */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${block.badgeColor} text-white flex items-center justify-center shadow-xs`}
                      >
                        {renderCourseIcon(block.iconName)}
                      </span>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-indigo-400 block">
                          Course Block {block.stepNumber}
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                          {block.title}
                        </h3>
                      </div>
                    </div>

                    {completedLevelsCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shrink-0">
                        {completedLevelsCount}/3 Done
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {block.summary}
                  </p>

                  {/* Syllabus Micro-Modules */}
                  <div className="space-y-1 pt-1">
                    {block.modules.map((m, idx) => (
                      <div
                        key={m}
                        className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium"
                      >
                        <span className="w-4 h-4 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="truncate">{m}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Level Pills inside the Course Block */}
                <div className="pt-4 mt-4 border-t border-slate-200/70 dark:border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Select Level to Start Quiz:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as QuizDifficulty[]).map((lvl) => {
                      const badge = getBadgeForCourseLevel(block.id, lvl);
                      const isActiveLvl = isSelected && selectedLevel === lvl;
                      const shortLbl =
                        lvl === 'BEGINNER' ? 'Lvl 1: Easy' : lvl === 'INTERMEDIATE' ? 'Lvl 2: Mid' : 'Lvl 3: Pro';

                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectCourseAndLevel(block.id, lvl, true);
                          }}
                          className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center justify-center gap-1 ${
                            isActiveLvl
                              ? 'bg-brand-600 text-white border-brand-600 shadow-2xs'
                              : badge
                              ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          {badge && <Check className="w-2.5 h-2.5 shrink-0" />}
                          <span>{shortLbl}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 2: Active Course Level & Interactive Quiz Workbench */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-brand-200 dark:border-indigo-800/80 p-6 sm:p-8 shadow-card space-y-6 transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-brand-100 dark:bg-indigo-950 text-brand-800 dark:text-indigo-300 text-xs font-extrabold">
                Block {activeCourse.stepNumber}: {activeCourse.title}
              </span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                +{activeLevelData.xpReward} XP Reward
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {activeLevelData.duration}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              {activeLevelData.levelLabel}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {activeLevelData.lessonSummary}
            </p>
          </div>

          {/* 3-Level Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
            {(
              [
                { id: 'BEGINNER', label: 'Level 1: Foundation' },
                { id: 'INTERMEDIATE', label: 'Level 2: Practitioner' },
                { id: 'ADVANCED', label: 'Level 3: Specialist' },
              ] as Array<{ id: QuizDifficulty; label: string }>
            ).map((tab) => {
              const badge = getBadgeForCourseLevel(activeCourse.id, tab.id);
              const active = selectedLevel === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSelectCourseAndLevel(activeCourse.id, tab.id, true)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {badge && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {!quizActive ? (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-600 dark:text-indigo-400" />
                <span>Ready to test your {activeCourse.shortTitle} skills at {selectedLevel} level?</span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Includes {activeLevelData.questions.length} scenario-based questions with instant learning
                explanations. Untimed and stress-free.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setQuizActive(true)}
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-card transition-colors shrink-0"
            >
              <Play className="w-4 h-4" />
              <span>Start {selectedLevel} Quiz Now</span>
            </button>
          </div>
        ) : (
          /* Interactive Questions List */
          <div className="space-y-6">
            {activeLevelData.questions.map((q, qIdx) => {
              const selectedOpt = userAnswers[q.id];
              const isCorrect = selectedOpt === q.correctIndex;

              return (
                <div
                  key={q.id}
                  className="p-5 sm:p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/90 dark:border-slate-700 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-indigo-400">
                        Question {qIdx + 1} of {activeLevelData.questions.length}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                        {q.question}
                      </h4>
                    </div>
                    {quizSubmitted && (
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1 ${
                          isCorrect
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" /> Review Answer
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  {q.codeOrContext && (
                    <pre className="p-3 rounded-xl bg-slate-900 text-indigo-200 text-xs font-mono overflow-x-auto border border-slate-700">
                      <code>{q.codeOrContext}</code>
                    </pre>
                  )}

                  <div className="grid grid-cols-1 gap-2.5">
                    {q.options.map((optText, optIdx) => {
                      const chosen = selectedOpt === optIdx;
                      const isRightOption = q.correctIndex === optIdx;

                      let btnStyle =
                        'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-brand-400';
                      if (quizSubmitted) {
                        if (isRightOption) {
                          btnStyle =
                            'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 text-emerald-950 dark:text-emerald-200 ring-1 ring-emerald-500';
                        } else if (chosen && !isRightOption) {
                          btnStyle =
                            'bg-rose-50 dark:bg-rose-950/70 border-rose-400 text-rose-900 dark:text-rose-200';
                        }
                      } else if (chosen) {
                        btnStyle =
                          'bg-brand-50 dark:bg-indigo-950 border-brand-600 dark:border-indigo-400 text-slate-900 dark:text-white ring-2 ring-brand-500/20';
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectAnswer(q.id, optIdx)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-start gap-3 ${btnStyle}`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full border text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                              chosen
                                ? 'bg-brand-600 border-brand-600 text-white'
                                : 'border-slate-300 dark:border-slate-600 text-slate-500'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="leading-relaxed">{optText}</span>
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="p-3.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs text-slate-700 dark:text-slate-200 space-y-1">
                      <span className="font-bold text-brand-700 dark:text-indigo-300 block">
                        Why this answer is correct:
                      </span>
                      <p className="leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Quiz Footer Actions & Results Banner */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              {!quizSubmitted ? (
                <>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Answered {Object.keys(userAnswers).length} of {activeLevelData.questions.length} questions
                  </span>
                  <button
                    type="button"
                    disabled={!allQuestionsAnswered}
                    onClick={handleGradeQuiz}
                    className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-card transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Quiz & Verify {selectedLevel} Badge</span>
                  </button>
                </>
              ) : (
                <div className="w-full p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-emerald-700/50">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center font-black text-lg text-emerald-300 shrink-0">
                      {currentScorePct}%
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 block">
                        {activeCourse.shortTitle} • {selectedLevel} Completed
                      </span>
                      <h4 className="text-sm sm:text-base font-extrabold">
                        You answered {currentCorrectCount} of {activeLevelData.questions.length} correctly!
                      </h4>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setUserAnswers({});
                        setQuizSubmitted(false);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retry Level</span>
                    </button>

                    {selectedLevel !== 'ADVANCED' && (
                      <button
                        type="button"
                        onClick={() =>
                          handleSelectCourseAndLevel(
                            activeCourse.id,
                            selectedLevel === 'BEGINNER' ? 'INTERMEDIATE' : 'ADVANCED',
                            true
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-white text-xs font-bold transition-colors"
                      >
                        <span>
                          Next: {selectedLevel === 'BEGINNER' ? 'Level 2 (Practitioner)' : 'Level 3 (Specialist)'}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <Link
                      to={`/jobs?category=${activeCourse.jobCategory}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold transition-colors"
                    >
                      <span>View {activeCourse.shortTitle} Jobs</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Earned Skill Badges Showcase */}
      {earnedBadges.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Your Verified Field Quiz Badges ({earnedBadges.length})</span>
            </h3>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Total XP: {totalXp}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {earnedBadges.map((b) => (
              <div
                key={`${b.courseId}-${b.level}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-900 dark:text-emerald-200"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {b.courseTitle} • {b.level} ({b.scorePct}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
