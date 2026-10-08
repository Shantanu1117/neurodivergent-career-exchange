import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';

export const EmployerJobCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
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

  // Responsibilities & Requirements
  const [responsibilities, setResponsibilities] = useState<string[]>([
    'Design and maintain automated end-to-end regression suites',
    'Formulate edge-case test matrices and verify API endpoints',
  ]);
  const [newResp, setNewResp] = useState('');

  const [requirements, setRequirements] = useState<string[]>([
    'Experience testing modern web applications and REST APIs',
    'Strong analytical problem-solving and systematic verification skills',
  ]);
  const [newReq, setNewReq] = useState('');

  // Skills
  const [requiredSkills, setRequiredSkills] = useState<string[]>(['Cypress', 'Playwright', 'TypeScript']);
  const [newSkill, setNewSkill] = useState('');

  // Strengths
  const [matchedStrengths, setMatchedStrengths] = useState<string[]>([
    'Attention to Detail',
    'Pattern Recognition',
    'Deep Focus',
  ]);

  // Accommodations Offered
  const [accommodationsOffered, setAccommodationsOffered] = useState<string[]>([
    'Written task instructions standard',
    'Camera-optional video calls',
    'Quiet focus blocks (no meetings 1pm-5pm)',
  ]);

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
        accommodationsOffered,
      };

      const res = await api.createJob(payload);
      if (res.success) {
        success('Neuro-inclusive job posting published successfully!');
        navigate('/employer/jobs');
      }
    } catch (err: any) {
      error(err.message || 'Failed to create job posting.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/employer/jobs')}
          className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Post an Inclusive Opportunity
          </h1>
          <p className="text-xs text-slate-500">
            Define role parameters, cognitive strengths, and guaranteed accommodations.
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
                <option value="REMOTE">100% Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ONSITE">On-Site</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Remote (US/Canada)"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Range Min ($)</label>
              <input
                type="number"
                value={salaryMin}
                onChange={(e) => setSalaryMin(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Range Max ($)</label>
              <input
                type="number"
                value={salaryMax}
                onChange={(e) => setSalaryMax(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Job Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the mission of the team, day-to-day cadence, and technical stack..."
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white"
            />
          </div>
        </div>

        {/* Cognitive Strengths Alignment */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Cognitive Strengths Valued</h2>
              <p className="text-xs text-slate-500">The specific thinking patterns that excel in this position</p>
            </div>
            <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg">
              {matchedStrengths.length} Selected
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {strengthList.map((str) => {
              const selected = matchedStrengths.includes(str);
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

        {/* Guaranteed Workplace Accommodations */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Guaranteed Workplace Accommodations
              </h2>
              <p className="text-xs text-slate-500">
                Explicit commitments you offer to support neurodivergent employees
              </p>
            </div>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg">
              {accommodationsOffered.length} Selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {accommodationOptions.map((acc) => {
              const isChecked = accommodationsOffered.includes(acc);
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
                    onChange={() => handleToggleAcc(acc)}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span>{acc}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Publish Action */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm px-8 py-3 rounded-xl shadow-card transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Publishing...' : 'Publish Inclusive Job'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
