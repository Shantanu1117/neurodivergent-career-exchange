import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';
import { JobCategory } from '../../types/index.js';
import {
  Briefcase,
  ShieldCheck,
  Plus,
  Trash2,
  Clock,
  Check,
  Save,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

export const EmployerJobEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<JobCategory>('SOFTWARE_TESTING_QA');
  const [description, setDescription] = useState('');
  const [workMode, setWorkMode] = useState<'REMOTE' | 'HYBRID' | 'ONSITE'>('REMOTE');
  const [location, setLocation] = useState('Remote');
  const [salaryMin, setSalaryMin] = useState(90000);
  const [salaryMax, setSalaryMax] = useState(130000);
  const [experienceLevel, setExperienceLevel] = useState<'ENTRY' | 'MID' | 'SENIOR'>('MID');
  const [employmentType, setEmploymentType] = useState<'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP'>('FULL_TIME');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'CLOSED'>('PUBLISHED');

  // Responsibilities & Requirements
  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [newResp, setNewResp] = useState('');

  const [requirements, setRequirements] = useState<string[]>([]);
  const [newReq, setNewReq] = useState('');

  // Skills
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  // Strengths
  const [matchedStrengths, setMatchedStrengths] = useState<string[]>([]);

  // Accommodations Offered
  const [accommodationsOffered, setAccommodationsOffered] = useState<string[]>([]);

  const strengthList = [
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

  const accommodationOptions = [
    'Written task instructions standard',
    'Camera-optional video calls',
    'Noise-cancelling headphones allowance',
    'Quiet focus blocks (no meetings 1pm-5pm)',
    'Flexible core working hours',
    'Clear task expectations & checklists',
    'Advance meeting agendas & questions',
    'Asynchronous standups',
  ];

  useEffect(() => {
    if (!id) return;
    const fetchJob = async () => {
      setLoading(true);
      try {
        const res = await api.getJobById(id);
        if (res.success && res.job) {
          const j = res.job;
          setTitle(j.title || '');
          setCategory(j.category || 'SOFTWARE_TESTING_QA');
          setDescription(j.description || '');
          setWorkMode(j.workMode || 'REMOTE');
          setLocation(j.location || 'Remote');
          setSalaryMin(j.salaryMin || 80000);
          setSalaryMax(j.salaryMax || 120000);
          setExperienceLevel(j.experienceLevel || 'MID');
          setEmploymentType(j.employmentType || 'FULL_TIME');
          setStatus(j.status || 'PUBLISHED');
          setResponsibilities(j.responsibilities || []);
          setRequirements(j.requirements || []);
          setRequiredSkills(j.requiredSkills || []);
          setMatchedStrengths(j.matchedStrengths || []);
          setAccommodationsOffered(j.accommodationsOffered || []);
        }
      } catch (err: any) {
        error(err.message || 'Failed to load job details.');
        navigate('/employer/jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, navigate]);

  const handleToggleStrength = (str: string) => {
    if (matchedStrengths.includes(str)) {
      setMatchedStrengths(matchedStrengths.filter((s) => s !== str));
    } else {
      setMatchedStrengths([...matchedStrengths, str]);
    }
  };

  const handleToggleAcc = (acc: string) => {
    if (accommodationsOffered.includes(acc)) {
      setAccommodationsOffered(accommodationsOffered.filter((a) => a !== acc));
    } else {
      setAccommodationsOffered([...accommodationsOffered, acc]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!title || !description) {
      error('Please complete title and description.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        category,
        description,
        responsibilities,
        requirements,
        requiredSkills,
        matchedStrengths,
        workMode,
        location,
        salaryMin,
        salaryMax,
        experienceLevel,
        employmentType,
        status,
        accommodationsOffered,
      };

      const res = await api.updateJob(id, payload);
      if (res.success) {
        success('Job posting updated successfully!');
        navigate('/employer/jobs');
      }
    } catch (err: any) {
      error(err.message || 'Failed to update job posting.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-slate-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm font-medium">Loading position details...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/employer/jobs')}
          className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Edit Job Posting
          </h1>
          <p className="text-xs text-slate-500">
            Update role specifications, requirements, and inclusive accommodations.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role Essentials */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle space-y-4">
          <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
            Role Essentials
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior QA Automation Engineer (Cypress / Playwright)"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Career Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              >
                <option value="SOFTWARE_TESTING_QA">Software Testing / QA</option>
                <option value="CYBERSECURITY">Cybersecurity</option>
                <option value="DATA_ANALYSIS_AUDIT">Data Analysis / Audit</option>
                <option value="SOFTWARE_DEVELOPMENT">Software Engineering</option>
                <option value="UI_UX_DESIGN">UI/UX Design</option>
                <option value="RESEARCH_DOCUMENTATION">Research & Documentation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Work Mode</label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              >
                <option value="REMOTE">Remote (Anywhere)</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ONSITE">On-Site</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Timezone</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote (US/Canada)"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Min Salary ($)</label>
              <input
                type="number"
                value={salaryMin}
                onChange={(e) => setSalaryMin(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Salary ($)</label>
              <input
                type="number"
                value={salaryMax}
                onChange={(e) => setSalaryMax(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              >
                <option value="ENTRY">Entry-Level</option>
                <option value="MID">Mid-Level</option>
                <option value="SENIOR">Senior-Level</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Publish Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold"
              >
                <option value="PUBLISHED">Published (Active)</option>
                <option value="DRAFT">Draft (Hidden)</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Role Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a transparent overview of the role, team rituals, and day-to-day focus..."
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white"
            />
          </div>
        </div>

        {/* Responsibilities & Requirements */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-2">Key Responsibilities</h2>
            <div className="space-y-2 mb-3">
              {responsibilities.map((resp, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                  <span>{resp}</span>
                  <button
                    type="button"
                    onClick={() => setResponsibilities(responsibilities.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newResp}
                onChange={(e) => setNewResp(e.target.value)}
                placeholder="Add daily task or duty..."
                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newResp.trim()) {
                      setResponsibilities([...responsibilities, newResp.trim()]);
                      setNewResp('');
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (newResp.trim()) {
                    setResponsibilities([...responsibilities, newResp.trim()]);
                    setNewResp('');
                  }
                }}
                className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900 mb-2">Requirements & Qualifications</h2>
            <div className="space-y-2 mb-3">
              {requirements.map((req, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                  <span>{req}</span>
                  <button
                    type="button"
                    onClick={() => setRequirements(requirements.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newReq}
                onChange={(e) => setNewReq(e.target.value)}
                placeholder="Add transparent qualification criteria..."
                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newReq.trim()) {
                      setRequirements([...requirements, newReq.trim()]);
                      setNewReq('');
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (newReq.trim()) {
                    setRequirements([...requirements, newReq.trim()]);
                    setNewReq('');
                  }
                }}
                className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Skills & Cognitive Strengths */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-2">Technical Skills & Tooling</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {requiredSkills.map((sk, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200/60 rounded-lg text-xs font-medium"
                >
                  {sk}
                  <button
                    type="button"
                    onClick={() => setRequiredSkills(requiredSkills.filter((_, i) => i !== idx))}
                    className="hover:text-rose-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 max-w-sm">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add tool/skill (e.g. Cypress)..."
                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newSkill.trim() && !requiredSkills.includes(newSkill.trim())) {
                      setRequiredSkills([...requiredSkills, newSkill.trim()]);
                      setNewSkill('');
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (newSkill.trim() && !requiredSkills.includes(newSkill.trim())) {
                    setRequiredSkills([...requiredSkills, newSkill.trim()]);
                    setNewSkill('');
                  }
                }}
                className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">Target Cognitive Strengths</h2>
            <p className="text-xs text-slate-500 mb-3">
              Select key cognitive traits that naturally thrive in this role.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {strengthList.map((str) => {
                const active = matchedStrengths.includes(str);
                return (
                  <button
                    key={str}
                    type="button"
                    onClick={() => handleToggleStrength(str)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition ${
                      active
                        ? 'bg-teal-50 border-teal-500 text-teal-800 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span>{str}</span>
                    {active && <Check className="w-3.5 h-3.5 text-teal-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Accommodations Offered */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Guaranteed Inclusive Accommodations</h2>
          </div>
          <p className="text-xs text-slate-500">
            Confirm standard accommodations offered for this role to boost neurodivergent psychological safety.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            {accommodationOptions.map((acc) => {
              const active = accommodationsOffered.includes(acc);
              return (
                <button
                  key={acc}
                  type="button"
                  onClick={() => handleToggleAcc(acc)}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border text-left text-xs transition ${
                    active
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                    active ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {active && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>{acc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/employer/jobs')}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 text-xs font-bold shadow-md shadow-teal-600/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {submitting ? 'Saving Changes...' : 'Save Job Posting'}
          </button>
        </div>
      </form>
    </div>
  );
};
