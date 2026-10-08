import React from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useAccessibility } from '../../context/AccessibilityContext.js';
import { useToast } from '../../context/ToastContext.js';
import { Building2, Sliders, Bell, User, Save, RotateCcw } from 'lucide-react';

export const EmployerSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { settings, updateSetting, resetSettings } = useAccessibility();
  const { success } = useToast();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    success('Employer preferences saved successfully.');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Employer Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Manage recruitment preferences and account credentials.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Sensory Display Controls */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-600" />
              <h2 className="text-base font-bold text-slate-900">Accessibility Preferences</h2>
            </div>
            <button
              type="button"
              onClick={resetSettings}
              className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Reduced Motion</span>
                <span className="text-[11px] text-slate-500">Disable UI animation effects</span>
              </div>
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500"
              />
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">High Contrast Mode</span>
                <span className="text-[11px] text-slate-500">Sharpen text & borders</span>
              </div>
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={(e) => updateSetting('highContrast', e.target.checked)}
                className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Credentials */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <User className="w-4 h-4 text-slate-600" />
            <h2 className="text-base font-bold text-slate-900">Account Credentials</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-semibold text-slate-500 block mb-1">Company Login Email</span>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 font-mono">
                {user?.email}
              </div>
            </div>
            <div>
              <span className="font-semibold text-slate-500 block mb-1">Role Type</span>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 font-bold">
                {user?.role}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition-colors shadow-xs"
          >
            <Save className="w-4 h-4" /> Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};
