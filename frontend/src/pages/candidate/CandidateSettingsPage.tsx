import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useAccessibility } from '../../context/AccessibilityContext.js';
import { useToast } from '../../context/ToastContext.js';
import {
  Settings,
  Sliders,
  ShieldCheck,
  Bell,
  Lock,
  User,
  Eye,
  Type,
  Zap,
  Save,
  RotateCcw,
} from 'lucide-react';

export const CandidateSettingsPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { settings, updateSetting, resetSettings } = useAccessibility();
  const { success } = useToast();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [interviewReminders, setInterviewReminders] = useState(true);
  const [matchNotifications, setMatchNotifications] = useState(true);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    success('Notification & accessibility preferences saved!');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Settings & Preferences</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your sensory ergonomics, privacy controls, and account information.
        </p>
      </div>

      <form onSubmit={handleSavePreferences} className="space-y-6">
        {/* Sensory & Accessibility Settings Panel */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Sensory & Display Controls</h2>
                <p className="text-xs text-slate-500">Fine-tune your cognitive ergonomics</p>
              </div>
            </div>
            <button
              type="button"
              onClick={resetSettings}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Reduced Motion */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-brand-600" />
                  Reduced Motion
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">Disables slide animations and transitions</p>
              </div>
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
            </div>

            {/* High Contrast */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-600" />
                  High Contrast Mode
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">Increases card borders and font contrast</p>
              </div>
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={(e) => updateSetting('highContrast', e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Font Sizing */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 block flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-brand-600" />
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
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Density */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 block">Content Density</span>
            <div className="grid grid-cols-2 gap-2">
              {(['comfortable', 'compact'] as const).map((dn) => (
                <button
                  key={dn}
                  type="button"
                  onClick={() => updateSetting('density', dn)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize transition-all ${
                    settings.density === dn
                      ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {dn}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Notification Preferences</h2>
              <p className="text-xs text-slate-500">Choose when and how you receive alerts</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 block">Interview Schedule Reminders</span>
                <span className="text-slate-500">Receive advance reminders with agenda links</span>
              </div>
              <input
                type="checkbox"
                checked={interviewReminders}
                onChange={(e) => setInterviewReminders(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 block">High-Score Job Drops (90%+ Match)</span>
                <span className="text-slate-500">Get notified when high-fit accommodated roles open</span>
              </div>
              <input
                type="checkbox"
                checked={matchNotifications}
                onChange={(e) => setMatchNotifications(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600"
              />
            </label>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Account Credentials</h2>
              <p className="text-xs text-slate-500">Your secure authentication parameters</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-semibold text-slate-500 block mb-1">Email Address</span>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 font-mono">
                {user?.email}
              </div>
            </div>
            <div>
              <span className="font-semibold text-slate-500 block mb-1">Account Role</span>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 font-bold">
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
    </div>
  );
};
