import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { Interview } from '../../types/index.js';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { EmailPreviewModal, EmailLogItem } from '../../components/common/EmailPreviewModal.js';
import { useToast } from '../../context/ToastContext.js';
import {
  CalendarDays,
  Clock,
  Video,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  FileText,
  Download,
  Coffee,
  ListChecks,
  Mail,
  Plus,
  Sparkles,
  Volume2,
} from 'lucide-react';

const PREP_ITEMS = [
  'Reviewed all advance interview questions and jotted down bullet notes',
  'Confirmed my preferred communication modality (camera optional / written chat ready)',
  'Verified quiet sensory environment, lighting, and water/stim tools nearby',
  'Noted my scheduled sensory break interval and time-zone alignment',
];

export const CandidateInterviewsPage: React.FC = () => {
  const { success, error } = useToast();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [schedulingPractice, setSchedulingPractice] = useState(false);
  const [sendingPacketId, setSendingPacketId] = useState<string | null>(null);
  const [previewEmail, setPreviewEmail] = useState<EmailLogItem | null>(null);
  const [questionNotes, setQuestionNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('nce_interview_question_notes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [checkedPrep, setCheckedPrep] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('nce_interview_prep_checks');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

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

  useEffect(() => {
    fetchInterviews();
  }, []);

  const togglePrepCheck = (key: string) => {
    const updated = { ...checkedPrep, [key]: !checkedPrep[key] };
    setCheckedPrep(updated);
    localStorage.setItem('nce_interview_prep_checks', JSON.stringify(updated));
  };

  const handleNoteChange = (key: string, value: string) => {
    const updated = { ...questionNotes, [key]: value };
    setQuestionNotes(updated);
    localStorage.setItem('nce_interview_question_notes', JSON.stringify(updated));
  };

  const handleRequestPractice = async () => {
    setSchedulingPractice(true);
    try {
      const res = await api.requestPracticeInterview({
        meetingType: 'VIDEO',
        sensoryBreakMinutes: 10,
      });
      if (res.success && res.interview) {
        setInterviews((prev) => [res.interview, ...prev]);
        success(res.message || 'Practice interview scheduled & 48h Advance Packet emailed!');
      }
    } catch (err: any) {
      error(err.message || 'Could not schedule practice interview.');
    } finally {
      setSchedulingPractice(false);
    }
  };

  const handleEmailAdvancePacket = async (int: Interview) => {
    setSendingPacketId(int._id);
    try {
      const res = await api.sendInterviewPacketEmail({
        interviewId: int._id,
        jobTitle: int.jobId?.title,
        companyName: int.employerId?.companyName,
      });
      if (res.success && res.email) {
        setPreviewEmail(res.email);
        success(res.message || '48-Hour Advance Interview Packet sent to your email!');
      }
    } catch (err: any) {
      error(err.message || 'Failed to email 48-hour advance packet.');
    } finally {
      setSendingPacketId(null);
    }
  };

  const handleSpeakAgenda = (int: Interview) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      `${int.title} with ${int.employerId?.companyName || 'Inclusive Partner'}. Agenda: ${
        int.agenda
      }. Advance Questions: ${(int.questionsInAdvance || []).join(' ')}`
    );
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  // Feature #20: Generate & Download .ics Calendar Invite with Sensory Break Buffer
  const handleDownloadIcs = (int: Interview) => {
    const start = new Date(int.scheduledAt);
    const end = new Date(start.getTime() + (int.durationMinutes || 45) * 60000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Neurodivergent Career Exchange//Predictable Interview//EN',
      'BEGIN:VEVENT',
      `UID:${int._id}@nce.app`,
      `DTSTAMP:${fmt(new Date())}`,
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:${int.title} - ${int.employerId?.companyName || 'Employer'}`,
      `DESCRIPTION:Agenda: ${(int.agenda || '').replace(/\n/g, ' ')} | Sensory Break Buffer: ${
        int.sensoryBreakMinutes || 10
      } mins | Confirmed Accommodations: ${(int.confirmedAccommodations || []).join(', ')}`,
      `LOCATION:${int.meetingUrl || 'Online'}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NCE-Interview-${int._id.slice(-6)}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    success('Calendar invite (.ics) downloaded with agenda & sensory break buffer!');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-indigo-400">
            <CalendarDays className="w-4 h-4" />
            <span>Predictable Interview Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Scheduled Interviews &amp; 48h Advance Packets
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Zero surprise questions or unexpected video checks. Review agendas, confirmed accommodations,
            sensory break buffers, and questions in advance—or email the full packet to yourself.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRequestPractice}
          disabled={schedulingPractice}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white text-xs font-bold shadow-md transition-all shrink-0 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>{schedulingPractice ? 'Scheduling...' : '+ Request Mock / Portfolio Session'}</span>
        </button>
      </div>

      {/* Feature #15: Interactive Pre-Interview Preparation Checklist */}
      <div className="bg-indigo-50/70 dark:bg-slate-900 rounded-3xl border border-indigo-200 dark:border-slate-800 p-6 space-y-3 shadow-subtle">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <ListChecks className="w-5 h-5 text-brand-600 dark:text-indigo-400" />
            <span>Low-Anxiety Pre-Interview Readiness Checklist</span>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            {Object.values(checkedPrep).filter(Boolean).length} / {PREP_ITEMS.length} Ready
          </span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Use this self-paced checklist before your session. You are always allowed to keep written notes in front of you during interviews on NCE.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {PREP_ITEMS.map((item, idx) => {
            const key = `prep_${idx}`;
            const isDone = !!checkedPrep[key];
            return (
              <label
                key={key}
                className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                  isDone
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/70 text-emerald-950 dark:text-emerald-200 font-semibold'
                    : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => togglePrepCheck(key)}
                  className="mt-0.5 rounded border-slate-300 dark:border-slate-700 text-brand-600"
                />
                <span>{item}</span>
              </label>
            );
          })}
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={2} height="h-64" />
      ) : interviews.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No interviews currently scheduled"
          description="Click below to schedule a low-stress Mock & Portfolio Walkthrough session with an inclusive mentor."
          actionText="Schedule Practice Session Now"
          onAction={handleRequestPractice}
        />
      ) : (
        <div className="space-y-6">
          {interviews.map((int) => (
            <div
              key={int._id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-subtle space-y-6"
            >
              {/* Header Row */}
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-brand-700 dark:text-indigo-300 bg-brand-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-md border border-brand-200/50 dark:border-indigo-800">
                      {int.status}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">
                      <Sparkles className="w-3 h-3" /> 48h Advance Packet Verified
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-1">{int.title}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    With <strong className="text-slate-700 dark:text-slate-200">{int.employerId?.companyName || 'Inclusive Partner'}</strong> • For role:{' '}
                    <strong className="text-slate-700 dark:text-slate-200">{int.jobId?.title || 'Engineering Specialist'}</strong>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSpeakAgenda(int)}
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
                    title="Listen to agenda and questions aloud"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-brand-600 dark:text-indigo-400" />
                    <span>Listen</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEmailAdvancePacket(int)}
                    disabled={sendingPacketId === int._id}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>
                      {sendingPacketId === int._id ? 'Emailing Packet...' : 'Email Me 48h Agenda'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadIcs(int)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Calendar (.ics)</span>
                  </button>
                  <a
                    href={int.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-card transition-colors"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join Session</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Date, Time, Time-Zone & Sensory Break Buffer (Feature #20) */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CalendarDays className="w-4 h-4 text-brand-600 dark:text-indigo-400 shrink-0" />
                  <span>Date: {new Date(int.scheduledAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Clock className="w-4 h-4 text-brand-600 dark:text-indigo-400 shrink-0" />
                  <span>
                    {new Date(int.scheduledAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    ({int.durationMinutes}m • {int.timeZone || 'Local TZ'})
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Video className="w-4 h-4 text-brand-600 dark:text-indigo-400 shrink-0" />
                  <span>Format: {int.meetingType}</span>
                </div>
                <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 font-semibold">
                  <Coffee className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>+{int.sensoryBreakMinutes || 10}m Sensory Break Buffer</span>
                </div>
              </div>

              {/* Advance Agenda Section */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-brand-600 dark:text-indigo-400" />
                  <span>Advance Session Agenda</span>
                </h3>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {int.agenda}
                </div>
              </div>

              {/* Questions Provided In Advance + Personal Scratchpad */}
              {int.questionsInAdvance && int.questionsInAdvance.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Exact Interview Questions Provided in Advance (With Private Prep Scratchpad)</span>
                  </h3>
                  <div className="space-y-3">
                    {int.questionsInAdvance.map((q, idx) => {
                      const noteKey = `${int._id}_q_${idx}`;
                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-slate-950/80 border border-indigo-100 dark:border-slate-800 space-y-2.5"
                        >
                          <div className="flex items-start gap-2.5 text-xs text-slate-900 dark:text-white">
                            <span className="w-5 h-5 rounded-full bg-brand-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="leading-relaxed font-semibold">{q}</span>
                          </div>
                          <textarea
                            rows={2}
                            value={questionNotes[noteKey] || ''}
                            onChange={(e) => handleNoteChange(noteKey, e.target.value)}
                            placeholder="Draft your private bullet points or STAR example here (saved automatically in your browser)..."
                            className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Confirmed Accommodations */}
              {int.confirmedAccommodations && int.confirmedAccommodations.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Confirmed Session Adjustments</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {int.confirmedAccommodations.map((acc) => (
                      <span
                        key={acc}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
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

      {/* Email Preview Modal */}
      <EmailPreviewModal
        email={previewEmail}
        isOpen={!!previewEmail}
        onClose={() => setPreviewEmail(null)}
        onResendToAddress={async (targetEmail) => {
          const res = await api.sendInterviewPacketEmail({ toEmail: targetEmail });
          if (res.success && res.email) {
            setPreviewEmail(res.email);
            success(`48h Interview Packet sent to ${targetEmail}!`);
          }
        }}
      />
    </div>
  );
};
