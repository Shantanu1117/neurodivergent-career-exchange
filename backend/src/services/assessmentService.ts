export interface AssessmentQuestionData {
  questionId: number;
  prompt: string;
  categoryDimension: string;
  options: Array<{
    text: string;
    weights: {
      qaTesting: number;
      cybersecurity: number;
      dataAudit: number;
      softwareDev: number;
      uiUx: number;
      researchDoc: number;
    };
  }>;
}

export const ASSESSMENT_QUESTIONS: AssessmentQuestionData[] = [
  {
    questionId: 1,
    prompt: 'When exploring software or systems, what draws your attention first?',
    categoryDimension: 'System Curiosity',
    options: [
      {
        text: 'Finding anomalies, broken links, edge cases, and unexpected errors.',
        weights: { qaTesting: 5, cybersecurity: 3, dataAudit: 4, softwareDev: 2, uiUx: 2, researchDoc: 3 },
      },
      {
        text: 'Examining permissions, potential vulnerabilities, and privacy controls.',
        weights: { qaTesting: 2, cybersecurity: 5, dataAudit: 3, softwareDev: 2, uiUx: 1, researchDoc: 2 },
      },
      {
        text: 'Understanding how database schemas and numerical metrics flow across the platform.',
        weights: { qaTesting: 2, cybersecurity: 2, dataAudit: 5, softwareDev: 3, uiUx: 1, researchDoc: 3 },
      },
      {
        text: 'Evaluating the visual layout, accessibility contrast, and intuitive navigation.',
        weights: { qaTesting: 2, cybersecurity: 1, dataAudit: 1, softwareDev: 3, uiUx: 5, researchDoc: 2 },
      },
    ],
  },
  {
    questionId: 2,
    prompt: 'How would you describe your relationship with detailed, repetitive tasks?',
    categoryDimension: 'Task Structure & Repetition',
    options: [
      {
        text: 'I find deep calm and hyperfocus in systematically verifying data or test scenarios.',
        weights: { qaTesting: 5, cybersecurity: 3, dataAudit: 5, softwareDev: 1, uiUx: 1, researchDoc: 4 },
      },
      {
        text: 'I enjoy spotting subtle patterns and discrepancies that others usually overlook.',
        weights: { qaTesting: 4, cybersecurity: 5, dataAudit: 4, softwareDev: 2, uiUx: 3, researchDoc: 3 },
      },
      {
        text: 'I prefer building tools and automation scripts to eliminate manual repetition.',
        weights: { qaTesting: 3, cybersecurity: 3, dataAudit: 2, softwareDev: 5, uiUx: 2, researchDoc: 1 },
      },
      {
        text: 'I prefer creating structured written documentation and process checklists.',
        weights: { qaTesting: 3, cybersecurity: 2, dataAudit: 3, softwareDev: 1, uiUx: 2, researchDoc: 5 },
      },
    ],
  },
  {
    questionId: 3,
    prompt: 'When problem-solving under complexity, which mode fits your cognitive flow best?',
    categoryDimension: 'Problem-Solving Flow',
    options: [
      {
        text: 'Step-by-step root-cause analysis: breaking down the problem into logical sequences.',
        weights: { qaTesting: 5, cybersecurity: 4, dataAudit: 4, softwareDev: 4, uiUx: 2, researchDoc: 3 },
      },
      {
        text: 'Investigative threat modeling: thinking like an adversary to find loopholes.',
        weights: { qaTesting: 2, cybersecurity: 5, dataAudit: 3, softwareDev: 2, uiUx: 1, researchDoc: 2 },
      },
      {
        text: 'Data reconciliation: inspecting anomalies in datasets to ensure pure integrity.',
        weights: { qaTesting: 3, cybersecurity: 3, dataAudit: 5, softwareDev: 2, uiUx: 1, researchDoc: 3 },
      },
      {
        text: 'Empathetic workflow mapping: streamlining screens so users never experience cognitive strain.',
        weights: { qaTesting: 1, cybersecurity: 1, dataAudit: 1, softwareDev: 3, uiUx: 5, researchDoc: 3 },
      },
    ],
  },
  {
    questionId: 4,
    prompt: 'What kind of work environment provides you with the deepest cognitive energy?',
    categoryDimension: 'Environment & Sensory Focus',
    options: [
      {
        text: 'Quiet, predictable schedule with clear written specifications and minimal interruption.',
        weights: { qaTesting: 4, cybersecurity: 4, dataAudit: 5, softwareDev: 3, uiUx: 2, researchDoc: 5 },
      },
      {
        text: 'High-focus technical immersion where I can solve deep architectural logic puzzles.',
        weights: { qaTesting: 3, cybersecurity: 4, dataAudit: 3, softwareDev: 5, uiUx: 2, researchDoc: 2 },
      },
      {
        text: 'Investigative research environment with dedicated deep-dive time into system logs.',
        weights: { qaTesting: 3, cybersecurity: 5, dataAudit: 4, softwareDev: 2, uiUx: 1, researchDoc: 4 },
      },
      {
        text: 'Visual and conceptual design space crafting harmonious, accessible digital interfaces.',
        weights: { qaTesting: 1, cybersecurity: 1, dataAudit: 1, softwareDev: 2, uiUx: 5, researchDoc: 2 },
      },
    ],
  },
  {
    questionId: 5,
    prompt: 'Which technical toolset or language domain sounds most intriguing to you?',
    categoryDimension: 'Tooling & Technology',
    options: [
      {
        text: 'Test suites, Cypress, Playwright, Selenium, Postman API testing.',
        weights: { qaTesting: 5, cybersecurity: 2, dataAudit: 2, softwareDev: 3, uiUx: 1, researchDoc: 2 },
      },
      {
        text: 'Wireshark, SIEM tools, Kali Linux, firewall rule audits, cryptography basics.',
        weights: { qaTesting: 2, cybersecurity: 5, dataAudit: 3, softwareDev: 2, uiUx: 1, researchDoc: 2 },
      },
      {
        text: 'SQL, Python pandas, Excel power pivot, data reconciliation pipelines.',
        weights: { qaTesting: 2, cybersecurity: 2, dataAudit: 5, softwareDev: 3, uiUx: 1, researchDoc: 3 },
      },
      {
        text: 'TypeScript, React, Node.js, building full-stack applications and web services.',
        weights: { qaTesting: 2, cybersecurity: 2, dataAudit: 2, softwareDev: 5, uiUx: 3, researchDoc: 1 },
      },
    ],
  },
  {
    questionId: 6,
    prompt: 'How do you prefer communication to occur regarding work instructions?',
    categoryDimension: 'Communication Rhythms',
    options: [
      {
        text: 'Written specifications, acceptance criteria, Jira tickets, and async Slack messages.',
        weights: { qaTesting: 4, cybersecurity: 4, dataAudit: 4, softwareDev: 4, uiUx: 3, researchDoc: 4 },
      },
      {
        text: 'Structured visual diagrams, user flows, and wireframes.',
        weights: { qaTesting: 2, cybersecurity: 2, dataAudit: 2, softwareDev: 3, uiUx: 5, researchDoc: 3 },
      },
      {
        text: 'Comprehensive documentation, technical wikis, and reference manuals.',
        weights: { qaTesting: 3, cybersecurity: 3, dataAudit: 3, softwareDev: 2, uiUx: 2, researchDoc: 5 },
      },
      {
        text: 'Brief 1-on-1 check-ins with clear action items and no surprise meetings.',
        weights: { qaTesting: 3, cybersecurity: 3, dataAudit: 3, softwareDev: 4, uiUx: 3, researchDoc: 3 },
      },
    ],
  },
  {
    questionId: 7,
    prompt: 'When someone says "this software is working perfectly", what is your instinctive reaction?',
    categoryDimension: 'Critical Inquiry',
    options: [
      {
        text: '"Let me test the negative cases, extreme inputs, and boundary values to be sure."',
        weights: { qaTesting: 5, cybersecurity: 3, dataAudit: 3, softwareDev: 2, uiUx: 2, researchDoc: 2 },
      },
      {
        text: '"What happens if an unauthorized user crafts a malicious packet or payload?"',
        weights: { qaTesting: 2, cybersecurity: 5, dataAudit: 2, softwareDev: 2, uiUx: 1, researchDoc: 1 },
      },
      {
        text: '"Do the transaction totals and audit logs mathematically match across tables?"',
        weights: { qaTesting: 3, cybersecurity: 2, dataAudit: 5, softwareDev: 2, uiUx: 1, researchDoc: 2 },
      },
      {
        text: '"Can a screen-reader user or someone with motor difficulties navigate it seamlessly?"',
        weights: { qaTesting: 2, cybersecurity: 1, dataAudit: 1, softwareDev: 2, uiUx: 5, researchDoc: 2 },
      },
    ],
  },
  {
    questionId: 8,
    prompt: 'Which kind of project milestone feels most satisfying to achieve?',
    categoryDimension: 'Outcome Motivation',
    options: [
      {
        text: 'Discovering a critical bug that prevented customer failure before release.',
        weights: { qaTesting: 5, cybersecurity: 3, dataAudit: 3, softwareDev: 2, uiUx: 1, researchDoc: 2 },
      },
      {
        text: 'Securing system configurations and closing security loopholes.',
        weights: { qaTesting: 2, cybersecurity: 5, dataAudit: 2, softwareDev: 2, uiUx: 1, researchDoc: 2 },
      },
      {
        text: 'Delivering a clean, perfectly verified dataset with zero reconciliations missing.',
        weights: { qaTesting: 2, cybersecurity: 2, dataAudit: 5, softwareDev: 2, uiUx: 1, researchDoc: 3 },
      },
      {
        text: 'Launching a clean feature that works flawlessly from frontend to database.',
        weights: { qaTesting: 2, cybersecurity: 2, dataAudit: 2, softwareDev: 5, uiUx: 3, researchDoc: 1 },
      },
    ],
  },
  {
    questionId: 9,
    prompt: 'How do you handle ambiguous requirements or lack of structure?',
    categoryDimension: 'Ambiguity Resolution',
    options: [
      {
        text: 'I create structured test matrices and acceptance criteria to bring clarity.',
        weights: { qaTesting: 5, cybersecurity: 3, dataAudit: 4, softwareDev: 3, uiUx: 2, researchDoc: 3 },
      },
      {
        text: 'I establish security guardrails and compliance baseline rules.',
        weights: { qaTesting: 2, cybersecurity: 5, dataAudit: 3, softwareDev: 2, uiUx: 1, researchDoc: 3 },
      },
      {
        text: 'I audit historical records to understand ground truth and establish patterns.',
        weights: { qaTesting: 3, cybersecurity: 3, dataAudit: 5, softwareDev: 2, uiUx: 1, researchDoc: 4 },
      },
      {
        text: 'I write detailed documentation and create knowledge base guides for the team.',
        weights: { qaTesting: 3, cybersecurity: 2, dataAudit: 3, softwareDev: 2, uiUx: 2, researchDoc: 5 },
      },
    ],
  },
  {
    questionId: 10,
    prompt: 'What is your perspective on rules, standards, and compliance checklists?',
    categoryDimension: 'Standardization Alignment',
    options: [
      {
        text: 'I value rigorous standards; knowing the exact expected behavior gives me high confidence.',
        weights: { qaTesting: 5, cybersecurity: 4, dataAudit: 5, softwareDev: 2, uiUx: 2, researchDoc: 4 },
      },
      {
        text: 'I love standards frameworks (NIST, ISO, CIS benchmarks) because they protect organizations.',
        weights: { qaTesting: 2, cybersecurity: 5, dataAudit: 3, softwareDev: 2, uiUx: 1, researchDoc: 3 },
      },
      {
        text: 'I enjoy translating complex engineering rules into clear design tokens and component systems.',
        weights: { qaTesting: 2, cybersecurity: 1, dataAudit: 1, softwareDev: 3, uiUx: 5, researchDoc: 2 },
      },
      {
        text: 'I love building software systems that implement business rules reliably.',
        weights: { qaTesting: 3, cybersecurity: 3, dataAudit: 3, softwareDev: 5, uiUx: 2, researchDoc: 1 },
      },
    ],
  },
  {
    questionId: 11,
    prompt: 'If you could spend 4 uninterrupted hours on one task, which would you pick?',
    categoryDimension: 'Deep Focus Specialization',
    options: [
      {
        text: 'Systematically testing an application using automated scripts and exploratory suites.',
        weights: { qaTesting: 5, cybersecurity: 2, dataAudit: 3, softwareDev: 2, uiUx: 2, researchDoc: 2 },
      },
      {
        text: 'Investigating network anomalies or conducting a vulnerability assessment.',
        weights: { qaTesting: 2, cybersecurity: 5, dataAudit: 3, softwareDev: 2, uiUx: 1, researchDoc: 2 },
      },
      {
        text: 'Cleaning, analyzing, and finding trends across large corporate datasets.',
        weights: { qaTesting: 2, cybersecurity: 2, dataAudit: 5, softwareDev: 2, uiUx: 2, researchDoc: 3 },
      },
      {
        text: 'Coding a clean, elegant web application with reactive state and APIs.',
        weights: { qaTesting: 2, cybersecurity: 2, dataAudit: 2, softwareDev: 5, uiUx: 3, researchDoc: 1 },
      },
    ],
  },
  {
    questionId: 12,
    prompt: 'How do you view documentation and knowledge sharing?',
    categoryDimension: 'Documentation Affinity',
    options: [
      {
        text: 'Detailed bug reproduction steps and test documentation are essential for quality.',
        weights: { qaTesting: 5, cybersecurity: 3, dataAudit: 3, softwareDev: 2, uiUx: 2, researchDoc: 4 },
      },
      {
        text: 'Accurate security incident reports and audit trails prevent future disasters.',
        weights: { qaTesting: 3, cybersecurity: 5, dataAudit: 4, softwareDev: 2, uiUx: 1, researchDoc: 4 },
      },
      {
        text: 'Creating comprehensive guides, FAQs, and technical handbooks is deeply satisfying to me.',
        weights: { qaTesting: 3, cybersecurity: 2, dataAudit: 3, softwareDev: 2, uiUx: 2, researchDoc: 5 },
      },
      {
        text: 'Design system documentation and UI component guidelines make teams efficient.',
        weights: { qaTesting: 2, cybersecurity: 1, dataAudit: 1, softwareDev: 3, uiUx: 5, researchDoc: 3 },
      },
    ],
  },
  {
    questionId: 13,
    prompt: 'Which phrase resonates most with your natural cognitive rhythm?',
    categoryDimension: 'Cognitive Rhythm',
    options: [
      {
        text: '"Precision and thoroughness over rushed velocity."',
        weights: { qaTesting: 5, cybersecurity: 4, dataAudit: 5, softwareDev: 2, uiUx: 2, researchDoc: 4 },
      },
      {
        text: '"Defensive vigilance and systemic risk awareness."',
        weights: { qaTesting: 3, cybersecurity: 5, dataAudit: 3, softwareDev: 2, uiUx: 1, researchDoc: 2 },
      },
      {
        text: '"Logical architecture and building functional systems."',
        weights: { qaTesting: 2, cybersecurity: 2, dataAudit: 2, softwareDev: 5, uiUx: 3, researchDoc: 1 },
      },
      {
        text: '"Clarity, empathy, and intuitive human-first experiences."',
        weights: { qaTesting: 1, cybersecurity: 1, dataAudit: 1, softwareDev: 2, uiUx: 5, researchDoc: 4 },
      },
    ],
  },
  {
    questionId: 14,
    prompt: 'When you notice an inconsistency or discrepancy in numbers or code, what do you do?',
    categoryDimension: 'Pattern Inconsistency Response',
    options: [
      {
        text: 'I cannot let it go until I track down exactly why it deviated and document it.',
        weights: { qaTesting: 5, cybersecurity: 4, dataAudit: 5, softwareDev: 3, uiUx: 2, researchDoc: 4 },
      },
      {
        text: 'I investigate whether it represents an authentication flaw or suspicious activity.',
        weights: { qaTesting: 3, cybersecurity: 5, dataAudit: 4, softwareDev: 2, uiUx: 1, researchDoc: 2 },
      },
      {
        text: 'I trace the algorithmic logic and refactor the code to eliminate the flaw.',
        weights: { qaTesting: 3, cybersecurity: 2, dataAudit: 3, softwareDev: 5, uiUx: 2, researchDoc: 1 },
      },
      {
        text: 'I analyze how that error impacts the user experience and adjust the UI feedback.',
        weights: { qaTesting: 2, cybersecurity: 1, dataAudit: 1, softwareDev: 3, uiUx: 5, researchDoc: 2 },
      },
    ],
  },
  {
    questionId: 15,
    prompt: 'What type of feedback style helps you thrive best in your career?',
    categoryDimension: 'Feedback Style',
    options: [
      {
        text: 'Direct, objective feedback based on measurable metrics rather than subjective social cues.',
        weights: { qaTesting: 4, cybersecurity: 4, dataAudit: 4, softwareDev: 4, uiUx: 3, researchDoc: 4 },
      },
      {
        text: 'Written technical reviews with specific examples and time to process before discussing.',
        weights: { qaTesting: 4, cybersecurity: 4, dataAudit: 4, softwareDev: 4, uiUx: 3, researchDoc: 5 },
      },
      {
        text: 'Clear priority rubrics so I always know which item has the highest importance.',
        weights: { qaTesting: 4, cybersecurity: 3, dataAudit: 5, softwareDev: 3, uiUx: 3, researchDoc: 4 },
      },
      {
        text: 'Visual critiques with side-by-side comparisons of desired outcomes.',
        weights: { qaTesting: 2, cybersecurity: 1, dataAudit: 1, softwareDev: 2, uiUx: 5, researchDoc: 2 },
      },
    ],
  },
  {
    questionId: 16,
    prompt: 'Which role in a tech company feels like the best champion for quality and truth?',
    categoryDimension: 'Quality Philosophy',
    options: [
      {
        text: 'QA & Test Engineers: They protect customers by ensuring software actually works as promised.',
        weights: { qaTesting: 5, cybersecurity: 2, dataAudit: 2, softwareDev: 2, uiUx: 2, researchDoc: 2 },
      },
      {
        text: 'Cybersecurity Analysts: They defend sensitive human data from adversaries.',
        weights: { qaTesting: 2, cybersecurity: 5, dataAudit: 2, softwareDev: 2, uiUx: 1, researchDoc: 2 },
      },
      {
        text: 'Data Auditors: They maintain mathematical integrity and prevent financial/data corruption.',
        weights: { qaTesting: 2, cybersecurity: 2, dataAudit: 5, softwareDev: 2, uiUx: 1, researchDoc: 3 },
      },
      {
        text: 'Software Developers & Designers: They bring ideas to life with code and human-centered design.',
        weights: { qaTesting: 2, cybersecurity: 2, dataAudit: 2, softwareDev: 5, uiUx: 4, researchDoc: 2 },
      },
    ],
  },
  {
    questionId: 17,
    prompt: 'How do you approach learning a new complex system or tool?',
    categoryDimension: 'Learning Strategy',
    options: [
      {
        text: 'I read the documentation thoroughly and experiment with edge conditions systematically.',
        weights: { qaTesting: 5, cybersecurity: 4, dataAudit: 4, softwareDev: 3, uiUx: 2, researchDoc: 5 },
      },
      {
        text: 'I build a small hands-on prototype and learn by solving problems along the way.',
        weights: { qaTesting: 3, cybersecurity: 3, dataAudit: 2, softwareDev: 5, uiUx: 4, researchDoc: 2 },
      },
      {
        text: 'I deconstruct the architecture to understand potential attack surfaces and failure points.',
        weights: { qaTesting: 3, cybersecurity: 5, dataAudit: 3, softwareDev: 3, uiUx: 1, researchDoc: 2 },
      },
      {
        text: 'I map out the user journeys and interface models to understand the system flow.',
        weights: { qaTesting: 2, cybersecurity: 1, dataAudit: 2, softwareDev: 2, uiUx: 5, researchDoc: 4 },
      },
    ],
  },
  {
    questionId: 18,
    prompt: 'What kind of workplace accommodation makes the biggest positive difference for you?',
    categoryDimension: 'Workplace Enabler',
    options: [
      {
        text: 'Advance written agendas, clear expectations, and asynchronous standups.',
        weights: { qaTesting: 4, cybersecurity: 4, dataAudit: 4, softwareDev: 4, uiUx: 4, researchDoc: 4 },
      },
      {
        text: 'Dedicated uninterrupted focus blocks with noise-cancelling headphones supported.',
        weights: { qaTesting: 5, cybersecurity: 5, dataAudit: 5, softwareDev: 4, uiUx: 3, researchDoc: 4 },
      },
      {
        text: 'Flexible work hours and remote environment to manage sensory stimulation.',
        weights: { qaTesting: 4, cybersecurity: 4, dataAudit: 4, softwareDev: 4, uiUx: 4, researchDoc: 4 },
      },
      {
        text: 'Direct communication style with clear priorities and minimal corporate jargon.',
        weights: { qaTesting: 4, cybersecurity: 4, dataAudit: 4, softwareDev: 4, uiUx: 4, researchDoc: 5 },
      },
    ],
  },
];

export class AssessmentService {
  public static calculateScores(
    answers: Array<{ questionId: number; selectedOptionIndex: number }>
  ) {
    const rawScores = {
      qaTesting: 0,
      cybersecurity: 0,
      dataAudit: 0,
      softwareDev: 0,
      uiUx: 0,
      researchDoc: 0,
    };

    const maxPossible = {
      qaTesting: 0,
      cybersecurity: 0,
      dataAudit: 0,
      softwareDev: 0,
      uiUx: 0,
      researchDoc: 0,
    };

    ASSESSMENT_QUESTIONS.forEach((q) => {
      // Find max weight in this question for normalizer
      q.options.forEach((opt) => {
        maxPossible.qaTesting = Math.max(maxPossible.qaTesting, opt.weights.qaTesting);
        maxPossible.cybersecurity = Math.max(maxPossible.cybersecurity, opt.weights.cybersecurity);
        maxPossible.dataAudit = Math.max(maxPossible.dataAudit, opt.weights.dataAudit);
        maxPossible.softwareDev = Math.max(maxPossible.softwareDev, opt.weights.softwareDev);
        maxPossible.uiUx = Math.max(maxPossible.uiUx, opt.weights.uiUx);
        maxPossible.researchDoc = Math.max(maxPossible.researchDoc, opt.weights.researchDoc);
      });

      const userAns = answers.find((a) => a.questionId === q.questionId);
      if (userAns && q.options[userAns.selectedOptionIndex]) {
        const weights = q.options[userAns.selectedOptionIndex].weights;
        rawScores.qaTesting += weights.qaTesting;
        rawScores.cybersecurity += weights.cybersecurity;
        rawScores.dataAudit += weights.dataAudit;
        rawScores.softwareDev += weights.softwareDev;
        rawScores.uiUx += weights.uiUx;
        rawScores.researchDoc += weights.researchDoc;
      }
    });

    const normalize = (val: number, max: number) => {
      if (max === 0) return 70;
      const ratio = val / (max * ASSESSMENT_QUESTIONS.length * 0.7);
      return Math.min(96, Math.max(55, Math.round(ratio * 85 + 10)));
    };

    const percentages = {
      qaTesting: normalize(rawScores.qaTesting, 5),
      cybersecurity: normalize(rawScores.cybersecurity, 5),
      dataAudit: normalize(rawScores.dataAudit, 5),
      softwareDev: normalize(rawScores.softwareDev, 5),
      uiUx: normalize(rawScores.uiUx, 5),
      researchDoc: normalize(rawScores.researchDoc, 5),
    };

    // Determine primary match
    const categoryEntries: Array<[string, number]> = [
      ['Software Testing / QA', percentages.qaTesting],
      ['Cybersecurity & Assurance', percentages.cybersecurity],
      ['Data Analysis & Audit', percentages.dataAudit],
      ['Software Development', percentages.softwareDev],
      ['UI/UX & Accessible Design', percentages.uiUx],
      ['Research & Documentation', percentages.researchDoc],
    ];

    categoryEntries.sort((a, b) => b[1] - a[1]);
    const primaryMatch = categoryEntries[0][0];

    const explanations = [
      {
        category: 'Software Testing / QA',
        score: percentages.qaTesting,
        rationale:
          'Exceptional attention to detail, systematic test verification instincts, and high appreciation for structured acceptance criteria make Quality Assurance an outstanding cognitive match.',
        strengthsCited: ['Attention to Detail', 'Pattern Recognition', 'Systematic Verification', 'Deep Focus'],
      },
      {
        category: 'Cybersecurity & Assurance',
        score: percentages.cybersecurity,
        rationale:
          'Strong investigative instincts, sensitivity to anomalies, and structured rule compliance align directly with defensive threat hunting and security analysis.',
        strengthsCited: ['Threat Modeling', 'Rule Compliance', 'Anomaly Detection', 'Logical Thinking'],
      },
      {
        category: 'Data Analysis & Audit',
        score: percentages.dataAudit,
        rationale:
          'Deep comfort with structured data, numerical integrity, and spotting statistical discrepancies provide great aptitude for data verification and pipeline auditing.',
        strengthsCited: ['Data Integrity', 'Pattern Recognition', 'Analytical Focus', 'Root Cause Analysis'],
      },
      {
        category: 'Software Development',
        score: percentages.softwareDev,
        rationale:
          'Interest in systematic software architecture, automated problem solving, and building logical functional workflows.',
        strengthsCited: ['Algorithmic Thinking', 'Problem Solving', 'Automation', 'Technical Craftsmanship'],
      },
      {
        category: 'UI/UX & Accessible Design',
        score: percentages.uiUx,
        rationale:
          'Sensitivity to sensory ergonomics, cognitive overload prevention, and intuitive accessible user journeys.',
        strengthsCited: ['Empathy for Neurodivergent UX', 'Visual Hierarchy', 'Accessibility Standards', 'Design Systems'],
      },
      {
        category: 'Research & Documentation',
        score: percentages.researchDoc,
        rationale:
          'Strong appreciation for written clarity, comprehensive technical wikis, structured procedural documentation, and async knowledge sharing.',
        strengthsCited: ['Written Communication', 'Process Documentation', 'Methodical Research', 'Information Architecture'],
      },
    ];

    return {
      scores: percentages,
      primaryMatch,
      explanations,
    };
  }
}
