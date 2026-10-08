import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.js';
import {
  Building2,
  Briefcase,
  Users,
  Calendar,
  PlusCircle,
  ArrowRight,
  Sparkles,
  FileText,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const EmployerDashboard: React.FC = () => {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [statsRes, appsRes] = await Promise.all([
          api.getEmployerDashboardStats(),
          api.getJobApplications(),
        ]);

        if (statsRes.success) {
          setStats(statsRes.stats);
        }
        if (appsRes.success) {
          setRecentApps(appsRes.applications.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to load employer dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-teal-200 text-xs font-semibold backdrop-blur-sm">
            <Building2 className="w-3.5 h-3.5 text-teal-300" />
            <span>Inclusive Talent Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {profile?.companyName || 'Employer Dashboard'}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100 leading-relaxed">
            Manage your neuro-inclusive job postings, review qualified candidates based on objective
            strengths, and schedule predictable interviews.
          </p>
        </div>

        <Link
          to="/employer/jobs/create"
          className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold text-xs px-5 py-3 rounded-xl shadow-card transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post an Inclusive Job</span>
        </Link>
      </div>

      {/* Metrics Row */}
      {loading ? (
        <LoadingSkeleton count={4} height="h-28" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Active Postings</span>
              <Briefcase className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-slate-900">{stats?.activeJobs ?? 0}</span>
              <span className="text-xs text-slate-500 block mt-0.5">Published roles</span>
            </div>
            <Link
              to="/employer/jobs"
              className="text-[11px] font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 mt-3 pt-2 border-t border-slate-100"
            >
              <span>Manage postings</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Total Applicants</span>
              <Users className="w-4 h-4 text-brand-600" />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-slate-900">
                {stats?.totalApplications ?? 0}
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">Across all positions</span>
            </div>
            <Link
              to="/employer/applications"
              className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 mt-3 pt-2 border-t border-slate-100"
            >
              <span>View pipeline</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Shortlisted Talent</span>
              <CheckCircle2 className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-slate-900">{stats?.shortlisted ?? 0}</span>
              <span className="text-xs text-slate-500 block mt-0.5">Ready for interview</span>
            </div>
            <Link
              to="/employer/applications?status=SHORTLISTED"
              className="text-[11px] font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 mt-3 pt-2 border-t border-slate-100"
            >
              <span>Review shortlisted</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Interviews Active</span>
              <Calendar className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-slate-900">{stats?.interviews ?? 0}</span>
              <span className="text-xs text-slate-500 block mt-0.5">Advance agendas sent</span>
            </div>
            <Link
              to="/employer/interviews"
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-3 pt-2 border-t border-slate-100"
            >
              <span>View schedule</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Recent Applications Pipeline Snapshot */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Recent Candidate Applications</h2>
          <Link
            to="/employer/applications"
            className="text-xs font-semibold text-teal-600 hover:text-teal-700"
          >
            Open Full Pipeline
          </Link>
        </div>

        {recentApps.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            No incoming applications yet. Once you publish jobs, matched candidates will appear here.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentApps.map((app) => (
              <div key={app._id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 block">
                    {app.candidateId?.fullName}
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Applied for: <span className="font-semibold text-slate-700">{app.jobId?.title}</span> •{' '}
                    {app.candidateId?.location}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200/50">
                    {app.matchScore}% Match
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
