import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { api } from '../../services/api.js';
import { Job, Application, Interview } from '../../types/index.js';
import { JobCard } from '../../components/common/JobCard.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.js';
import { EmailPreviewModal, EmailLogItem } from '../../components/common/EmailPreviewModal.js';
import {
  Sparkles,
  Compass,
  FileCheck2,
  CalendarDays,
  ArrowRight,
  HeartHandshake,
  Mail,
  Award,
} from 'lucide-react';

export const CandidateDashboard: React.FC = () => {
  const { profile, user } = useAuth();
  const { success, error } = useToast();
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [upcomingInterview, setUpcomingInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [previewEmail, setPreviewEmail] = useState<EmailLogItem | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [jobsRes, appsRes, intRes] = await Promise.all([
          api.getJobs('sort=match'),
          api.getMyApplications(),
          api.getMyInterviews(),
        ]);

        if (jobsRes.success) {
          setRecommendedJobs(jobsRes.jobs.slice(0, 4));
        }
        if (appsRes.success) {
          setApplications(appsRes.applications.slice(0, 5));
        }
        if (intRes.success && intRes.interviews.length > 0) {
          setUpcomingInterview(intRes.interviews[0]);
        }
      } catch (err) {
        console.error('Failed to load candidate dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleSendDigestEmail = async () => {
    setSendingEmail(true);
    try {
      const res = await api.sendTestEmail(user?.email);
      if (res.success && res.email) {
        setPreviewEmail(res.email);
        success(res.message || 'Career Match Digest emailed!');
      }
    } catch (err: any) {
      error(err.message || 'Could not dispatch digest email.');
    } finally {
      setSendingEmail(false);
    }
  };

  const scores = profile?.assessmentResults;
  const primaryMatch = scores?.primaryMatch || 'Software Testing / QA & Systems';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-card flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border border-indigo-500/20">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-300" />
            <span>Strengths-First Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {profile?.fullName || user?.email.split('@')[0]}
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
            Your career profile is actively matching with verified neuro-inclusive employers offering
            structured workflows, 48-hour advance interview agendas, and guaranteed accommodations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleSendDigestEmail}
            disabled={sendingEmail}
            className="inline-flex items-center gap-2 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 text-teal-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            <Mail className="w-4 h-4" />
            <span>{sendingEmail ? 'Emailing...' : 'Email Me Match Digest'}</span>
          </button>
          <Link
            to="/candidate/results"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <Award className="w-4 h-4" />
            <span>Results &amp; Course Quizzes</span>
          </Link>
          <Link
            to="/candidate/jobs"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/20 transition-colors"
          >
            <span>Explore Matched Jobs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Top Career Fit */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Primary Career Alignment</span>
            <Compass className="w-4 h-4 text-brand-600 dark:text-indigo-400" />
          </div>
          <div>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white block truncate">
              {primaryMatch}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              {scores ? `${Math.max(scores.qaTesting || 92, 85)}% Match Score` : '94% Cognitive Fit'}
            </span>
          </div>
          <Link
            to="/candidate/results"
            className="text-[11px] font-semibold text-brand-600 dark:text-indigo-400 hover:text-brand-700 flex items-center gap-1 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800"
          >
            <span>View results &amp; skill quizzes</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Metric 2: Active Applications */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Submitted Applications</span>
            <FileCheck2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {applications.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
              Tracked in Kanban ATS
            </span>
          </div>
          <Link
            to="/candidate/applications"
            className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 flex items-center gap-1 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800"
          >
            <span>Open ATS board</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Metric 3: Upcoming Interviews */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Scheduled Interviews</span>
            <CalendarDays className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {upcomingInterview ? 1 : 0}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
              48h Advance Agendas Active
            </span>
          </div>
          <Link
            to="/candidate/interviews"
            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800"
          >
            <span>Interview Hub</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Metric 4: Profile Completion */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Profile Completeness</span>
            <HeartHandshake className="w-4 h-4 text-brand-600 dark:text-indigo-400" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {profile?.profileCompletion || 85}%
            </span>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-brand-600 h-1.5 rounded-full"
                style={{ width: `${profile?.profileCompletion || 85}%` }}
              />
            </div>
          </div>
          <Link
            to="/candidate/profile"
            className="text-[11px] font-semibold text-brand-600 dark:text-indigo-400 hover:text-brand-700 flex items-center gap-1 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800"
          >
            <span>Edit How I Work Best</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Upcoming Interview Alert (If exists) */}
      {upcomingInterview && (
        <div className="bg-indigo-50/80 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/50 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 dark:text-indigo-400 block">
                Upcoming Predictable Interview
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {upcomingInterview.title} with {upcomingInterview.employerId?.companyName}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Scheduled for {new Date(upcomingInterview.scheduledAt).toLocaleDateString()} at{' '}
                {new Date(upcomingInterview.scheduledAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                ({upcomingInterview.durationMinutes} mins)
              </p>
            </div>
          </div>
          <Link
            to="/candidate/interviews"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-xs shrink-0"
          >
            Preview Agenda &amp; Questions
          </Link>
        </div>
      )}

      {/* Recommended Jobs Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              High-Fit Recommended Jobs
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ranked by your cognitive strengths, preferred work mode, and requested accommodations
            </p>
          </div>
          <Link
            to="/candidate/jobs"
            className="text-xs font-semibold text-brand-600 dark:text-indigo-400 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSkeleton count={2} height="h-44" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendedJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Applications Snapshot */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Applications</h2>
          <Link
            to="/candidate/applications"
            className="text-xs font-semibold text-brand-600 dark:text-indigo-400 hover:text-brand-700"
          >
            Open Kanban ATS
          </Link>
        </div>

        {applications.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
            You haven't submitted any applications yet. Browse recommended positions above to apply!
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {applications.map((app) => (
              <div key={app._id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {app.jobId?.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {app.jobId?.employerId?.companyName}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-brand-700 dark:text-indigo-300 bg-brand-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                    {app.matchScore}% Match
                  </span>
                  <StatusBadge status={app.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* HTML Email Preview Modal */}
      <EmailPreviewModal
        email={previewEmail}
        isOpen={!!previewEmail}
        onClose={() => setPreviewEmail(null)}
        onResendToAddress={async (targetEmail) => {
          const res = await api.sendTestEmail(targetEmail);
          if (res.success && res.email) {
            setPreviewEmail(res.email);
            success(`Dispatched email copy to ${targetEmail}!`);
          }
        }}
      />
    </div>
  );
};
