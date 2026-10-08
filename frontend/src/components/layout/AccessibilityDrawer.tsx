import React from 'react';
import { useAccessibility } from '../../context/AccessibilityContext.js';
import { X, Eye, Type, Zap, Sliders, RotateCcw, Sun, Moon } from 'lucide-react';

export const AccessibilityDrawer: React.FC = () => {
  const { settings, updateSetting, resetSettings, isDrawerOpen, closeDrawer } = useAccessibility();

  if (!isDrawerOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-drawer-title"
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-brand-100 dark:bg-indigo-950 text-brand-700 dark:text-indigo-400 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 id="accessibility-drawer-title" className="text-lg font-bold text-slate-900 dark:text-white">
                Accessibility & Sensory Preferences
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Customize display to match your sensory flow</p>
            </div>
          </div>
          <button
            onClick={closeDrawer}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close accessibility controls"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Sensory Theme: Daylight vs Night View */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 mt-0.5">
                {settings.theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Display Theme (Daylight / Night View)</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Toggle between soft daylight mode and sensory-friendly dark mode to minimize ocular glare.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => updateSetting('theme', 'light')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  settings.theme === 'light'
                    ? 'bg-white border-brand-600 text-brand-700 shadow-sm'
                    : 'bg-slate-100/60 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light Mode</span>
              </button>
              <button
                type="button"
                onClick={() => updateSetting('theme', 'dark')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  settings.theme === 'dark'
                    ? 'bg-slate-900 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500'
                    : 'bg-slate-100/60 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Night View</span>
              </button>
            </div>
          </div>

          {/* Reduced Motion */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Reduced Motion</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Disables all smooth transitions and sliding animations to reduce visual stimulation.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                id="toggle-reduced-motion"
                checked={settings.reducedMotion}
                onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                aria-label="Toggle reduced motion"
              />
            </div>
          </div>

          {/* High Contrast */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">High Contrast Mode</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Sharpens borders to solid high-definition lines and increases text contrast to 7:1+.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                id="toggle-high-contrast"
                checked={settings.highContrast}
                onChange={(e) => updateSetting('highContrast', e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                aria-label="Toggle high contrast mode"
              />
            </div>
          </div>

          {/* Font Size Scaling */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-start gap-3 mb-3">
              <Type className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Typography Scale</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Adjust base text sizing across all dashboards and listings for enhanced readability.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['standard', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => updateSetting('fontSize', size)}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold capitalize transition-all ${
                    settings.fontSize === size
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Interface Density */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-start gap-3 mb-3">
              <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Information Density</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Comfortable spacing introduces generous breathing room between cards to reduce sensory overwhelm.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateSetting('density', 'comfortable')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                  settings.density === 'comfortable'
                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Comfortable (Calm)
              </button>
              <button
                onClick={() => updateSetting('density', 'compact')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                  settings.density === 'compact'
                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Compact (High Data)
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <button
            onClick={resetSettings}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={closeDrawer}
            className="bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
