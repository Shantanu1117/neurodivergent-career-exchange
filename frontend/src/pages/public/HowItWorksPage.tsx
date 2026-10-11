import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Briefcase,
  FileCheck2,
  CalendarDays,
  Building2,
  Users,
  ArrowRight,
  HeartHandshake,
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-16">
      {/* Header */}
      <div data-gsap="fade-up" className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-indigo-400">
          Transparent Methodology
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          How the Neurodivergent Career Exchange Works
        </h1>
        <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Traditional hiring was built for neurotypical social signaling: unstructured interviews, small talk,
          and ambiguous social cues. We replace subjective barriers with objective, task-based clarity.
        </p>
      </div>

      {/* For Candidates Section */}
      <div className="space-y-8">
        <div
          data-gsap="fade-up"
          className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800"
        >
          <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-indigo-950 text-brand-700 dark:text-indigo-300 flex items-center justify-center font-bold">
            1
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">The Candidate Journey</h2>
        </div>

        <div data-gsap="stagger-parent" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            data-gsap-item
            data-gsap-tilt="7"
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-3 will-change-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-indigo-950 text-brand-600 dark:text-indigo-400 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              1. Strengths & "How I Work Best"
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Define your cognitive superpowers (deep focus, edge-case verification, pattern recognition)
              and communication preferences without medical disclosure.
            </p>
          </div>

          <div
            data-gsap-item
            data-gsap-tilt="7"
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-3 will-change-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">2. Interactive Assessment</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Take the 18-question cognitive alignment assessment to evaluate affinity across QA Automation,
              Cybersecurity, Data Audit, and Systems Development.
            </p>
          </div>

          <div
            data-gsap-item
            data-gsap-tilt="7"
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-3 will-change-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">3. Transparent Job Matches</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Every job card shows a calculated match score and transparent breakdown across skills, work
              environment, and guaranteed accommodations.
            </p>
          </div>

          <div
            data-gsap-item
            data-gsap-tilt="7"
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-3 will-change-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <CalendarDays className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">4. Predictable Interviews</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Receive agendas, interviewer bios, and questions in advance. Zero surprise phone calls or
              stress testing.
            </p>
          </div>
        </div>
      </div>

      {/* For Employers Section */}
      <div className="space-y-8">
        <div
          data-gsap="fade-up"
          className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold">
            2
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            The Employer & Recruiter Framework
          </h2>
        </div>

        <div data-gsap="stagger-parent" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            data-gsap-item
            data-gsap-tilt="7"
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-3 will-change-transform"
          >
            <Building2 className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Inclusive Job Authoring</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Specify guaranteed workplace accommodations right on the posting (written instructions,
              camera-optional meetings, quiet focus blocks) to signal psychological safety.
            </p>
          </div>

          <div
            data-gsap-item
            data-gsap-tilt="7"
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-3 will-change-transform"
          >
            <Users className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Strengths-First Discovery</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Filter candidates by proven cognitive aptitudes, technical stacks, and work mode alignment.
              Review anonymized "How I Work Best" canvases.
            </p>
          </div>

          <div
            data-gsap-item
            data-gsap-tilt="7"
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-3 will-change-transform"
          >
            <FileCheck2 className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Structured ATS Pipeline</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Manage applicant stages seamlessly. Provide predictable interview schedules with advance
              questions and confirmed accommodation checklists.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div
        data-gsap="scale-in"
        className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-4 border border-slate-800"
      >
        <h2 className="text-2xl sm:text-3xl font-extrabold">Ready to begin?</h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
          Start your strengths assessment or explore open positions right now.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/candidate/assessment"
            data-gsap-magnetic
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs px-6 py-3 rounded-xl transition-colors"
          >
            <span>Take Career Assessment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/jobs"
            data-gsap-magnetic
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs px-6 py-3 rounded-xl transition-colors"
          >
            <span>Browse Jobs</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
