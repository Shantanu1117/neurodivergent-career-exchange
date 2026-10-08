import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useAccessibility } from '../context/AccessibilityContext.js';
import {
  ShieldAlert,
  LayoutDashboard,
  Users,
  Briefcase,
  FileCheck,
  BarChart3,
  BookOpen,
  Settings,
  LogOut,
  Sliders,
  Menu,
  X,
  ExternalLink,
  Moon,
  Sun,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { toggleDrawer, theme, toggleTheme } = useAccessibility();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'System Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'User Management', path: '/admin/users', icon: Users },
    { label: 'Job Moderation', path: '/admin/jobs', icon: Briefcase },
    { label: 'Applications Oversight', path: '/admin/applications', icon: FileCheck },
    { label: 'Platform Analytics', path: '/admin/reports', icon: BarChart3 },
    { label: 'Resource CMS', path: '/admin/resources', icon: BookOpen },
    { label: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 border-b border-slate-800">
        <Link to="/" className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-indigo-400" />
          <span className="font-bold text-sm">NDCE SuperAdmin</span>
        </Link>
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800"
            title={theme === 'dark' ? 'Switch to Daylight View' : 'Switch to Night View'}
            aria-label="Toggle Night Mode"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-300" />}
          </button>
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800"
            aria-label="Toggle navigation"
          >
            {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-white block leading-tight">
                NDCE Admin
              </span>
              <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
                Platform Operations
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Tag */}
        <div className="p-3 mx-3 my-2 bg-slate-800/80 rounded-xl border border-slate-700/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Signed in as:</span>
            <span className="font-mono text-[11px] text-indigo-300 font-semibold">{user?.email}</span>
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
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 space-y-1 bg-slate-950/40">
          <div className="grid grid-cols-5 gap-1.5">
            <button
              onClick={toggleDrawer}
              className="col-span-4 flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
            >
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Sensory Controls</span>
            </button>
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center p-2 text-slate-300 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
              title={theme === 'dark' ? 'Switch to Daylight View' : 'Switch to Night View'}
              aria-label="Toggle Night View"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
            </button>
          </div>
          <div className="flex items-center justify-between pt-1">
            <Link
              to="/jobs"
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 px-2 py-1"
            >
              Public Jobs <ExternalLink className="w-3 h-3" />
            </Link>
            <button
              onClick={handleLogout}
              className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 px-2 py-1 font-medium"
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
