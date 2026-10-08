import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { Job } from '../../types/index.js';
import { JobCard } from '../../components/common/JobCard.js';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { Bookmark } from 'lucide-react';

export const CandidateSavedJobsPage: React.FC = () => {
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const res = await api.getSavedJobs();
      if (res.success) {
        setSavedJobs(res.jobs);
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
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Saved Jobs</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Roles you have bookmarked to review or apply for later.
        </p>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} height="h-44" />
      ) : savedJobs.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved jobs"
          description="You haven't bookmarked any jobs yet. Browse matched positions to save opportunities."
          actionText="Browse Matched Jobs"
          actionPath="/candidate/jobs"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedJobs.map((job) => (
            <JobCard key={job._id} job={job} onBookmarkToggled={handleBookmarkToggled} />
          ))}
        </div>
      )}
    </div>
  );
};
