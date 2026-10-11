import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Application, ApplicationStatus } from '../../types/index.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { useToast } from '../../context/ToastContext.js';
import {
  FileCheck2,
  Kanban,
  List,
  Clock,
  Trash2,
  ExternalLink,
  MessageSquarePlus,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const STAGE_ORDER: ApplicationStatus[] = [
  'APPLIED',
  'UNDER_REVIEW',
  'SHORTLISTED',
  'INTERVIEW',
  'OFFER',
];

const SLA_GUIDES: Record<string, string> = {
  APPLIED: 'Next Step: Initial strengths & skills review by inclusive hiring team (Expected within 3–5 business days).',
  UNDER_REVIEW: 'Next Step: Hiring manager is reviewing your cognitive fit and work-sample/profile (Expected within 3 business days).',
  SHORTLISTED: 'Next Step: You are on the shortlist! An invitation with advance interview questions or a practical task will be sent soon.',
  INTERVIEW: 'Next Step: Scheduled structured interview or asynchronous walkthrough with confirmed accommodations.',
  ASSESSMENT: 'Next Step: Practical work-sample review by technical peers.',
  OFFER: 'Congratulations! An offer has been extended. Your Day-1 workplace adjustments are being prepared.',
  REJECTED: 'This application has concluded. You can request or view structured constructive feedback below.',
  WITHDRAWN: 'You withdrew this application.',
};

export const CandidateApplicationsPage: React.FC = () => {
  const { success, error } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [loading, setLoading] = useState(true);
  const [requestingFeedbackId, setRequestingFeedbackId] = useState<string | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.getMyApplications();
      if (res.success) {
        setApplications(res.applications);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (appId: string) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    try {
      const res = await api.withdrawApplication(appId);
      if (res.success) {
        success('Application withdrawn.');
        fetchApplications();
      }
    } catch (err: any) {
      error(err.message || 'Failed to withdraw application.');
    }
  };

  const handleRequestFeedback = async (appId: string) => {
    setRequestingFeedbackId(appId);
    try {
      const res = await api.requestApplicationFeedback(appId);
      if (res.success) {
        success('Constructive feedback requested from the employer!');
        fetchApplications();
      }
    } catch (err: any) {
      error(err.message || 'Could not request feedback.');
    } finally {
      setRequestingFeedbackId(null);
    }
  };

  const kanbanColumns: Array<{ title: string; status: ApplicationStatus; color: string }> = [
    { title: 'Applied', status: 'APPLIED', color: 'border-blue-300' },
    { title: 'Under Review', status: 'UNDER_REVIEW', color: 'border-amber-300' },
    { title: 'Shortlisted', status: 'SHORTLISTED', color: 'border-purple-300' },
    { title: 'Interview Stage', status: 'INTERVIEW', color: 'border-indigo-400' },
    { title: 'Assessment', status: 'ASSESSMENT', color: 'border-cyan-300' },
    { title: 'Offer Extended', status: 'OFFER', color: 'border-emerald-400' },
  ];

  const getStageIndex = (status: ApplicationStatus) => {
    if (status === 'ASSESSMENT') return 3;
    const idx = STAGE_ORDER.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Predictable Application Tracker &amp; SLA Timeline
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Transparent stage-by-stage progress, expected response windows, and constructive feedback.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Timeline Stepper View</span>
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'kanban'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} height="h-36" />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title="No applications submitted yet"
          description="Browse matched positions to discover roles that align with your cognitive strengths."
          actionText="Explore Open Jobs"
          actionPath="/candidate/jobs"
        />
      ) : viewMode === 'kanban' ? (
        /* Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-6">
          {kanbanColumns.map((col) => {
            const columnApps = applications.filter((a) => a.status === col.status);
            return (
              <div
                key={col.status}
                className="bg-slate-100/70 dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 flex flex-col min-w-[220px]"
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <span>{col.title}</span>
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[10px]">
                    {columnApps.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {columnApps.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-slate-400">Empty</div>
                  ) : (
                    columnApps.map((app) => (
                      <div
                        key={app._id}
                        className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5 hover:shadow-subtle transition-shadow"
                      >
                        <div className="flex justify-between items-start gap-1">
                          <Link
                            to={`/jobs/${app.jobId?._id}`}
                            className="font-bold text-xs text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-indigo-400 line-clamp-2"
                          >
                            {app.jobId?.title}
                          </Link>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          {app.jobId?.employerId?.companyName}
                        </p>
                        <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
                          <span className="font-bold text-brand-700 dark:text-indigo-300 bg-brand-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded">
                            {app.matchScore}% Match
                          </span>
                          <span>{new Date(app.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Feature #21 & #22: Predictable Timeline Stepper + Constructive Feedback View */
        <div className="space-y-4">
          {applications.map((app) => {
            const currentIdx = getStageIndex(app.status);
            const isTerminal = app.status === 'REJECTED' || app.status === 'WITHDRAWN';

            return (
              <div
                key={app._id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-subtle space-y-5 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/jobs/${app.jobId?._id}`}
                        className="font-extrabold text-base text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-indigo-400"
                      >
                        {app.jobId?.title}
                      </Link>
                      <span className="text-xs font-bold text-brand-700 dark:text-indigo-300 bg-brand-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-lg border border-brand-200 dark:border-indigo-800">
                        {app.matchScore}% Match
                      </span>
                      {app.submissionType && app.submissionType !== 'STANDARD' && (
                        <span className="text-[11px] font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-lg border border-teal-200 dark:border-teal-800">
                          {app.submissionType.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {app.jobId?.employerId?.companyName}
                      </span>
                      <span>•</span>
                      <span>{app.jobId?.location}</span>
                      <span>•</span>
                      <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <StatusBadge status={app.status} />
                    {!app.structuredFeedback && !app.feedbackRequested && (
                      <button
                        type="button"
                        onClick={() => handleRequestFeedback(app._id)}
                        disabled={requestingFeedbackId === app._id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 text-brand-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800 transition-colors"
                      >
                        <MessageSquarePlus className="w-3.5 h-3.5" />
                        <span>{requestingFeedbackId === app._id ? 'Requesting...' : 'Request Feedback'}</span>
                      </button>
                    )}
                    {app.feedbackRequested && !app.structuredFeedback && (
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                        Feedback Requested
                      </span>
                    )}
                    {app.status === 'APPLIED' && (
                      <button
                        onClick={() => handleWithdraw(app._id)}
                        className="text-xs text-slate-400 hover:text-rose-600 p-1.5"
                        title="Withdraw application"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <Link
                      to={`/jobs/${app.jobId?._id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-brand-600 text-white text-xs font-semibold transition-colors"
                      title="View job details"
                    >
                      <span>View Details</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Feature #21: 5-Stage Progress Stepper */}
                {!isTerminal && (
                  <div className="grid grid-cols-5 gap-2 pt-1">
                    {[
                      { key: 'APPLIED', label: '1. Applied' },
                      { key: 'UNDER_REVIEW', label: '2. In Review' },
                      { key: 'SHORTLISTED', label: '3. Shortlisted' },
                      { key: 'INTERVIEW', label: '4. Interview / Task' },
                      { key: 'OFFER', label: '5. Offer' },
                    ].map((step, idx) => {
                      const done = idx <= currentIdx;
                      return (
                        <div key={step.key} className="space-y-1.5">
                          <div
                            className={`h-2 rounded-full transition-colors ${
                              done ? 'bg-brand-600' : 'bg-slate-200'
                            }`}
                          />
                          <span
                            className={`block text-[10px] sm:text-xs font-bold truncate ${
                              done ? 'text-brand-700' : 'text-slate-400'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Expected Next-Step & SLA Guide */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-xs text-slate-700">
                  <Clock className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>{SLA_GUIDES[app.status] || SLA_GUIDES.APPLIED}</span>
                </div>

                {/* Feature #22: Constructive Feedback Display */}
                {app.structuredFeedback && (
                  <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-2.5 text-xs">
                    <div className="flex items-center gap-2 font-bold text-teal-900">
                      <Sparkles className="w-4 h-4 text-teal-600" />
                      <span>Constructive Hiring Team Feedback</span>
                    </div>
                    {app.structuredFeedback.encouragementNote && (
                      <p className="text-slate-700 leading-relaxed">
                        {app.structuredFeedback.encouragementNote}
                      </p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="font-bold text-emerald-800 block mb-1">
                          Strengths Demonstrated:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {(app.structuredFeedback.strengthsHighlighted || []).map((s, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-semibold text-[11px]"
                            >
                              ✓ {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="font-bold text-amber-900 block mb-1">
                          Recommended Growth Areas:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {(app.structuredFeedback.growthAreas || []).map((g, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold text-[11px]"
                            >
                              • {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Day-1 Accommodation Readiness Checklist Preview (#26) */}
                {app.accommodationChecklist && app.accommodationChecklist.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-slate-600">Employer Adjustment Checklist:</span>
                    {app.accommodationChecklist.map((item, i) => (
                      <span
                        key={i}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg font-semibold text-[11px] border ${
                          item.status === 'COMPLETED' || item.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>
                          {item.item} ({item.status})
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
