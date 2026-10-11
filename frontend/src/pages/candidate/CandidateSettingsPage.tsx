import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useAccessibility } from '../../context/AccessibilityContext.js';
import { useToast } from '../../context/ToastContext.js';
import { api } from '../../services/api.js';
import { EmailPreviewModal, EmailLogItem } from '../../components/common/EmailPreviewModal.js';
import {
  Sliders,
  Bell,
  User,
  Eye,
  Type,
  Zap,
  Save,
  RotateCcw,
  Mail,
  Send,
  ShieldCheck,
  Moon,
  Sun,
} from 'lucide-react';

export const CandidateSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { settings, updateSetting, resetSettings, theme, toggleTheme } = useAccessibility();
  const { success, error } = useToast();

  const [recipientEmail, setRecipientEmail] = useState(user?.email || '');
  const [interviewReminders, setInterviewReminders] = useState(true);
  const [matchNotifications, setMatchNotifications] = useState(true);
  const [applicationEmails, setApplicationEmails] = useState(true);
  const [sendingTest, setSendingTest] = useState(false);
  const [sendingPassport, setSendingPassport] = useState(false);
  const [previewEmail, setPreviewEmail] = useState<EmailLogItem | null>(null);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(
      'nce_email_preferences',
      JSON.stringify({
        recipientEmail: recipientEmail || user?.email,
        interviewReminders,
        matchNotifications,
        applicationEmails,
      })
    );
    success('Email delivery & cognitive accessibility preferences saved!');
  };

  const handleSendTestEmail = async () => {
    setSendingTest(true);
    try {
      const target = (recipientEmail || user?.email || '').trim();
      const res = await api.sendTestEmail(target || undefined);
      if (res.success && res.email) {
        setPreviewEmail(res.email);
        success(res.message || `Test digest email sent to ${target}!`);
      }
    } catch (err: any) {
      error(err.message || 'Failed to send test email.');
    } finally {
      setSendingTest(false);
    }
  };

  const handleSendPassportEmail = async () => {
    setSendingPassport(true);
    try {
      const target = (recipientEmail || user?.email || '').trim();
      const res = await api.sendPassportEmail(target || undefined);
      if (res.success && res.email) {
        setPreviewEmail(res.email);
        success(res.message || `Accommodation Passport sent to ${target}!`);
      }
    } catch (err: any) {
      error(err.message || 'Failed to send Accommodation Passport email.');
    } finally {
      setSendingPassport(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Settings, Ergonomics &amp; Email Delivery
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your sensory ergonomics, dark/light appearance, email dispatch address, and privacy controls.
        </p>
      </div>

      <form onSubmit={handleSavePreferences} className="space-y-6">
        {/* Sensory & Accessibility Settings Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-subtle space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-indigo-950/60 text-brand-600 dark:text-indigo-400 flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Sensory &amp; Display Controls
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Fine-tune your visual &amp; cognitive ergonomics
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={resetSettings}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Dark Mode Toggle */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  {theme === 'dark' ? (
                    <Moon className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  Night / Dark Mode
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Low-glare dark slate palette
                </p>
              </div>
              <input
                type="checkbox"
                checked={theme === 'dark'}
                onChange={toggleTheme}
                className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-brand-600 focus:ring-brand-500"
              />
            </div>

            {/* Reduced Motion */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-brand-600 dark:text-indigo-400" />
                  Reduced Motion
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Disables parallax &amp; motion effects
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-brand-600 focus:ring-brand-500"
              />
            </div>

            {/* High Contrast */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  High Contrast Mode
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Stronger borders and text contrast
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={(e) => updateSetting('highContrast', e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-brand-600 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Font Sizing */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-brand-600 dark:text-indigo-400" />
              Font Size Scaling
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['standard', 'medium', 'large'] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => updateSetting('fontSize', sz)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize transition-all ${
                    settings.fontSize === sz
                      ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                      : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Density */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Content Density
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(['comfortable', 'compact'] as const).map((dn) => (
                <button
                  key={dn}
                  type="button"
                  onClick={() => updateSetting('density', dn)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize transition-all ${
                    settings.density === dn
                      ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                      : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {dn}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Verified Email Delivery & Dispatch Controls */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-subtle space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Email Notification &amp; Dispatch Settings
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Receive HTML interview packets, accommodation passports, and 90%+ match digests
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={sendingTest}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sendingTest ? 'Dispatching...' : 'Send Test Digest Email'}</span>
              </button>
              <button
                type="button"
                onClick={handleSendPassportEmail}
                disabled={sendingPassport}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-50"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{sendingPassport ? 'Sending...' : 'Email My Passport'}</span>
              </button>
            </div>
          </div>

          {/* Delivery Email Address Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Primary Delivery Email Address
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder={user?.email || 'your.email@example.com'}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              All 48-hour advance interview agendas, application receipts, and accommodation passports are sent here and archived in your NCE Email Vault.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  48-Hour Advance Interview Agenda &amp; Question Packets
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  Automatically email written interview questions &amp; sensory break schedules
                </span>
              </div>
              <input
                type="checkbox"
                checked={interviewReminders}
                onChange={(e) => setInterviewReminders(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  High-Score Job Drops (90%+ Cognitive &amp; Sensory Match)
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  Receive weekly HTML digests when high-fit accommodated roles open
                </span>
              </div>
              <input
                type="checkbox"
                checked={matchNotifications}
                onChange={(e) => setMatchNotifications(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Instant Application &amp; Accommodation Confirmation Receipts
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  Email a copy of your submitted accommodations whenever you apply to a role
                </span>
              </div>
              <input
                type="checkbox"
                checked={applicationEmails}
                onChange={(e) => setApplicationEmails(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600"
              />
            </label>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-subtle space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Account Credentials</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your authenticated session identity
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Registered Email Address
              </span>
              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono">
                {user?.email}
              </div>
            </div>
            <div>
              <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Account Role
              </span>
              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold">
                {user?.role}
              </div>
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-card transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

      {/* HTML Email Preview Modal */}
      <EmailPreviewModal
        email={previewEmail}
        isOpen={!!previewEmail}
        onClose={() => setPreviewEmail(null)}
        onResendToAddress={async (targetEmail) => {
          const res = await api.sendTestEmail(targetEmail);
          if (res.success && res.email) {
            setPreviewEmail(res.email);
            success(`Dispatched email copy to ${targetEmail}!`);
          }
        }}
      />
    </div>
  );
};
