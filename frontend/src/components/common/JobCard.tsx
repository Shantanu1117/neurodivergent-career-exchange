import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Job } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { MatchBreakdownModal } from './MatchBreakdownModal.js';
import {
  Bookmark,
  Building2,
  MapPin,
  DollarSign,
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
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 lg:p-6 shadow-subtle hover:shadow-card hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group">
        <div>
          {/* Top Row: Employer, Location, Save */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-700 font-bold text-sm shrink-0">
                {job.employerId?.companyName ? job.employerId.companyName.charAt(0) : 'E'}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base group-hover:text-brand-700 transition-colors">
                  <Link to={`/jobs/${job._id}`}>{job.title}</Link>
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="font-semibold text-slate-700">{job.employerId?.companyName}</span>
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
                  ? 'bg-brand-50 border-brand-200 text-brand-600'
                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
              title={isSaved ? 'Remove from saved' : 'Save job'}
              aria-label={isSaved ? 'Saved job' : 'Save job'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-brand-600' : ''}`} />
            </button>
          </div>

          {/* Badges Bar: Work Mode, Experience, Salary */}
          <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-medium text-slate-600">
            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold">
              {job.workMode}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
              {job.experienceLevel} Level
            </span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/50 font-semibold">
              {formatSalary()}
            </span>
          </div>

          {/* Description Excerpt */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {job.description}
          </p>

          {/* Matched Strengths & Skills Tags */}
          <div className="space-y-2 mb-5">
            <div className="flex flex-wrap gap-1.5">
              {(job.matchedStrengths || []).slice(0, 3).map((strength) => (
                <span
                  key={strength}
                  className="px-2 py-0.5 rounded text-[11px] font-medium bg-brand-50/80 text-brand-800 border border-brand-200/60"
                >
                  {strength}
                </span>
              ))}
              {(job.requiredSkills || []).slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60"
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* Workplace Support Pills */}
            {job.accommodationsOffered && job.accommodationsOffered.length > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] text-teal-700 bg-teal-50/80 px-2.5 py-1 rounded-md border border-teal-200/60 w-fit">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span className="truncate max-w-[280px]">
                  Offers: {job.accommodationsOffered.slice(0, 2).join(' • ')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer: Match Score + Action CTAs */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          {job.matchScore ? (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100/80 text-brand-800 border border-indigo-200/80 text-xs font-bold transition-colors group/score"
              title="Click to view transparent match explanation"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-600 group-hover/score:scale-110 transition-transform" />
              <span>{job.matchScore}% Match</span>
              <Info className="w-3 h-3 text-brand-500 opacity-70" />
            </button>
          ) : (
            <span className="text-[11px] text-slate-400">Public Posting</span>
          )}

          <div className="flex items-center gap-2">
            {job.hasApplied ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/70">
                <Check className="w-3.5 h-3.5" /> Applied
              </span>
            ) : null}

            <Link
              to={`/jobs/${job._id}`}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-brand-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
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
