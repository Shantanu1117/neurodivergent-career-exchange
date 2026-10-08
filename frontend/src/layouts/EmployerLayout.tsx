import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useAccessibility } from '../context/AccessibilityContext.js';
import {
  Sparkles,
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  Users,
  FileText,
  Calendar,
  MessageSquare,
  Building2,
  Settings,
  LogOut,
  Sliders,
  Menu,
  X,
  ExternalLink,
  Moon,
  Sun,
} from 'lucide-react';

export const EmployerLayout: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const { toggleDrawer, theme, toggleTheme } = useAccessibility();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/employer/dashboard', icon: LayoutDashboard },
    { label: 'My Job Postings', path: '/employer/jobs', icon: Briefcase },
    { label: 'Post a New Job', path: '/employer/jobs/create', icon: PlusCircle },
    { label: 'Candidate Discovery', path: '/employer/candidates', icon: Users },
    { label: 'Applications Pipeline', path: '/employer/applications', icon: FileText },
    { label: 'Interviews Scheduled', path: '/employer/interviews', icon: Calendar },
    { label: 'Messages', path: '/employer/messages', icon: MessageSquare },
    { label: 'Company Profile', path: '/employer/profile', icon: Building2 },
    { label: 'Settings', path: '/employer/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors">
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-slate-900 dark:text-white">Employer Portal</span>
        </Link>
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title={theme === 'dark' ? 'Switch to Daylight View' : 'Switch to Night View'}
            aria-label="Toggle Night Mode"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle navigation"
          >
            {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 text-white flex items-center justify-center shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-900 dark:text-white block leading-tight">
                ND Career Exchange
              </span>
              <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                Recruiter Portal
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Employer Info */}
        <div className="p-4 mx-3 my-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-bold text-xs flex items-center justify-center shrink-0">
              {profile?.companyName ? profile.companyName.charAt(0) : 'E'}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {profile?.companyName || user?.email.split('@')[0]}
              </h4>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800 mt-0.5">
                Verified Neuro-Inclusive
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-50 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 font-semibold border-l-2 border-teal-600'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-1 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="grid grid-cols-5 gap-1.5">
            <button
              onClick={toggleDrawer}
              className="col-span-4 flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <Sliders className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Sensory Controls</span>
            </button>
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center p-2 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
              title={theme === 'dark' ? 'Switch to Daylight View' : 'Switch to Night View'}
              aria-label="Toggle Night View"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>
          <div className="flex items-center justify-between pt-1">
            <Link
              to="/jobs"
              className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 px-2 py-1"
            >
              Public Jobs <ExternalLink className="w-3 h-3" />
            </Link>
            <button
              onClick={handleLogout}
              className="text-[11px] text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1 px-2 py-1 font-medium"
            >
              <LogOut className="w-3 h-3" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
