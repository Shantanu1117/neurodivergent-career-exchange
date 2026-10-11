import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { Job } from '../../types/index.js';
import { JobCard } from '../../components/common/JobCard.js';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { Bookmark, Sparkles } from 'lucide-react';

export const CandidateSavedJobsPage: React.FC = () => {
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [suggestedJobs, setSuggestedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const [res, jobsRes] = await Promise.all([
        api.getSavedJobs(),
        api.getJobs('sort=match'),
      ]);
      if (res.success) {
        setSavedJobs(res.jobs || []);
      }
      if (jobsRes.success) {
        setSuggestedJobs((jobsRes.jobs || []).slice(0, 4));
      }
    } catch (err) {
      console.error('Failed to load saved jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleBookmarkToggled = (jobId: string, isSaved: boolean) => {
    if (!isSaved) {
      setSavedJobs((prev) => prev.filter((j) => j._id !== jobId));
    } else {
      const added = suggestedJobs.find((j) => j._id === jobId);
      if (added && !savedJobs.some((s) => s._id === jobId)) {
        setSavedJobs((prev) => [{ ...added, isSaved: true }, ...prev]);
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-brand-600 dark:text-indigo-400 mb-1">
          <Bookmark className="w-4 h-4" />
          <span>Bookmarked Opportunities</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Saved Jobs ({savedJobs.length})
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Roles you have bookmarked to review sensory metrics, advance questions, or apply for at your own pace.
        </p>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} height="h-44" />
      ) : savedJobs.length === 0 ? (
        <div className="space-y-8">
          <EmptyState
            icon={Bookmark}
            title="No saved jobs yet"
            description="Click the bookmark icon on any role below to add it to your personal shortlist for low-pressure review."
            actionText="Explore All Matched Jobs"
            actionPath="/candidate/jobs"
          />

          {suggestedJobs.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600 dark:text-indigo-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Suggested 90%+ Cognitive Match Roles to Bookmark
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {suggestedJobs.map((job) => (
                  <JobCard key={job._id} job={job} onBookmarkToggled={handleBookmarkToggled} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedJobs.map((job) => (
            <JobCard
              key={job._id}
              job={{ ...job, isSaved: true }}
              onBookmarkToggled={handleBookmarkToggled}
            />
          ))}
        </div>
      )}
    </div>
  );
};
