import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { NotificationItem } from '../../types/index.js';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { useToast } from '../../context/ToastContext.js';
import {
  Bell,
  CheckCheck,
  CalendarDays,
  FileCheck2,
  Sparkles,
  ArrowRight,
  Clock,
} from 'lucide-react';

export const CandidateNotificationsPage: React.FC = () => {
  const { success, error } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch {
      // Silently catch
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await api.markAllNotificationsAsRead();
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        success('All notifications marked as read.');
      }
    } catch (err: any) {
      error('Failed to mark all as read.');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'INTERVIEW_SCHEDULED':
        return <CalendarDays className="w-4 h-4 text-indigo-600" />;
      case 'APPLICATION_STATUS_CHANGED':
        return <FileCheck2 className="w-4 h-4 text-emerald-600" />;
      case 'NEW_JOB_MATCH':
        return <Sparkles className="w-4 h-4 text-brand-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time updates regarding application progress and scheduled interviews.
          </p>
        </div>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 px-3 py-1.5 rounded-xl border border-brand-200/60"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSkeleton count={4} height="h-20" />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="All caught up!"
          description="You have no notifications. When your applications advance or interviews are scheduled, alerts will appear here."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle divide-y divide-slate-100 overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => handleMarkAsRead(n._id)}
              className={`p-5 flex items-start gap-4 transition-colors cursor-pointer ${
                n.read ? 'hover:bg-slate-50/50' : 'bg-brand-50/30 hover:bg-brand-50/50'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span>{n.title}</span>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-brand-600 inline-block" />}
                  </h3>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                {n.linkUrl && (
                  <Link
                    to={n.linkUrl}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700 pt-1"
                  >
                    <span>View details</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
