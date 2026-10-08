import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Check,
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

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
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

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
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

  const handleSubmit = async () => {
    // Verify all answered
    const unanswered = questions.filter((q) => selectedAnswers[q.questionId] === undefined);
    if (unanswered.length > 0) {
      error(`Please answer all questions (${unanswered.length} remaining).`);
      return;
    }

    setSubmitting(true);
    try {
      const formattedAnswers = Object.entries(selectedAnswers).map(([qId, optIdx]) => ({
        questionId: Number(qId),
        selectedOptionIndex: optIdx,
      }));

      const res = await api.submitAssessment(formattedAnswers);
      if (res.success) {
        success('Assessment completed! Discover your career fit matches.');
        navigate('/candidate/results');
      }
    } catch (err: any) {
      error(err.message || 'Failed to submit assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500">Preparing assessment engine...</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progressPct = Math.round(((currentIndex + 1) / questions.length) * 100);
  const isOptionSelected = currentQ ? selectedAnswers[currentQ.questionId] !== undefined : false;
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 lg:py-12 space-y-8">
      {/* Header */}
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold">
          <Compass className="w-3.5 h-3.5" />
          <span>Interactive Cognitive Fit Assessment</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Discover Where Your Mind Thrives
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          18 questions evaluating your problem-solving rhythm, attention focus, and environment preferences.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold text-slate-600">
          <span>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-brand-600">{progressPct}% Completed</span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-brand-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Active Question Card */}
      {currentQ && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle space-y-6">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
              Dimension: {currentQ.categoryDimension}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {currentQ.prompt}
            </h2>
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
                      ? 'bg-brand-50/70 border-brand-500 ring-2 ring-brand-500/20 text-slate-900'
                      : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100/70 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-slate-300 bg-white group-hover:border-slate-400'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-xs sm:text-sm leading-relaxed">{option.text}</span>
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {isLastQuestion ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !isOptionSelected}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-xl shadow-card transition-colors disabled:opacity-50"
              >
                <span>{submitting ? 'Calculating Matches...' : 'Complete & View Results'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            ) : (
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
          </div>
        </div>
      )}

      {/* Voluntary Privacy Guarantee */}
      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 text-center">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>No diagnostic claims made. Results can be retaken at any time.</span>
      </div>
    </div>
  );
};
