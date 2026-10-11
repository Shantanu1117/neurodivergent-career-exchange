import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { api } from '../../services/api.js';
import {
  HeartHandshake,
  ShieldCheck,
  Save,
  Sparkles,
  Check,
  X,
  Plus,
  FileText,
  Upload,
  Sliders,
  Download,
  Trash2,
  Compass,
  Lock,
  ArrowRight,
  ArrowLeft,
  Ear,
  Mail,
} from 'lucide-react';
import { EmailPreviewModal, EmailLogItem } from '../../components/common/EmailPreviewModal.js';

export const CandidateProfilePage: React.FC = () => {
  const { profile, setProfile, logout } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [emailingPassport, setEmailingPassport] = useState(false);
  const [previewEmail, setPreviewEmail] = useState<EmailLogItem | null>(null);

  // Guided Wizard Mode (Feature #12)
  const [wizardMode, setWizardMode] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // Smart CV / Portfolio Importer (Feature #14)
  const [showCvModal, setShowCvModal] = useState(false);
  const [cvRawText, setCvRawText] = useState('');
  const [parsingCv, setParsingCv] = useState(false);

  // Core Profile State
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [headline, setHeadline] = useState(profile?.headline || '');
  const [location, setLocation] = useState(profile?.location || 'Remote');
  const [bio, setBio] = useState(profile?.bio || '');
  const [skills, setSkills] = useState<string[]>(profile?.skills || []);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [strengths, setStrengths] = useState<string[]>(profile?.strengths || []);
  const [workMode, setWorkMode] = useState(profile?.workPreferences?.workMode || 'REMOTE');
  const [hours, setHours] = useState(profile?.workPreferences?.preferredHours || 'Flexible Daytime');
  const [modality, setModality] = useState(profile?.communicationPreferences?.primaryModality || 'WRITTEN');
  const [meetingFrequency, setMeetingFrequency] = useState(
    profile?.communicationPreferences?.meetingFrequency || 'MINIMAL'
  );
  const [accommodations, setAccommodations] = useState<string[]>(profile?.accommodations || []);
  const [howIWorkBest, setHowIWorkBest] = useState(profile?.howIWorkBest || '');
  const [shareAccommodationsPublicly, setShareAccommodationsPublicly] = useState(
    profile?.privacySettings?.shareAccommodationsPublicly ?? true
  );
  const [isSearchable, setIsSearchable] = useState(
    profile?.privacySettings?.isSearchableByRecruiters ?? true
  );

  // Feature #7: Sensory & Cognitive Work-Style Profile
  const [noiseTolerance, setNoiseTolerance] = useState<'LOW' | 'MODERATE' | 'HIGH'>(
    (profile as any)?.sensoryProfile?.noiseTolerance || 'LOW'
  );
  const [lightingPreference, setLightingPreference] = useState<'NATURAL_DIM' | 'MODERATE' | 'ANY'>(
    (profile as any)?.sensoryProfile?.lightingPreference || 'NATURAL_DIM'
  );
  const [interruptionTolerance, setInterruptionTolerance] = useState<'MINIMAL' | 'MODERATE' | 'FLEXIBLE'>(
    (profile as any)?.sensoryProfile?.interruptionTolerance || 'MINIMAL'
  );
  const [multitaskingStyle, setMultitaskingStyle] = useState<
    'SINGLE_TASK_FOCUS' | 'BALANCED' | 'CONTEXT_SWITCHING'
  >((profile as any)?.sensoryProfile?.multitaskingStyle || 'SINGLE_TASK_FOCUS');
  const [maxDailyMeetings, setMaxDailyMeetings] = useState<number>(
    (profile as any)?.sensoryProfile?.maxDailyMeetings ?? 2
  );

  // Feature #5: Transferable Skills Mapper
  const [transferableSkills, setTransferableSkills] = useState<
    Array<{ sourceExperience: string; mappedSkill: string; category: string }>
  >(
    (profile as any)?.transferableSkills?.length
      ? (profile as any).transferableSkills
      : [
          {
            sourceExperience: 'Self-Directed Debugging & Pattern Analysis',
            mappedSkill: 'Automated Testing & Bug Reproduction',
            category: 'SOFTWARE_TESTING_QA',
          },
        ]
  );
  const [newTransSource, setNewTransSource] = useState('');
  const [newTransMapped, setNewTransMapped] = useState('');

  // Feature #9: Private Accommodation Planner (Health Adjustment Passport)
  const [interviewStageAcc, setInterviewStageAcc] = useState<string[]>(
    (profile as any)?.accommodationPlanner?.interviewStage || [
      'Interview questions shared 24h in advance',
      'Camera-optional video interview',
    ]
  );
  const [offerStageAcc, setOfferStageAcc] = useState<string[]>(
    (profile as any)?.accommodationPlanner?.offerStage || [
      'Written offer breakdown with clear role expectations',
      'Flexible start-time discussion',
    ]
  );
  const [dayOneAcc, setDayOneAcc] = useState<string[]>(
    (profile as any)?.accommodationPlanner?.dayOneOnboarding || [
      'Written onboarding documentation',
      'Quiet workspace or remote setup',
      'Dedicated onboarding buddy',
    ]
  );
  const [privateNotes, setPrivateNotes] = useState<string>(
    (profile as any)?.accommodationPlanner?.privateNotes ||
      'Personal notes (never shared with employers): I do my deepest debugging work between 9 AM and 1 PM when notifications are snoozed.'
  );
  const [newPassportItem, setNewPassportItem] = useState('');
  const [passportTargetStage, setPassportTargetStage] = useState<'interview' | 'offer' | 'dayOne'>('interview');

  // Feature #19: Stage-Gate Disclosure Matrix
  const [accommodationsStage, setAccommodationsStage] = useState<
    'AT_APPLICATION' | 'AT_INTERVIEW' | 'POST_OFFER' | 'PRIVATE'
  >((profile as any)?.disclosurePreferences?.accommodationsStage || 'AT_INTERVIEW');
  const [sensoryProfileStage, setSensoryProfileStage] = useState<
    'AT_APPLICATION' | 'AT_INTERVIEW' | 'POST_OFFER' | 'PRIVATE'
  >((profile as any)?.disclosurePreferences?.sensoryProfileStage || 'AT_APPLICATION');

  // Feature #39: Account Deletion Confirmation
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setHeadline(profile.headline || '');
      setLocation(profile.location || 'Remote');
      setBio(profile.bio || '');
      setSkills(profile.skills || []);
      setStrengths(profile.strengths || []);
      setWorkMode(profile.workPreferences?.workMode || 'REMOTE');
      setHours(profile.workPreferences?.preferredHours || 'Flexible Daytime');
      setModality(profile.communicationPreferences?.primaryModality || 'WRITTEN');
      setMeetingFrequency(profile.communicationPreferences?.meetingFrequency || 'MINIMAL');
      setAccommodations(profile.accommodations || []);
      setHowIWorkBest(profile.howIWorkBest || '');
      setShareAccommodationsPublicly(profile.privacySettings?.shareAccommodationsPublicly ?? true);
      setIsSearchable(profile.privacySettings?.isSearchableByRecruiters ?? true);
      if ((profile as any).sensoryProfile) {
        setNoiseTolerance((profile as any).sensoryProfile.noiseTolerance || 'LOW');
        setLightingPreference((profile as any).sensoryProfile.lightingPreference || 'NATURAL_DIM');
        setInterruptionTolerance((profile as any).sensoryProfile.interruptionTolerance || 'MINIMAL');
        setMultitaskingStyle((profile as any).sensoryProfile.multitaskingStyle || 'SINGLE_TASK_FOCUS');
        setMaxDailyMeetings((profile as any).sensoryProfile.maxDailyMeetings ?? 2);
      }
      if ((profile as any).transferableSkills?.length) {
        setTransferableSkills((profile as any).transferableSkills);
      }
      if ((profile as any).accommodationPlanner) {
        setInterviewStageAcc((profile as any).accommodationPlanner.interviewStage || []);
        setOfferStageAcc((profile as any).accommodationPlanner.offerStage || []);
        setDayOneAcc((profile as any).accommodationPlanner.dayOneOnboarding || []);
        setPrivateNotes((profile as any).accommodationPlanner.privateNotes || '');
      }
      if ((profile as any).disclosurePreferences) {
        setAccommodationsStage((profile as any).disclosurePreferences.accommodationsStage || 'AT_INTERVIEW');
        setSensoryProfileStage((profile as any).disclosurePreferences.sensoryProfileStage || 'AT_APPLICATION');
      }
    }
  }, [profile]);

  const allStrengthOptions = [
    'Attention to Detail',
    'Pattern Recognition',
    'Deep Focus',
    'Systematic Verification',
    'Analytical Thinking',
    'Problem Solving',
    'Logical Thinking',
    'Quality Assurance',
    'Technical Ability',
    'Systematic Documentation',
    'Research',
    'Visual Precision',
    'Data Analysis',
  ];

  const standardAccommodations = [
    'Written task instructions standard',
    'Camera-optional video calls',
    'Noise-cancelling headphones allowance',
    'Quiet focus blocks (no meetings 1pm-5pm)',
    'Flexible core working hours',
    'Clear task expectations & checklists',
    'Advance meeting agendas & questions',
    'Asynchronous standups',
  ];

  const handleToggleStrength = (str: string) => {
    if (strengths.includes(str)) {
      setStrengths(strengths.filter((s) => s !== str));
    } else {
      setStrengths([...strengths, str]);
    }
  };

  const handleToggleAccommodation = (acc: string) => {
    if (accommodations.includes(acc)) {
      setAccommodations(accommodations.filter((a) => a !== acc));
    } else {
      setAccommodations([...accommodations, acc]);
    }
  };

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddTransferable = () => {
    if (!newTransSource.trim() || !newTransMapped.trim()) return;
    setTransferableSkills([
      ...transferableSkills,
      {
        sourceExperience: newTransSource.trim(),
        mappedSkill: newTransMapped.trim(),
        category: 'SOFTWARE_TESTING_QA',
      },
    ]);
    setNewTransSource('');
    setNewTransMapped('');
  };

  const handleAddPassportItem = () => {
    const val = newPassportItem.trim();
    if (!val) return;
    if (passportTargetStage === 'interview') {
      setInterviewStageAcc([...interviewStageAcc, val]);
    } else if (passportTargetStage === 'offer') {
      setOfferStageAcc([...offerStageAcc, val]);
    } else {
      setDayOneAcc([...dayOneAcc, val]);
    }
    setNewPassportItem('');
  };

  const handleParseCv = async () => {
    if (!cvRawText.trim()) {
      error('Please paste your resume/portfolio summary or upload a text file first.');
      return;
    }
    setParsingCv(true);
    try {
      const res = await api.parseCv(cvRawText);
      if (res.success && res.parsed) {
        const mergedSkills = Array.from(new Set([...skills, ...(res.parsed.skills || [])]));
        const mergedStrengths = Array.from(new Set([...strengths, ...(res.parsed.strengths || [])]));
        setSkills(mergedSkills);
        setStrengths(mergedStrengths);
        if (res.parsed.transferableSkills?.length) {
          setTransferableSkills([...transferableSkills, ...res.parsed.transferableSkills]);
        }
        if (!headline && res.parsed.suggestedHeadline) {
          setHeadline(res.parsed.suggestedHeadline);
        }
        if (!bio && res.parsed.suggestedBio) {
          setBio(res.parsed.suggestedBio);
        }
        success(
          `Extracted ${res.parsed.skills?.length || 0} skills and ${
            res.parsed.strengths?.length || 0
          } strengths from your resume!`
        );
        setShowCvModal(false);
        setCvRawText('');
      }
    } catch (err: any) {
      error(err.message || 'Could not parse CV text.');
    } finally {
      setParsingCv(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = String(ev.target?.result || '');
      setCvRawText(content);
    };
    reader.readAsText(file);
  };

  const handleDownloadPassport = () => {
    const passportDoc = {
      title: 'Neurodivergent Workplace Adjustment & Strengths Passport',
      candidateName: fullName,
      generatedAt: new Date().toISOString(),
      howIWorkBest,
      sensoryProfile: {
        noiseTolerance,
        lightingPreference,
        interruptionTolerance,
        multitaskingStyle,
        maxDailyMeetings,
      },
      communicationPreferences: {
        primaryModality: modality,
        meetingFrequency,
      },
      stagedAccommodations: {
        interviewStage: interviewStageAcc,
        offerStage: offerStageAcc,
        dayOneOnboarding: dayOneAcc,
      },
    };
    const blob = new Blob([JSON.stringify(passportDoc, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(fullName || 'candidate').toLowerCase().replace(/\s+/g, '-')}-adjustment-passport.json`;
    a.click();
    URL.revokeObjectURL(url);
    success('Personal Adjustment Passport downloaded!');
  };

  const handleExportAllData = async () => {
    try {
      const res = await api.exportCandidateData();
      if (res.success && res.exportBundle) {
        const blob = new Blob([JSON.stringify(res.exportBundle, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nce-data-export-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        success('Complete GDPR personal data archive exported.');
      }
    } catch (err: any) {
      error(err.message || 'Failed to export data.');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await api.deleteCandidateAccount();
      if (res.success) {
        success('Your account and all personal data have been permanently deleted.');
        logout();
        navigate('/');
      }
    } catch (err: any) {
      error(err.message || 'Failed to delete account.');
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const updatePayload = {
        fullName,
        headline,
        location,
        bio,
        skills,
        strengths,
        workPreferences: {
          workMode,
          employmentType: profile?.workPreferences?.employmentType || 'FULL_TIME',
          preferredHours: hours,
          environmentStructure: profile?.workPreferences?.environmentStructure || 'STRUCTURED',
          soundPreference: noiseTolerance === 'LOW' ? 'QUIET' : 'MODERATE',
        },
        communicationPreferences: {
          primaryModality: modality,
          meetingFrequency,
        },
        sensoryProfile: {
          noiseTolerance,
          lightingPreference,
          interruptionTolerance,
          multitaskingStyle,
          maxDailyMeetings,
          sensoryTriggers: ['Unannounced calls', 'High background chatter'],
        },
        transferableSkills,
        accommodationPlanner: {
          interviewStage: interviewStageAcc,
          offerStage: offerStageAcc,
          dayOneOnboarding: dayOneAcc,
          privateNotes,
        },
        disclosurePreferences: {
          accommodationsStage,
          sensoryProfileStage,
          shareAssessmentScores: true,
        },
        accommodations,
        howIWorkBest,
        onboardingCompleted: true,
        privacySettings: {
          shareAccommodationsPublicly: accommodationsStage !== 'PRIVATE',
          isSearchableByRecruiters: isSearchable,
        },
      };

      const res = await api.updateCandidateProfile(updatePayload);
      if (res.success) {
        setProfile(res.profile);
        success('Profile, Sensory Matrix & Adjustment Passport saved!');
      }
    } catch (err: any) {
      error(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleEmailPassport = async () => {
    setEmailingPassport(true);
    try {
      const res = await api.sendPassportEmail();
      if (res.success && res.email) {
        setPreviewEmail(res.email);
        success(res.message || 'Accommodation Passport sent to your email!');
      }
    } catch (err: any) {
      error(err.message || 'Failed to email Accommodation Passport.');
    } finally {
      setEmailingPassport(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Profile, Sensory Flow & Adjustment Passport
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Zero medical disclosure required. You control what is shared and at which hiring stage.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleEmailPassport}
            disabled={emailingPassport}
            className="inline-flex items-center gap-1.5 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>{emailingPassport ? 'Emailing...' : 'Email My Passport'}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowCvModal(true)}
            className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Smart CV / Portfolio Import</span>
          </button>
          <button
            type="button"
            onClick={() => setWizardMode((prev) => !prev)}
            className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-brand-600" />
            <span>{wizardMode ? 'Show All Sections' : 'Guided 4-Step Wizard'}</span>
          </button>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-card transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>
      </div>

      {/* Guided Wizard Stepper Bar (Feature #12) */}
      {wizardMode && (
        <div className="bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-950 dark:text-indigo-200">
            <span>
              Guided Low-Overwhelm Wizard — Step {wizardStep} of 4 (Untimed • Auto-Saves)
            </span>
            <span>{wizardStep * 25}% Complete</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { step: 1, label: '1. Identity & How I Work' },
              { step: 2, label: '2. Strengths & Skills' },
              { step: 3, label: '3. Sensory & Environment' },
              { step: 4, label: '4. Passport & Privacy' },
            ].map((item) => (
              <button
                key={item.step}
                type="button"
                onClick={() => setWizardStep(item.step)}
                className={`py-2 px-2 rounded-xl text-[11px] font-semibold transition-all ${
                  wizardStep === item.step
                    ? 'bg-brand-600 text-white shadow-sm'
                    : wizardStep > item.step
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Smart CV / Portfolio Importer Modal (Feature #14) */}
      {showCvModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Accessible CV / Portfolio Smart Importer
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCvModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Avoid retyping! Paste your resume, LinkedIn summary, GitHub README, or upload a{' '}
              <code>.txt</code> / <code>.md</code> file. Our deterministic parser extracts skills, cognitive
              strengths, and transferable competencies for your review.
            </p>
            <div>
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-brand-600 cursor-pointer mb-2">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload .txt / .md / .json file</span>
                <input
                  type="file"
                  accept=".txt,.md,.json,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <textarea
                rows={6}
                value={cvRawText}
                onChange={(e) => setCvRawText(e.target.value)}
                placeholder="Paste your resume, project descriptions, or coursework here (e.g. Experienced in Python, Cypress automated testing, SQL data auditing, and systematic verification...)"
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCvModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleParseCv}
                disabled={parsingCv}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold"
              >
                {parsingCv ? 'Extracting...' : 'Extract Skills & Strengths'}
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* STEP 1: Basic Information & "How I Work Best" */}
        {(!wizardMode || wizardStep === 1) && (
          <>
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-subtle space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                Basic Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Remote / Denver, CO"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Professional Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="QA Automation Engineer | Edge-Case Testing & Cypress Specialist"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Professional Summary (About)
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe your background and what fuels your focus..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white"
                />
              </div>
            </div>

            {/* HERO SECTION: "How I Work Best" Canvas */}
            <div className="bg-gradient-to-br from-indigo-50/70 via-white to-brand-50/60 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 rounded-3xl border-2 border-brand-200 dark:border-indigo-800 p-6 sm:p-8 shadow-card space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    The "How I Work Best" Statement
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Your direct briefing to recruiters explaining the conditions where you perform at your best.
                  </p>
                </div>
              </div>

              <textarea
                rows={4}
                value={howIWorkBest}
                onChange={(e) => setHowIWorkBest(e.target.value)}
                placeholder="Example: I perform best with clearly documented acceptance criteria, written bug reproduction steps, and dedicated blocks of uninterrupted deep focus."
                className="w-full p-4 bg-white dark:bg-slate-800 border border-brand-200 dark:border-indigo-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white shadow-subtle"
              />
            </div>
          </>
        )}

        {/* STEP 2: Cognitive Strengths, Technical Skills & Transferable Skills Mapper */}
        {(!wizardMode || wizardStep === 2) && (
          <>
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-subtle space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Cognitive Strengths & Superpowers
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select the cognitive abilities that reflect your thinking style
                  </p>
                </div>
                <span className="text-xs font-semibold text-brand-700 bg-brand-50 dark:bg-indigo-950 dark:text-indigo-300 px-2.5 py-1 rounded-lg">
                  {strengths.length} Selected
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {allStrengthOptions.map((str) => {
                  const selected = strengths.includes(str);
                  return (
                    <button
                      key={str}
                      type="button"
                      onClick={() => handleToggleStrength(str)}
                      className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between ${
                        selected
                          ? 'bg-brand-50 dark:bg-indigo-950/80 text-brand-900 dark:text-indigo-200 border-brand-500 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{str}</span>
                      {selected && <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Technical Skills */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-subtle space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                Technical & Professional Skills
              </h2>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={handleAddSkill}
                  placeholder="Add skill (e.g. Cypress, SQL, Wireshark, TypeScript) and press Enter"
                  className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="text-slate-400 hover:text-rose-600"
                      aria-label={`Remove ${s}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Feature #5: Transferable Skills & Cognitive Equivalency Mapper */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-subtle space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Transferable Skills & Non-Linear Experience Mapper
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Translate academic projects, open-source hobbies, or non-traditional experience into enterprise competencies recognized by our Match Engine.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                <input
                  type="text"
                  value={newTransSource}
                  onChange={(e) => setNewTransSource(e.target.value)}
                  placeholder="Your experience (e.g., University Lab Research)"
                  className="sm:col-span-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  value={newTransMapped}
                  onChange={(e) => setNewTransMapped(e.target.value)}
                  placeholder="Enterprise competency (e.g., Data Auditing & SQL)"
                  className="sm:col-span-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddTransferable}
                  className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold px-3 py-2 flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Map Skill
                </button>
              </div>

              <div className="space-y-2">
                {transferableSkills.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 text-xs"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {item.sourceExperience}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-brand-600" />
                      <span className="font-bold text-brand-700 dark:text-indigo-300">
                        {item.mappedSkill}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setTransferableSkills(transferableSkills.filter((_, i) => i !== idx))
                      }
                      className="text-slate-400 hover:text-rose-600"
                      aria-label="Remove transferable skill"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* STEP 3: Sensory & Cognitive Work-Style Profile (Feature #7) & Communication Matrix */}
        {(!wizardMode || wizardStep === 3) && (
          <>
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-subtle space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Ear className="w-5 h-5 text-brand-600" />
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Sensory & Cognitive Work-Style Profile
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Used to match you with sensory-compatible workspaces and low-burnout team rhythms.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Auditory / Noise Tolerance
                  </label>
                  <select
                    value={noiseTolerance}
                    onChange={(e) => setNoiseTolerance(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="LOW">Low (Quiet space / Noise-canceling required)</option>
                    <option value="MODERATE">Moderate (Calm office or hybrid)</option>
                    <option value="HIGH">High (Comfortable in dynamic spaces)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Visual / Lighting Preference
                  </label>
                  <select
                    value={lightingPreference}
                    onChange={(e) => setLightingPreference(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="NATURAL_DIM">Natural or Dimmable Lighting (No fluorescent glare)</option>
                    <option value="MODERATE">Standard Warm Office Lighting</option>
                    <option value="ANY">No Specific Lighting Sensitivity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Task Switching & Multitasking Style
                  </label>
                  <select
                    value={multitaskingStyle}
                    onChange={(e) => setMultitaskingStyle(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="SINGLE_TASK_FOCUS">Deep Single-Task Monotropism / Hyperfocus</option>
                    <option value="BALANCED">Structured Sprint Batching</option>
                    <option value="CONTEXT_SWITCHING">Comfortable with Rapid Context Switching</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Unscheduled Interruption Tolerance
                  </label>
                  <select
                    value={interruptionTolerance}
                    onChange={(e) => setInterruptionTolerance(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="MINIMAL">Minimal (Protected focus blocks + scheduled syncs)</option>
                    <option value="MODERATE">Moderate (Async ping before calling)</option>
                    <option value="FLEXIBLE">Flexible</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Preferred Maximum Synchronous Meetings Per Day</span>
                  <span className="text-brand-600 font-bold">{maxDailyMeetings} meetings / day</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={6}
                  value={maxDailyMeetings}
                  onChange={(e) => setMaxDailyMeetings(Number(e.target.value))}
                  className="w-full accent-brand-600 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Work Mode
                  </label>
                  <select
                    value={workMode}
                    onChange={(e) => setWorkMode(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="REMOTE">100% Remote</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="ONSITE">On-Site</option>
                    <option value="FLEXIBLE">Flexible</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Communication Modality
                  </label>
                  <select
                    value={modality}
                    onChange={(e) => setModality(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="WRITTEN">Written-First (Slack/Email/Docs)</option>
                    <option value="BALANCED">Balanced Written & Verbal</option>
                    <option value="VERBAL">Verbal-First</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Meeting Cadence
                  </label>
                  <select
                    value={meetingFrequency}
                    onChange={(e) => setMeetingFrequency(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="MINIMAL">Minimal (Async updates preferred)</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="STANDARD">Standard</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Requested Workplace Accommodations */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-subtle space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Success Enablers & Workplace Adjustments
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select adjustments that enable your highest productivity
                  </p>
                </div>
                <span className="text-xs font-semibold text-teal-700 bg-teal-50 dark:bg-teal-950 dark:text-teal-300 px-2.5 py-1 rounded-lg">
                  {accommodations.length} Selected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {standardAccommodations.map((acc) => {
                  const isChecked = accommodations.includes(acc);
                  return (
                    <label
                      key={acc}
                      className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer text-xs font-medium transition-all ${
                        isChecked
                          ? 'bg-teal-50/70 dark:bg-teal-950/60 border-teal-500 text-teal-900 dark:text-teal-200 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleAccommodation(acc)}
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span>{acc}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* STEP 4: Private Accommodation Planner (Feature #9), Stage-Gate Disclosure (Feature #19) & Data Sovereignty (Feature #39) */}
        {(!wizardMode || wizardStep === 4) && (
          <>
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-subtle space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-teal-600" />
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Private Accommodation Planner ("Health Adjustment Passport")
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Organize what you need at each hiring stage. Your private notes remain 100% confidential to you.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadPassport}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-semibold hover:bg-teal-100 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Passport</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={passportTargetStage}
                  onChange={(e) => setPassportTargetStage(e.target.value as any)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="interview">1. Interview Stage</option>
                  <option value="offer">2. Post-Offer Stage</option>
                  <option value="dayOne">3. Day-1 Onboarding</option>
                </select>
                <input
                  type="text"
                  value={newPassportItem}
                  onChange={(e) => setNewPassportItem(e.target.value)}
                  placeholder="Add custom stage adjustment (e.g., Written code review rubric)..."
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddPassportItem}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold"
                >
                  Add to Stage
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 block">
                    1. Interview Stage Needs
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {interviewStageAcc.map((item, idx) => (
                      <li key={idx} className="flex items-start justify-between gap-2">
                        <span>• {item}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setInterviewStageAcc(interviewStageAcc.filter((_, i) => i !== idx))
                          }
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-xs font-bold text-teal-700 dark:text-teal-300 block">
                    2. Offer & Negotiation Stage
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {offerStageAcc.map((item, idx) => (
                      <li key={idx} className="flex items-start justify-between gap-2">
                        <span>• {item}</span>
                        <button
                          type="button"
                          onClick={() => setOfferStageAcc(offerStageAcc.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 block">
                    3. Day-1 Onboarding Setup
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {dayOneAcc.map((item, idx) => (
                      <li key={idx} className="flex items-start justify-between gap-2">
                        <span>• {item}</span>
                        <button
                          type="button"
                          onClick={() => setDayOneAcc(dayOneAcc.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Personal Self-Advocacy Notes (100% Private — Never Visible to Employers)
                </label>
                <textarea
                  rows={2}
                  value={privateNotes}
                  onChange={(e) => setPrivateNotes(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            {/* Feature #19: Stage-Gate Privacy & Disclosure Control Matrix */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-subtle space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Stage-Gate Disclosure & Privacy Matrix</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    When to Share Requested Accommodations
                  </label>
                  <select
                    value={accommodationsStage}
                    onChange={(e) => setAccommodationsStage(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="AT_APPLICATION">At Application (Visible immediately)</option>
                    <option value="AT_INTERVIEW">At Interview Stage (Recommended)</option>
                    <option value="POST_OFFER">Only After Receiving a Job Offer</option>
                    <option value="PRIVATE">Keep 100% Private (Manual sharing only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    When to Share Sensory Work-Style Profile
                  </label>
                  <select
                    value={sensoryProfileStage}
                    onChange={(e) => setSensoryProfileStage(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="AT_APPLICATION">At Application (Used for Match Score)</option>
                    <option value="AT_INTERVIEW">At Interview Stage</option>
                    <option value="POST_OFFER">Post-Offer Only</option>
                    <option value="PRIVATE">Keep Private</option>
                  </select>
                </div>
              </div>

              <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Allow Verified Inclusive Recruiters to Discover My Profile
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Allows pre-vetted neuro-inclusive employers to invite you to apply based on strengths.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isSearchable}
                  onChange={(e) => setIsSearchable(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Feature #39: Candidate Data Sovereignty (GDPR Export & Self-Service Deletion) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-subtle space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Data Sovereignty & Account Ownership (GDPR)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You own 100% of your career, sensory, and accommodation data. Export a full machine-readable JSON copy or permanently erase your account at any time.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleExportAllData}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
                >
                  <Download className="w-4 h-4 text-brand-600" />
                  <span>Export All My Data (JSON)</span>
                </button>

                {!confirmDeleteOpen ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-semibold transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Account & Erase Data</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800">
                    <span className="text-xs font-bold text-rose-800 dark:text-rose-200 px-2">
                      Permanently erase account?
                    </span>
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
                    >
                      Confirm Erase
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteOpen(false)}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Wizard Navigation or Full Save Footer */}
        <div className="flex items-center justify-between pt-2">
          {wizardMode ? (
            <div className="flex items-center gap-2">
              {wizardStep > 1 && (
                <button
                  type="button"
                  onClick={() => setWizardStep((s) => s - 1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold"
                >
                  <ArrowLeft className="w-4 h-4" /> Previous Step
                </button>
              )}
              {wizardStep < 4 && (
                <button
                  type="button"
                  onClick={() => setWizardStep((s) => s + 1)}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                >
                  Next Step <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div />
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm px-8 py-3 rounded-xl shadow-card transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving changes...' : 'Save All Profile Changes'}</span>
          </button>
        </div>
      </form>

      <EmailPreviewModal
        email={previewEmail}
        isOpen={!!previewEmail}
        onClose={() => setPreviewEmail(null)}
        onResendToAddress={async (targetEmail) => {
          const res = await api.sendPassportEmail(targetEmail);
          if (res.success && res.email) {
            setPreviewEmail(res.email);
            success(`Accommodation Passport sent to ${targetEmail}!`);
          }
        }}
      />
    </div>
  );
};
