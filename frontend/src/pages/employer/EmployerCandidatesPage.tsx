import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { CandidateProfile } from '../../types/index.js';
import { CandidateCard } from '../../components/common/CandidateCard.js';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { Search, Users, Sparkles, Filter, X, HeartHandshake, ShieldCheck } from 'lucide-react';

export const EmployerCandidatesPage: React.FC = () => {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStrength, setSelectedStrength] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [activeCandidateModal, setActiveCandidateModal] = useState<CandidateProfile | null>(null);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const parts: string[] = [];
      if (searchTerm) parts.push(`search=${encodeURIComponent(searchTerm)}`);
      if (selectedStrength) parts.push(`strength=${encodeURIComponent(selectedStrength)}`);
      if (selectedSkill) parts.push(`skill=${encodeURIComponent(selectedSkill)}`);
      if (workMode) parts.push(`workMode=${workMode}`);

      const res = await api.searchCandidates(parts.join('&'));
      if (res.success) {
        setCandidates(res.candidates);
      }
    } catch (err) {
      console.error('Failed to load candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [selectedStrength, selectedSkill, workMode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCandidates();
  };

  const strengthOptions = [
    'Attention to Detail',
    'Pattern Recognition',
    'Deep Focus',
    'Analytical Thinking',
    'Problem Solving',
    'Quality Assurance',
    'Documentation',
    'Data Analysis',
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-600">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Strengths-Based Talent Discovery</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Discover Exceptional Neurodivergent Talent
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Search qualified professionals by cognitive abilities, verified technical stacks, and work preferences.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by candidate name, skills (Cypress, SQL), or headline..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-5 py-2 rounded-xl transition-colors"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Cognitive Strength</label>
            <select
              value={selectedStrength}
              onChange={(e) => setSelectedStrength(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              <option value="">All Strengths</option>
              {strengthOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Technical Skill</label>
            <input
              type="text"
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              placeholder="e.g. Cypress, Python, SQL"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Work Mode</label>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              <option value="">Any Work Mode</option>
              <option value="REMOTE">100% Remote</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ONSITE">On-Site</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="text-xs text-slate-500 font-semibold">
        Found {candidates.length} verified candidate profiles
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingSkeleton count={4} height="h-44" />
      ) : candidates.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No candidates match current criteria"
          description="Try broadening your strength or technical skill filters."
          actionText="Reset Filters"
          onAction={() => {
            setSearchTerm('');
            setSelectedStrength('');
            setSelectedSkill('');
            setWorkMode('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((cand) => (
            <CandidateCard
              key={cand._id}
              candidate={cand}
              onViewProfile={(c) => setActiveCandidateModal(c)}
            />
          ))}
        </div>
      )}

      {/* Candidate Modal Details */}
      {activeCandidateModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-floating border border-slate-200 p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-brand-700 font-bold text-lg flex items-center justify-center">
                  {activeCandidateModal.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{activeCandidateModal.fullName}</h3>
                  <p className="text-xs text-slate-500">{activeCandidateModal.headline}</p>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    {activeCandidateModal.location} • {activeCandidateModal.workPreferences?.workMode}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveCandidateModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* How I Work Best Spotlight */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-800 flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-brand-600" />
                How I Work Best:
              </span>
              <p className="text-xs text-indigo-950 leading-relaxed font-medium">
                "{activeCandidateModal.howIWorkBest}"
              </p>
            </div>

            {/* Strengths & Skills */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Cognitive Strengths:
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(activeCandidateModal.strengths || []).map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-50 text-brand-800 border border-brand-200"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Technical Skills:
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(activeCandidateModal.skills || []).map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-800"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Workplace Accommodations */}
            {activeCandidateModal.accommodations && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  Requested Adjustments:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeCandidateModal.accommodations.map((acc) => (
                    <span
                      key={acc}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-teal-50 text-teal-900 border border-teal-200"
                    >
                      {acc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveCandidateModal(null)}
                className="bg-slate-900 text-white font-semibold text-xs px-5 py-2.5 rounded-xl hover:bg-slate-800"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
