import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { Sparkles, ArrowRight, Lock, Mail, User, Building2, ShieldAlert } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      success('Welcome back!');
      if (redirect) {
        navigate(redirect);
      } else {
        // Redirection based on role is handled by caller or state
        navigate('/');
      }
    } catch (err: any) {
      error(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string, role: string) => {
    setSubmitting(true);
    try {
      await login(demoEmail, 'Demo@2026!');
      success(`Signed in as Demo ${role}!`);
      if (role === 'Candidate') navigate('/candidate/dashboard');
      else if (role === 'Employer') navigate('/employer/dashboard');
      else if (role === 'Admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err: any) {
      error(err.message || 'Failed to authenticate demo user.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-subtle">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign in to your account</h2>
          <p className="text-xs text-slate-500">
            Or{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
              create a free strengths profile
            </Link>
          </p>
        </div>

        {/* 1-Click Demo Accounts Box */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100/80 space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 block">
            Instant Demo Sign-In (1-Click)
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleQuickDemoLogin('candidate@demo.com', 'Candidate')}
              className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-white hover:bg-brand-50 border border-indigo-200/70 text-slate-800 text-[11px] font-semibold transition-colors shadow-xs"
            >
              <User className="w-4 h-4 text-brand-600 mb-0.5" />
              <span>Candidate</span>
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleQuickDemoLogin('employer@demo.com', 'Employer')}
              className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-white hover:bg-teal-50 border border-teal-200/70 text-slate-800 text-[11px] font-semibold transition-colors shadow-xs"
            >
              <Building2 className="w-4 h-4 text-teal-600 mb-0.5" />
              <span>Employer</span>
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleQuickDemoLogin('admin@demo.com', 'Admin')}
              className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-[11px] font-semibold transition-colors shadow-xs"
            >
              <ShieldAlert className="w-4 h-4 text-indigo-700 mb-0.5" />
              <span>Admin</span>
            </button>
          </div>
          <span className="text-[10px] text-slate-500 block text-center">
            Demo password: <code className="bg-white/80 px-1 py-0.5 rounded">Demo@2026!</code>
          </span>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="email-input">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700" htmlFor="password-input">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                id="password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm py-3 rounded-xl shadow-card transition-colors disabled:opacity-50"
          >
            {submitting ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
