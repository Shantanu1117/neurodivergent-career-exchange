import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { ResourceItem } from '../../types/index.js';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.js';
import { useToast } from '../../context/ToastContext.js';
import { Clock, ArrowRight, Compass, CheckCircle2, Award } from 'lucide-react';

const CAREER_PATHWAYS = [
  {
    track: 'Software Testing & QA Automation',
    fitStrengths: ['Pattern Recognition', 'Attention to Detail', 'Systematic Verification'],
    levels: [
      {
        stage: '1. Entry-Level',
        role: 'Manual QA / Edge-Case Tester',
        skills: ['Test Case Design', 'Bug Reproduction', 'JIRA', 'HTTP Fundamentals'],
        salary: '$65k – $85k',
      },
      {
        stage: '2. Mid-Level',
        role: 'QA Automation Engineer',
        skills: ['Playwright / Cypress', 'TypeScript', 'API Testing (Postman)', 'CI/CD'],
        salary: '$95k – $125k',
      },
      {
        stage: '3. Senior Specialist',
        role: 'Principal SDET / Quality Architect',
        skills: ['Distributed Test Infrastructure', 'Performance Auditing', 'Security Regression'],
        salary: '$135k – $170k',
      },
    ],
  },
  {
    track: 'Data Analysis, Integrity & Audit',
    fitStrengths: ['Hyperfocus', 'Analytical Thinking', 'Anomaly Detection'],
    levels: [
      {
        stage: '1. Entry-Level',
        role: 'Data Quality & Documentation Specialist',
        skills: ['SQL Basics', 'Spreadsheet Modeling', 'Data Validation Checklists'],
        salary: '$62k – $80k',
      },
      {
        stage: '2. Mid-Level',
        role: 'Data Audit & BI Analyst',
        skills: ['Advanced SQL', 'Python (Pandas)', 'Tableau / PowerBI', 'Schema Auditing'],
        salary: '$90k – $120k',
      },
      {
        stage: '3. Senior Specialist',
        role: 'Staff Data Governance & Analytics Engineer',
        skills: ['dbt', 'Automated Anomaly Pipelines', 'Regulatory Data Compliance'],
        salary: '$130k – $165k',
      },
    ],
  },
  {
    track: 'Cybersecurity & Threat Analysis',
    fitStrengths: ['Deep Focus', 'Log Pattern Detection', 'Logical Thinking'],
    levels: [
      {
        stage: '1. Entry-Level',
        role: 'SOC Tier-1 / Log Triage Analyst',
        skills: ['SIEM Monitoring', 'Network Protocols', 'Incident Documentation'],
        salary: '$70k – $90k',
      },
      {
        stage: '2. Mid-Level',
        role: 'Vulnerability & Application Security Analyst',
        skills: ['OWASP Top 10', 'Burp Suite', 'Threat Hunting', 'Cloud IAM Auditing'],
        salary: '$105k – $138k',
      },
      {
        stage: '3. Senior Specialist',
        role: 'Principal Detection Engineer',
        skills: ['Zero-Trust Architecture', 'Automated Threat Signatures', 'Forensics'],
        salary: '$145k – $185k',
      },
    ],
  },
];

export const ResourcesPage: React.FC = () => {
  const { success } = useToast();
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [category, setCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTrackIdx, setSelectedTrackIdx] = useState(0);

  // Feature #35: Career Readiness & Learning Milestone Tracker
  const [completedMilestones, setCompletedMilestones] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nce_learning_milestones');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const res = await api.getResources(category);
        if (res.success) {
          setResources(res.resources);
        }
      } catch (err) {
        console.error('Failed to load resources:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, [category]);

  const toggleMilestone = (slug: string) => {
    const updated = completedMilestones.includes(slug)
      ? completedMilestones.filter((m) => m !== slug)
      : [...completedMilestones, slug];
    setCompletedMilestones(updated);
    localStorage.setItem('nce_learning_milestones', JSON.stringify(updated));
    api.updateCandidateProfile({ learningMilestones: updated }).catch(() => {});
    success(
      updated.includes(slug)
        ? 'Learning milestone marked as completed!'
        : 'Milestone unmarked.'
    );
  };

  const categories = [
    { label: 'All Resources', value: 'ALL' },
    { label: 'Software Testing / QA', value: 'Software Testing / QA' },
    { label: 'Cybersecurity', value: 'Cybersecurity' },
    { label: 'Data Analysis / Audit', value: 'Data Analysis / Audit' },
    { label: 'Interview Preparation', value: 'Interview preparation' },
  ];

  const activePathway = CAREER_PATHWAYS[selectedTrackIdx];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div data-gsap="fade-up" className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-indigo-400">
          Career Pathways & Readiness Hub
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Curated Guides & Role Progressions for Analytical Thinkers
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          Explore structured career roadmaps, practical tutorials, and self-advocacy playbooks.
        </p>
      </div>

      {/* Feature #6: Interactive Career Pathway & Role Transition Explorer */}
      <div
        data-gsap="fade-up"
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-subtle space-y-6 transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-brand-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Interactive Career Pathway & Role Transition Explorer
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                See how your cognitive strengths map from entry-level roles to senior specialist tracks
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {CAREER_PATHWAYS.map((p, idx) => (
              <button
                key={p.track}
                type="button"
                onClick={() => setSelectedTrackIdx(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedTrackIdx === idx
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {p.track.split('&')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-700 dark:text-slate-200">Aligned Cognitive Strengths:</span>
          {activePathway.fitStrengths.map((str) => (
            <span
              key={str}
              className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-brand-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold"
            >
              ★ {str}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activePathway.levels.map((lvl) => (
            <div
              key={lvl.stage}
              data-gsap-tilt="6"
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-3 flex flex-col justify-between will-change-transform"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-brand-600 dark:text-indigo-400 uppercase tracking-wider">
                    {lvl.stage}
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    {lvl.salary}
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{lvl.role}</h3>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {lvl.skills.map((sk) => (
                    <span
                      key={sk}
                      className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 font-medium"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                to="/jobs"
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-indigo-400 hover:text-brand-800 pt-2"
              >
                <span>View Matching Roles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Feature #35: Learning Milestone Progress Banner */}
      <div
        data-gsap="fade-up"
        className="bg-teal-50/70 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-800 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <Award className="w-6 h-6 text-teal-600 dark:text-teal-400 shrink-0" />
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-teal-950 dark:text-teal-200">
              Your Self-Paced Career Readiness Milestones
            </h3>
            <p className="text-xs text-teal-800 dark:text-teal-300">
              You have completed <strong>{completedMilestones.length}</strong> of{' '}
              <strong>{resources.length || 4}</strong> practical playbooks.
            </p>
          </div>
        </div>
        <span className="text-xs font-extrabold text-teal-900 dark:text-teal-200 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800">
          {resources.length > 0
            ? Math.round((completedMilestones.length / resources.length) * 100)
            : 0}
          % Completed
        </span>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              category === c.value
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Resources List */}
      {loading ? (
        <LoadingSkeleton count={3} height="h-32" />
      ) : (
        <div data-gsap="stagger-parent" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resources.map((item) => {
            const isCompleted = completedMilestones.includes(item.slug);
            return (
              <div
                key={item._id}
                data-gsap-item
                data-gsap-tilt="6"
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-subtle hover:shadow-floating transition-colors flex flex-col justify-between will-change-transform"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
                    <span className="font-semibold text-brand-700 dark:text-indigo-300 bg-brand-50 dark:bg-indigo-950/70 px-2.5 py-0.5 rounded-md border border-brand-200/60 dark:border-indigo-800">
                      {item.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {item.estimatedTime}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {item.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {item.skillsGained.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    to={`/resources/${item.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-indigo-400 hover:text-brand-700"
                  >
                    <span>Read guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleMilestone(item.slug)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                      isCompleted
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
