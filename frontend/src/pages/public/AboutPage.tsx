import React from 'react';
import { ShieldCheck, HeartHandshake, Eye } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 lg:py-16 space-y-12">
      <div data-gsap="fade-up" className="text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-indigo-400">
          Our Mission
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Neurodiversity is Not a Deficit to be Fixed.
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
          It is an indispensable dimension of human cognition that fuels technological breakthroughs,
          rigorous quality assurance, and resilient systems design.
        </p>
      </div>

      <div
        data-gsap="scale-in"
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-subtle space-y-6 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed transition-colors"
      >
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Why We Built This Exchange</h2>
        <p>
          Traditional recruiting pipelines are heavily biased toward extroversion, ambiguous conversational
          jargon, and unwritten social rules. As a result, millions of exceptionally capable autistic and ADHD
          professionals are screened out before they ever have the chance to demonstrate their technical
          superpowers.
        </p>
        <p>
          We created the <strong>Neurodivergent Career Exchange</strong> to dismantle these systemic barriers.
          By replacing subjective social screens with objective, task-based assessments and guaranteed workplace
          accommodations, we enable candidates to showcase their actual capabilities and flourish.
        </p>

        <div
          data-gsap="stagger-parent"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800"
        >
          <div
            data-gsap-item
            data-gsap-tilt="7"
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700 space-y-2 will-change-transform"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-xs">Voluntary Privacy</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Zero requirement to disclose diagnosis. We focus solely on functional strengths and workplace needs.
            </p>
          </div>
          <div
            data-gsap-item
            data-gsap-tilt="7"
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700 space-y-2 will-change-transform"
          >
            <HeartHandshake className="w-5 h-5 text-brand-600 dark:text-indigo-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-xs">Strengths-First</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              We champion hyperfocus, edge-case testing, anomaly detection, and deep mathematical precision.
            </p>
          </div>
          <div
            data-gsap-item
            data-gsap-tilt="7"
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700 space-y-2 will-change-transform"
          >
            <Eye className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-xs">Predictability</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Clear interview agendas, interviewer backgrounds, and written questions provided in advance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
