import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';
import { JobCategory } from '../../types/index.js';
import {
  Check,
  Save,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Ear,
  Code2,
} from 'lucide-react';

export const EmployerJobCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<JobCategory>('SOFTWARE_TESTING_QA');
  const [description, setDescription] = useState('');
  const [plainLanguageSummary, setPlainLanguageSummary] = useState('');
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
  const [requirements, setRequirements] = useState<string[]>([
    'Experience testing modern web applications and REST APIs',
    'Strong analytical problem-solving and systematic verification skills',
  ]);

  // Skills (#13 Essential vs Preferred)
  const [requiredSkills, setRequiredSkills] = useState<string[]>(['Cypress', 'Playwright', 'TypeScript']);
  const [preferredSkills, setPreferredSkills] = useState<string[]>(['GraphQL', 'CI/CD Pipelines']);
  const [newSkill, setNewSkill] = useState('');
  const [newPrefSkill, setNewPrefSkill] = useState('');

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
    'Advance meeting agendas & questions',
  ]);

  // Feature #29: Sensory Environment Configurator
  const [sensoryEnvironment, setSensoryEnvironment] = useState({
    noiseLevel: 'QUIET' as 'QUIET' | 'MODERATE' | 'DYNAMIC',
    meetingLoad: 'MINIMAL' as 'MINIMAL' | 'MODERATE' | 'HIGH',
    communicationStyle: 'ASYNC_FIRST' as 'ASYNC_FIRST' | 'BALANCED' | 'SYNC_HEAVY',
    teamAutonomy: 'HIGH_STRUCTURE' as 'HIGH_STRUCTURE' | 'BALANCED' | 'SELF_DIRECTED',
  });

  // Feature #18: Practical Work-Sample Task Option
  const [workSampleTask, setWorkSampleTask] = useState({
    enabled: true,
    title: 'Scoped Practical Work-Sample (Optional Resume Alternative)',
    instructions:
      'Review a sample API response or UI workflow and list 3 edge cases or verification steps you would prioritize.',
    estimatedMinutes: 25,
  });

  // Feature #24: Live Neuroinclusive Job-Posting Quality Checker & Bias Linter
  const [lintResult, setLintResult] = useState<{
    score: number;
    warnings: string[];
    positives: string[];
  } | null>(null);
  const [linting, setLinting] = useState(false);

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

  const handleRunInclusivityLinter = async () => {
    setLinting(true);
    try {
      const res = await api.analyzeJobInclusivity({
        title,
        description,
        requirements,
        accommodationsOffered,
        interviewProcess: [
          {
            stageNumber: 1,
            title: 'Async Intro & Accommodation Check',
            description: 'Questions shared 48h in advance',
            duration: '25 mins',
            format: 'Written or Camera-Optional Video',
          },
        ],
      });
      if (res.success) {
        setLintResult(res.analysis);
        success(`Inclusivity analysis complete: ${res.analysis.score}/100 score.`);
      }
    } catch (err: any) {
      error(err.message || 'Could not analyze job inclusivity.');
    } finally {
      setLinting(false);
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
        plainLanguageSummary:
          plainLanguageSummary ||
          `You will work as a ${title} (${workMode.toLowerCase()}) focusing on ${requiredSkills.join(', ')}. Guaranteed adjustments include ${accommodationsOffered.slice(0, 3).join(', ')}.`,
        responsibilities,
        requirements,
        essentialRequirements: requiredSkills,
        preferredRequirements: preferredSkills,
        requiredSkills,
        preferredSkills,
        matchedStrengths,
        workMode,
        location,
        salaryMin,
        salaryMax,
        experienceLevel,
        employmentType,
        accommodationsOffered,
        sensoryEnvironment,
        workSampleTask,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/employer/jobs')}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Post a Neuro-Inclusive Opportunity
            </h1>
            <p className="text-xs text-slate-500">
              Define role parameters, sensory environment, essential vs. bonus skills, and bias-free tasks.
            </p>
          </div>
        </div>

        {/* Feature #24: Inclusivity Linter Trigger */}
        <button
          type="button"
          onClick={handleRunInclusivityLinter}
          disabled={linting}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span>{linting ? 'Scanning...' : 'Run Neuro-Inclusivity Linter'}</span>
        </button>
      </div>

      {/* Feature #24: Live Inclusivity Linter Report */}
      {lintResult && (
        <div className="bg-indigo-50/70 rounded-3xl border border-indigo-200 p-6 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>Neuro-Inclusive Job Quality Score: {lintResult.score} / 100</span>
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Automated scan for exclusionary corporate tropes, sensory clarity, and W3C COGA plain language.
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-xl text-xs font-extrabold ${
                lintResult.score >= 80
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              {lintResult.score >= 80 ? 'Inclusive Certified' : 'Needs Review'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Inclusive Strengths Detected</span>
              </span>
              <ul className="space-y-1 text-slate-700">
                {lintResult.positives.map((p, i) => (
                  <li key={i}>✓ {p}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-bold text-amber-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Bias Warnings & Recommendations</span>
              </span>
              {lintResult.warnings.length === 0 ? (
                <p className="text-emerald-700 font-semibold">
                  Zero exclusionary phrases detected! Your posting uses clear, literal language.
                </p>
              ) : (
                <ul className="space-y-1 text-amber-900">
                  {lintResult.warnings.map((w, i) => (
                    <li key={i}>• {w}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role Essentials */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle space-y-4">
          <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
            Role Essentials & Plain-Language Overview
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Job Description (Tip: Avoid vague idioms like &quot;wear many hats&quot; or &quot;rockstar&quot;)
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the mission of the team, day-to-day cadence, and technical stack..."
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Plain-Language Summary (Optional — Auto-generated if left blank)
            </label>
            <input
              type="text"
              value={plainLanguageSummary}
              onChange={(e) => setPlainLanguageSummary(e.target.value)}
              placeholder="1–2 literal sentences explaining exactly what the person will do each day..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
            />
          </div>
        </div>

        {/* Feature #13: Essential ("Must-Have") vs. Bonus ("Nice-to-Have") Skills */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle space-y-4">
          <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
            Essential &quot;Must-Have&quot; vs. Optional &quot;Nice-to-Have&quot; Skills
          </h2>
          <p className="text-xs text-slate-500">
            Separating essential day-1 skills from optional bonus skills prevents neurodivergent candidates from self-selecting out.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">Essential Day-1 Skills</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add essential skill..."
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newSkill.trim()) {
                      setRequiredSkills([...requiredSkills, newSkill.trim()]);
                      setNewSkill('');
                    }
                  }}
                  className="px-3 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {requiredSkills.map((sk) => (
                  <span
                    key={sk}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-50 text-brand-800 text-xs font-semibold border border-brand-200"
                  >
                    <span>{sk}</span>
                    <button
                      type="button"
                      onClick={() => setRequiredSkills(requiredSkills.filter((s) => s !== sk))}
                      className="text-brand-500 hover:text-rose-600 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">Optional Bonus Skills</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPrefSkill}
                  onChange={(e) => setNewPrefSkill(e.target.value)}
                  placeholder="Add optional bonus skill..."
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newPrefSkill.trim()) {
                      setPreferredSkills([...preferredSkills, newPrefSkill.trim()]);
                      setNewPrefSkill('');
                    }
                  }}
                  className="px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {preferredSkills.map((sk) => (
                  <span
                    key={sk}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
                  >
                    <span>{sk}</span>
                    <button
                      type="button"
                      onClick={() => setPreferredSkills(preferredSkills.filter((s) => s !== sk))}
                      className="text-slate-400 hover:text-rose-600 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Feature #29: Sensory & Cognitive Environment Parameters */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Ear className="w-5 h-5 text-brand-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Workplace Sensory & Cognitive Environment
              </h2>
              <p className="text-xs text-slate-500">
                Helps our matching engine pair your role with candidates who thrive in your team cadence
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ambient Noise Level</label>
              <select
                value={sensoryEnvironment.noiseLevel}
                onChange={(e) =>
                  setSensoryEnvironment({ ...sensoryEnvironment, noiseLevel: e.target.value as any })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="QUIET">Quiet / Remote</option>
                <option value="MODERATE">Moderate</option>
                <option value="DYNAMIC">Dynamic</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Daily Meeting Load</label>
              <select
                value={sensoryEnvironment.meetingLoad}
                onChange={(e) =>
                  setSensoryEnvironment({ ...sensoryEnvironment, meetingLoad: e.target.value as any })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="MINIMAL">Minimal (Async-first)</option>
                <option value="MODERATE">Moderate</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Communication Style</label>
              <select
                value={sensoryEnvironment.communicationStyle}
                onChange={(e) =>
                  setSensoryEnvironment({
                    ...sensoryEnvironment,
                    communicationStyle: e.target.value as any,
                  })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="ASYNC_FIRST">Async Written First</option>
                <option value="BALANCED">Balanced</option>
                <option value="SYNC_HEAVY">Synchronous</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Task Structure</label>
              <select
                value={sensoryEnvironment.teamAutonomy}
                onChange={(e) =>
                  setSensoryEnvironment({ ...sensoryEnvironment, teamAutonomy: e.target.value as any })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="HIGH_STRUCTURE">High Structure & Clear Specs</option>
                <option value="BALANCED">Balanced</option>
                <option value="SELF_DIRECTED">Self-Directed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Feature #18: Practical Work-Sample Assessment Builder */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-teal-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Optional Work-Sample Task (Resume Alternative)
                </h2>
                <p className="text-xs text-slate-500">
                  Allow candidates to demonstrate real skill on a 25-minute scoped task
                </p>
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={workSampleTask.enabled}
                onChange={(e) => setWorkSampleTask({ ...workSampleTask, enabled: e.target.checked })}
                className="rounded border-slate-300 text-teal-600"
              />
              <span>Enable Work-Sample</span>
            </label>
          </div>

          {workSampleTask.enabled && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Prompt Title</label>
                <input
                  type="text"
                  value={workSampleTask.title}
                  onChange={(e) => setWorkSampleTask({ ...workSampleTask, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clear Task Instructions</label>
                <textarea
                  rows={2}
                  value={workSampleTask.instructions}
                  onChange={(e) => setWorkSampleTask({ ...workSampleTask, instructions: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          )}
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
