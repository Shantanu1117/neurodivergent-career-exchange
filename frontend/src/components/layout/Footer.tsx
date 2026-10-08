import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, HeartHandshake, Eye } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-base">Neurodivergent Career Exchange</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strengths-first career discovery connecting autistic, ADHD, and neurodivergent professionals
              with neuro-inclusive employers.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> Voluntary Privacy
              </span>
              <span className="flex items-center gap-1">
                <HeartHandshake className="w-3.5 h-3.5 text-brand-400" /> Strengths-First
              </span>
            </div>
          </div>

          {/* Candidates */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">For Candidates</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/candidate/assessment" className="hover:text-white transition-colors">
                  18-Question Career Fit Assessment
                </Link>
              </li>
              <li>
                <Link to="/jobs" className="hover:text-white transition-colors">
                  Search Accommodated Jobs
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  "How I Work Best" Canvas
                </Link>
              </li>
              <li>
                <Link to="/placed-candidates" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Placed Talent & Success Stories</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold">New</span>
                </Link>
              </li>
              <li>
                <Link to="/resources" className="hover:text-white transition-colors">
                  Career Learning Guides
                </Link>
              </li>
            </ul>
          </div>

          {/* Employers */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">For Employers</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/register?role=EMPLOYER" className="hover:text-white transition-colors">
                  Post Neuro-Inclusive Jobs
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Recruiter Portal
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  Predictable Hiring Framework
                </Link>
              </li>
              <li>
                <Link to="/resources" className="hover:text-white transition-colors">
                  Sensory Workplace Accommodations
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Ethics */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">Trust & Principles</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy & Diagnosis Protection
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Neurodiversity Affirming Pledge
                </Link>
              </li>
              <li className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-[11px] text-slate-300 border border-slate-700">
                  <Eye className="w-3 h-3 text-indigo-400" /> WCAG 2.1 AA Compliant
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Neurodivergent Career Exchange. All rights reserved.</p>
          <p className="text-center sm:text-right">
            Designed for human cognitive diversity. No medical diagnostic claims made.
          </p>
        </div>
      </div>
    </footer>
  );
};
