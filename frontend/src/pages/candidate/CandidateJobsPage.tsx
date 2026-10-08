import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { Job } from '../../types/index.js';
import { JobCard } from '../../components/common/JobCard.js';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { Search, Briefcase, Sparkles, X } from 'lucide-react';

export const CandidateJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('ALL');
  const [workMode, setWorkMode] = useState('ALL');
  const [sortBy, setSortBy] = useState('match');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const parts: string[] = [];
      if (searchTerm) parts.push(`search=${encodeURIComponent(searchTerm)}`);
      if (category && category !== 'ALL') parts.push(`category=${category}`);
      if (workMode && workMode !== 'ALL') parts.push(`workMode=${workMode}`);
      if (sortBy) parts.push(`sort=${sortBy}`);

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

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Personalized Match Engine</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Recommended Jobs For Your Cognitive Profile
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Jobs dynamically ranked by your declared skills, strengths, and requested workplace support.
        </p>
      </div>

      {/* Filter Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, tool, or keyword..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-5 py-2 rounded-xl transition-colors"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Career Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              <option value="ALL">All Categories</option>
              <option value="SOFTWARE_TESTING_QA">Software Testing / QA</option>
              <option value="CYBERSECURITY">Cybersecurity</option>
              <option value="DATA_ANALYSIS_AUDIT">Data Analysis / Audit</option>
              <option value="SOFTWARE_DEVELOPMENT">Software Engineering</option>
              <option value="UI_UX_DESIGN">UI/UX Design</option>
              <option value="RESEARCH_DOCUMENTATION">Research & Documentation</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Work Mode</label>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              <option value="ALL">Any Mode</option>
              <option value="REMOTE">100% Remote</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ONSITE">On-Site</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold"
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
    </div>
  );
};
