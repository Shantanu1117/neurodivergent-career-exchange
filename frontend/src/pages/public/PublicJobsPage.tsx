import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Job } from '../../types/index.js';
import { JobCard } from '../../components/common/JobCard.js';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import {
  Search,
  Briefcase,
  Sparkles,
  X,
} from 'lucide-react';

export const PublicJobsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'ALL');
  const [workMode, setWorkMode] = useState(searchParams.get('workMode') || 'ALL');
  const [experienceLevel, setExperienceLevel] = useState(searchParams.get('experienceLevel') || 'ALL');
  const [accommodation, setAccommodation] = useState(searchParams.get('accommodation') || '');
  const [sortBy, setSortBy] = useState('match');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const queryParts: string[] = [];
      if (searchTerm) queryParts.push(`search=${encodeURIComponent(searchTerm)}`);
      if (category && category !== 'ALL') queryParts.push(`category=${category}`);
      if (workMode && workMode !== 'ALL') queryParts.push(`workMode=${workMode}`);
      if (experienceLevel && experienceLevel !== 'ALL') queryParts.push(`experienceLevel=${experienceLevel}`);
      if (accommodation) queryParts.push(`accommodation=${encodeURIComponent(accommodation)}`);
      if (sortBy) queryParts.push(`sort=${sortBy}`);

      const res = await api.getJobs(queryParts.join('&'));
      if (res.success) {
        setJobs(res.jobs);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [category, workMode, experienceLevel, accommodation, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategory('ALL');
    setWorkMode('ALL');
    setExperienceLevel('ALL');
    setAccommodation('');
    setSortBy('match');
  };

  const hasActiveFilters =
    searchTerm || category !== 'ALL' || workMode !== 'ALL' || experienceLevel !== 'ALL' || accommodation;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      {/* Page Header */}
      <div data-gsap="fade-up" className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-indigo-400">
          <Sparkles className="w-4 h-4" />
          <span>Accommodated Job Marketplace</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Explore Neuro-Inclusive Opportunities
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
          Every posting lists verified workplace accommodations, clear interview expectations, and
          transparent match explanations.
        </p>
      </div>

      {/* Search & Sort Controls Bar */}
      <div
        data-gsap="fade-up"
        className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-4 transition-colors"
      >
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by role title, skill (Cypress, Python), or company..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800"
            />
          </div>
          <button
            type="submit"
            data-gsap-magnetic
            className="bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-colors shadow-xs"
          >
            Search
          </button>
        </form>

        {/* Filters Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Category */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Career Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full py-2 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
            >
              <option value="ALL">All Categories</option>
              <option value="SOFTWARE_TESTING_QA">Software Testing / QA</option>
              <option value="CYBERSECURITY">Cybersecurity</option>
              <option value="DATA_ANALYSIS_AUDIT">Data Analysis / Audit</option>
              <option value="SOFTWARE_DEVELOPMENT">Software Engineering</option>
              <option value="UI_UX_DESIGN">UI/UX & Accessibility</option>
              <option value="RESEARCH_DOCUMENTATION">Research & Documentation</option>
            </select>
          </div>

          {/* Work Mode */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Work Environment
            </label>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="w-full py-2 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
            >
              <option value="ALL">Any Mode</option>
              <option value="REMOTE">100% Remote</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ONSITE">On-Site</option>
            </select>
          </div>

          {/* Experience */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Experience Level
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full py-2 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
            >
              <option value="ALL">All Levels</option>
              <option value="ENTRY">Entry / Associate</option>
              <option value="MID">Mid-Level</option>
              <option value="SENIOR">Senior</option>
            </select>
          </div>

          {/* Accommodation / Support Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Supported Adjustment
            </label>
            <select
              value={accommodation}
              onChange={(e) => setAccommodation(e.target.value)}
              className="w-full py-2 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
            >
              <option value="">Any Accommodations</option>
              <option value="Written">Written Instructions</option>
              <option value="Camera">Camera-Optional Calls</option>
              <option value="Quiet">Quiet Focus Blocks</option>
              <option value="Flexible">Flexible Hours</option>
              <option value="Headphones">Headphones Allowance</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Sort Results By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-2 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 font-medium"
            >
              <option value="match">Match Percentage</option>
              <option value="newest">Newest First</option>
              <option value="salary">Salary (Highest)</option>
            </select>
          </div>
        </div>

        {/* Clear filters pill */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Filtering active results</span>
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-brand-600 dark:text-indigo-400 hover:text-brand-700 font-semibold"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset all filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          Showing {jobs.length} verified neuro-inclusive positions
        </span>
        <span className="hidden sm:inline">Transparent scoring & 3D interactive cards enabled</span>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <LoadingSkeleton count={4} height="h-44" />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs match your current filters"
          description="Try broadening your search term or clearing one of the accommodation filters."
          actionText="Clear All Filters"
          onAction={clearFilters}
        />
      ) : (
        <div data-gsap="stagger-parent" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
};
