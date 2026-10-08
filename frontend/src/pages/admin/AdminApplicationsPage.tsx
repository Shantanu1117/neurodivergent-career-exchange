import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { MatchBreakdownModal } from '../../components/common/MatchBreakdownModal.js';
import {
  FileCheck2,
  Search,
  Filter,
  Sparkles,
  Building2,
  Clock,
  User,
  ShieldCheck,
  ChevronRight,
  Eye,
} from 'lucide-react';

export const AdminApplicationsPage: React.FC = () => {
  const { error } = useToast();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Match breakdown modal
  const [activeMatchModal, setActiveMatchModal] = useState<any>(null);

  // Detail Drawer
  const [selectedApp, setSelectedApp] = useState<any>(null);

  useEffect(() => {
    const fetchApps = async () => {
      setLoading(true);
      try {
        const res = await api.getAdminApplications();
        if (res.success) {
          setApplications(res.applications || []);
        }
      } catch (err: any) {
        error(err.message || 'Failed to retrieve applications.');
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const filteredApps = applications.filter((app) => {
    const candidateName = app.candidateId?.fullName || '';
    const jobTitle = app.jobId?.title || '';
    const company = app.jobId?.employerId?.companyName || '';
    const matchesSearch =
      candidateName.toLowerCase().includes(search.toLowerCase()) ||
      jobTitle.toLowerCase().includes(search.toLowerCase()) ||
      company.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-indigo-600" />
            Platform Applications Oversight
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            System-wide audit trail of candidate submissions, match scores, and hiring stages across all employers.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-700">
          <span>{applications.length} Submissions Logged</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate name, target role, or company..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-xs text-slate-700 border-none focus:ring-0 cursor-pointer"
          >
            <option value="ALL">All Application Stages</option>
            <option value="APPLIED">Applied</option>
            <option value="SCREENING">Screening</option>
            <option value="INTERVIEWING">Interviewing</option>
            <option value="OFFER">Offer Extended</option>
            <option value="REJECTED">Declined / Closed</option>
            <option value="WITHDRAWN">Withdrawn</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <LoadingSkeleton count={5} height="h-24" />
      ) : filteredApps.length === 0 ? (
        <EmptyState
          title="No applications found"
          description="Try adjusting your search query or reset the stage filter."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Target Role & Employer</th>
                  <th className="py-3 px-4">Match Alignment</th>
                  <th className="py-3 px-4">Accommodations</th>
                  <th className="py-3 px-4">Pipeline Stage</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{app.candidateId?.fullName || 'Anonymous Candidate'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {app.candidateId?.headline || app.candidateId?.location || 'Profile on file'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {app.jobId?.title || 'Position'}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span>{app.jobId?.employerId?.companyName || 'Employer'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {app.matchScore ? (
                        <button
                          onClick={() =>
                            setActiveMatchModal({
                              score: app.matchScore,
                              reasons: app.matchReasons || ['Strong cognitive match with role requirements.'],
                              breakdown: app.matchBreakdown,
                              title: `${app.candidateId?.fullName} ↔ ${app.jobId?.title}`,
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200/60 hover:bg-indigo-100 transition"
                        >
                          <Sparkles className="w-3 h-3 text-indigo-600" />
                          <span>{app.matchScore}% Match</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">N/A</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {app.accommodationsRequested?.length > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          {app.accommodationsRequested.length} Requested
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">None requested</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={app.status} />
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {new Date(app.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition inline-flex items-center gap-1 text-xs font-semibold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Audit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Drawer Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Application Audit Summary</h3>
                <p className="text-xs text-slate-500">ID: {selectedApp._id}</p>
              </div>
              <StatusBadge status={selectedApp.status} />
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Candidate</span>
                <p className="font-bold text-slate-900 text-sm">{selectedApp.candidateId?.fullName}</p>
                <p className="text-slate-600">{selectedApp.candidateId?.headline}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Position</span>
                <p className="font-bold text-slate-900">{selectedApp.jobId?.title}</p>
                <p className="text-slate-600">{selectedApp.jobId?.employerId?.companyName}</p>
              </div>

              {selectedApp.coverNote && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Candidate Intro Note</span>
                  <p className="text-slate-700 italic">"{selectedApp.coverNote}"</p>
                </div>
              )}

              {selectedApp.accommodationsRequested?.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Requested Interview Accommodations
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedApp.accommodationsRequested.map((acc: string, i: number) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-medium"
                      >
                        ✓ {acc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Match Breakdown Modal */}
      {activeMatchModal && (
        <MatchBreakdownModal
          isOpen={true}
          onClose={() => setActiveMatchModal(null)}
          score={activeMatchModal.score}
          reasons={activeMatchModal.reasons}
          breakdown={activeMatchModal.breakdown}
          jobTitle={activeMatchModal.title}
        />
      )}
    </div>
  );
};
