import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Job, Application } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { useAccessibility } from '../../context/AccessibilityContext.js';
import { MatchBreakdownModal } from '../../components/common/MatchBreakdownModal.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Bookmark,
  Sparkles,
  ShieldCheck,
  Clock,
  Share2,
  Send,
  Check,
  Volume2,
  Square,
  FileText,
  BookOpen,
  Ear,
  Code2,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { success, error, info } = useToast();
  const { speakText, stopSpeaking, isSpeaking } = useAccessibility();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Feature #13: Plain-Language Summary Toggle
  const [plainLanguageMode, setPlainLanguageMode] = useState(false);

  // Feature #4: Skill-Gap Analysis & Actionable Learning Bridge
  const [skillGap, setSkillGap] = useState<any | null>(null);

  // Application Drawer / Modal State (Features #17 & #18)
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [candidateNote, setCandidateNote] = useState('');
  const [selectedAccommodations, setSelectedAccommodations] = useState<string[]>([]);
  const [submissionType, setSubmissionType] = useState<'STANDARD' | 'WORK_SAMPLE' | 'ASYNC_WALKTHROUGH'>('STANDARD');
  const [workSampleText, setWorkSampleText] = useState('');
  const [workSampleUrl, setWorkSampleUrl] = useState('');
  const [preferredInterviewFormat, setPreferredInterviewFormat] = useState<
    'VIDEO' | 'WRITTEN_ASYNC' | 'TAKE_HOME_TASK' | 'PHONE' | 'FLEXIBLE'
  >('FLEXIBLE');
  const [submittingApply, setSubmittingApply] = useState(false);
  const [existingApplication, setExistingApplication] = useState<Application | null>(null);

  const fetchJob = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.getJobById(id);
      if (res.success && res.job) {
        setJob(res.job);
        setIsSaved(res.job.isSaved || false);
        if (res.job.hasApplied && res.job.userApplication) {
          setExistingApplication(res.job.userApplication);
        }
      }
      if (user?.role === 'CANDIDATE') {
        api
          .getSkillGapAnalysis(id)
          .then((gapRes) => {
            if (gapRes.success) {
              setSkillGap(gapRes.skillGap);
            }
          })
          .catch(() => {});
      }
    } catch (err: any) {
      error('Failed to load job details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id, user?.role]);

  const handleToggleSave = async () => {
    if (!user || user.role !== 'CANDIDATE') {
      error('Please sign in as a candidate to save jobs.');
      return;
    }
    if (!job) return;

    try {
      const res = await api.toggleSaveJob(job._id);
      if (res.success) {
        setIsSaved(res.isSaved);
        if (res.isSaved) success('Job saved to your bookmarks.');
        else success('Job removed from saved.');
      }
    } catch (err: any) {
      error(err.message || 'Failed to toggle save.');
    }
  };

  const handleOpenApplyModal = () => {
    if (!user) {
      navigate(`/login?redirect=/jobs/${id}`);
      return;
    }
    if (user.role !== 'CANDIDATE') {
      error('Only candidate accounts can submit job applications.');
      return;
    }
    if (job?.accommodationsOffered) {
      setSelectedAccommodations([...job.accommodationsOffered]);
    }
    if (job?.workSampleTask?.enabled) {
      setSubmissionType('WORK_SAMPLE');
    }
    setApplyModalOpen(true);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    setSubmittingApply(true);
    try {
      const res = await api.applyToJob({
        jobId: job._id,
        candidateNote,
        requestedAccommodations: selectedAccommodations,
        submissionType,
        preferredInterviewFormat,
        workSampleSubmission:
          submissionType !== 'STANDARD'
            ? {
                taskPrompt: job.workSampleTask?.title || 'Practical Skill Demonstration',
                responseText: workSampleText,
                artifactUrl: workSampleUrl,
              }
            : undefined,
      });

      if (res.success) {
        success('Application submitted successfully!');
        setApplyModalOpen(false);
        setExistingApplication(res.application);
        fetchJob();
      }
    } catch (err: any) {
      error(err.message || 'Failed to submit application.');
    } finally {
      setSubmittingApply(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    info('Job link copied to clipboard!');
  };

  const handleReadJobAloud = () => {
    if (!job) return;
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    const textToSpeak = `${job.title} at ${job.employerId?.companyName || 'Verified Employer'}. Location: ${
      job.location
    }, ${job.workMode}. ${
      plainLanguageMode && job.plainLanguageSummary ? job.plainLanguageSummary : job.description
    }. Guaranteed accommodations include: ${(job.accommodationsOffered || []).join(', ')}.`;
    speakText(textToSpeak);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 dark:text-slate-400">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Job not found</h2>
        <Link to="/jobs" className="text-xs text-brand-600 dark:text-indigo-400 font-semibold mt-2 inline-block">
          Return to jobs directory
        </Link>
      </div>
    );
  }

  const essentialList =
    job.essentialRequirements && job.essentialRequirements.length > 0
      ? job.essentialRequirements
      : job.requiredSkills || [];
  const preferredList =
    job.preferredRequirements && job.preferredRequirements.length > 0
      ? job.preferredRequirements
      : job.preferredSkills || [];

  const sensoryNoise = job.sensoryEnvironment?.noiseLevel || (job.workMode === 'ONSITE' ? 'MODERATE' : 'QUIET');
  const sensoryMeetings = job.sensoryEnvironment?.meetingLoad || 'MINIMAL';
  const sensoryComms = String(
    job.sensoryEnvironment?.communicationStyle || 'Async-first written documentation'
  ).replace(/_/g, ' ');
  const sensoryAutonomy = String(
    job.sensoryEnvironment?.teamAutonomy || 'Structured High Autonomy'
  ).replace(/_/g, ' ');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 lg:py-12 space-y-8">
      {/* Back Button */}
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to all jobs</span>
      </Link>

      {/* Main Header Card */}
      <div
        data-gsap="fade-up"
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-subtle space-y-6 transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center font-bold text-lg text-brand-700 dark:text-indigo-300 shrink-0">
              {job.employerId?.companyName ? job.employerId.companyName.charAt(0) : 'E'}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300 mt-1">
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {job.employerId?.companyName || 'Verified Neuro-Inclusive Employer'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {job.location}
                </span>
                <span>•</span>
                <span className="font-semibold text-brand-700 dark:text-indigo-400">{job.workMode}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Feature #32: Read Aloud TTS Button */}
            <button
              type="button"
              onClick={handleReadJobAloud}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-colors ${
                isSpeaking
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title="Read job description aloud"
            >
              {isSpeaking ? <Square className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isSpeaking ? 'Stop Audio' : 'Read Aloud'}</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Share job link"
              aria-label="Share job"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleToggleSave}
              className={`p-2.5 rounded-xl border transition-colors ${
                isSaved
                  ? 'bg-brand-50 dark:bg-indigo-950 border-brand-200 dark:border-indigo-700 text-brand-600 dark:text-indigo-400'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
              title={isSaved ? 'Saved job' : 'Save job'}
              aria-label="Save job"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-brand-600 dark:fill-indigo-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Status / Match Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700">
          <div className="flex items-center gap-3">
            {job.matchScore ? (
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100/80 text-brand-800 dark:text-indigo-200 border border-indigo-200/80 dark:border-indigo-800 text-xs font-bold transition-colors"
              >
                <Sparkles className="w-4 h-4 text-brand-600 dark:text-indigo-400" />
                <span>{job.matchScore}% Match Score</span>
                <span className="text-[10px] text-brand-600 dark:text-indigo-400 underline font-medium">
                  Why?
                </span>
              </button>
            ) : null}

            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              ${Math.round((job.salaryMin || 75000) / 1000)}k–${Math.round((job.salaryMax || 110000) / 1000)}k / year
            </span>
          </div>

          <div>
            {existingApplication ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Application Status:
                </span>
                <StatusBadge status={existingApplication.status} />
              </div>
            ) : (
              <button
                onClick={handleOpenApplyModal}
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-card transition-colors"
              >
                <span>Apply with Accommodations</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feature #29: Sensory & Cognitive Load Transparency Card */}
      <div
        data-gsap="fade-up"
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-subtle space-y-4 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Ear className="w-5 h-5 text-brand-600 dark:text-indigo-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Workplace Sensory & Cognitive Environment
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Ambient Noise
            </span>
            <span className="font-bold text-slate-900 dark:text-white mt-1 block">{sensoryNoise}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Meeting Load
            </span>
            <span className="font-bold text-slate-900 dark:text-white mt-1 block">{sensoryMeetings}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Communication Style
            </span>
            <span className="font-bold text-slate-900 dark:text-white mt-1 block">{sensoryComms}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Task Autonomy
            </span>
            <span className="font-bold text-slate-900 dark:text-white mt-1 block">{sensoryAutonomy}</span>
          </div>
        </div>
      </div>

      {/* Feature #4: Skill-Gap Analysis & Actionable Learning Bridge */}
      {skillGap && (
        <div
          data-gsap="fade-up"
          className="bg-indigo-50/50 dark:bg-indigo-950/30 rounded-3xl border border-indigo-200/80 dark:border-indigo-800/80 p-6 space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-600 dark:text-indigo-400" />
                <span>Personalized Skill-Gap & Learning Bridge</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                You match <strong>{skillGap.readinessPercent ?? 85}%</strong> of this role&apos;s core skills.
                Even if you don&apos;t meet 100% of preferred items, we encourage you to apply!
              </p>
            </div>
            <Link
              to="/resources"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-indigo-400 hover:text-brand-800 shrink-0"
            >
              <span>Open Learning Hub</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
              <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  Your Matched & Transferable Skills ({(skillGap.matchedCoreSkills || []).length})
                </span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(skillGap.matchedCoreSkills || []).length > 0 ? (
                  skillGap.matchedCoreSkills.map((s: string) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold"
                    >
                      ✓ {s}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 dark:text-slate-400">
                    Add skills to your profile to see direct matches.
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
              <span className="font-bold text-amber-800 dark:text-amber-400 block">
                Growth Opportunities ({(skillGap.missingCoreSkills || []).length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(skillGap.missingCoreSkills || []).length > 0 ? (
                  skillGap.missingCoreSkills.map((s: string) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-medium"
                    >
                      + {s}
                    </span>
                  ))
                ) : (
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                    You meet 100% of the core required skills for this role!
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accommodations Highlight Box */}
      {job.accommodationsOffered && job.accommodationsOffered.length > 0 && (
        <div
          data-gsap="fade-up"
          className="bg-teal-50/70 dark:bg-teal-950/40 rounded-2xl border border-teal-200/80 dark:border-teal-800 p-5 sm:p-6 space-y-3"
        >
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Guaranteed Workplace Accommodations</span>
          </div>
          <p className="text-xs text-teal-900 dark:text-teal-200 leading-relaxed">
            This employer has pre-committed to providing the following adjustments for this role:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {job.accommodationsOffered.map((acc) => (
              <div
                key={acc}
                className="flex items-center gap-2 text-xs text-teal-900 dark:text-teal-200 font-medium"
              >
                <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>{acc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Predictable Interview Process */}
      {job.interviewProcess && job.interviewProcess.length > 0 && (
        <div
          data-gsap="fade-up"
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-subtle space-y-4 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Predictable Interview Process
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No surprise stages or stress tests. Here is exactly what will happen if you are invited to
            interview:
          </p>
          <div className="space-y-3 pt-2">
            {job.interviewProcess.map((stage) => (
              <div
                key={stage.stageNumber}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                    Stage {stage.stageNumber}: {stage.title}
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{stage.description}</p>
                </div>
                <div className="shrink-0 sm:text-right">
                  <span className="inline-block px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                    {stage.duration} • {stage.format}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Job Description & Plain-Language Toggle (Feature #13) */}
      <div
        data-gsap="fade-up"
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-subtle space-y-6 transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Role Overview & Expectations
          </h2>
          <button
            type="button"
            onClick={() => setPlainLanguageMode(!plainLanguageMode)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
              plainLanguageMode
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>
              {plainLanguageMode ? 'Showing Plain-Language Summary' : 'Switch to Plain-Language View'}
            </span>
          </button>
        </div>

        {plainLanguageMode && job.plainLanguageSummary ? (
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 dark:text-indigo-300 block">
              W3C COGA Plain-Language Summary (No Corporate Jargon)
            </span>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
              {job.plainLanguageSummary}
            </p>
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {job.description}
          </p>
        )}

        {job.responsibilities && job.responsibilities.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Core Day-to-Day Responsibilities
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
              {job.responsibilities.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Feature #13: Essential ("Must-Have") vs. Preferred ("Nice-to-Have") Requirements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Essential &quot;Must-Have&quot; Skills
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-brand-100 dark:bg-indigo-950 text-brand-800 dark:text-indigo-300">
                Core to Role
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              These are the actual day-1 skills needed. You do not need to know everything else!
            </p>
            <ul className="space-y-1.5 text-xs text-slate-800 dark:text-slate-200 font-medium pt-1">
              {essentialList.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-brand-600 dark:text-indigo-400 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Bonus &quot;Nice-to-Have&quot; Skills
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                100% Optional
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Can be learned on the job. Please apply even if you have zero of these bonus skills.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-1">
              {preferredList.length > 0 ? (
                preferredList.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-400 italic">No optional bonus requirements listed.</li>
              )}
            </ul>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
            Cognitive Strengths Aligned
          </h3>
          <div className="flex flex-wrap gap-2">
            {(job.matchedStrengths || []).map((s) => (
              <span
                key={s}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-50 dark:bg-indigo-950/80 text-brand-800 dark:text-indigo-300 border border-brand-200/60 dark:border-indigo-800"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* About Company */}
      {job.employerId && (
        <div
          data-gsap="fade-up"
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-subtle space-y-3 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              About {job.employerId.companyName}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {job.employerId.about || 'Verified inclusive employer partner committed to structured workflows and workplace accommodations.'}
          </p>
        </div>
      )}

      {/* Application Modal with Work-Sample & Interview Format Selector (Features #17 & #18) */}
      {applyModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-floating border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Apply to {job.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Choose your preferred evaluation style and confirm your workplace accommodations.
              </p>
            </div>

            <form onSubmit={handleSubmitApplication} className="space-y-4">
              {/* Feature #18: Application Modality (Standard vs Work-Sample) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  1. Choose How You Want to Demonstrate Your Skills:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'STANDARD', label: 'Profile + Note', desc: 'Standard strengths-based application' },
                    { id: 'WORK_SAMPLE', label: 'Work-Sample Task', desc: 'Show practical output instead of resume' },
                    { id: 'ASYNC_WALKTHROUGH', label: 'Async Walkthrough', desc: 'Share a GitHub / Loom / portfolio link' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setSubmissionType(mode.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        submissionType === mode.id
                          ? 'bg-brand-50 dark:bg-indigo-950 border-brand-600 dark:border-indigo-500 text-brand-900 dark:text-white ring-1 ring-brand-500'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className="font-bold block">{mode.label}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                        {mode.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {submissionType !== 'STANDARD' && (
                <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-950 dark:text-indigo-200">
                    <Code2 className="w-4 h-4 text-brand-600 dark:text-indigo-400" />
                    <span>
                      {job.workSampleTask?.title || 'Optional Practical Work-Sample Demonstration'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {job.workSampleTask?.instructions ||
                      'Share a brief walkthrough of how you solve problems in this domain, or link to a past project/artifact.'}
                  </p>
                  <textarea
                    rows={3}
                    value={workSampleText}
                    onChange={(e) => setWorkSampleText(e.target.value)}
                    placeholder="Write your practical approach, test cases, or structured walkthrough here..."
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                  <input
                    type="url"
                    value={workSampleUrl}
                    onChange={(e) => setWorkSampleUrl(e.target.value)}
                    placeholder="Optional Link to GitHub Repo, Figma, Google Doc, or Loom Walkthrough..."
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
              )}

              {/* Feature #17: Preferred Interview Format */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  2. Preferred Interview Modality (No Penalty for Any Choice):
                </label>
                <select
                  value={preferredInterviewFormat}
                  onChange={(e) => setPreferredInterviewFormat(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white"
                >
                  <option value="FLEXIBLE">Flexible (Open to any structured format)</option>
                  <option value="WRITTEN_ASYNC">Written / Text-Based Asynchronous Q&A</option>
                  <option value="TAKE_HOME_TASK">Practical Paid/Scoped Take-Home Task + Review</option>
                  <option value="VIDEO">
                    Video Call with Questions Sent 48h in Advance (Camera Optional)
                  </option>
                  <option value="PHONE">Audio-Only Call</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  3. Additional Context for Hiring Team (Optional)
                </label>
                <textarea
                  rows={2}
                  value={candidateNote}
                  onChange={(e) => setCandidateNote(e.target.value)}
                  placeholder="Share any context about your strengths, working style, or interest..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  4. Confirm Requested Workplace Accommodations:
                </label>
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs max-h-36 overflow-y-auto">
                  {(job.accommodationsOffered || []).map((acc) => (
                    <label
                      key={acc}
                      className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-200"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAccommodations.includes(acc)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAccommodations([...selectedAccommodations, acc]);
                          } else {
                            setSelectedAccommodations(
                              selectedAccommodations.filter((a) => a !== acc)
                            );
                          }
                        }}
                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span>{acc}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingApply}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {submittingApply ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MatchBreakdownModal job={job} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};
