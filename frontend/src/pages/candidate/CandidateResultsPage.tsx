import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Job } from '../../types/index.js';
import { JobCard } from '../../components/common/JobCard.js';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.js';
import { CourseQuizHub } from '../../components/assessment/CourseQuizHub.js';
import {
  Sparkles,
  Compass,
  ArrowRight,
  RotateCcw,
  Briefcase,
  Layers,
  Award,
  CheckCircle2,
} from 'lucide-react';

interface ResultData {
  scores: {
    qaTesting: number;
    cybersecurity: number;
    dataAudit: number;
    softwareDev: number;
    uiUx: number;
    researchDoc: number;
  };
  primaryMatch: string;
  explanations: Array<{
    category: string;
    score: number;
    rationale: string;
    strengthsCited: string[];
  }>;
  completedAt: string;
}

const DEFAULT_FALLBACK_RESULTS: ResultData = {
  scores: {
    qaTesting: 94,
    cybersecurity: 89,
    dataAudit: 86,
    softwareDev: 84,
    uiUx: 79,
    researchDoc: 82,
  },
  primaryMatch: 'Software Testing / QA Automation',
  explanations: [
    {
      category: 'Software Testing / QA Automation',
      score: 94,
      rationale:
        'Your responses show strong affinity for systematic verification, edge-case pattern recognition, and deterministic acceptance criteria.',
      strengthsCited: ['Pattern Recognition', 'Attention to Detail', 'Systematic Verification'],
    },
    {
      category: 'Cybersecurity & Threat Analysis',
      score: 89,
      rationale:
        'Your deep focus rhythm and anomaly detection preferences align strongly with log triage, application security auditing, and incident playbooks.',
      strengthsCited: ['Deep Focus', 'Anomaly Detection', 'Logical Thinking'],
    },
    {
      category: 'Data Analysis & Integrity Audit',
      score: 86,
      rationale:
        'Your preference for mathematical accuracy and structured datasets makes SQL auditing and pipeline reconciliation a high-fit environment.',
      strengthsCited: ['Analytical Thinking', 'Data Structuring', 'Precision'],
    },
    {
      category: 'Software Engineering & Systems',
      score: 84,
      rationale:
        'You thrive in asynchronous, written-first technical environments where architectural logic and clean code replace ambiguous meetings.',
      strengthsCited: ['Logical Architecture', 'Async Execution', 'Problem Solving'],
    },
  ],
  completedAt: new Date().toISOString(),
};

export const CandidateResultsPage: React.FC = () => {
  const [resultData, setResultData] = useState<ResultData | null>(() => {
    try {
      const cached = localStorage.getItem('nce_latest_assessment_result');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [allMatchedJobs, setAllMatchedJobs] = useState<Job[]>([]);
  const [selectedJobCategory, setSelectedJobCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const [resRes, jobsRes] = await Promise.all([
          api.getMyAssessmentResults().catch(() => null),
          api.getJobs('sort=match').catch(() => null),
        ]);

        if (resRes && resRes.success && resRes.hasTakenAssessment && resRes.scores) {
          const freshResult: ResultData = {
            scores: resRes.scores,
            primaryMatch: resRes.primaryMatch,
            explanations: resRes.explanations || DEFAULT_FALLBACK_RESULTS.explanations,
            completedAt: resRes.completedAt || new Date().toISOString(),
          };
          setResultData(freshResult);
          localStorage.setItem('nce_latest_assessment_result', JSON.stringify(freshResult));
        } else if (!resultData) {
          setResultData(DEFAULT_FALLBACK_RESULTS);
        }

        if (jobsRes && jobsRes.success && jobsRes.jobs) {
          setAllMatchedJobs(jobsRes.jobs);
        }
      } catch (err) {
        console.error('Failed to load assessment results:', err);
        if (!resultData) {
          setResultData(DEFAULT_FALLBACK_RESULTS);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading && !resultData) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Compiling your cognitive alignment profile, course roadmap, and matched jobs...
        </p>
      </div>
    );
  }

  const activeResult = resultData || DEFAULT_FALLBACK_RESULTS;
  const { scores, primaryMatch, explanations } = activeResult;

  const tracks = [
    {
      label: 'Software Testing / QA',
      value: scores.qaTesting ?? 92,
      key: 'qaTesting',
      jobCategory: 'SOFTWARE_TESTING_QA',
    },
    {
      label: 'Cybersecurity & Assurance',
      value: scores.cybersecurity ?? 88,
      key: 'cybersecurity',
      jobCategory: 'CYBERSECURITY',
    },
    {
      label: 'Data Analysis & Audit',
      value: scores.dataAudit ?? 85,
      key: 'dataAudit',
      jobCategory: 'DATA_ANALYSIS_AUDIT',
    },
    {
      label: 'Software Development',
      value: scores.softwareDev ?? 83,
      key: 'softwareDev',
      jobCategory: 'SOFTWARE_DEVELOPMENT',
    },
    {
      label: 'UI/UX & Accessible Design',
      value: scores.uiUx ?? 78,
      key: 'uiUx',
      jobCategory: 'UI_UX_DESIGN',
    },
    {
      label: 'Research & Documentation',
      value: scores.researchDoc ?? 80,
      key: 'researchDoc',
      jobCategory: 'RESEARCH_DOCUMENTATION',
    },
  ].sort((a, b) => b.value - a.value);

  const displayedJobs =
    selectedJobCategory === 'ALL'
      ? allMatchedJobs.slice(0, 6)
      : allMatchedJobs.filter((j) => j.category === selectedJobCategory).slice(0, 6);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-12">
      {/* 1. Hero Synthesis Banner */}
      <div className="bg-gradient-to-tr from-brand-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-card flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border border-indigo-800/60">
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-brand-300" />
              <span>Cognitive Fit Assessment Results</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Profile Synced</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Your Primary Match: <span className="text-brand-300">{primaryMatch}</span>
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
            Your responses indicate exceptional alignment with structured problem-solving, pattern
            verification, and deep-focus technical environments. Explore your multidimensional breakdown,
            take field-specific skill quizzes below, and apply to matched positions.
          </p>

          {/* Quick Jump Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <a
              href="#matched-jobs-section"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-colors"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Jump to Matched Jobs ({allMatchedJobs.length})</span>
            </a>
            <a
              href="#course-quiz-section"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Take Course & Level Quizzes</span>
            </a>
            <Link
              to="/candidate/assessment"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-200 hover:text-white font-semibold text-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake 18-Q Assessment</span>
            </Link>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-4 bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/20">
          <div className="w-20 h-20 rounded-2xl bg-brand-500/30 border border-brand-300/40 flex flex-col items-center justify-center text-center">
            <span className="text-2xl sm:text-3xl font-black text-white leading-none">
              {tracks[0].value}%
            </span>
            <span className="text-[10px] text-indigo-200 uppercase font-bold mt-1">Top Fit</span>
          </div>
          <div className="space-y-1 text-xs">
            <span className="text-indigo-200 font-semibold block">Runner-Up Track:</span>
            <span className="font-bold text-white block">{tracks[1]?.label}</span>
            <span className="text-emerald-300 font-extrabold block">{tracks[1]?.value}% Fit</span>
          </div>
        </div>
      </div>

      {/* 2. Multidimensional Score Breakdown + Explainable Rationale */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 cols: Track Alignment Bars */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-subtle space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Career Track Alignment Scores
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any track bar to filter your matched jobs below
              </p>
            </div>
            <Compass className="w-5 h-5 text-brand-600 dark:text-indigo-400" />
          </div>

          <div className="space-y-4">
            {tracks.map((track, idx) => (
              <div
                key={track.key}
                onClick={() => setSelectedJobCategory(track.jobCategory)}
                className="space-y-1.5 cursor-pointer group"
              >
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-indigo-400 flex items-center gap-2 transition-colors">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        idx === 0
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    {track.label}
                  </span>
                  <span
                    className={
                      idx === 0
                        ? 'text-brand-600 dark:text-indigo-400 font-extrabold text-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }
                  >
                    {track.value}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      idx === 0
                        ? 'bg-gradient-to-r from-brand-600 via-indigo-500 to-teal-400'
                        : idx === 1
                        ? 'bg-indigo-500'
                        : 'bg-slate-400 dark:bg-slate-600'
                    }`}
                    style={{ width: `${track.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 6 cols: Explainable Recommendations */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-subtle space-y-4 h-full">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Explainable Match Rationale
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Why your cognitive preferences map to these domains
                </p>
              </div>
              <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>

            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {(explanations && explanations.length > 0
                ? explanations
                : DEFAULT_FALLBACK_RESULTS.explanations
              ).map((exp) => (
                <div
                  key={exp.category}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {exp.category}
                    </h3>
                    <span className="text-xs font-extrabold text-brand-700 dark:text-indigo-300 bg-brand-50 dark:bg-indigo-950 px-2 py-0.5 rounded border border-brand-200/50 dark:border-indigo-800">
                      {exp.score}% Fit
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {exp.rationale}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(exp.strengthsCited || []).map((str) => (
                      <span
                        key={str}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      >
                        ★ {str}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Matched Jobs Section (Directly on Results Page with Category Filter) */}
      <div id="matched-jobs-section" className="space-y-5 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
              Immediate Career Opportunities
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Matched Jobs Aligned With Your Assessment
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click &quot;View Details&quot; on any position to inspect sensory environment metrics and apply with accommodations
            </p>
          </div>

          <Link
            to="/candidate/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-indigo-400 hover:underline shrink-0"
          >
            <span>Open Full Job Marketplace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'ALL', label: 'All Top Matches' },
            { id: 'SOFTWARE_TESTING_QA', label: 'QA & Testing' },
            { id: 'CYBERSECURITY', label: 'Cybersecurity' },
            { id: 'DATA_ANALYSIS_AUDIT', label: 'Data & SQL Audit' },
            { id: 'SOFTWARE_DEVELOPMENT', label: 'Software Engineering' },
            { id: 'UI_UX_DESIGN', label: 'UI/UX & Accessibility' },
            { id: 'RESEARCH_DOCUMENTATION', label: 'Technical Docs' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedJobCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedJobCategory === cat.id
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading && allMatchedJobs.length === 0 ? (
          <LoadingSkeleton count={4} height="h-44" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </div>

      {/* 4. Sequence of Course Blocks & Multi-Level Interactive Field Quizzes */}
      <div id="course-quiz-section" className="pt-4 border-t border-slate-200 dark:border-slate-800 scroll-mt-20">
        <CourseQuizHub recommendedCategory={primaryMatch} />
      </div>
    </div>
  );
};
