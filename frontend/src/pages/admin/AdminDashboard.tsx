import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.js';
import { useToast } from '../../context/ToastContext.js';
import {
  ShieldCheck,
  MessageSquareWarning,
  CheckCircle2,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { success, error } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const [statsRes, repRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminAccessibilityReports().catch(() => ({ success: false, reports: [] })),
      ]);
      if (statsRes.success) {
        setStats(statsRes.stats);
      }
      if (repRes.success) {
        setReports(repRes.reports);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleResolveReport = async (reportId: string, nextStatus: string) => {
    try {
      const res = await api.updateAdminAccessibilityReport(reportId, {
        status: nextStatus,
        adminNote: 'Reviewed and resolved by Accessibility Operations Team.',
      });
      if (res.success) {
        success(`Accessibility report marked as ${nextStatus}.`);
        fetchAdminData();
      }
    } catch (err: any) {
      error(err.message || 'Could not update accessibility report.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600">
          <ShieldCheck className="w-4 h-4" />
          <span>Platform Operations & Accessibility Governance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Executive Operations & WCAG Compliance Center
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time platform activity across candidates, verified employers, jobs, applications, and WCAG 2.2 accessibility feedback.
        </p>
      </div>

      {loading ? (
        <LoadingSkeleton count={4} height="h-28" />
      ) : (
        <>
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Total Candidates</span>
              <span className="text-2xl font-black text-slate-900">{stats?.totalCandidates ?? 0}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Verified Employers</span>
              <span className="text-2xl font-black text-slate-900">{stats?.totalEmployers ?? 0}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Active Job Postings</span>
              <span className="text-2xl font-black text-brand-600">{stats?.activeJobs ?? 0}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Applications Filed</span>
              <span className="text-2xl font-black text-slate-900">{stats?.totalApplications ?? 0}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Interviews Scheduled</span>
              <span className="text-2xl font-black text-indigo-600">{stats?.totalInterviews ?? 0}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Offers Extended</span>
              <span className="text-2xl font-black text-emerald-600">{stats?.successfulOffers ?? 0}</span>
            </div>
          </div>

          {/* Breakdown Matrices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-subtle space-y-4">
              <h2 className="text-base font-bold text-slate-900">Job Distribution by Career Track</h2>
              <div className="space-y-3">
                {(stats?.categoryBreakdown || []).map((cat: any) => (
                  <div key={cat._id} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{cat._id?.replace(/_/g, ' ')}</span>
                      <span className="text-brand-600">{cat.count} jobs</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-brand-600 h-2 rounded-full"
                        style={{ width: `${Math.min(100, cat.count * 15)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Pipeline Status Breakdown */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-subtle space-y-4">
              <h2 className="text-base font-bold text-slate-900">Application Pipeline Statuses</h2>
              <div className="space-y-2.5">
                {(stats?.applicationStatusBreakdown || []).map((st: any) => (
                  <div
                    key={st._id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-slate-800">{st._id?.replace('_', ' ')}</span>
                    <span className="font-black text-slate-900 bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                      {st.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature #40: In-App Accessibility Barrier Reports Triage */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquareWarning className="w-5 h-5 text-brand-600" />
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    WCAG 2.2 SC 3.2.6 Accessibility & Sensory Barrier Reports ({reports.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Direct user feedback submitted from the global Comfort & Accessibility Drawer
                  </p>
                </div>
              </div>
            </div>

            {reports.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">
                Zero open accessibility or sensory barrier reports at this time.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {reports.map((rep) => (
                  <div
                    key={rep._id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-brand-700 font-bold border border-indigo-200">
                          {rep.category}
                        </span>
                        <span className="font-semibold text-slate-500">Page: {rep.pageUrl}</span>
                        <span className="text-slate-400">
                          • {new Date(rep.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-800 font-medium">{rep.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-lg font-bold ${
                          rep.status === 'RESOLVED'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {rep.status}
                      </span>
                      {rep.status !== 'RESOLVED' && (
                        <button
                          type="button"
                          onClick={() => handleResolveReport(rep._id, 'RESOLVED')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Resolved</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
