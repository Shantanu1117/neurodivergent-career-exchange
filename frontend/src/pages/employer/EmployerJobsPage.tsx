import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Job } from '../../types/index.js';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { useToast } from '../../context/ToastContext.js';
import {
  Briefcase,
  PlusCircle,
  Eye,
  Trash2,
  Users,
  CheckCircle2,
  AlertCircle,
  MapPin,
} from 'lucide-react';

export const EmployerJobsPage: React.FC = () => {
  const { success, error } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.getEmployerJobs();
      if (res.success) {
        setJobs(res.jobs);
      }
    } catch (err) {
      console.error('Failed to load employer jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleToggleStatus = async (jobId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PUBLISHED' ? 'CLOSED' : 'PUBLISHED';
    try {
      const res = await api.toggleJobStatus(jobId, newStatus);
      if (res.success) {
        success(`Job status changed to ${newStatus}.`);
        setJobs((prev) => prev.map((j) => (j._id === jobId ? { ...j, status: newStatus as any } : j)));
      }
    } catch (err: any) {
      error(err.message || 'Failed to update job status.');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      const res = await api.deleteJob(jobId);
      if (res.success) {
        success('Job deleted successfully.');
        setJobs((prev) => prev.filter((j) => j._id !== jobId));
      }
    } catch (err: any) {
      error(err.message || 'Failed to delete job.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Job Postings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your inclusive job openings, publish status, and applicant pipelines.
          </p>
        </div>
        <Link
          to="/employer/jobs/create"
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-card transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Job</span>
        </Link>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} height="h-32" />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No job postings yet"
          description="Create your first neuro-inclusive job opening to connect with skilled candidates."
          actionText="Post Your First Job"
          actionPath="/employer/jobs/create"
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle overflow-hidden divide-y divide-slate-100">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-bold text-base text-slate-900">{job.title}</h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      job.status === 'PUBLISHED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">{job.category}</span>
                  <span>•</span>
                  <span>{job.workMode}</span>
                  <span>•</span>
                  <span>${Math.round(job.salaryMin / 1000)}k–${Math.round(job.salaryMax / 1000)}k</span>
                  <span>•</span>
                  <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {(job.accommodationsOffered || []).slice(0, 3).map((acc) => (
                    <span
                      key={acc}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-teal-50 text-teal-800 border border-teal-200/60"
                    >
                      {acc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions & Applicant Counter */}
              <div className="flex items-center gap-4 shrink-0">
                <Link
                  to={`/employer/applications?jobId=${job._id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                >
                  <Users className="w-3.5 h-3.5 text-teal-600" />
                  <span>{job.applicantCount ?? 0} Applicants</span>
                </Link>

                <button
                  onClick={() => handleToggleStatus(job._id, job.status)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100"
                >
                  {job.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                </button>

                <Link
                  to={`/jobs/${job._id}`}
                  className="p-2 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                  title="View public posting"
                >
                  <Eye className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => handleDeleteJob(job._id)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  title="Delete job"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
