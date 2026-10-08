import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.js';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  Award,
  Users,
  Briefcase,
  FileCheck2,
  Calendar,
  ShieldCheck,
  Download,
  Filter,
} from 'lucide-react';

const COLORS = ['#6366f1', '#0d9488', '#059669', '#f59e0b', '#ec4899', '#8b5cf6'];
const STATUS_COLORS: Record<string, string> = {
  APPLIED: '#64748b',
  SCREENING: '#3b82f6',
  INTERVIEWING: '#8b5cf6',
  OFFER: '#10b981',
  REJECTED: '#f43f5e',
  WITHDRAWN: '#94a3b8',
};

export const AdminReportsPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await api.getAdminStats();
        if (res.success) {
          setStats(res.stats);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatCategoryName = (cat: string) => {
    switch (cat) {
      case 'SOFTWARE_TESTING_QA':
        return 'QA & Testing';
      case 'CYBERSECURITY':
        return 'Cybersecurity';
      case 'DATA_ANALYSIS_AUDIT':
        return 'Data Analysis';
      case 'SOFTWARE_DEVELOPMENT':
        return 'Engineering';
      case 'UI_UX_DESIGN':
        return 'UI/UX Design';
      case 'RESEARCH_DOCUMENTATION':
        return 'Research & Docs';
      default:
        return cat?.replace(/_/g, ' ') || 'Other';
    }
  };

  const categoryChartData =
    stats?.categoryBreakdown?.map((item: any) => ({
      name: formatCategoryName(item._id),
      jobs: item.count,
    })) || [];

  const statusChartData =
    stats?.applicationStatusBreakdown?.map((item: any) => ({
      name: item._id,
      value: item.count,
      color: STATUS_COLORS[item._id] || '#6366f1',
    })) || [];

  const handleExportCSV = () => {
    if (!stats) return;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Value\n' +
      `Total Candidates,${stats.totalCandidates}\n` +
      `Total Employers,${stats.totalEmployers}\n` +
      `Active Jobs,${stats.activeJobs}\n` +
      `Total Applications,${stats.totalApplications}\n` +
      `Scheduled Interviews,${stats.totalInterviews}\n` +
      `Successful Offers,${stats.successfulOffers}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ndce_platform_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            Executive Platform Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Macro metrics, hiring velocity, cognitive discipline demand, and pipeline funnel efficiency.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition shadow-subtle"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} height="h-64" />
      ) : (
        <>
          {/* Metric KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle">
              <span className="text-[11px] font-semibold text-slate-500 block">Candidate Pool</span>
              <span className="text-2xl font-black text-slate-900">{stats?.totalCandidates ?? 0}</span>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1">100% Opt-in Privacy</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle">
              <span className="text-[11px] font-semibold text-slate-500 block">Partner Companies</span>
              <span className="text-2xl font-black text-slate-900">{stats?.totalEmployers ?? 0}</span>
              <div className="text-[10px] text-indigo-600 font-semibold mt-1">Verified Inclusive</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle">
              <span className="text-[11px] font-semibold text-slate-500 block">Active Jobs</span>
              <span className="text-2xl font-black text-slate-900">{stats?.activeJobs ?? 0}</span>
              <div className="text-[10px] text-teal-600 font-semibold mt-1">Accommodated</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle">
              <span className="text-[11px] font-semibold text-slate-500 block">Total Submissions</span>
              <span className="text-2xl font-black text-slate-900">{stats?.totalApplications ?? 0}</span>
              <div className="text-[10px] text-slate-500 font-semibold mt-1">Tracked ATS</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle">
              <span className="text-[11px] font-semibold text-slate-500 block">Interviews Held</span>
              <span className="text-2xl font-black text-slate-900">{stats?.totalInterviews ?? 0}</span>
              <div className="text-[10px] text-purple-600 font-semibold mt-1">Zero Ambiguity</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle">
              <span className="text-[11px] font-semibold text-slate-500 block">Offers Extended</span>
              <span className="text-2xl font-black text-emerald-600">{stats?.successfulOffers ?? 0}</span>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1">Placements</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Jobs by Category */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-subtle space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Market Demand by Cognitive Discipline</h3>
                <p className="text-xs text-slate-500">Distribution of published roles aligned with neurodivergent strengths.</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      angle={-20}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '12px',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Bar dataKey="jobs" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Applications Stage Funnel */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-subtle space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Application Pipeline Funnel Distribution</h3>
                <p className="text-xs text-slate-500">Real-time breakdown of candidates across interview stages.</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {statusChartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Operational Insights Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Cognitive Discipline Benchmark Matrix</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Discipline</th>
                    <th className="py-2.5 px-3">Primary Cognitive Alignment</th>
                    <th className="py-2.5 px-3">Standard Accommodations</th>
                    <th className="py-2.5 px-3">Typical Comp Band</th>
                    <th className="py-2.5 px-3">Hiring Velocity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 px-3 font-bold text-slate-900">Software Testing / QA</td>
                    <td className="py-3 px-3 text-slate-600">Pattern Recognition, Attention to Detail</td>
                    <td className="py-3 px-3 text-slate-600">Async Standups, Clear Test Checklists</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">$85,000 - $130,000</td>
                    <td className="py-3 px-3 text-emerald-600 font-bold">High (14 days avg)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-bold text-slate-900">Cybersecurity & SecOps</td>
                    <td className="py-3 px-3 text-slate-600">Hyperfocus, Anomaly Detection, Logic</td>
                    <td className="py-3 px-3 text-slate-600">Quiet Focus Blocks, Written Runbooks</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">$100,000 - $155,000</td>
                    <td className="py-3 px-3 text-emerald-600 font-bold">Very High (11 days)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-bold text-slate-900">Data Analysis & Audit</td>
                    <td className="py-3 px-3 text-slate-600">Data Structuring, Systematic Verification</td>
                    <td className="py-3 px-3 text-slate-600">Camera-Optional Calls, Detailed Spec</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">$90,000 - $140,000</td>
                    <td className="py-3 px-3 text-indigo-600 font-bold">Moderate (18 days)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-bold text-slate-900">Software Development</td>
                    <td className="py-3 px-3 text-slate-600">Deep Focus, Problem Solving, Architecture</td>
                    <td className="py-3 px-3 text-slate-600">Async Code Reviews, Headphone Allowance</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">$110,000 - $175,000</td>
                    <td className="py-3 px-3 text-indigo-600 font-bold">Moderate (21 days)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-bold text-slate-900">Research & Documentation</td>
                    <td className="py-3 px-3 text-slate-600">Information Synthesis, Precision Writing</td>
                    <td className="py-3 px-3 text-slate-600">Reduced Meetings, Flexible Core Hours</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">$75,000 - $115,000</td>
                    <td className="py-3 px-3 text-slate-600 font-bold">Standard (24 days)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
