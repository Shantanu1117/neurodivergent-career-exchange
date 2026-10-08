import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAccessibility } from '../../context/AccessibilityContext.js';
import heroVideo from '../../assets/videos/hero-background.mp4';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Compass,
  Briefcase,
  Users,
  Lock,
  Layers,
  HeartHandshake,
  Check,
  Building2,
  FileText,
  Search,
  Play,
  Pause,
  Video,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { settings, theme } = useAccessibility();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Force explicit DOM muted & playsInline for strict browser autoplay compliance
    video.defaultMuted = true;
    video.muted = true;
    video.playbackRate = 0.85;

    const playVideo = async () => {
      try {
        if (settings.reducedMotion || settings.disableAnimations) {
          video.pause();
          setIsPlaying(false);
        } else {
          await video.play();
          setIsPlaying(true);
        }
      } catch (err) {
        console.warn('Autoplay waiting for user gesture:', err);
        setIsPlaying(false);
      }
    };

    playVideo();

    // Auto-resume if browser deferred until first user interaction
    const handleGesture = () => {
      if (video.paused && !settings.reducedMotion) {
        video.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    };

    window.addEventListener('click', handleGesture, { once: true });
    window.addEventListener('touchstart', handleGesture, { once: true });
    window.addEventListener('scroll', handleGesture, { once: true });

    return () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
      window.removeEventListener('scroll', handleGesture);
    };
  }, [settings.reducedMotion, settings.disableAnimations]);

  const toggleVideoPlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const careerTracks = [
    {
      title: 'Software Testing / QA Automation',
      highlight: 'Pattern Recognition & Edge Cases',
      desc: 'Systematically discovering defects, stress-testing APIs, and building non-flaky test automation suites.',
      skills: ['Cypress', 'Playwright', 'Jest', 'API Testing'],
      matchPct: '94%',
    },
    {
      title: 'Cybersecurity & Threat Hunting',
      highlight: 'Deep Focus & Anomaly Detection',
      desc: 'Investigating SIEM logs, detecting network intrusions, and establishing defensive compliance baselines.',
      skills: ['Wireshark', 'Splunk', 'Linux', 'SIEM'],
      matchPct: '91%',
    },
    {
      title: 'Data Analysis & Data Audit',
      highlight: 'Mathematical Precision & Integrity',
      desc: 'Reconciling ledger discrepancies, verifying database schemas, and cleaning complex enterprise pipelines.',
      skills: ['SQL', 'Python pandas', 'PostgreSQL', 'Excel'],
      matchPct: '89%',
    },
    {
      title: 'Software Engineering',
      highlight: 'Logical Architecture & Craftsmanship',
      desc: 'Constructing robust full-stack applications, resilient microservices, and asynchronous background systems.',
      skills: ['TypeScript', 'React', 'Node.js', 'MongoDB'],
      matchPct: '88%',
    },
    {
      title: 'Accessible UI/UX Design',
      highlight: 'Cognitive Ergonmics & Sensory Clarity',
      desc: 'Designing low-cognitive-load design systems, WCAG 2.1 AA/AAA interfaces, and accessible user flows.',
      skills: ['Figma', 'Design Systems', 'WCAG Audits', 'ARIA'],
      matchPct: '86%',
    },
    {
      title: 'Technical Documentation & Research',
      highlight: 'Unambiguous Written Communication',
      desc: 'Creating crisp developer guides, API references, and structured operating manuals that eliminate ambiguity.',
      skills: ['Markdown', 'OpenAPI', 'Git', 'Information Arch'],
      matchPct: '85%',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Build Your Strengths Profile',
      desc: 'Select your cognitive superpowers and communication preferences. Detail your "How I Work Best" canvas.',
    },
    {
      step: '02',
      title: 'Take the 18-Q Career Assessment',
      desc: 'Discover which professional fields fit your cognitive rhythm with transparent, explainable match scoring.',
    },
    {
      step: '03',
      title: 'Discover Accommodated Roles',
      desc: 'Browse jobs from verified employers who explicitly offer written instructions, quiet blocks, and async comms.',
    },
    {
      step: '04',
      title: 'Experience Predictable Interviews',
      desc: 'Eliminate surprise anxiety with advance interview agendas, interviewer backgrounds, and prepared question previews.',
    },
  ];

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      {/* Hero Section with Cinematic Video Background */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-12 sm:pt-16 pb-20 overflow-hidden bg-slate-100 dark:bg-slate-950 transition-colors">
        {/* Cinematic Video Background Layer (High Visibility) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover object-center opacity-85 dark:opacity-75 filter saturate-[1.25] contrast-[1.1] dark:contrast-[1.25] dark:brightness-[0.85]"
          >
            <source src={heroVideo} type="video/mp4" />
            <source src="/videos/hero-background.mp4" type="video/mp4" />
          </video>

          {/* Dual-Mode Adaptive Ambient Tints: Keeps video visibly playing while blending into page */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-white/15 to-slate-50 dark:from-slate-950/45 dark:via-slate-950/35 dark:to-slate-950 transition-colors duration-300" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(255,255,255,0.4)_90%)] dark:bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(9,13,22,0.7)_90%)] transition-colors duration-300" />

          {/* Seamless Header/Footer Gradient Blends */}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/70 dark:from-slate-900/90 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          {/* Frosted Glass Hero Island: Preserves 100% WCAG contrast while letting the cinematic video shine all around and behind it */}
          <div className="max-w-4xl mx-auto bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl p-8 sm:p-12 rounded-3xl border border-white/90 dark:border-slate-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.6)] text-center space-y-6">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50/90 dark:bg-brand-950/70 border border-brand-200/90 dark:border-brand-500/40 text-brand-800 dark:text-brand-300 text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>Inclusive, Strengths-Based Career Intelligence</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              Find Work That Fits the{' '}
              <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-teal-600 dark:from-indigo-400 dark:via-brand-300 dark:to-teal-300 bg-clip-text text-transparent">
                Way You Think
              </span>
              .
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-700 dark:text-slate-200 leading-relaxed max-w-2xl mx-auto font-normal">
              Discover careers, employers, and opportunities that recognize your strengths—not just your
              résumé. Built specifically for autistic, ADHD, and neurodivergent professionals.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/candidate/assessment"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-6 py-3.5 rounded-xl shadow-card hover:shadow-floating transition-all duration-200"
              >
                <Compass className="w-4 h-4" />
                <span>Find Your Career Fit</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/jobs"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/95 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-sm px-6 py-3.5 rounded-xl border border-slate-200 dark:border-slate-600 shadow-subtle hover:shadow-card transition-all duration-200"
              >
                <Search className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Explore Opportunities</span>
              </Link>
            </div>

            {/* Sensory Motion Control Pill: Gives neurodivergent users full motion autonomy */}
            <div className="flex items-center justify-center pt-1">
              <button
                type="button"
                onClick={toggleVideoPlay}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                title={isPlaying ? 'Pause background video (Sensory Control)' : 'Play background video'}
                aria-label={isPlaying ? 'Pause background animation' : 'Play background animation'}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                      isPlaying ? 'bg-emerald-400' : 'bg-slate-400'
                    } opacity-75`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      isPlaying ? 'bg-emerald-500' : 'bg-slate-500'
                    }`}
                  />
                </span>
                {isPlaying ? (
                  <Pause className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                ) : (
                  <Play className="w-3.5 h-3.5 text-brand-600 dark:text-indigo-400" />
                )}
                <span className="font-semibold">{isPlaying ? 'Cinematic Video Playing' : 'Video Paused'}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700 pl-1.5">
                  Motion Control
                </span>
              </button>
            </div>

            {/* Voluntary Privacy Trust Banner */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Voluntary Privacy (No Diagnosis Required)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span>Transparent & Explainable Matching</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
                <HeartHandshake className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Verified Neuro-Inclusive Employers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Career Tracks */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-indigo-400 block mb-2">
            Specialized Cognitive Alignment
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Careers That Value Your Natural Superpowers
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2">
            Neurodivergent minds excel when matched with environments that reward hyperfocus, pattern
            recognition, and systematic integrity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {careerTracks.map((track) => (
            <div
              key={track.title}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle hover:shadow-card hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">{track.title}</h3>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    High Fit
                  </span>
                </div>
                <span className="inline-block text-[11px] font-semibold text-brand-700 dark:text-indigo-300 bg-brand-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md mb-3 border border-brand-200/50 dark:border-indigo-800">
                  {track.highlight}
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">{track.desc}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {track.skills.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-transparent dark:border-slate-700/60"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                to={`/jobs?category=${track.title.includes('QA') ? 'SOFTWARE_TESTING_QA' : 'ALL'}`}
                className="text-xs font-semibold text-brand-600 dark:text-indigo-400 hover:text-brand-700 dark:hover:text-indigo-300 flex items-center gap-1 pt-3 border-t border-slate-100 dark:border-slate-800"
              >
                <span>View open roles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-900 text-white py-16 lg:py-20 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 block mb-2">
              Predictability By Design
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              How the Exchange Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Eliminating subjective hiring bias and interview anxiety through task-based clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-3">
                <span className="text-2xl font-black text-indigo-400 font-mono block">{s.step}</span>
                <h3 className="font-bold text-base text-white">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* "How I Work Best" Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-tr from-brand-900 to-indigo-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8 border border-brand-700/40">
          <div className="max-w-xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Candidate Empowerment Feature
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              The "How I Work Best" Canvas
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
              Instead of forcing candidates to mask or explain accommodations after receiving an offer,
              our platform gives every candidate a structured, recruiter-facing canvas defining their
              ideal working rhythm, communication style, and environment settings.
            </p>
            <div className="space-y-2 pt-2 text-xs text-indigo-200">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Specify preferred communication (Written vs. Verbal, Async Standups)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Request sensory support (Quiet focus blocks, noise-cancelling stipends)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Granular privacy controls: share publicly or only with applied recruiters</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 w-full max-w-md space-y-4 text-xs shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                JT
              </div>
              <div>
                <span className="font-bold text-white block">Jordan Taylor</span>
                <span className="text-[11px] text-indigo-200">QA Automation Specialist</span>
              </div>
            </div>
            <div className="bg-black/20 p-3.5 rounded-xl border border-white/10">
              <span className="font-semibold text-white block mb-1 text-[11px] uppercase tracking-wide">
                How I Work Best Statement:
              </span>
              <p className="text-indigo-100 text-[11px] leading-relaxed">
                "I perform best with clearly documented acceptance criteria, written bug reproduction
                steps, and dedicated blocks of uninterrupted deep focus. I prefer asynchronous Slack
                check-ins over unexpected phone calls."
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2 py-0.5 rounded bg-white/15 text-[10px] text-white">Written-first</span>
              <span className="px-2 py-0.5 rounded bg-white/15 text-[10px] text-white">Quiet blocks</span>
              <span className="px-2 py-0.5 rounded bg-white/15 text-[10px] text-white">Camera-optional</span>
            </div>
          </div>
        </div>
      </section>

      {/* Employer Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-8 transition-colors">
          <div className="max-w-xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
              For Hiring Teams
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Hire Exceptional Neuro-Exceptional Talent
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Post jobs with pre-configured workplace accommodations, receive objective candidate match
              scores, and eliminate executive-functioning friction from your recruitment pipeline.
            </p>
          </div>
          <Link
            to="/register?role=EMPLOYER"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-teal-600 dark:hover:bg-teal-500 font-semibold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-colors shadow-sm shrink-0"
          >
            <Building2 className="w-4 h-4" />
            <span>Join as an Employer Partner</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="text-center max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Ready to discover your career fit?
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
          Take the 18-question assessment in under 5 minutes. Get clear, strength-based matches without
          diagnostic disclosure.
        </p>
        <Link
          to="/candidate/assessment"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-8 py-4 rounded-xl shadow-card transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Start Free Career Assessment</span>
        </Link>
      </section>
    </div>
  );
};
