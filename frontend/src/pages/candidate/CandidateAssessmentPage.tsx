import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';
import { useAccessibility } from '../../context/AccessibilityContext.js';
import { CourseQuizHub } from '../../components/assessment/CourseQuizHub.js';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Check,
  Layers,
  Zap,
  Volume2,
  Square,
  BarChart3,
} from 'lucide-react';

interface Question {
  questionId: number;
  prompt: string;
  categoryDimension: string;
  options: Array<{ text: string }>;
}

export const CandidateAssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { speakText, stopSpeaking, isSpeaking } = useAccessibility();

  const [activeTab, setActiveTab] = useState<'ASSESSMENT' | 'COURSE_QUIZZES'>('ASSESSMENT');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>(() => {
    try {
      const saved = localStorage.getItem('nce_assessment_draft_answers');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await api.getAssessmentQuestions();
        if (res.success && res.questions) {
          setQuestions(res.questions);
        }
      } catch (err: any) {
        error('Failed to load assessment questions.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  // Persist draft answers automatically so neurodivergent users never lose progress
  useEffect(() => {
    try {
      localStorage.setItem('nce_assessment_draft_answers', JSON.stringify(selectedAnswers));
    } catch {
      // ignore storage quota errors
    }
  }, [selectedAnswers]);

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    if (autoAdvance && currentIndex < questions.length - 1) {
      window.setTimeout(() => {
        setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
      }, 240);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const submitAnswersPayload = async (answersMap: Record<number, number>) => {
    setSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answersMap).map(([qId, optIdx]) => ({
        questionId: Number(qId),
        selectedOptionIndex: optIdx,
      }));

      const res = await api.submitAssessment(formattedAnswers);
      if (res.success) {
        // Cache result in localStorage so Results page renders instantaneously
        localStorage.setItem(
          'nce_latest_assessment_result',
          JSON.stringify({
            scores: res.scores,
            primaryMatch: res.primaryMatch,
            explanations: res.explanations,
            completedAt: new Date().toISOString(),
          })
        );
        success('Assessment completed! Redirecting to your Career Fit Results & Matched Jobs...');
        navigate('/candidate/results');
      }
    } catch (err: any) {
      error(err.message || 'Failed to submit assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    const unanswered = questions.filter((q) => selectedAnswers[q.questionId] === undefined);
    if (unanswered.length > 0) {
      const firstUnansweredIdx = questions.findIndex(
        (q) => selectedAnswers[q.questionId] === undefined
      );
      if (firstUnansweredIdx !== -1) {
        setCurrentIndex(firstUnansweredIdx);
      }
      error(`Please answer all questions (${unanswered.length} remaining). Jumped to Question #${firstUnansweredIdx + 1}.`);
      return;
    }

    await submitAnswersPayload(selectedAnswers);
  };

  const handleQuickDemoComplete = async () => {
    if (questions.length === 0) return;
    const demoAnswers: Record<number, number> = {};
    questions.forEach((q, idx) => {
      demoAnswers[q.questionId] = idx % Math.max(1, q.options.length);
    });
    setSelectedAnswers(demoAnswers);
    await submitAnswersPayload(demoAnswers);
  };

  const handleReadCurrentQuestion = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    const text = `Question ${currentIndex + 1}, Dimension ${currentQ.categoryDimension}. ${
      currentQ.prompt
    }. Options: ${currentQ.options.map((o, idx) => `Option ${idx + 1}: ${o.text}`).join('. ')}`;
    speakText(text);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Preparing cognitive assessment & skill quiz engine...
        </p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const answeredCount = questions.filter((q) => selectedAnswers[q.questionId] !== undefined).length;
  const progressPct = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;
  const isOptionSelected = currentQ ? selectedAnswers[currentQ.questionId] !== undefined : false;
  const isLastQuestion = currentIndex === questions.length - 1;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 lg:py-10 space-y-8">
      {/* Top Hero Header & Mode Switcher */}
      <div className="bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-card space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold">
              <Compass className="w-3.5 h-3.5 text-brand-300" />
              <span>Neuro-Affirming Assessment & Skill Verification Suite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Discover Where Your Mind Thrives & Verify Field Skills
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
              Complete the 18-question Cognitive Fit Assessment to unlock your personalized Results
              Dashboard and Matched Jobs, or practice multi-level technical quizzes across 6 career
              tracks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              to="/candidate/results"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 transition-colors"
            >
              <BarChart3 className="w-4 h-4 text-emerald-300" />
              <span>View Results & Matched Jobs</span>
            </Link>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('ASSESSMENT')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ASSESSMENT'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'bg-white/10 text-indigo-100 hover:bg-white/20'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>1. 18-Q Cognitive Fit Assessment ({answeredCount}/{questions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('COURSE_QUIZZES')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'COURSE_QUIZZES'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'bg-white/10 text-indigo-100 hover:bg-white/20'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>2. Course Sequence & 3-Level Field Quizzes (6 Tracks)</span>
          </button>
        </div>
      </div>

      {activeTab === 'COURSE_QUIZZES' ? (
        <CourseQuizHub />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 cols): Active Question Workbench */}
          <div className="lg:col-span-8 space-y-6">
            {/* Progress & Controls Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-subtle space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span>
                  Question <strong>{currentIndex + 1}</strong> of <strong>{questions.length}</strong>{' '}
                  ({answeredCount} answered)
                </span>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-600 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={autoAdvance}
                      onChange={(e) => setAutoAdvance(e.target.checked)}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span>Auto-advance on select</span>
                  </label>
                  <span className="text-brand-600 dark:text-indigo-400 font-extrabold">
                    {progressPct}% Completed
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-brand-600 via-indigo-500 to-teal-400 h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Active Question Card */}
            {currentQ && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-subtle space-y-6 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-brand-50 dark:bg-indigo-950 text-[11px] font-bold uppercase tracking-wider text-brand-700 dark:text-indigo-300 border border-brand-200/60 dark:border-indigo-800">
                      <Sparkles className="w-3 h-3" />
                      Dimension: {currentQ.categoryDimension}
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                      {currentQ.prompt}
                    </h2>
                  </div>

                  {/* Read Aloud Button */}
                  <button
                    type="button"
                    onClick={handleReadCurrentQuestion}
                    className={`p-2.5 rounded-xl border text-xs font-bold shrink-0 transition-colors ${
                      isSpeaking
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                    title="Read question aloud"
                  >
                    {isSpeaking ? <Square className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                {/* Options Grid */}
                <div className="space-y-3">
                  {currentQ.options.map((option, idx) => {
                    const isSelected = selectedAnswers[currentQ.questionId] === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectOption(currentQ.questionId, idx)}
                        className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all flex items-start gap-3.5 group ${
                          isSelected
                            ? 'bg-brand-50/80 dark:bg-indigo-950/80 border-brand-600 dark:border-indigo-400 ring-2 ring-brand-500/20 text-slate-900 dark:text-white shadow-xs'
                            : 'bg-slate-50/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full border mt-0.5 flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${
                            isSelected
                              ? 'border-brand-600 bg-brand-600 text-white'
                              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-500 group-hover:border-brand-400'
                          }`}
                        >
                          {isSelected ? <Check className="w-3.5 h-3.5 text-white" /> : idx + 1}
                        </div>
                        <span className="text-xs sm:text-sm leading-relaxed font-medium">
                          {option.text}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Navigation & Submit Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-2.5">
                    {!isLastQuestion && (
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={!isOptionSelected}
                        className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-xl shadow-card transition-colors disabled:opacity-40"
                      >
                        <span>Next Question</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    {(isLastQuestion || allAnswered) && (
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting || !allAnswered}
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-card transition-colors disabled:opacity-50"
                      >
                        <span>
                          {submitting
                            ? 'Calculating Matches...'
                            : 'Complete Assessment & View Results'}
                        </span>
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column (4 cols): 18-Question Navigator Map & Quick Demo Complete */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Question Navigator
                </h3>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {answeredCount} / {questions.length} Done
                </span>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {questions.map((q, idx) => {
                  const answered = selectedAnswers[q.questionId] !== undefined;
                  const active = idx === currentIndex;
                  return (
                    <button
                      key={q.questionId}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-9 rounded-xl text-xs font-bold border transition-all flex items-center justify-center ${
                        active
                          ? 'bg-brand-600 text-white border-brand-600 ring-2 ring-brand-500/30'
                          : answered
                          ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-brand-300'
                      }`}
                      title={`Question ${idx + 1}: ${q.categoryDimension}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {allAnswered && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-sm transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {submitting ? 'Submitting...' : 'Submit All 18 Answers & See Results'}
                  </span>
                </button>
              )}

              {/* Instant Demo Complete Helper */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Quick Testing Mode
                </span>
                <button
                  type="button"
                  onClick={handleQuickDemoComplete}
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-brand-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition-colors"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Auto-Fill All 18 & Go To Results Page</span>
                </button>
              </div>
            </div>

            {/* Course Quiz Shortcut Card */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 space-y-3 shadow-md">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <Layers className="w-4 h-4" />
                <span>Skill Verification Hub</span>
              </div>
              <h3 className="text-sm font-extrabold">
                Want to practice field-specific quizzes by level?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Explore our 6 sequenced course blocks (QA, Cybersecurity, Data Audit, Software Eng,
                UI/UX, Technical Docs) and take Level 1, 2, or 3 quizzes.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('COURSE_QUIZZES')}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-white text-slate-900 hover:bg-indigo-50 text-xs font-bold transition-colors"
              >
                <span>Open Course Blocks & Quizzes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Voluntary Privacy Guarantee */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 text-center px-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>No medical disclosure required. Retake anytime.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
