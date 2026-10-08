import React from 'react';
import { ApplicationStatus } from '../../types/index.js';

interface StatusBadgeProps {
  status: ApplicationStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStyle = () => {
    switch (status) {
      case 'OFFER':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'INTERVIEW':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold';
      case 'SHORTLISTED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'UNDER_REVIEW':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'ASSESSMENT':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'REJECTED':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'WITHDRAWN':
        return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'APPLIED':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'UNDER_REVIEW':
        return 'Under Review';
      case 'SHORTLISTED':
        return 'Shortlisted';
      case 'INTERVIEW':
        return 'Interview Stage';
      case 'ASSESSMENT':
        return 'Skill Assessment';
      case 'OFFER':
        return 'Offer Extended';
      case 'REJECTED':
        return 'Not Selected';
      case 'WITHDRAWN':
        return 'Withdrawn';
      case 'APPLIED':
      default:
        return 'Applied';
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border font-semibold tracking-wide ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } ${getStyle()}`}
    >
      {getLabel()}
    </span>
  );
};
