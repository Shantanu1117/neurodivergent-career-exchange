import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { Interview } from '../../types/index.js';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { useToast } from '../../context/ToastContext.js';
import {
  CalendarDays,
  Video,
  ExternalLink,
  ClipboardCheck,
  Sparkles,
  Coffee,
} from 'lucide-react';

export const EmployerInterviewsPage: React.FC = () => {
  const { success, error } = useToast();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  // Feature #16: Structured Bias-Free Interview Rubric Scorecard Modal
  const [rubricInterview, setRubricInterview] = useState<Interview | null>(null);
  const [rubric, setRubric] = useState({
    technicalExecution: 5,
    problemSolvingClarity: 5,
    asyncCommunication: 5,
    taskCompletionQuality: 5,
    evaluatorSummary:
      'Demonstrated strong systematic logic and edge-case awareness on practical tasks.',
  });
  const [savingRubric, setSavingRubric] = useState(false);

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

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleOpenRubric = (int: Interview) => {
    setRubricInterview(int);
    if (int.evaluationRubric) {
      setRubric({
        technicalExecution: int.evaluationRubric.technicalExecution || 5,
        problemSolvingClarity: int.evaluationRubric.problemSolvingClarity || 5,
        asyncCommunication: int.evaluationRubric.asyncCommunication || 5,
        taskCompletionQuality: int.evaluationRubric.taskCompletionQuality || 5,
        evaluatorSummary: int.evaluationRubric.evaluatorSummary || '',
      });
    }
  };

  const handleSaveRubric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rubricInterview) return;
    setSavingRubric(true);
    try {
      const res = await api.updateInterviewStatus(
        rubricInterview._id,
        'COMPLETED',
        rubric.evaluatorSummary,
        rubric
      );
      if (res.success) {
        success('Bias-free objective rubric scorecard saved!');
        setRubricInterview(null);
        fetchInterviews();
      }
    } catch (err: any) {
      error(err.message || 'Failed to save rubric.');
    } finally {
      setSavingRubric(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Scheduled Candidate Interviews & Bias-Free Scorecards
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Interviews conducted with advance agendas, sensory break buffers, and objective skill rubrics (no eye-contact or small-talk scoring).
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
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-subtle space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                      {int.status}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 font-medium">{int.jobId?.title}</span>
                    <span className="inline-flex items-center gap-1 text-teal-700 font-semibold">
                      <Coffee className="w-3.5 h-3.5" />
                      +{int.sensoryBreakMinutes || 10}m Break Buffer
                    </span>
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
                      {new Date(int.scheduledAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      ({int.durationMinutes}m • {int.timeZone || 'Local TZ'})
                    </span>
                  </div>
                  {int.confirmedAccommodations && int.confirmedAccommodations.length > 0 && (
                    <p className="text-[11px] text-teal-800 bg-teal-50/60 p-2 rounded-lg border border-teal-100">
                      <strong>Accommodations Confirmed:</strong>{' '}
                      {int.confirmedAccommodations.join(' • ')}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenRubric(int)}
                    className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-xs"
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    <span>
                      {int.evaluationRubric ? 'View / Edit Rubric' : 'Complete Bias-Free Scorecard'}
                    </span>
                  </button>
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

              {/* Saved Rubric Summary */}
              {int.evaluationRubric && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Technical Execution
                    </span>
                    <span className="font-extrabold text-brand-700">
                      {int.evaluationRubric.technicalExecution} / 5
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Problem-Solving Clarity
                    </span>
                    <span className="font-extrabold text-brand-700">
                      {int.evaluationRubric.problemSolvingClarity} / 5
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Async Communication
                    </span>
                    <span className="font-extrabold text-brand-700">
                      {int.evaluationRubric.asyncCommunication} / 5
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Task Completion Quality
                    </span>
                    <span className="font-extrabold text-brand-700">
                      {int.evaluationRubric.taskCompletionQuality} / 5
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Feature #16: Bias-Free Structured Interview Rubric Modal */}
      {rubricInterview && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-floating border border-slate-200 p-6 sm:p-8 space-y-5">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Neuro-Inclusive Evaluation Standard</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                Bias-Free Skill Scorecard: {rubricInterview.candidateId?.fullName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluate strictly on objective task execution and problem-solving. Do not penalize for eye contact, vocal prosody, camera-off preference, or body language.
              </p>
            </div>

            <form onSubmit={handleSaveRubric} className="space-y-4 text-xs">
              {[
                { key: 'technicalExecution', label: '1. Technical / Domain Execution (1–5)' },
                { key: 'problemSolvingClarity', label: '2. Systematic Problem-Solving Logic (1–5)' },
                { key: 'asyncCommunication', label: '3. Written / Structured Clarity (1–5)' },
                { key: 'taskCompletionQuality', label: '4. Practical Work-Sample Accuracy (1–5)' },
              ].map((dim) => (
                <div key={dim.key} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <label className="font-bold text-slate-800">{dim.label}</label>
                  <select
                    value={(rubric as any)[dim.key]}
                    onChange={(e) =>
                      setRubric({ ...rubric, [dim.key]: Number(e.target.value) })
                    }
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 font-bold text-brand-700"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} / 5
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Objective Evidence Summary
                </label>
                <textarea
                  rows={3}
                  value={rubric.evaluatorSummary}
                  onChange={(e) => setRubric({ ...rubric, evaluatorSummary: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRubricInterview(null)}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingRubric}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl"
                >
                  {savingRubric ? 'Saving...' : 'Save Objective Scorecard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
