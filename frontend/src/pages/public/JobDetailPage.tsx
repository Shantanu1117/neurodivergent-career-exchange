import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Job, Application } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { MatchBreakdownModal } from '../../components/common/MatchBreakdownModal.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Bookmark,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Calendar,
  Share2,
  Send,
  AlertCircle,
  Eye,
  Check,
} from 'lucide-react';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Application Drawer / Modal State
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [candidateNote, setCandidateNote] = useState('');
  const [selectedAccommodations, setSelectedAccommodations] = useState<string[]>([]);
  const [submittingApply, setSubmittingApply] = useState(false);
  const [existingApplication, setExistingApplication] = useState<Application | null>(null);

  const fetchJob = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.getJobById(id);
      if (res.success) {
        setJob(res.job);
        setIsSaved(res.job.isSaved || false);
        if (res.job.hasApplied && res.job.userApplication) {
          setExistingApplication(res.job.userApplication);
        }
      }
    } catch (err: any) {
      error('Failed to load job details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-lg font-bold text-slate-800">Job not found</h2>
        <Link to="/jobs" className="text-xs text-brand-600 font-semibold mt-2 inline-block">
          Return to jobs directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 lg:py-12 space-y-8">
      {/* Back Button */}
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to all jobs</span>
      </Link>

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-lg text-brand-700 shrink-0">
              {job.employerId?.companyName ? job.employerId.companyName.charAt(0) : 'E'}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-1">
                <span className="font-semibold text-slate-800">{job.employerId?.companyName}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {job.location}
                </span>
                <span>•</span>
                <span className="font-semibold text-brand-700">{job.workMode}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
              title="Share job link"
              aria-label="Share job"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleToggleSave}
              className={`p-2.5 rounded-xl border transition-colors ${
                isSaved
                  ? 'bg-brand-50 border-brand-200 text-brand-600'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
              }`}
              title={isSaved ? 'Saved job' : 'Save job'}
              aria-label="Save job"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-brand-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Status / Match Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-3">
            {job.matchScore ? (
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 text-brand-800 border border-indigo-200/80 text-xs font-bold transition-colors"
              >
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>{job.matchScore}% Match Score</span>
                <span className="text-[10px] text-brand-600 underline font-medium">Why?</span>
              </button>
            ) : null}

            <span className="text-xs font-bold text-slate-700">
              ${Math.round(job.salaryMin / 1000)}k–${Math.round(job.salaryMax / 1000)}k / year
            </span>
          </div>

          <div>
            {existingApplication ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Application Status:</span>
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

      {/* Accommodations Highlight Box */}
      {job.accommodationsOffered && job.accommodationsOffered.length > 0 && (
        <div className="bg-teal-50/70 rounded-2xl border border-teal-200/80 p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-800">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Guaranteed Workplace Accommodations</span>
          </div>
          <p className="text-xs text-teal-900 leading-relaxed">
            This employer has pre-committed to providing the following adjustments for this role:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {job.accommodationsOffered.map((acc) => (
              <div key={acc} className="flex items-center gap-2 text-xs text-teal-900 font-medium">
                <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>{acc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Predictable Interview Process */}
      {job.interviewProcess && job.interviewProcess.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Predictable Interview Process
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            No surprise stages or stress tests. Here is exactly what will happen if you are invited to
            interview:
          </p>
          <div className="space-y-3 pt-2">
            {job.interviewProcess.map((stage) => (
              <div
                key={stage.stageNumber}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 block mb-0.5">
                    Stage {stage.stageNumber}: {stage.title}
                  </span>
                  <p className="text-slate-600 leading-relaxed">{stage.description}</p>
                </div>
                <div className="shrink-0 sm:text-right">
                  <span className="inline-block px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium text-[11px]">
                    {stage.duration} • {stage.format}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Job Description & Details */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-2">Role Overview</h2>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {job.description}
          </p>
        </div>

        {job.responsibilities && job.responsibilities.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Core Responsibilities</h3>
            <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
              {job.responsibilities.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        {job.requirements && job.requirements.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Requirements & Aptitudes</h3>
            <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
              {job.requirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-2">Cognitive Strengths Aligned</h3>
          <div className="flex flex-wrap gap-2">
            {(job.matchedStrengths || []).map((s) => (
              <span
                key={s}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-50 text-brand-800 border border-brand-200/60"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* About Company */}
      {job.employerId && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle space-y-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-bold text-slate-900">
              About {job.employerId.companyName}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {job.employerId.about}
          </p>
        </div>
      )}

      {/* Application Modal */}
      {applyModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-floating border border-slate-200 p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Apply to {job.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your profile strengths and work preferences will be shared directly with the hiring team.
              </p>
            </div>

            <form onSubmit={handleSubmitApplication} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Why are you interested in this role? (Optional)
                </label>
                <textarea
                  rows={3}
                  value={candidateNote}
                  onChange={(e) => setCandidateNote(e.target.value)}
                  placeholder="Share any specific context about your strengths, past projects, or interest..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Requested Workplace Accommodations:
                </label>
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  {(job.accommodationsOffered || []).map((acc) => (
                    <label key={acc} className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={selectedAccommodations.includes(acc)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAccommodations([...selectedAccommodations, acc]);
                          } else {
                            setSelectedAccommodations(selectedAccommodations.filter((a) => a !== acc));
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
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
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
