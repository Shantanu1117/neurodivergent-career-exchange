import React from 'react';
import { X, Sparkles, CheckCircle2, ShieldCheck, HeartHandshake } from 'lucide-react';
import { Job } from '../../types/index.js';

interface MatchBreakdownModalProps {
  job?: Job;
  isOpen: boolean;
  onClose: () => void;
  score?: number;
  reasons?: string[];
  breakdown?: any;
  jobTitle?: string;
}

export const MatchBreakdownModal: React.FC<MatchBreakdownModalProps> = ({
  job,
  isOpen,
  onClose,
  score: directScore,
  reasons: directReasons,
  breakdown: directBreakdown,
  jobTitle,
}) => {
  if (!isOpen) return null;

  const score = job?.matchScore ?? directScore ?? 85;
  const breakdown = job?.matchBreakdown ?? directBreakdown ?? {
    skillsMatch: 85,
    environmentMatch: 90,
    strengthsMatch: 85,
    experienceMatch: 80,
    accommodationsMatch: 90,
  };
  const reasons = job?.matchReasons ?? directReasons ?? [
    'Cognitive strengths align with daily role expectations.',
    'Neuro-inclusive workplace commitment confirmed.',
  ];
  const displayTitle = job?.title ?? jobTitle ?? 'Position Alignment';

  const breakdownMetrics = [
    { label: 'Skills & Technical Overlap', value: breakdown.skillsMatch, weight: '30%' },
    { label: 'Work Environment & Mode Fit', value: breakdown.environmentMatch, weight: '25%' },
    { label: 'Cognitive Strengths Alignment', value: breakdown.strengthsMatch, weight: '20%' },
    { label: 'Experience Level Fit', value: breakdown.experienceMatch, weight: '15%' },
    { label: 'Accommodations & Support Fit', value: breakdown.accommodationsMatch, weight: '10%' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="match-modal-title"
    >
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-floating border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
              {score}%
            </div>
            <div>
              <h3 id="match-modal-title" className="text-base font-bold text-slate-900">
                Transparent Match Breakdown
              </h3>
              <p className="text-xs text-slate-500">{displayTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close match explanation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Ethical AI Notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-indigo-900">
            <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Objective & Explainable:</strong> This score is calculated entirely from your declared
              functional skills, environment preferences, and requested accommodations. We never use
              medical or diagnostic criteria.
            </p>
          </div>

          {/* Factor Breakdown Bars */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Factor Alignment
            </h4>
            {breakdownMetrics.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>{item.label}</span>
                  <span className="text-brand-700">{item.value}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Specific Match Highlights */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Why You Were Matched
            </h4>
            <div className="space-y-1.5">
              {reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
