import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { Job } from '../../types/index.js';
import { JobCard } from '../../components/common/JobCard.js';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { EmailPreviewModal, EmailLogItem } from '../../components/common/EmailPreviewModal.js';
import { useToast } from '../../context/ToastContext.js';
import { Search, Briefcase, Sparkles, Sliders, RotateCcw, Save, Mail } from 'lucide-react';

export const CandidateJobsPage: React.FC = () => {
  const { success, error } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('ALL');
  const [workMode, setWorkMode] = useState('ALL');
  const [sortBy, setSortBy] = useState('match');

  // Feature #3: Candidate-Controlled Matching Weight Sliders
  const [showWeightTuner, setShowWeightTuner] = useState(false);
  const [weights, setWeights] = useState({
    skills: 35,
    environment: 25,
    strengths: 20,
    experience: 10,
    accommodations: 10,
  });
  const [savingWeights, setSavingWeights] = useState(false);
  const [sendingDigest, setSendingDigest] = useState(false);
  const [previewEmail, setPreviewEmail] = useState<EmailLogItem | null>(null);

  useEffect(() => {
    // Load saved weights from candidate profile on mount
    api
      .getCandidateProfile()
      .then((res) => {
        if (res.success && res.profile?.matchingWeights) {
          setWeights(res.profile.matchingWeights);
        }
      })
      .catch(() => {});
  }, []);

  const fetchJobs = async (customWeights = weights) => {
    setLoading(true);
    try {
      const parts: string[] = [];
      if (searchTerm) parts.push(`search=${encodeURIComponent(searchTerm)}`);
      if (category && category !== 'ALL') parts.push(`category=${category}`);
      if (workMode && workMode !== 'ALL') parts.push(`workMode=${workMode}`);
      if (sortBy) parts.push(`sort=${sortBy}`);

      parts.push(`wSkills=${customWeights.skills}`);
      parts.push(`wEnv=${customWeights.environment}`);
      parts.push(`wStrengths=${customWeights.strengths}`);
      parts.push(`wExp=${customWeights.experience}`);
      parts.push(`wAcc=${customWeights.accommodations}`);

      const res = await api.getJobs(parts.join('&'));
      if (res.success) {
        setJobs(res.jobs);
      }
    } catch (err) {
      console.error('Failed to load candidate jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [category, workMode, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleApplyWeights = () => {
    fetchJobs(weights);
    success('Job ranking updated with your custom priority weights.');
  };

  const handleSaveWeightsToProfile = async () => {
    setSavingWeights(true);
    try {
      const res = await api.updateCandidateProfile({ matchingWeights: weights });
      if (res.success) {
        success('Custom matching weights saved to your profile!');
        fetchJobs(weights);
      }
    } catch (err: any) {
      error(err.message || 'Could not save weights.');
    } finally {
      setSavingWeights(false);
    }
  };

  const handleResetWeights = () => {
    const defaults = {
      skills: 35,
      environment: 25,
      strengths: 20,
      experience: 10,
      accommodations: 10,
    };
    setWeights(defaults);
    fetchJobs(defaults);
  };

  const handleEmailMatchedDigest = async () => {
    setSendingDigest(true);
    try {
      const res = await api.sendTestEmail();
      if (res.success && res.email) {
        setPreviewEmail(res.email);
        success(res.message || 'Top 90%+ Matched Jobs digest emailed!');
      }
    } catch (err: any) {
      error(err.message || 'Failed to email job digest.');
    } finally {
      setSendingDigest(false);
    }
  };

  const totalRawWeight =
    weights.skills +
    weights.environment +
    weights.strengths +
    weights.experience +
    weights.accommodations || 100;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-indigo-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personalized Match Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Recommended Jobs For Your Cognitive Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Jobs dynamically ranked by your declared skills, sensory environment fit, strengths, and requested accommodations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleEmailMatchedDigest}
            disabled={sendingDigest}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition-colors disabled:opacity-50"
          >
            <Mail className="w-4 h-4" />
            <span>{sendingDigest ? 'Emailing...' : 'Email Me 90%+ Match Digest'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowWeightTuner(!showWeightTuner)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
              showWeightTuner
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Customize Match Priorities</span>
          </button>
        </div>
      </div>

      {/* Feature #3: Candidate-Controlled Matching Weight Sliders */}
      {showWeightTuner && (
        <div className="bg-indigo-50/60 dark:bg-slate-900 border border-indigo-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-600 dark:text-indigo-400" />
                <span>Interactive Match Priority Sliders</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Adjust how much each dimension matters to you. Our engine automatically normalizes your weights to 100%.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetWeights}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
              <button
                type="button"
                onClick={handleApplyWeights}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-bold"
              >
                <span>Re-Rank Jobs Now</span>
              </button>
              <button
                type="button"
                onClick={handleSaveWeightsToProfile}
                disabled={savingWeights}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingWeights ? 'Saving...' : 'Save to Profile'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 pt-2">
            {[
              { key: 'skills', label: 'Technical & Transferable Skills' },
              { key: 'environment', label: 'Sensory & Work Environment' },
              { key: 'strengths', label: 'Cognitive Strengths' },
              { key: 'accommodations', label: 'Workplace Accommodations' },
              { key: 'experience', label: 'Experience Level' },
            ].map((item) => {
              const rawVal = (weights as any)[item.key] ?? 20;
              const normalizedPct = Math.round((rawVal / totalRawWeight) * 100);
              return (
                <div
                  key={item.key}
                  className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    <span className="truncate pr-1">{item.label}</span>
                    <span className="text-brand-600 dark:text-indigo-400 shrink-0">{normalizedPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={rawVal}
                    onChange={(e) =>
                      setWeights({
                        ...weights,
                        [item.key]: Number(e.target.value),
                      })
                    }
                    aria-label={item.label}
                    className="w-full accent-brand-600 cursor-pointer"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, tool, or keyword..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900"
            />
          </div>
          <button
            type="submit"
            className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-5 py-2 rounded-xl transition-colors"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Career Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Categories</option>
              <option value="SOFTWARE_TESTING_QA">Software Testing / QA</option>
              <option value="CYBERSECURITY">Cybersecurity</option>
              <option value="DATA_ANALYSIS_AUDIT">Data Analysis / Audit</option>
              <option value="SOFTWARE_DEVELOPMENT">Software Engineering</option>
              <option value="UI_UX_DESIGN">UI/UX Design</option>
              <option value="RESEARCH_DOCUMENTATION">Research &amp; Documentation</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Work Mode
            </label>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">Any Mode</option>
              <option value="REMOTE">100% Remote</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ONSITE">On-Site</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 font-semibold"
            >
              <option value="match">Match Score (Highest)</option>
              <option value="newest">Newest First</option>
              <option value="salary">Salary (Highest)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingSkeleton count={4} height="h-44" />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs found matching criteria"
          description="Try broadening your search or resetting category filters."
          actionText="Reset Filters"
          onAction={() => {
            setSearchTerm('');
            setCategory('ALL');
            setWorkMode('ALL');
            setSortBy('match');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      )}

      {/* Email Preview Modal */}
      <EmailPreviewModal
        email={previewEmail}
        isOpen={!!previewEmail}
        onClose={() => setPreviewEmail(null)}
        onResendToAddress={async (targetEmail) => {
          const res = await api.sendTestEmail(targetEmail);
          if (res.success && res.email) {
            setPreviewEmail(res.email);
            success(`Dispatched digest copy to ${targetEmail}!`);
          }
        }}
      />
    </div>
  );
};
