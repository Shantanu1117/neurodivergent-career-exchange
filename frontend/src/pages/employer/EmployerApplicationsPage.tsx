import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Application, ApplicationStatus } from '../../types/index.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { useToast } from '../../context/ToastContext.js';
import {
  FileText,
  Calendar,
  Sparkles,
  HeartHandshake,
  ShieldCheck,
  Check,
  X,
  MessageSquare,
  Clock,
  Plus,
} from 'lucide-react';

export const EmployerApplicationsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { success, error } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Status Filter
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');

  // Interview Schedule Modal
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('14:00');
  const [interviewDuration, setInterviewDuration] = useState(45);
  const [agenda, setAgenda] = useState(
    '1. Welcome & Accommodation Check (5m)\n2. Practical Task Walkthrough (25m)\n3. Candidate Q&A (15m)'
  );
  const [questionsInAdvance, setQuestionsInAdvance] = useState(
    'Can you walk us through a complex bug or inconsistency you discovered?\nWhat working conditions help you maintain uninterrupted concentration?'
  );
  const [scheduling, setScheduling] = useState(false);

  // Recruiter Note
  const [newNote, setNewNote] = useState('');

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const query = statusFilter !== 'ALL' ? `status=${statusFilter}` : '';
      const res = await api.getJobApplications(query);
      if (res.success) {
        setApplications(res.applications);
        if (res.applications.length > 0 && !selectedApp) {
          setSelectedApp(res.applications[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const handleUpdateStatus = async (appId: string, newStatus: ApplicationStatus) => {
    try {
      const res = await api.updateApplicationStatus(appId, newStatus);
      if (res.success) {
        success(`Application stage changed to ${newStatus.replace('_', ' ')}.`);
        setApplications((prev) =>
          prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
        );
        if (selectedApp && selectedApp._id === appId) {
          setSelectedApp({ ...selectedApp, status: newStatus });
        }
      }
    } catch (err: any) {
      error(err.message || 'Failed to update status.');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !selectedApp) return;

    try {
      const res = await api.addEmployerNote(selectedApp._id, newNote.trim());
      if (res.success) {
        success('Note added.');
        setSelectedApp({ ...selectedApp, employerNotes: res.employerNotes });
        setNewNote('');
      }
    } catch (err: any) {
      error(err.message || 'Failed to add note.');
    }
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !interviewDate) {
      error('Please specify interview date.');
      return;
    }

    setScheduling(true);
    try {
      const scheduledDateTime = new Date(`${interviewDate}T${interviewTime}:00`);
      const qArray = questionsInAdvance
        .split('\n')
        .map((q) => q.trim())
        .filter((q) => q.length > 0);

      const res = await api.scheduleInterview({
        applicationId: selectedApp._id,
        scheduledAt: scheduledDateTime,
        durationMinutes: interviewDuration,
        agenda,
        questionsInAdvance: qArray,
      });

      if (res.success) {
        success('Interview scheduled! Candidate notified with advance agenda.');
        setScheduleModalOpen(false);
        handleUpdateStatus(selectedApp._id, 'INTERVIEW');
      }
    } catch (err: any) {
      error(err.message || 'Failed to schedule interview.');
    } finally {
      setScheduling(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Applicant Review & ATS Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate candidate strengths, "How I Work Best" summaries, and schedule predictable interviews.
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Filter Stage:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 shadow-xs"
          >
            <option value="ALL">All Stages</option>
            <option value="APPLIED">Applied</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEW">Interview</option>
            <option value="ASSESSMENT">Assessment</option>
            <option value="OFFER">Offer</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} height="h-40" />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications in this stage"
          description="Candidates applying to your published jobs will populate this review pipeline."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Applicant Cards List (5 Cols) */}
          <div className="lg:col-span-5 space-y-3 max-h-[750px] overflow-y-auto pr-1">
            {applications.map((app) => {
              const isSelected = selectedApp?._id === app._id;
              return (
                <div
                  key={app._id}
                  onClick={() => setSelectedApp(app)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-white border-teal-500 ring-2 ring-teal-500/20 shadow-card'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-subtle'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{app.candidateId?.fullName}</h3>
                      <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                        {app.jobId?.title}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200/50">
                      {app.matchScore}% Match
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 border-t border-slate-100">
                    <StatusBadge status={app.status} size="sm" />
                    <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed Candidate Inspection Drawer (7 Cols) */}
          {selectedApp && (
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedApp.candidateId?.fullName}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Candidate for: <span className="font-semibold text-slate-800">{selectedApp.jobId?.title}</span>
                  </p>
                  <span className="inline-block text-[11px] text-slate-500 mt-1">
                    {selectedApp.candidateId?.location}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setScheduleModalOpen(true)}
                    className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Schedule Interview</span>
                  </button>
                </div>
              </div>

              {/* Status Selector Bar */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-slate-700">Move Candidate Stage:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(['UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'OFFER', 'REJECTED'] as ApplicationStatus[]).map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(selectedApp._id, st)}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-all text-[11px] ${
                          selectedApp.status === st
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* "How I Work Best" Spotlight */}
              {selectedApp.candidateId?.howIWorkBest && (
                <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100 space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-800 flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4 text-brand-600" />
                    How I Work Best (Candidate Briefing):
                  </span>
                  <p className="text-xs text-indigo-950 leading-relaxed font-medium">
                    "{selectedApp.candidateId.howIWorkBest}"
                  </p>
                </div>
              )}

              {/* Requested Workplace Accommodations */}
              {selectedApp.requestedAccommodations && selectedApp.requestedAccommodations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    Requested Workplace Adjustments:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedApp.requestedAccommodations.map((acc) => (
                      <span
                        key={acc}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-50 text-teal-900 border border-teal-200"
                      >
                        {acc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths & Skills */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Cognitive Strengths & Skills:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedApp.candidateId?.strengths || []).map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded text-[11px] font-semibold bg-brand-50 text-brand-800 border border-brand-200"
                    >
                      {s}
                    </span>
                  ))}
                  {(selectedApp.candidateId?.skills || []).map((sk) => (
                    <span
                      key={sk}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recruiter Evaluation Notes */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Private Recruiter Notes
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {(selectedApp.employerNotes || []).map((note, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700">
                      <span className="font-semibold text-slate-900 block mb-0.5">{note.authorName}</span>
                      <p>{note.note}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add evaluation note..."
                    className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white"
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-xl"
                  >
                    Add Note
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Schedule Predictable Interview Modal */}
      {scheduleModalOpen && selectedApp && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-floating border border-slate-200 p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Schedule Predictable Interview
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                For candidate: {selectedApp.candidateId?.fullName} ({selectedApp.jobId?.title})
              </p>
            </div>

            <form onSubmit={handleScheduleInterview} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Interview Date</label>
                  <input
                    type="date"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Structured Session Agenda (Advance Notice)
                </label>
                <textarea
                  rows={3}
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Questions Provided in Advance (1 per line)
                </label>
                <textarea
                  rows={3}
                  value={questionsInAdvance}
                  onChange={(e) => setQuestionsInAdvance(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduling}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs disabled:opacity-50"
                >
                  {scheduling ? 'Scheduling...' : 'Confirm & Notify Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
