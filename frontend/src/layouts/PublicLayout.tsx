import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar.js';
import { Footer } from '../components/layout/Footer.js';
import { AccessibilityDrawer } from '../components/layout/AccessibilityDrawer.js';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      <AccessibilityDrawer />
    </div>
  );
};
