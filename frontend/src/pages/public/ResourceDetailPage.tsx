import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { ResourceItem } from '../../types/index.js';
import { ArrowLeft, Clock, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';

export const ResourceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [resource, setResource] = useState<ResourceItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoc = async () => {
      if (!slug) return;
      try {
        const res = await api.getResourceBySlug(slug);
        if (res.success) {
          setResource(res.resource);
        }
      } catch (err) {
        console.error('Failed to load resource:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500">Loading guide...</p>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-lg font-bold text-slate-800">Guide not found</h2>
        <Link to="/resources" className="text-xs text-brand-600 font-semibold mt-2 inline-block">
          Return to resources library
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <Link
        to="/resources"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to all resources</span>
      </Link>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-200/60">
            {resource.category}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {resource.estimatedTime}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {resource.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{resource.description}</p>
      </div>

      {/* Skills Pill Bar */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Skills Gained:</span>
        <div className="flex flex-wrap gap-1.5">
          {resource.skillsGained.map((s) => (
            <span
              key={s}
              className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-slate-200 text-slate-800"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-sans">
        {resource.contentMarkdown}
      </div>
    </div>
  );
};
