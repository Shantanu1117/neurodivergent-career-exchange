import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { api } from '../../services/api.js';
import { CandidateProfile } from '../../types/index.js';
import {
  User,
  HeartHandshake,
  ShieldCheck,
  Save,
  CheckCircle2,
  Sparkles,
  MapPin,
  Mail,
  Sliders,
  Check,
  X,
  Plus,
} from 'lucide-react';

export const CandidateProfilePage: React.FC = () => {
  const { profile, setProfile } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State initialized from profile
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
  const [meetingFrequency, setMeetingFrequency] = useState(profile?.communicationPreferences?.meetingFrequency || 'MINIMAL');
  const [accommodations, setAccommodations] = useState<string[]>(profile?.accommodations || []);
  const [howIWorkBest, setHowIWorkBest] = useState(profile?.howIWorkBest || '');
  const [shareAccommodationsPublicly, setShareAccommodationsPublicly] = useState(
    profile?.privacySettings?.shareAccommodationsPublicly ?? true
  );
  const [isSearchable, setIsSearchable] = useState(
    profile?.privacySettings?.isSearchableByRecruiters ?? true
  );

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
    }
  }, [profile]);

  const allStrengthOptions = [
    'Attention to Detail',
    'Pattern Recognition',
    'Deep Focus',
    'Analytical Thinking',
    'Problem Solving',
    'Logical Thinking',
    'Quality Assurance',
    'Technical Ability',
    'Documentation',
    'Research',
    'Creativity',
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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
          soundPreference: profile?.workPreferences?.soundPreference || 'QUIET',
        },
        communicationPreferences: {
          primaryModality: modality,
          meetingFrequency,
        },
        accommodations,
        howIWorkBest,
        privacySettings: {
          shareAccommodationsPublicly,
          isSearchableByRecruiters: isSearchable,
        },
      };

      const res = await api.updateCandidateProfile(updatePayload);
      if (res.success) {
        setProfile(res.profile);
        success('Profile and "How I Work Best" canvas updated successfully!');
      }
    } catch (err: any) {
      error(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Profile & "How I Work Best" Canvas
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure your strengths, communication modalities, and workplace adjustments.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-card transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle space-y-4">
          <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Remote / Denver, CO"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Headline</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="QA Automation Engineer | Edge-Case Testing & Cypress Specialist"
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Summary (About)</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe your background and what fuels your focus..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white"
            />
          </div>
        </div>

        {/* HERO SECTION: "How I Work Best" Canvas */}
        <div className="bg-gradient-to-br from-indigo-50/70 via-white to-brand-50/60 rounded-3xl border-2 border-brand-200 p-6 sm:p-8 shadow-card space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                The "How I Work Best" Statement
              </h2>
              <p className="text-xs text-slate-500">
                Your direct briefing to recruiters explaining the conditions where you perform at your best.
              </p>
            </div>
          </div>

          <textarea
            rows={4}
            value={howIWorkBest}
            onChange={(e) => setHowIWorkBest(e.target.value)}
            placeholder="Example: I perform best with clearly documented acceptance criteria, written bug reproduction steps, and dedicated blocks of uninterrupted deep focus. I prefer asynchronous Slack check-ins over unexpected phone calls."
            className="w-full p-4 bg-white border border-brand-200 rounded-2xl text-xs sm:text-sm text-slate-900 shadow-subtle focus:ring-2 focus:ring-brand-500/20"
          />

          <div className="p-3 bg-white/80 rounded-xl border border-brand-200/60 text-[11px] text-slate-600 leading-relaxed">
            <strong>Recruiter Preview:</strong> This statement is prominently featured on your candidate card
            and application reviews so interviewers prepare accommodations before meeting you.
          </div>
        </div>

        {/* Cognitive Strengths (12 Core Options) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Cognitive Strengths & Superpowers</h2>
              <p className="text-xs text-slate-500">Select the cognitive abilities that reflect your thinking style</p>
            </div>
            <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg">
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
                      ? 'bg-brand-50 text-brand-900 border-brand-500 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
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
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle space-y-4">
          <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
            Technical & Professional Skills
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
              placeholder="Add skill (e.g. Cypress, SQL, Wireshark, TypeScript) and press Enter"
              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {skills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200"
              >
                <span>{s}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(s)}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Work & Communication Preferences */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle space-y-4">
          <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
            Environment & Communication Preferences
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Work Mode</label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              >
                <option value="REMOTE">100% Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ONSITE">On-Site</option>
                <option value="FLEXIBLE">Flexible</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Modality</label>
              <select
                value={modality}
                onChange={(e) => setModality(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              >
                <option value="WRITTEN">Written-First (Slack/Email/Docs)</option>
                <option value="BALANCED">Balanced Written & Verbal</option>
                <option value="VERBAL">Verbal-First</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Meeting Frequency</label>
              <select
                value={meetingFrequency}
                onChange={(e) => setMeetingFrequency(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              >
                <option value="MINIMAL">Minimal (Async updates preferred)</option>
                <option value="MODERATE">Moderate</option>
                <option value="STANDARD">Standard</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requested Workplace Accommodations */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Workplace Support & Accommodations
              </h2>
              <p className="text-xs text-slate-500">
                Select standard adjustments to streamline your job matching
              </p>
            </div>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg">
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
                      ? 'bg-teal-50/70 border-teal-500 text-teal-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
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

        {/* Granular Privacy Settings */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Granular Privacy Controls</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Show Workplace Accommodations to All Verified Recruiters
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  When turned off, accommodations are only shared with employers where you submit an application.
                </p>
              </div>
              <input
                type="checkbox"
                checked={shareAccommodationsPublicly}
                onChange={(e) => setShareAccommodationsPublicly(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
              />
            </div>

            <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Allow Verified Recruiters to Discover My Profile
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Allows neuro-inclusive hiring managers to find your profile during candidate searches.
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
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
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
    </div>
  );
};
