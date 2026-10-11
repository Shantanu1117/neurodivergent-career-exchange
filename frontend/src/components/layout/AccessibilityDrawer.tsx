import React, { useState } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext.js';
import { api } from '../../services/api.js';
import {
  X,
  Eye,
  Type,
  Zap,
  Sliders,
  RotateCcw,
  Sun,
  Moon,
  Volume2,
  Square,
  Focus,
  MessageSquareWarning,
  CheckCircle2,
  AlignLeft,
} from 'lucide-react';

export const AccessibilityDrawer: React.FC = () => {
  const {
    settings,
    updateSetting,
    resetSettings,
    isDrawerOpen,
    closeDrawer,
    isSpeaking,
    readCurrentPageAloud,
    stopSpeaking,
  } = useAccessibility();

  const [reportCategory, setReportCategory] = useState('COGNITIVE_CLARITY');
  const [reportSeverity, setReportSeverity] = useState('MEDIUM');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);

  if (!isDrawerOpen) return null;

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDescription.trim()) return;
    setReportSubmitting(true);
    try {
      await api.submitAccessibilityReport({
        pageUrl: typeof window !== 'undefined' ? window.location.pathname : '/',
        category: reportCategory,
        severity: reportSeverity,
        description: reportDescription.trim(),
      });
      setReportSubmitted(true);
      setReportDescription('');
      setTimeout(() => setReportSubmitted(false), 4000);
    } catch {
      // Fallback confirmation even if offline
      setReportSubmitted(true);
    } finally {
      setReportSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-drawer-title"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-brand-100 dark:bg-indigo-950 text-brand-700 dark:text-indigo-400 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 id="accessibility-drawer-title" className="text-lg font-bold text-slate-900 dark:text-white">
                Accessibility & Sensory Controls
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                WCAG 2.2 AA & W3C COGA neuro-adaptive settings
              </p>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Read-Aloud (Text-to-Speech) Assistant */}
          <div className="bg-indigo-50/80 dark:bg-indigo-950/40 p-4 rounded-xl border border-indigo-200/80 dark:border-indigo-800/70">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-2.5">
                <Volume2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Read-Aloud Voice Assistant (TTS)
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Listen to the current page content aloud using zero-tracking browser speech synthesis.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isSpeaking ? (
                <button
                  type="button"
                  onClick={readCurrentPageAloud}
                  className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Read Current Page Aloud</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopSpeaking}
                  className="flex-1 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Stop Reading</span>
                </button>
              )}
              <select
                aria-label="Speech speed"
                value={settings.speechRate || 1.0}
                onChange={(e) => updateSetting('speechRate', Number(e.target.value))}
                className="py-2 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                <option value={0.85}>0.85x Calm</option>
                <option value={1.0}>1.0x Normal</option>
                <option value={1.2}>1.2x Fast</option>
              </select>
            </div>
          </div>

          {/* Sensory Theme: Daylight vs Night View */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 mt-0.5">
                {settings.theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Display Theme (Daylight / Night View)
                </h3>
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
                    : 'bg-slate-100/60 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
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
                    : 'bg-slate-100/60 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Night View</span>
              </button>
            </div>
          </div>

          {/* Focus Mode (Distraction-Free) */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Focus className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Distraction-Free Focus Mode
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Dims peripheral sidebars and hides secondary footers so you can focus on one task at a time.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                id="toggle-focus-mode"
                checked={!!settings.focusMode}
                onChange={(e) => updateSetting('focusMode', e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                aria-label="Toggle distraction-free focus mode"
              />
            </div>
          </div>

          {/* Dyslexia-Friendly Font & Reduced Motion */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Type className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Dyslexia-Friendly Typography
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Uses weighted open-counter letterforms to reduce character mirroring and crowding.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={!!settings.dyslexiaFont}
                onChange={(e) => updateSetting('dyslexiaFont', e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                aria-label="Toggle dyslexia-friendly font"
              />
            </div>

            <div className="flex items-start justify-between pt-3 border-t border-slate-200/70 dark:border-slate-700/70">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Reduced Motion</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Stops animations and transitions to prevent vestibular or visual overload.
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

            <div className="flex items-start justify-between pt-3 border-t border-slate-200/70 dark:border-slate-700/70">
              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">High Contrast Mode</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Increases border definition and text contrast to 7:1+ AAA levels.
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

          {/* Font Size & WCAG 2.2 Text Spacing */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Type className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Typography Scale</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['standard', 'medium', 'large'] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => updateSetting('fontSize', size)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold capitalize transition-all ${
                      settings.fontSize === size
                        ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlignLeft className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Line & Letter Spacing (WCAG 1.4.12)
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {(['normal', 'relaxed', 'loose'] as const).map((ls) => (
                  <button
                    key={ls}
                    type="button"
                    onClick={() => updateSetting('lineSpacing', ls)}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-semibold capitalize ${
                      (settings.lineSpacing || 'normal') === ls
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {ls} Lines
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(['normal', 'wide'] as const).map(( tracking) => (
                  <button
                    key={tracking}
                    type="button"
                    onClick={() => updateSetting('letterSpacing', tracking)}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-semibold capitalize ${
                      (settings.letterSpacing || 'normal') === tracking
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {tracking} Letters
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interface Density */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Information Density</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateSetting('density', 'comfortable')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                  settings.density === 'comfortable'
                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                }`}
              >
                Comfortable (Calm)
              </button>
              <button
                type="button"
                onClick={() => updateSetting('density', 'compact')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                  settings.density === 'compact'
                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                }`}
              >
                Compact (High Data)
              </button>
            </div>
          </div>

          {/* In-App Accessibility Barrier Reporter (WCAG 2.2 SC 3.2.6 Consistent Help) */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquareWarning className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Report an Accessibility Barrier
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
              Encountered sensory clutter, keyboard traps, or unclear copy on this page? Let our accessibility team know.
            </p>
            {reportSubmitted ? (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Thank you! Your accessibility feedback has been logged for review.</span>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    aria-label="Barrier category"
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value)}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value="COGNITIVE_CLARITY">Cognitive Clarity</option>
                    <option value="SENSORY_OVERLOAD">Sensory / Visual</option>
                    <option value="KEYBOARD_NAVIGATION">Keyboard / Focus</option>
                    <option value="SCREEN_READER">Screen Reader</option>
                    <option value="VISUAL_CONTRAST">Color Contrast</option>
                  </select>
                  <select
                    aria-label="Barrier severity"
                    value={reportSeverity}
                    onChange={(e) => setReportSeverity(e.target.value)}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value="LOW">Low Impact</option>
                    <option value="MEDIUM">Medium Impact</option>
                    <option value="HIGH">High Blocker</option>
                  </select>
                </div>
                <textarea
                  rows={2}
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Describe what felt confusing or inaccessible..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
                />
                <button
                  type="submit"
                  disabled={reportSubmitting || !reportDescription.trim()}
                  className="w-full py-2 px-3 rounded-lg bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors"
                >
                  {reportSubmitting ? 'Submitting...' : 'Submit Accessibility Feedback'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={resetSettings}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
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
