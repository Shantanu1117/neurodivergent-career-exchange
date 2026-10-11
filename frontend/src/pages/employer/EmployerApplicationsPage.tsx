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
  CheckCircle2,
  Code2,
  MessageSquareHeart,
  ExternalLink,
} from 'lucide-react';

const QUESTION_BANK: Record<string, string[]> = {
  SOFTWARE_TESTING_QA: [
    'Walk us through a subtle bug or regression you uncovered and the systematic steps you took to isolate it.',
    'How do you structure automated test suites so they remain deterministic and easy to maintain?',
    'What written specifications or acceptance criteria help you do your best verification work?',
  ],
  DATA_ANALYSIS_AUDIT: [
    'Tell us about a dataset anomaly or pattern you spotted that others initially missed.',
    'What tools and checklists do you use to validate data integrity before publishing an audit?',
  ],
  DEFAULT: [
    'Can you walk us through a concrete technical problem or project you enjoyed solving?',
    'What working environment and communication cadence help you maintain deep concentration?',
    'How do you prefer to receive task expectations and constructive code/work reviews?',
  ],
};

export const EmployerApplicationsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { success, error } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Status Filter
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');

  // Interview Schedule Modal (#20 & #28)
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('14:00');
  const [interviewDuration, setInterviewDuration] = useState(45);
  const [sensoryBreakMinutes, setSensoryBreakMinutes] = useState(10);
  const [timeZone, setTimeZone] = useState('America/New_York (EST)');
  const [agenda, setAgenda] = useState(
    '1. Welcome & Accommodation Check (5m)\n2. Practical Task Walkthrough (25m)\n3. Sensory Break Buffer (10m)\n4. Candidate Q&A (15m)'
  );
  const [questionsInAdvance, setQuestionsInAdvance] = useState(
    'Can you walk us through a complex bug or inconsistency you discovered?\nWhat working conditions help you maintain uninterrupted concentration?'
  );
  const [scheduling, setScheduling] = useState(false);

  // Feature #22: Constructive Feedback Modal
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [strengthsInput, setStrengthsInput] = useState('Systematic Attention to Detail, Clear Technical Logic');
  const [growthInput, setGrowthInput] = useState('Expand end-to-end CI/CD pipeline examples');
  const [encouragementNote, setEncouragementNote] = useState(
    'Thank you for sharing your strengths profile and practical approach with our team. Here is structured feedback from our review.'
  );
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

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

  // Feature #26: Employer Accommodation Readiness & Day-1 Checklist
  const handleToggleChecklistItem = async (itemText: string, currentStatus?: string) => {
    if (!selectedApp) return;
    const nextStatus =
      currentStatus === 'COMPLETED'
        ? 'PENDING'
        : currentStatus === 'APPROVED'
        ? 'COMPLETED'
        : 'APPROVED';

    const existingList =
      selectedApp.accommodationChecklist && selectedApp.accommodationChecklist.length > 0
        ? selectedApp.accommodationChecklist
        : (selectedApp.requestedAccommodations || []).map((a) => ({
            item: a,
            status: 'PENDING' as const,
          }));

    const updatedChecklist = existingList.map((entry) =>
      entry.item === itemText ? { ...entry, status: nextStatus as any } : entry
    );

    try {
      const res = await api.updateAccommodationChecklist(selectedApp._id, updatedChecklist);
      if (res.success) {
        setSelectedApp({ ...selectedApp, accommodationChecklist: res.accommodationChecklist });
        success(`Adjustment "${itemText}" marked as ${nextStatus}.`);
      }
    } catch (err: any) {
      error(err.message || 'Failed to update adjustment checklist.');
    }
  };

  // Feature #22: Submit Constructive Feedback
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    setSubmittingFeedback(true);
    try {
      const res = await api.submitStructuredFeedback(selectedApp._id, {
        strengthsHighlighted: strengthsInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        growthAreas: growthInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        encouragementNote,
      });
      if (res.success) {
        success('Constructive feedback shared with candidate!');
        setSelectedApp({ ...selectedApp, structuredFeedback: res.application.structuredFeedback });
        setFeedbackModalOpen(false);
      }
    } catch (err: any) {
      error(err.message || 'Could not submit feedback.');
    } finally {
      setSubmittingFeedback(false);
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

  const handleLoadRoleQuestionBank = () => {
    const cat = selectedApp?.jobId?.category || 'DEFAULT';
    const questions = QUESTION_BANK[cat] || QUESTION_BANK.DEFAULT;
    setQuestionsInAdvance(questions.join('\n'));
    success('Loaded bias-free, literal question bank for this role!');
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
        timeZone,
        sensoryBreakMinutes,
        agenda,
        questionsInAdvance: qArray,
      });

      if (res.success) {
        success('Interview scheduled! Candidate notified with advance agenda and sensory break buffer.');
        setScheduleModalOpen(false);
        handleUpdateStatus(selectedApp._id, 'INTERVIEW');
      }
    } catch (err: any) {
      error(err.message || 'Failed to schedule interview.');
    } finally {
      setScheduling(false);
    }
  };

  const checklistToRender =
    selectedApp?.accommodationChecklist && selectedApp.accommodationChecklist.length > 0
      ? selectedApp.accommodationChecklist
      : (selectedApp?.requestedAccommodations || []).map((acc) => ({
          item: acc,
          status: 'PENDING' as const,
        }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Applicant Review & Inclusive ATS Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate candidate strengths, work-samples, Day-1 accommodation checklists, and share constructive feedback.
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
                    <div className="flex items-center gap-1.5">
                      {app.feedbackRequested && !app.structuredFeedback && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                          Feedback Requested
                        </span>
                      )}
                      <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200/50">
                        {app.matchScore}% Match
                      </span>
                    </div>
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
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                    <span>{selectedApp.candidateId?.location}</span>
                    {selectedApp.preferredInterviewFormat && (
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-brand-700 font-semibold border border-indigo-200">
                        Prefers: {selectedApp.preferredInterviewFormat.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFeedbackModalOpen(true)}
                    className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-colors"
                  >
                    <MessageSquareHeart className="w-3.5 h-3.5" />
                    <span>Share Feedback</span>
                  </button>
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

              {/* Feature #18: Work-Sample / Practical Task Submission Viewer */}
              {selectedApp.workSampleSubmission &&
                (selectedApp.workSampleSubmission.responseText ||
                  selectedApp.workSampleSubmission.artifactUrl) && (
                  <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                        <Code2 className="w-4 h-4 text-teal-600" />
                        <span>Candidate Work-Sample Submission ({selectedApp.submissionType})</span>
                      </span>
                    </div>
                    {selectedApp.workSampleSubmission.responseText && (
                      <p className="text-slate-800 bg-white p-3 rounded-xl border border-teal-100 whitespace-pre-line leading-relaxed">
                        {selectedApp.workSampleSubmission.responseText}
                      </p>
                    )}
                    {selectedApp.workSampleSubmission.artifactUrl && (
                      <a
                        href={selectedApp.workSampleSubmission.artifactUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-teal-800 font-bold underline"
                      >
                        <span>Open Candidate Portfolio / Artifact Link</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                )}

              {/* "How I Work Best" Spotlight */}
              {selectedApp.candidateId?.howIWorkBest && (
                <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100 space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-800 flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4 text-brand-600" />
                    How I Work Best (Candidate Briefing):
                  </span>
                  <p className="text-xs text-indigo-950 leading-relaxed font-medium">
                    &quot;{selectedApp.candidateId.howIWorkBest}&quot;
                  </p>
                </div>
              )}

              {/* Feature #26: Interactive Employer Accommodation Readiness & Day-1 Checklist */}
              {checklistToRender.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-teal-600" />
                      <span>Day-1 Workplace Adjustment Readiness Checklist (Click to Approve):</span>
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {checklistToRender.map((entry) => (
                      <button
                        key={entry.item}
                        type="button"
                        onClick={() => handleToggleChecklistItem(entry.item, entry.status)}
                        className={`p-3 rounded-xl border text-left text-xs flex items-center justify-between transition-all ${
                          entry.status === 'COMPLETED'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                            : entry.status === 'APPROVED'
                            ? 'bg-teal-50 border-teal-300 text-teal-950 font-semibold'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate pr-2">{entry.item}</span>
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 shrink-0 font-bold">
                          <CheckCircle2 className="w-3 h-3 text-teal-600" />
                          {entry.status}
                        </span>
                      </button>
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

      {/* Feature #22: Constructive Feedback Modal */}
      {feedbackModalOpen && selectedApp && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-floating border border-slate-200 p-6 sm:p-8 space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Share Structured Constructive Feedback
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Concrete, respectful feedback helps neurodivergent candidates grow and eliminates application black-hole anxiety.
              </p>
            </div>
            <form onSubmit={handleSubmitFeedback} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Strengths Demonstrated (Comma-separated)
                </label>
                <input
                  type="text"
                  value={strengthsInput}
                  onChange={(e) => setStrengthsInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Recommended Growth Areas (Comma-separated)
                </label>
                <input
                  type="text"
                  value={growthInput}
                  onChange={(e) => setGrowthInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Personal Encouragement / Summary Note
                </label>
                <textarea
                  rows={3}
                  value={encouragementNote}
                  onChange={(e) => setEncouragementNote(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFeedbackModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl"
                >
                  {submittingFeedback ? 'Sending...' : 'Send Feedback to Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Predictable Interview Modal (#20 & #28) */}
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

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (m)</label>
                  <input
                    type="number"
                    value={interviewDuration}
                    onChange={(e) => setInterviewDuration(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sensory Break (m)</label>
                  <input
                    type="number"
                    value={sensoryBreakMinutes}
                    onChange={(e) => setSensoryBreakMinutes(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time Zone</label>
                  <input
                    type="text"
                    value={timeZone}
                    onChange={(e) => setTimeZone(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Questions Provided in Advance (1 per line)
                  </label>
                  <button
                    type="button"
                    onClick={handleLoadRoleQuestionBank}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-800"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-Fill Bias-Free Question Bank</span>
                  </button>
                </div>
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
