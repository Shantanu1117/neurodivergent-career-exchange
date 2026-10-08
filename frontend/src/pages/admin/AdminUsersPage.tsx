import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.js';
import { Users, Search, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { success, error } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let q = '';
      if (roleFilter !== 'ALL') q += `role=${roleFilter}&`;
      if (search) q += `search=${encodeURIComponent(search)}`;
      const res = await api.getAdminUsers(q);
      if (res.success) {
        setUsers(res.users);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      const res = await api.toggleUserStatus(userId);
      if (res.success) {
        success('User status updated.');
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isActive: res.user.isActive } : u))
        );
      }
    } catch (err: any) {
      error('Failed to toggle status.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">User Administration</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage candidates, verified employers, and system administrators.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
          >
            <option value="ALL">All Roles</option>
            <option value="CANDIDATE">Candidates Only</option>
            <option value="EMPLOYER">Employers Only</option>
            <option value="ADMIN">Administrators Only</option>
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user email..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900"
          />
        </div>
        <button
          type="submit"
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl"
        >
          Search
        </button>
      </form>

      {/* Users Table */}
      {loading ? (
        <LoadingSkeleton count={4} height="h-16" />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                  <th className="py-3 px-4">User Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Associated Entity</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 font-mono text-xs">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-[10px] uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {u.profile?.fullName || u.profile?.companyName || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold text-[11px] px-2 py-0.5 rounded ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(u._id)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                          u.isActive
                            ? 'border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50'
                            : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        {u.isActive ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
