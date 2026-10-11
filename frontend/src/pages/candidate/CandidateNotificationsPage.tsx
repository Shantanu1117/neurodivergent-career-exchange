import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { NotificationItem } from '../../types/index.js';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { EmailPreviewModal, EmailLogItem } from '../../components/common/EmailPreviewModal.js';
import { useToast } from '../../context/ToastContext.js';
import {
  Bell,
  CheckCheck,
  CalendarDays,
  FileCheck2,
  Sparkles,
  ArrowRight,
  Clock,
  Mail,
  Send,
  Eye,
  ShieldCheck,
  CheckCircle2,
  Plus,
  X,
} from 'lucide-react';

export const CandidateNotificationsPage: React.FC = () => {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<'ALERTS' | 'EMAILS'>('ALERTS');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [emails, setEmails] = useState<EmailLogItem[]>([]);
  const [userEmail, setUserEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [previewEmail, setPreviewEmail] = useState<EmailLogItem | null>(null);

  // Compose custom email modal state
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState(
    'Accommodation & Work-Style Inquiry — Neurodivergent Career Exchange'
  );
  const [composeBody, setComposeBody] = useState(
    'Hello Inclusive Hiring Team,\n\nI am writing to share my strengths profile and confirm that written interview questions in advance and async work-sample options are available for this role.\n\nBest regards,'
  );

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [notifRes, emailRes] = await Promise.all([
        api.getNotifications(),
        api.getMyEmails().catch(() => ({ success: false, emails: [] })),
      ]);
      if (notifRes.success) {
        setNotifications(notifRes.notifications || []);
      }
      if (emailRes.success) {
        setEmails(emailRes.emails || []);
        if (emailRes.userEmail) {
          setUserEmail(emailRes.userEmail);
          setComposeTo(emailRes.userEmail);
        }
      }
    } catch (err) {
      console.error('Failed to load notifications/emails:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
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
    } catch {
      error('Failed to mark all as read.');
    }
  };

  const handleSendDigestEmail = async () => {
    setSendingEmail(true);
    try {
      const res = await api.sendTestEmail(userEmail || undefined);
      if (res.success && res.email) {
        setEmails((prev) => [res.email, ...prev]);
        setPreviewEmail(res.email);
        setActiveTab('EMAILS');
        success(res.message || 'Match Digest email dispatched!');
      }
    } catch (err: any) {
      error(err.message || 'Could not dispatch digest email.');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSendPassportEmail = async () => {
    setSendingEmail(true);
    try {
      const res = await api.sendPassportEmail(userEmail || undefined);
      if (res.success && res.email) {
        setEmails((prev) => [res.email, ...prev]);
        setPreviewEmail(res.email);
        setActiveTab('EMAILS');
        success(res.message || 'Accommodation Passport emailed!');
      }
    } catch (err: any) {
      error(err.message || 'Could not dispatch Accommodation Passport email.');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSendComposeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeSubject.trim() || !composeBody.trim()) return;
    setSendingEmail(true);
    try {
      const res = await api.sendCustomEmail({
        toEmail: composeTo.trim() || userEmail,
        subject: composeSubject.trim(),
        messageBody: composeBody.trim(),
      });
      if (res.success && res.email) {
        setEmails((prev) => [res.email, ...prev]);
        setComposeOpen(false);
        setPreviewEmail(res.email);
        setActiveTab('EMAILS');
        success(res.message || 'Email dispatched!');
      }
    } catch (err: any) {
      error(err.message || 'Failed to send email.');
    } finally {
      setSendingEmail(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'INTERVIEW_SCHEDULED':
        return <CalendarDays className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'APPLICATION_STATUS_CHANGED':
        return <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'NEW_JOB_MATCH':
      case 'JOB_MATCH_FOUND':
        return <Sparkles className="w-4 h-4 text-brand-600 dark:text-indigo-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500 dark:text-slate-400" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-brand-600 dark:text-indigo-400 mb-1">
            <Mail className="w-4 h-4" />
            <span>Notifications &amp; Verified Email Vault</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Alerts &amp; Email Dispatch Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time application updates and full HTML emails dispatched to{' '}
            <strong className="text-slate-800 dark:text-slate-200">{userEmail || 'your inbox'}</strong>.
          </p>
        </div>

        {/* Quick Email Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSendDigestEmail}
            disabled={sendingEmail}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Email Me 90%+ Match Digest</span>
          </button>
          <button
            type="button"
            onClick={handleSendPassportEmail}
            disabled={sendingEmail}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-bold transition-colors disabled:opacity-50"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Email Accommodation Passport</span>
          </button>
          <button
            type="button"
            onClick={() => setComposeOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Compose Email</span>
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('ALERTS')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ALERTS'
                ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>In-App Alerts ({notifications.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('EMAILS')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'EMAILS'
                ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Sent &amp; Received Emails ({emails.length})</span>
          </button>
        </div>

        {activeTab === 'ALERTS' && notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-indigo-400 hover:text-brand-700 bg-brand-50 dark:bg-indigo-950/50 px-3 py-1.5 rounded-xl border border-brand-200/60 dark:border-indigo-800"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSkeleton count={4} height="h-20" />
      ) : activeTab === 'ALERTS' ? (
        notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="All caught up!"
            description="You have no notifications. When your applications advance or interviews are scheduled, alerts will appear here."
          />
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-subtle divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
            {notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleMarkAsRead(n._id)}
                className={`p-5 flex items-start gap-4 transition-colors cursor-pointer ${
                  n.read
                    ? 'hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
                    : 'bg-brand-50/30 dark:bg-indigo-950/30 hover:bg-brand-50/50 dark:hover:bg-indigo-950/50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{n.title}</span>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-brand-600 dark:bg-indigo-400 inline-block" />
                      )}
                    </h3>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{n.message}</p>
                  {n.linkUrl && (
                    <Link
                      to={n.linkUrl}
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-indigo-400 hover:text-brand-700 pt-1"
                    >
                      <span>Open destination</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : emails.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No emails logged yet"
          description="Send a 90%+ Job Match Digest or Accommodation Passport to your email to preview it here."
          actionText="Send Test Digest Email Now"
          onAction={handleSendDigestEmail}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-subtle divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
          {emails.map((item, idx) => (
            <div
              key={item._id || idx}
              onClick={() => setPreviewEmail(item)}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800 flex items-center justify-center text-brand-600 dark:text-indigo-400 shrink-0 mt-0.5">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {item.category || 'TRANSACTIONAL'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> {item.status || 'DELIVERED'} to {item.toEmail}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.subject}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{item.textBody}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[11px] text-slate-400">
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Just now'}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewEmail(item);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-600 hover:text-white text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View HTML Email</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compose Direct Email Modal */}
      {composeOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-brand-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Compose Neuro-Affirming Email
                </h3>
              </div>
              <button
                onClick={() => setComposeOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendComposeEmail} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Recipient Email Address
                </label>
                <input
                  type="email"
                  required
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="hiring@company.com or your own email"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  required
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Message Body
                </label>
                <textarea
                  rows={5}
                  required
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setComposeOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sendingEmail ? 'Sending...' : 'Dispatch HTML Email'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HTML Email Preview Modal */}
      <EmailPreviewModal
        email={previewEmail}
        isOpen={!!previewEmail}
        onClose={() => setPreviewEmail(null)}
        onResendToAddress={async (targetEmail) => {
          const res = await api.sendTestEmail(targetEmail);
          if (res.success && res.email) {
            setEmails((prev) => [res.email, ...prev]);
            setPreviewEmail(res.email);
            success(`Dispatched email copy to ${targetEmail}!`);
          }
        }}
      />
    </div>
  );
};
