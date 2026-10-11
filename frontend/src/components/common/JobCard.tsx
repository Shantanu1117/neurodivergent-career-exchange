import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Job } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { MatchBreakdownModal } from './MatchBreakdownModal.js';
import {
  Bookmark,
  MapPin,
  Sparkles,
  ShieldCheck,
  Check,
  ArrowRight,
  Info,
} from 'lucide-react';

interface JobCardProps {
  job: Job;
  onBookmarkToggled?: (jobId: string, isSaved: boolean) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onBookmarkToggled }) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [isSaved, setIsSaved] = useState<boolean>(job.isSaved || false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || user.role !== 'CANDIDATE') {
      error('Please sign in as a candidate to save jobs.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.toggleSaveJob(job._id);
      if (res.success) {
        setIsSaved(res.isSaved);
        if (res.isSaved) {
          success('Job saved to your bookmarks.');
        } else {
          success('Job removed from saved bookmarks.');
        }
        if (onBookmarkToggled) {
          onBookmarkToggled(job._id, res.isSaved);
        }
      }
    } catch (err: any) {
      error(err.message || 'Failed to toggle save.');
    } finally {
      setSaving(false);
    }
  };

  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return 'Competitive';
    const minK = Math.round(job.salaryMin / 1000);
    const maxK = Math.round(job.salaryMax / 1000);
    return `$${minK}k–$${maxK}k / yr`;
  };

  return (
    <>
      <div
        data-gsap-item
        data-gsap-tilt="6"
        className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 lg:p-6 shadow-subtle hover:shadow-floating hover:border-brand-300 dark:hover:border-indigo-700 transition-colors duration-200 flex flex-col justify-between group will-change-transform"
      >
        {/* Dynamic Mouse-Tracking Radial Spotlight inside JobCard */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background:
              'radial-gradient(280px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(99, 102, 241, 0.11), transparent 80%)',
          }}
        />
        <div className="relative z-10">
          {/* Top Row: Employer, Location, Save */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-sm shrink-0">
                {job.employerId?.companyName ? job.employerId.companyName.charAt(0) : 'E'}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-brand-600 dark:group-hover:text-indigo-400 transition-colors">
                  <Link to={`/jobs/${job._id}`}>{job.title}</Link>
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {job.employerId?.companyName}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {job.location}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleToggleSave}
              disabled={saving}
              className={`p-2 rounded-xl border transition-colors ${
                isSaved
                  ? 'bg-brand-50 dark:bg-indigo-950 border-brand-200 dark:border-indigo-700 text-brand-600 dark:text-indigo-400'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title={isSaved ? 'Remove from saved' : 'Save job'}
              aria-label={isSaved ? 'Saved job' : 'Save job'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-brand-600 dark:fill-indigo-400' : ''}`} />
            </button>
          </div>

          {/* Badges Bar: Work Mode, Experience, Salary */}
          <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-medium text-slate-600 dark:text-slate-300">
            <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold">
              {job.workMode}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {job.experienceLevel} Level
            </span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800 font-semibold">
              {formatSalary()}
            </span>
          </div>

          {/* Description Excerpt */}
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4">
            {job.description}
          </p>

          {/* Matched Strengths & Skills Tags */}
          <div className="space-y-2 mb-5">
            <div className="flex flex-wrap gap-1.5">
              {(job.matchedStrengths || []).slice(0, 3).map((strength) => (
                <span
                  key={strength}
                  className="px-2 py-0.5 rounded text-[11px] font-medium bg-brand-50/80 dark:bg-indigo-950/70 text-brand-800 dark:text-indigo-300 border border-brand-200/60 dark:border-indigo-800"
                >
                  {strength}
                </span>
              ))}
              {(job.requiredSkills || []).slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700"
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* Workplace Support Pills */}
            {job.accommodationsOffered && job.accommodationsOffered.length > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] text-teal-700 dark:text-teal-300 bg-teal-50/80 dark:bg-teal-950/60 px-2.5 py-1 rounded-md border border-teal-200/60 dark:border-teal-800 w-fit">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                <span className="truncate max-w-[280px]">
                  Offers: {job.accommodationsOffered.slice(0, 2).join(' • ')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer: Match Score + Action CTAs */}
        <div className="relative z-10 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          {job.matchScore ? (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100/80 dark:hover:bg-indigo-900 text-brand-800 dark:text-indigo-200 border border-indigo-200/80 dark:border-indigo-800 text-xs font-bold transition-colors group/score"
              title="Click to view transparent match explanation"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-indigo-400 group-hover/score:scale-110 transition-transform" />
              <span>{job.matchScore}% Match</span>
              <Info className="w-3 h-3 text-brand-500 dark:text-indigo-400 opacity-70" />
            </button>
          ) : (
            <span className="text-[11px] text-slate-400">Public Posting</span>
          )}

          <div className="flex items-center gap-2">
            {job.hasApplied ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-3 py-1.5 rounded-xl border border-emerald-200/70 dark:border-emerald-800">
                <Check className="w-3.5 h-3.5" /> Applied
              </span>
            ) : null}

            <Link
              to={`/jobs/${job._id}`}
              className="inline-flex items-center gap-1.5 bg-slate-900 dark:bg-indigo-600 hover:bg-brand-600 dark:hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <MatchBreakdownModal job={job} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};
