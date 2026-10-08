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
} from 'lucide-react';

export const EmployerInterviewsPage: React.FC = () => {
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
        console.error('Failed to load employer interviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Scheduled Candidate Interviews
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Interviews conducted with advance agendas and confirmed accommodations.
        </p>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} height="h-44" />
      ) : interviews.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No scheduled interviews"
          description="When you shortlist candidate applications, you can schedule predictable interviews directly from your applicant pipeline."
          actionText="View Applications"
          actionPath="/employer/applications"
        />
      ) : (
        <div className="space-y-4">
          {interviews.map((int) => (
            <div
              key={int._id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                    {int.status}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 font-medium">{int.jobId?.title}</span>
                </div>
                <h3 className="font-bold text-base text-slate-900">{int.title}</h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="font-semibold text-slate-800">
                    Candidate: {int.candidateId?.fullName}
                  </span>
                  <span>•</span>
                  <span>{new Date(int.scheduledAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>
                    {new Date(int.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                    ({int.durationMinutes}m)
                  </span>
                </div>
                {int.confirmedAccommodations && int.confirmedAccommodations.length > 0 && (
                  <p className="text-[11px] text-teal-800 bg-teal-50/60 p-2 rounded-lg border border-teal-100">
                    <strong>Accommodations Confirmed:</strong> {int.confirmedAccommodations.join(' • ')}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={int.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-xs"
                >
                  <Video className="w-4 h-4" />
                  <span>Join Session</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
