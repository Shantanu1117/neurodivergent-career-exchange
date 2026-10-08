import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { Interview } from '../../types/index.js';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import {
  CalendarDays,
  Clock,
  Video,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Users,
  Sparkles,
  HelpCircle,
  FileText,
} from 'lucide-react';

export const CandidateInterviewsPage: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      setLoading(true);
      try {
        const res = await api.getMyInterviews();
        if (res.success) {
          setInterviews(res.interviews);
        }
      } catch (err) {
        console.error('Failed to load interviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-600">
          <CalendarDays className="w-4 h-4" />
          <span>Predictable Interview Hub</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Scheduled Interviews & Advance Preparation
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          Zero surprise questions or unexpected video checks. Review agendas, confirmed accommodations,
          and questions in advance.
        </p>
      </div>

      {loading ? (
        <LoadingSkeleton count={2} height="h-64" />
      ) : interviews.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No interviews currently scheduled"
          description="When an employer invites you to an interview, your advance agenda and accommodation confirmations will appear here."
          actionText="View Active Applications"
          actionPath="/candidate/applications"
        />
      ) : (
        <div className="space-y-6">
          {interviews.map((int) => (
            <div
              key={int._id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle space-y-6"
            >
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-200/50">
                    {int.status}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 pt-1">{int.title}</h2>
                  <p className="text-xs text-slate-500 font-medium">
                    With {int.employerId?.companyName} • For role: {int.jobId?.title}
                  </p>
                </div>

                <a
                  href={int.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-card transition-colors shrink-0"
                >
                  <Video className="w-4 h-4" />
                  <span>Join Meeting Room</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Date & Time Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <CalendarDays className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Date: {new Date(int.scheduledAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>
                    Time:{' '}
                    {new Date(int.scheduledAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    ({int.durationMinutes} mins)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Video className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Format: {int.meetingType}</span>
                </div>
              </div>

              {/* Advance Agenda Section */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-brand-600" />
                  <span>Advance Session Agenda</span>
                </h3>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {int.agenda}
                </div>
              </div>

              {/* Questions Provided In Advance */}
              {int.questionsInAdvance && int.questionsInAdvance.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Interview Questions Provided in Advance</span>
                  </h3>
                  <div className="space-y-2">
                    {int.questionsInAdvance.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-slate-800 flex items-start gap-2.5"
                      >
                        <span className="w-5 h-5 rounded-full bg-brand-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed font-medium">{q}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Confirmed Accommodations */}
              {int.confirmedAccommodations && int.confirmedAccommodations.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>Confirmed Session Adjustments</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {int.confirmedAccommodations.map((acc) => (
                      <span
                        key={acc}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-teal-50 text-teal-900 border border-teal-200"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                        <span>{acc}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
