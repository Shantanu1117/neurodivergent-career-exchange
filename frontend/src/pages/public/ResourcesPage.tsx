import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { ResourceItem } from '../../types/index.js';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.js';
import { BookOpen, Clock, ArrowRight, Sparkles, Filter } from 'lucide-react';

export const ResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [category, setCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const res = await api.getResources(category);
        if (res.success) {
          setResources(res.resources);
        }
      } catch (err) {
        console.error('Failed to load resources:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, [category]);

  const categories = [
    { label: 'All Resources', value: 'ALL' },
    { label: 'Software Testing / QA', value: 'Software Testing / QA' },
    { label: 'Cybersecurity', value: 'Cybersecurity' },
    { label: 'Data Analysis / Audit', value: 'Data Analysis / Audit' },
    { label: 'Interview Preparation', value: 'Interview preparation' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Career Development</span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Curated Guides for Pattern & Analytical Thinkers
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Practical tutorials, test automation templates, and self-advocacy playbooks to help you thrive.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              category === c.value
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Resources List */}
      {loading ? (
        <LoadingSkeleton count={3} height="h-32" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resources.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-2">
                  <span className="font-semibold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-200/60">
                    {item.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {item.estimatedTime}
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 mb-2">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">{item.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {item.skillsGained.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                to={`/resources/${item.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 pt-3 border-t border-slate-100"
              >
                <span>Read guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
