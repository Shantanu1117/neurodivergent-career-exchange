import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600">
          <ShieldCheck className="w-4 h-4" />
          <span>Privacy & Diagnosis Protection</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Privacy Policy & Voluntary Disclosure Principles
        </h1>
        <p className="text-xs text-slate-500">Last updated: October 2026</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-subtle space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Core Privacy Principle: Zero Mandatory Disclosure</h2>
          <p>
            You are <strong>never</strong> required to disclose a formal medical diagnosis (such as Autism, ADHD,
            Dyslexia, Tourette's, or any other condition) to use the Neurodivergent Career Exchange. All profiling,
            job matching, and recommendation algorithms operate entirely on your self-declared functional skills,
            cognitive preferences, and requested workplace adjustments.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Control Over "How I Work Best" Visibility</h2>
          <p>
            You maintain granular control over what employers can see. You may choose to make your workplace
            support preferences visible to all verified employers, or only share them with employers where you have
            submitted an active application.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Data Security & Storage</h2>
          <p>
            All user credentials, authentication tokens, and profile data are stored with industry-standard
            encryption (bcrypt password hashing, TLS 1.3 in transit, and JWT token authorization). We do not sell,
            rent, or monetize your profile information to third-party data brokers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">4. Right to Deletion & Portability</h2>
          <p>
            You can delete or export your candidate profile, assessment records, and application history at any
            time directly from your account settings.
          </p>
        </section>
      </div>
    </div>
  );
};
