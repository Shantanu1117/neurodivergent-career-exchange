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
  Building2,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  Trash2,
  ExternalLink,
} from 'lucide-react';

export const CandidateApplicationsPage: React.FC = () => {
  const { success, error } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [loading, setLoading] = useState(true);

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

  const kanbanColumns: Array<{ title: string; status: ApplicationStatus; color: string }> = [
    { title: 'Applied', status: 'APPLIED', color: 'border-blue-300' },
    { title: 'Under Review', status: 'UNDER_REVIEW', color: 'border-amber-300' },
    { title: 'Shortlisted', status: 'SHORTLISTED', color: 'border-purple-300' },
    { title: 'Interview Stage', status: 'INTERVIEW', color: 'border-indigo-400' },
    { title: 'Assessment', status: 'ASSESSMENT', color: 'border-cyan-300' },
    { title: 'Offer Extended', status: 'OFFER', color: 'border-emerald-400' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Application Tracking System (ATS)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time pipeline tracking across all submitted applications and interview stages.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'kanban'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'list'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List View</span>
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} height="h-32" />
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
                className="bg-slate-100/70 rounded-2xl p-3 border border-slate-200 flex flex-col min-w-[220px]"
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 text-xs font-bold text-slate-700">
                  <span>{col.title}</span>
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">
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
                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2.5 hover:shadow-subtle transition-shadow"
                      >
                        <div className="flex justify-between items-start gap-1">
                          <Link
                            to={`/jobs/${app.jobId?._id}`}
                            className="font-bold text-xs text-slate-900 hover:text-brand-600 line-clamp-2"
                          >
                            {app.jobId?.title}
                          </Link>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {app.jobId?.employerId?.companyName}
                        </p>
                        <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 border-t border-slate-100">
                          <span className="font-bold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">
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
        /* List View */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle overflow-hidden">
          <div className="divide-y divide-slate-100">
            {applications.map((app) => (
              <div
                key={app._id}
                className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/jobs/${app.jobId?._id}`}
                      className="font-bold text-sm text-slate-900 hover:text-brand-600"
                    >
                      {app.jobId?.title}
                    </Link>
                    <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                      {app.matchScore}% Match
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">
                      {app.jobId?.employerId?.companyName}
                    </span>
                    <span>•</span>
                    <span>{app.jobId?.location}</span>
                    <span>•</span>
                    <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={app.status} />
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
                    className="p-1.5 text-slate-400 hover:text-slate-800"
                    title="View job"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
