import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Job } from '../../types/index.js';
import { JobCard } from '../../components/common/JobCard.js';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.js';
import {
  Sparkles,
  Compass,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Briefcase,
  ShieldCheck,
  TrendingUp,
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

export const CandidateResultsPage: React.FC = () => {
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [matchedJobs, setMatchedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const [resRes, jobsRes] = await Promise.all([
          api.getMyAssessmentResults(),
          api.getJobs('sort=match'),
        ]);

        if (resRes.success && resRes.hasTakenAssessment) {
          setResultData(resRes);
        }
        if (jobsRes.success) {
          setMatchedJobs(jobsRes.jobs.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load assessment results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500">Compiling your cognitive alignment profile...</p>
      </div>
    );
  }

  if (!resultData) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-brand-600 flex items-center justify-center mx-auto">
          <Compass className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">No Assessment Found</h2>
        <p className="text-xs text-slate-500">
          Take the 18-question assessment to unlock transparent match scores across all six technology tracks.
        </p>
        <Link
          to="/candidate/assessment"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <span>Take Assessment</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const { scores, primaryMatch, explanations } = resultData;

  const tracks = [
    { label: 'Software Testing / QA', value: scores.qaTesting, key: 'qaTesting' },
    { label: 'Cybersecurity & Assurance', value: scores.cybersecurity, key: 'cybersecurity' },
    { label: 'Data Analysis & Audit', value: scores.dataAudit, key: 'dataAudit' },
    { label: 'Software Development', value: scores.softwareDev, key: 'softwareDev' },
    { label: 'UI/UX & Accessible Design', value: scores.uiUx, key: 'uiUx' },
    { label: 'Research & Documentation', value: scores.researchDoc, key: 'researchDoc' },
  ].sort((a, b) => b.value - a.value);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-10">
      {/* Hero Banner */}
      <div className="bg-gradient-to-tr from-brand-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-brand-300" />
            <span>Assessment Synthesis</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Your Primary Match: <span className="text-brand-300">{primaryMatch}</span>
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
            Your answers reflect strong cognitive alignment with systematic verification, deep focus, and
            structured workflows.
          </p>
        </div>

        <div className="shrink-0 flex flex-col items-center gap-2">
          <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-white leading-none">{tracks[0].value}%</span>
            <span className="text-[10px] text-indigo-200 uppercase font-semibold mt-1">Match Fit</span>
          </div>
          <Link
            to="/candidate/assessment"
            className="text-xs font-semibold text-indigo-200 hover:text-white flex items-center gap-1 mt-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Retake Test</span>
          </Link>
        </div>
      </div>

      {/* Multidimensional Score Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Career Track Alignment Scores</h2>
            <p className="text-xs text-slate-500">Transparent percentage across all six professional domains</p>
          </div>
          <span className="text-xs font-semibold text-slate-400">Higher is stronger fit</span>
        </div>

        <div className="space-y-4">
          {tracks.map((track, idx) => (
            <div key={track.key} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  {track.label}
                </span>
                <span className={idx === 0 ? 'text-brand-700 font-extrabold text-sm' : 'text-slate-600'}>
                  {track.value}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    idx === 0
                      ? 'bg-gradient-to-r from-brand-600 to-indigo-500'
                      : idx === 1
                      ? 'bg-indigo-400'
                      : 'bg-slate-300'
                  }`}
                  style={{ width: `${track.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why Each Match Was Generated (Detailed Explanations) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Why These Recommendations Were Generated</h2>
          <p className="text-xs text-slate-500">
            Explainable logic linking your cognitive choices to professional requirements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {explanations.map((exp) => (
            <div
              key={exp.category}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="font-bold text-sm text-slate-900">{exp.category}</h3>
                  <span className="text-xs font-extrabold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200/50">
                    {exp.score}%
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{exp.rationale}</p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Cognitive Strengths Cited:
                </span>
                <div className="flex flex-wrap gap-1">
                  {exp.strengthsCited.map((str) => (
                    <span
                      key={str}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700"
                    >
                      {str}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Jobs Matching Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recommended Jobs For You</h2>
            <p className="text-xs text-slate-500">
              Verified openings from employers matching your primary score
            </p>
          </div>
          <Link
            to="/candidate/jobs"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>Explore all matched jobs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matchedJobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      </div>
    </div>
  );
};
