import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import {
  Award,
  Sparkles,
  Building2,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  Quote,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  X,
  Briefcase,
  UserCheck,
} from 'lucide-react';

interface PlacedCandidate {
  id: string;
  fullName: string;
  role: string;
  previousRole: string;
  company: string;
  companyIndustry: string;
  location: string;
  avatar: string;
  salary: string;
  track: string;
  trackName: string;
  strengths: string[];
  accommodations: string[];
  story: string;
  managerQuote: string;
  managerName: string;
  placedDate: string;
}

const FALLBACK_PLACED_CANDIDATES: PlacedCandidate[] = [
  {
    id: 'placed-1',
    fullName: 'Maya Patel',
    role: 'Lead QA Automation Engineer',
    previousRole: 'Underemployed Math Graduate',
    company: 'Fintech Logic Corp',
    companyIndustry: 'Financial Infrastructure & Payments',
    location: 'Remote • Denver, CO',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    salary: '$125,000',
    track: 'SOFTWARE_TESTING_QA',
    trackName: 'Software Testing & QA',
    strengths: ['Attention to Detail', 'Pattern Recognition', 'Systematic Verification'],
    accommodations: ['Written bug reproduction steps', 'Quiet focus blocks (no meetings 1-5pm)', 'Camera-optional calls'],
    story: 'Traditional interview loops asked me ambiguous riddle questions that made me shut down. NDCE matched me directly with an engineering lead who gave me a real Cypress test harness to debug with clear criteria. I was hired in 10 days.',
    managerQuote: 'Maya found 14 critical edge-case flaws in her first sprint that our automated regression tools missed. Her systematic precision is unmatched on our engineering floor.',
    managerName: 'Marcus Vance, VP of Quality Engineering',
    placedDate: 'March 2026',
  },
  {
    id: 'placed-2',
    fullName: 'Alex Chen',
    role: 'Tier 2 Cybersecurity Incident Analyst',
    previousRole: 'Retail Associate (Self-taught SecOps)',
    company: 'PrismFlow Cloud',
    companyIndustry: 'Cloud Infrastructure & Security',
    location: 'Remote • Seattle, WA',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    salary: '$118,000',
    track: 'CYBERSECURITY',
    trackName: 'Cybersecurity & SecOps',
    strengths: ['Deep Focus', 'Anomaly Detection', 'Logical Thinking'],
    accommodations: ['Advance meeting agendas', 'Asynchronous daily standups', 'Noise-cancelling headphones allowance'],
    story: 'My hyperfocus on SIEM logs and packet analysis was treated as an oddity in past jobs. At PrismFlow, it is treated as a strategic asset. Knowing interview questions beforehand allowed me to prepare without sensory panic.',
    managerQuote: 'Alex has an instinct for pattern disruption in intrusion detection. He identified an APT infiltration vector within his first month that saved us immense exposure.',
    managerName: 'Evelyn Reed, Chief Information Security Officer',
    placedDate: 'January 2026',
  },
  {
    id: 'placed-3',
    fullName: 'Jordan Taylor',
    role: 'Data Integrity & Audit Specialist',
    previousRole: 'Contract QA Assistant',
    company: 'NeuroTech Labs',
    companyIndustry: 'AI & Assistive Technologies',
    location: 'Remote • Chicago, IL',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    salary: '$110,000',
    track: 'DATA_ANALYSIS_AUDIT',
    trackName: 'Data Analysis & Audit',
    strengths: ['Data Structuring', 'Attention to Detail', 'Problem Solving'],
    accommodations: ['Explicit task checklists', 'Flexible core hours', 'Written performance expectations'],
    story: 'I have ADHD and thrive when tasks have clear boundaries and structured outcomes. The "How I Work Best" canvas meant my manager already understood my communication needs before my first day.',
    managerQuote: 'Jordan reduced our data reconciliation cycle from 5 days to 4 hours with elegant SQL pipelines. An absolute game changer for our business intelligence operations.',
    managerName: 'David K., Director of Analytics',
    placedDate: 'April 2026',
  },
  {
    id: 'placed-4',
    fullName: 'Samira Khan',
    role: 'Senior Accessibility & Design Systems Engineer',
    previousRole: 'Freelance Web Designer',
    company: 'AccessCraft Studio',
    companyIndustry: 'Digital Accessibility Consulting',
    location: 'Remote • Austin, TX',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
    salary: '$135,000',
    track: 'UI_UX_DESIGN',
    trackName: 'UI/UX & Accessibility Design',
    strengths: ['Visual Precision', 'Empathy-Driven Architecture', 'Research'],
    accommodations: ['Camera-optional video calls', 'Low-stimulation workspace', 'Screen reader testing allocation'],
    story: 'Being autistic gave me an instinctive sensitivity to cognitive overload and sensory clutter in software. NDCE connected me with a company that values accessibility from the inside out.',
    managerQuote: 'Samira transformed our entire client design system to meet WCAG AAA standards while boosting client workflow completion rates by 38%.',
    managerName: 'Leila Faris, Head of Experience Design',
    placedDate: 'February 2026',
  },
  {
    id: 'placed-5',
    fullName: 'Lucas Vance',
    role: 'Backend Systems Engineer (Rust / Node.js)',
    previousRole: 'Junior Support Engineer',
    company: 'Cognitive Systems',
    companyIndustry: 'Enterprise Search & Indexing',
    location: 'Hybrid • New York, NY',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    salary: '$140,000',
    track: 'SOFTWARE_DEVELOPMENT',
    trackName: 'Software Engineering',
    strengths: ['Logical Thinking', 'Algorithmic Efficiency', 'Deep Focus'],
    accommodations: ['No ad-hoc interruptions', 'Async code reviews', 'Flexible arrival window'],
    story: 'I struggled with open-office environments and impromptu brainstorming sessions. Here, 90% of our architectural discussion happens in written markdown. My code output has tripled and I sleep better.',
    managerQuote: 'Lucas solved a concurrent lock contention bottleneck in our distributed indexing cluster that had stumped senior engineers for 3 months.',
    managerName: 'Greg Holloway, VP of Engineering',
    placedDate: 'May 2026',
  },
  {
    id: 'placed-6',
    fullName: 'Elena Rostova',
    role: 'Technical Documentation & Knowledge Architect',
    previousRole: 'Academic Researcher',
    company: 'Fintech Logic Corp',
    companyIndustry: 'Developer APIs & Tools',
    location: 'Remote • Boston, MA',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=600&q=80',
    salary: '$105,000',
    track: 'RESEARCH_DOCUMENTATION',
    trackName: 'Research & Technical Docs',
    strengths: ['Systematic Documentation', 'Pattern Recognition', 'Clarity of Expression'],
    accommodations: ['Dedicated quiet days', 'Written project scopes', 'Self-directed pacing'],
    story: 'I transitioned from academia where my ADHD hyperfocus was burning me out. NDCE matched me with an API company that needed rigorous documentation. I feel respected, well-compensated, and calm.',
    managerQuote: 'Our developer onboarding drop-off decreased by 45% within 60 days of Elena revamping our API documentation architecture.',
    managerName: 'Nadia Solis, Lead Product Manager',
    placedDate: 'January 2026',
  },
];

export const PlacedCandidatesPage: React.FC = () => {
  const [candidates, setCandidates] = useState<PlacedCandidate[]>(FALLBACK_PLACED_CANDIDATES);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('ALL');
  const [selectedStrength, setSelectedStrength] = useState<string | null>(null);
  const [activeModalCandidate, setActiveModalCandidate] = useState<PlacedCandidate | null>(null);

  useEffect(() => {
    const fetchPlaced = async () => {
      try {
        const res = await api.getPlacedCandidates();
        if (res.success && res.candidates && res.candidates.length > 0) {
          setCandidates(res.candidates);
        }
      } catch (err) {
        console.warn('Using client-side placed candidates fallback data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaced();
  }, []);

  const trackTabs = [
    { key: 'ALL', label: 'All Disciplines' },
    { key: 'SOFTWARE_TESTING_QA', label: 'QA & Testing' },
    { key: 'CYBERSECURITY', label: 'Cybersecurity' },
    { key: 'DATA_ANALYSIS_AUDIT', label: 'Data Analysis' },
    { key: 'SOFTWARE_DEVELOPMENT', label: 'Software Engineering' },
    { key: 'UI_UX_DESIGN', label: 'UI/UX & Design' },
    { key: 'RESEARCH_DOCUMENTATION', label: 'Technical Docs' },
  ];

  const popularStrengths = [
    'Attention to Detail',
    'Pattern Recognition',
    'Deep Focus',
    'Logical Thinking',
    'Systematic Verification',
  ];

  const filteredCandidates = candidates.filter((cand) => {
    const matchesSearch =
      cand.fullName.toLowerCase().includes(search.toLowerCase()) ||
      cand.role.toLowerCase().includes(search.toLowerCase()) ||
      cand.company.toLowerCase().includes(search.toLowerCase()) ||
      cand.strengths.some((s) => s.toLowerCase().includes(search.toLowerCase()));

    const matchesTrack = selectedTrack === 'ALL' || cand.track === selectedTrack;
    const matchesStrength = !selectedStrength || cand.strengths.includes(selectedStrength);

    return matchesSearch && matchesTrack && matchesStrength;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-slate-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200/80 dark:border-slate-800 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold tracking-wide shadow-sm">
            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Alumni Hall of Fame & Real Placement Milestones</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto leading-tight">
            Neurodivergent Talent Thriving in World-Class Roles
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            See real candidates who discovered high-paying technology, QA, cybersecurity, and data roles aligned with their cognitive strengths, communication needs, and guaranteed accommodations.
          </p>

          {/* Stats Grid with GSAP Counters & 3D Tilt */}
          <div
            data-gsap="stagger-parent"
            className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4 max-w-4xl mx-auto pt-8"
          >
            <div
              data-gsap-item
              data-gsap-tilt="6"
              className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle will-change-transform"
            >
              <span
                data-gsap-counter="480"
                data-gsap-suffix="+"
                className="block text-2xl sm:text-3xl font-black text-brand-600 dark:text-indigo-400"
              >
                480+
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Verified Placements</span>
            </div>
            <div
              data-gsap-item
              data-gsap-tilt="6"
              className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle will-change-transform"
            >
              <span
                data-gsap-counter="94"
                data-gsap-suffix="%"
                className="block text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400"
              >
                94%
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">6-Month Retention Rate</span>
            </div>
            <div
              data-gsap-item
              data-gsap-tilt="6"
              className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle will-change-transform"
            >
              <span
                data-gsap-counter="118"
                data-gsap-prefix="$"
                data-gsap-suffix="k"
                className="block text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400"
              >
                $118k
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Average Placed Salary</span>
            </div>
            <div
              data-gsap-item
              data-gsap-tilt="6"
              className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle will-change-transform"
            >
              <span
                data-gsap-counter="100"
                data-gsap-suffix="%"
                className="block text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400"
              >
                100%
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Accommodated Workplaces</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Search & Filter Toolbar */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by candidate name, role, company, or cognitive strength..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Clear Filters */}
            {(selectedStrength || search || selectedTrack !== 'ALL') && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedTrack('ALL');
                  setSelectedStrength(null);
                }}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline px-2 py-1 shrink-0 text-center"
              >
                Reset All Filters
              </button>
            )}
          </div>

          {/* Discipline Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {trackTabs.map((tab) => {
              const active = selectedTrack === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTrack(tab.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-brand-600 dark:bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Quick Strength Tags */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 overflow-x-auto text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
              Filter By Strength:
            </span>
            {popularStrengths.map((str) => {
              const isSelected = selectedStrength === str;
              return (
                <button
                  key={str}
                  onClick={() => setSelectedStrength(isSelected ? null : str)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition whitespace-nowrap ${
                    isSelected
                      ? 'bg-teal-50 dark:bg-teal-950 border-teal-500 text-teal-700 dark:text-teal-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {str} {isSelected && '✓'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span>Showing {filteredCandidates.length} placed neurodivergent alumni</span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Genuine Hires
          </span>
        </div>

        {/* Candidates Grid */}
        <div
          data-gsap="stagger-parent"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredCandidates.map((cand) => (
            <div
              key={cand.id}
              data-gsap-item
              data-gsap-tilt="7"
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-subtle hover:shadow-floating dark:hover:border-indigo-700 transition-colors flex flex-col justify-between overflow-hidden group will-change-transform"
            >
              <div>
                {/* Top Banner with Avatar & Verified Badge */}
                <div className="p-6 pb-4 flex items-start gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={cand.avatar}
                      alt={cand.fullName}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-100 dark:border-slate-700 shadow-sm"
                      loading="lazy"
                    />
                    <div
                      className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-white p-1 rounded-full shadow-sm"
                      title="Verified Hired via NDCE"
                    >
                      <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                        {cand.fullName}
                      </h3>
                      <span className="text-[10px] font-bold text-slate-400 shrink-0">
                        {cand.placedDate}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-brand-600 dark:text-indigo-400 truncate mt-0.5">
                      {cand.role}
                    </p>

                    <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                      <Building2 className="w-3 h-3 shrink-0" />
                      <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                        {cand.company}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Compensation & Discipline Badge */}
                <div className="px-6 py-2 bg-slate-50/60 dark:bg-slate-800/40 border-y border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Previous: <span className="italic">{cand.previousRole}</span>
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                    {cand.salary}
                  </span>
                </div>

                {/* Cognitive Strengths Tags */}
                <div className="p-6 pt-4 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Target Cognitive Traits
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cand.strengths.map((st, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-[10px] font-semibold"
                        >
                          {st}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Guaranteed Accommodations */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Confirmed Accommodations
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cand.accommodations.slice(0, 2).map((acc, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[10px] font-medium"
                        >
                          ✓ {acc}
                        </span>
                      ))}
                      {cand.accommodations.length > 2 && (
                        <span className="px-1.5 py-0.5 text-[10px] text-slate-400 font-medium">
                          +{cand.accommodations.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quote Snippet */}
                  <div className="pt-2">
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-3 leading-relaxed relative pl-3 border-l-2 border-brand-400 dark:border-indigo-500">
                      "{cand.story}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer with CTA */}
              <div className="p-5 pt-0">
                <button
                  type="button"
                  onClick={() => setActiveModalCandidate(cand)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-white transition group-hover:border-brand-300 dark:group-hover:border-indigo-600"
                >
                  <span>Read Full Case Study</span>
                  <ChevronRight className="w-3.5 h-3.5 text-brand-600 dark:text-indigo-400" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty Search State */}
        {filteredCandidates.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <Award className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No alumni found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Try adjusting your search keywords or reset filters to see all placed candidates.
            </p>
          </div>
        )}

        {/* Dual CTA Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
          <div className="bg-gradient-to-br from-brand-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              For Neurodivergent Candidates
            </span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Ready for a Career Where Your Strengths Excel?
            </h3>
            <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
              Take our interactive 18-question assessment. Get matched with roles tailored to your deep focus, pattern recognition, and workplace adjustments.
            </p>
            <div className="pt-2">
              <Link
                to="/candidate/assessment"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-brand-900 font-bold text-xs hover:bg-indigo-50 transition shadow-sm"
              >
                <span>Take 18-Q Fit Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
              For Inclusive Employers
            </span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Access Untapped Cognitive Superpowers
            </h3>
            <p className="text-xs sm:text-sm text-teal-200 leading-relaxed">
              Join verified leaders like Fintech Logic and PrismFlow. Post roles with guaranteed accommodations and hire top-tier QA, cybersecurity, and data talent.
            </p>
            <div className="pt-2">
              <Link
                to="/register?role=EMPLOYER"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-400 text-slate-900 font-bold text-xs hover:bg-teal-300 transition shadow-sm"
              >
                <span>Hire Neurodivergent Talent</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Full Case Study Detail Modal */}
      {activeModalCandidate && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden space-y-0 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50 shrink-0">
              <div className="flex items-center gap-3.5">
                <img
                  src={activeModalCandidate.avatar}
                  alt={activeModalCandidate.fullName}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {activeModalCandidate.fullName}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Hired
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-brand-600 dark:text-indigo-400">
                    {activeModalCandidate.role} at {activeModalCandidate.company}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalCandidate(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
              {/* Highlight Metrics */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Starting Comp</span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {activeModalCandidate.salary}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Discipline</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                    {activeModalCandidate.trackName}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Location Mode</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                    {activeModalCandidate.location}
                  </span>
                </div>
              </div>

              {/* The Candidate's Story */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Candidate Transformation Experience
                </h4>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 relative">
                  <Quote className="w-6 h-6 text-brand-200 dark:text-indigo-900 absolute right-3 top-3" />
                  <p className="text-slate-700 dark:text-slate-200 leading-relaxed italic pr-6 text-xs sm:text-sm">
                    "{activeModalCandidate.story}"
                  </p>
                </div>
              </div>

              {/* Hiring Manager Endorsement */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Hiring Team Evaluation & Impact
                </h4>
                <div className="p-4 bg-teal-50/50 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-800/80 space-y-2">
                  <p className="text-teal-900 dark:text-teal-200 leading-relaxed text-xs sm:text-sm">
                    "{activeModalCandidate.managerQuote}"
                  </p>
                  <p className="text-[11px] font-bold text-teal-700 dark:text-teal-400">
                    — {activeModalCandidate.managerName}
                  </p>
                </div>
              </div>

              {/* Accommodations in Active Practice */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Confirmed Accommodations & Communication Agreement
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeModalCandidate.accommodations.map((acc, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/30 flex items-center gap-2 text-xs text-emerald-900 dark:text-emerald-200 font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{acc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between shrink-0">
              <Link
                to="/candidate/assessment"
                className="text-xs font-bold text-brand-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Take Strengths Assessment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setActiveModalCandidate(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white font-bold text-xs hover:bg-slate-800 dark:hover:bg-indigo-700"
              >
                Close Story
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
