import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useAccessibility } from '../context/AccessibilityContext.js';
import { api } from '../services/api.js';
import {
  Sparkles,
  LayoutDashboard,
  Compass,
  Briefcase,
  FileCheck2,
  CalendarDays,
  Bookmark,
  MessageSquare,
  Bell,
  User,
  Settings,
  LogOut,
  Sliders,
  Menu,
  X,
  ExternalLink,
  Moon,
  Sun,
  Layers,
} from 'lucide-react';

export const CandidateLayout: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const { toggleDrawer, theme, toggleTheme } = useAccessibility();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.getNotifications();
        if (res.success) {
          setUnreadNotifications(res.unreadCount || 0);
        }
      } catch {
        // Silently catch
      }
    };
    fetchUnread();
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/candidate/dashboard', icon: LayoutDashboard },
    { label: 'Career Assessment', path: '/candidate/assessment', icon: Compass },
    { label: 'Results & Course Quizzes', path: '/candidate/results', icon: Layers },
    { label: 'Matched Jobs', path: '/candidate/jobs', icon: Briefcase },
    { label: 'My Applications', path: '/candidate/applications', icon: FileCheck2 },
    { label: 'Interview Hub', path: '/candidate/interviews', icon: CalendarDays },
    { label: 'Saved Jobs', path: '/candidate/saved', icon: Bookmark },
    { label: 'Messages', path: '/candidate/messages', icon: MessageSquare },
    {
      label: 'Notifications',
      path: '/candidate/notifications',
      icon: Bell,
      badge: unreadNotifications > 0 ? unreadNotifications : null,
    },
    { label: 'Profile & Work Style', path: '/candidate/profile', icon: User },
    { label: 'Settings', path: '/candidate/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-slate-900 dark:text-white">ND Career Exchange</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title={theme === 'dark' ? 'Switch to Daylight View' : 'Switch to Night View'}
            aria-label="Toggle Night Mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700" />
            )}
          </button>
          <button
            onClick={toggleDrawer}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Sensory mode"
          >
            <Sliders className="w-5 h-5 text-brand-600 dark:text-indigo-400" />
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

      {/* Desktop & Mobile Drawer Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 to-indigo-500 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-900 dark:text-white block leading-tight">
                ND Career Exchange
              </span>
              <span className="text-[10px] font-semibold text-brand-600 dark:text-indigo-400 uppercase tracking-wider">
                Candidate Portal
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Snapshot / Quick Card */}
        <div className="p-4 mx-3 my-2 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200/70 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
              {profile?.fullName ? profile.fullName.charAt(0) : user?.email.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {profile?.fullName || user?.email.split('@')[0]}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {profile?.headline || 'Neuro-inclusive candidate'}
              </p>
            </div>
          </div>
          {/* Profile Strength Bar */}
          <div className="mt-2.5">
            <div className="flex justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <span>Profile Strength</span>
              <span>{profile?.profileCompletion || 75}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-brand-600 h-1.5 rounded-full"
                style={{ width: `${profile?.profileCompletion || 75}%` }}
              />
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path === '/candidate/results' &&
                location.pathname === '/candidate/assessment/results');
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 dark:bg-indigo-950 text-brand-700 dark:text-indigo-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-brand-600 dark:text-indigo-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-brand-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sensory Mode & Logout Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-1 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="grid grid-cols-5 gap-1.5">
            <button
              onClick={toggleDrawer}
              className="col-span-4 flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <Sliders className="w-4 h-4 text-brand-600 dark:text-indigo-400" />
              <span>Sensory Controls</span>
            </button>
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center p-2 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
              title={theme === 'dark' ? 'Switch to Daylight View' : 'Switch to Night View'}
              aria-label="Toggle Night View"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between pt-1">
            <Link
              to="/jobs"
              className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 px-2 py-1"
            >
              Public Jobs <ExternalLink className="w-3 h-3" />
            </Link>
            <button
              onClick={handleLogout}
              className="text-[11px] text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1 px-2 py-1 font-medium"
            >
              <LogOut className="w-3 h-3" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
