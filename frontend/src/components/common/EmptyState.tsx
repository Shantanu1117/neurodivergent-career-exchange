import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionPath?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionText,
  actionPath,
  onAction,
}) => {
  return (
    <div className="text-center py-12 px-4 bg-white rounded-2xl border border-slate-200/80 shadow-subtle max-w-lg mx-auto">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 mb-6 leading-relaxed max-w-sm mx-auto">{description}</p>
      {actionText && actionPath && (
        <Link
          to={actionPath}
          className="inline-flex items-center justify-center bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          {actionText}
        </Link>
      )}
      {actionText && onAction && !actionPath && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
