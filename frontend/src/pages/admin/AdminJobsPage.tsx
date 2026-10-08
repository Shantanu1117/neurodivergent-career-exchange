import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import {
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Trash2,
  ExternalLink,
  ShieldAlert,
  Building2,
  DollarSign,
  MapPin,
  Clock,
  ChevronDown,
} from 'lucide-react';

export const AdminJobsPage: React.FC = () => {
  const { success, error } = useToast();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Deletion modal
  const [jobToDelete, setJobToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminJobs();
      if (res.success) {
        setJobs(res.jobs || []);
      }
    } catch (err: any) {
      error(err.message || 'Failed to retrieve platform jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleToggleStatus = async (jobId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'PUBLISHED' ? 'CLOSED' : 'PUBLISHED';
    try {
      const res = await api.toggleAdminJobStatus(jobId, nextStatus);
      if (res.success) {
        success(`Job status changed to ${nextStatus}.`);
        setJobs(jobs.map((j) => (j._id === jobId ? { ...j, status: nextStatus } : j)));
      }
    } catch (err: any) {
      error(err.message || 'Failed to update job status.');
    }
  };

  const handleDelete = async () => {
    if (!jobToDelete) return;
    setDeleting(true);
    try {
      const res = await api.deleteAdminJob(jobToDelete._id);
      if (res.success) {
        success('Job posting permanently removed.');
        setJobs(jobs.filter((j) => j._id !== jobToDelete._id));
        setJobToDelete(null);
      }
    } catch (err: any) {
      error(err.message || 'Failed to remove job posting.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      (job.employerId?.companyName || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || job.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-600" />
            Platform Job Moderation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Oversee active postings, verify neuro-inclusive standards, and manage visibility across employers.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-700">
          <span>{jobs.length} Total Postings</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by role title, keyword, or employer..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex flex-wrap gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-700 border-none focus:ring-0 cursor-pointer"
            >
              <option value="ALL">All Disciplines</option>
              <option value="SOFTWARE_TESTING_QA">QA / Testing</option>
              <option value="CYBERSECURITY">Cybersecurity</option>
              <option value="DATA_ANALYSIS_AUDIT">Data Analysis</option>
              <option value="SOFTWARE_DEVELOPMENT">Engineering</option>
              <option value="UI_UX_DESIGN">UI / UX</option>
              <option value="RESEARCH_DOCUMENTATION">Research & Docs</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-700 border-none focus:ring-0 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton count={5} height="h-24" />
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          title="No jobs match your filter criteria"
          description="Try broadening your search term or selecting 'All Disciplines'."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Role & Employer</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Work Mode / Comp</th>
                  <th className="py-3 px-4">Accommodations</th>
                  <th className="py-3 px-4">Applicants</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 hover:text-indigo-600 transition flex items-center gap-1.5">
                        <span>{job.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-[11px] mt-0.5">
                        <span className="font-semibold text-slate-700">
                          {job.employerId?.companyName || 'Verified Employer'}
                        </span>
                        <span>•</span>
                        <span>{job.location}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-700">
                        {job.category?.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">
                        ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k
                      </div>
                      <span className="text-[11px] text-slate-500">{job.workMode}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        {job.accommodationsOffered?.length || 0} Guaranteed
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-700">{job.applicantCount || 0}</span>
                      <span className="text-slate-400 text-[11px] ml-1">candidates</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={job.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleStatus(job._id, job.status)}
                          title={job.status === 'PUBLISHED' ? 'Unpublish / Close Job' : 'Publish Job'}
                          className={`p-1.5 rounded-lg border text-xs font-medium transition ${
                            job.status === 'PUBLISHED'
                              ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {job.status === 'PUBLISHED' ? (
                            <XCircle className="w-3.5 h-3.5" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() => setJobToDelete(job)}
                          title="Delete Job"
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {jobToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Remove Job Posting</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              Are you sure you want to permanently delete{' '}
              <strong className="text-slate-900">"{jobToDelete.title}"</strong> posted by{' '}
              <strong className="text-slate-900">{jobToDelete.employerId?.companyName || 'Employer'}</strong>?
              All candidate associations will be archived.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setJobToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
