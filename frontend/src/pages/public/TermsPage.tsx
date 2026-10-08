import React from 'react';
import { FileText } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <FileText className="w-4 h-4" />
          <span>Platform Agreement</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Terms of Service</h1>
        <p className="text-xs text-slate-500">Last updated: October 2026</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-subtle space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Neurodivergent Career Exchange platform, you agree to comply with and be
            bound by these Terms of Service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. No Medical or Diagnostic Advice</h2>
          <p>
            The assessments and matching algorithms provided on this platform are designed strictly for career
            preference guidance and workplace fit. They do not constitute a medical diagnosis, clinical evaluation,
            or psychological assessment.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Employer Code of Conduct</h2>
          <p>
            Employers using this platform pledge to respect candidate accommodations, adhere to non-discriminatory
            hiring practices, and maintain predictable, clear communication throughout the interview process.
          </p>
        </section>
      </div>
    </div>
  );
};
