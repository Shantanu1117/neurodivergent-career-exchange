import { Request, Response } from 'express';
import { CandidateProfile } from '../models/CandidateProfile.js';
import { User } from '../models/User.js';

export class CandidateController {
  public static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const candidate = await CandidateProfile.findOne({ userId: req.user?.userId });
      if (!candidate) {
        res.status(404).json({ success: false, message: 'Candidate profile not found.' });
        return;
      }
      res.json({ success: true, profile: candidate });
    } catch (err: any) {
      console.error('getProfile error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
    }
  }

  public static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const updateData = req.body;
      
      // Calculate profile completion score
      let completion = 30;
      if (updateData.fullName) completion += 10;
      if (updateData.headline) completion += 10;
      if (updateData.skills && updateData.skills.length >= 3) completion += 15;
      if (updateData.strengths && updateData.strengths.length >= 2) completion += 15;
      if (updateData.howIWorkBest && updateData.howIWorkBest.length > 20) completion += 10;
      if (updateData.accommodations && updateData.accommodations.length >= 1) completion += 10;
      
      updateData.profileCompletion = Math.min(100, completion);

      const updated = await CandidateProfile.findOneAndUpdate(
        { userId: req.user?.userId },
        { $set: updateData },
        { new: true, upsert: true }
      );

      res.json({ success: true, profile: updated });
    } catch (err: any) {
      console.error('updateProfile error:', err);
      res.status(500).json({ success: false, message: 'Failed to update profile.' });
    }
  }

  public static async searchCandidates(req: Request, res: Response): Promise<void> {
    try {
      const { skill, strength, workMode, category, search } = req.query;

      const filter: any = {
        'privacySettings.isSearchableByRecruiters': true,
      };

      if (skill) {
        filter.skills = { $in: [new RegExp(String(skill), 'i')] };
      }

      if (strength) {
        filter.strengths = { $in: [new RegExp(String(strength), 'i')] };
      }

      if (workMode) {
        filter['workPreferences.workMode'] = workMode;
      }

      if (category) {
        filter.careerInterests = { $in: [new RegExp(String(category), 'i')] };
      }

      if (search) {
        const sRegex = new RegExp(String(search), 'i');
        filter.$or = [
          { fullName: sRegex },
          { headline: sRegex },
          { skills: sRegex },
          { strengths: sRegex },
        ];
      }

      const candidates = await CandidateProfile.find(filter)
        .select('-phone -userId')
        .limit(50);

      // Sanitize candidates who don't want accommodations public
      const sanitized = candidates.map((cand) => {
        const obj = cand.toObject();
        if (!obj.privacySettings?.shareAccommodationsPublicly) {
          obj.accommodations = ['[Candidate prefers to share accommodations post-match]'];
        }
        return obj;
      });

      res.json({ success: true, candidates: sanitized, total: sanitized.length });
    } catch (err: any) {
      console.error('searchCandidates error:', err);
      res.status(500).json({ success: false, message: 'Failed to search candidates.' });
    }
  }

  public static async getCandidateById(req: Request, res: Response): Promise<void> {
    try {
      const candidate = await CandidateProfile.findById(req.params.id);
      if (!candidate) {
        res.status(404).json({ success: false, message: 'Candidate not found.' });
        return;
      }

      const candObj = candidate.toObject();
      if (!candObj.privacySettings?.shareAccommodationsPublicly) {
        candObj.accommodations = ['[Shared directly with interviewing employers]'];
      }

      res.json({ success: true, candidate: candObj });
    } catch (err: any) {
      console.error('getCandidateById error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve candidate profile.' });
    }
  }

  public static async getPlacedCandidates(req: Request, res: Response): Promise<void> {
    try {
      const placedCandidates = [
        {
          id: 'placed-1',
          fullName: 'Maya Patel',
          role: 'Lead QA Automation Engineer',
          previousRole: 'Underemployed Math Graduate',
          company: 'Fintech Logic Corp',
          companyIndustry: 'Financial Infrastructure',
          location: 'Remote • Denver, CO',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
          salary: '$125,000',
          track: 'SOFTWARE_TESTING_QA',
          trackName: 'Software Testing & QA',
          strengths: ['Attention to Detail', 'Pattern Recognition', 'Systematic Verification'],
          accommodations: ['Written bug reproduction steps', 'Quiet focus blocks (no meetings 1-5pm)', 'Camera-optional calls'],
          story: 'Traditional interview loops asked me ambiguous riddle questions that made me shut down. NDCE matched me directly with an engineering lead who gave me a real Cypress test harness to debug with clear criteria. I was hired in 10 days.',
          managerQuote: 'Maya found 14 critical edge-case flaws in her first sprint that our automated regression tools missed. Her systematic precision is unmatched.',
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
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          salary: '$118,000',
          track: 'CYBERSECURITY',
          trackName: 'Cybersecurity & SecOps',
          strengths: ['Deep Focus', 'Anomaly Detection', 'Logical Thinking'],
          accommodations: ['Advance meeting agendas', 'Asynchronous daily standups', 'Noise-cancelling headphones allowance'],
          story: 'My hyperfocus on SIEM logs and packet analysis was treated as an oddity in past jobs. At PrismFlow, it is treated as a strategic asset. Knowing interview questions beforehand allowed me to prepare without sensory panic.',
          managerQuote: 'Alex has an instinct for pattern disruption in intrusion detection. He identified an APT infiltration vector within his first month.',
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
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
          salary: '$110,000',
          track: 'DATA_ANALYSIS_AUDIT',
          trackName: 'Data Analysis & Audit',
          strengths: ['Data Structuring', 'Attention to Detail', 'Problem Solving'],
          accommodations: ['Explicit task checklists', 'Flexible core hours', 'Written feedback on performance'],
          story: 'I have ADHD and thrive when tasks have clear boundaries and structured outcomes. The "How I Work Best" canvas meant my manager already understood my communication needs before my first day.',
          managerQuote: 'Jordan reduced our data reconciliation cycle from 5 days to 4 hours with elegant SQL pipelines. An absolute game changer for our team.',
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
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
          salary: '$135,000',
          track: 'UI_UX_DESIGN',
          trackName: 'UI/UX & Accessibility Design',
          strengths: ['Visual Precision', 'Empathy-Driven Architecture', 'Research'],
          accommodations: ['Camera-optional video calls', 'Low-stimulation workspace', 'Screen reader testing allocation'],
          story: 'Being autistic gave me an instinctive sensitivity to cognitive overload and sensory clutter in software. NDCE connected me with a company that values accessibility from the inside out.',
          managerQuote: 'Samira transformed our entire client design system to meet WCAG AAA standards while boosting task completion rates by 38%.',
          managerName: 'Leila Faris, Head of Experience Design',
          placedDate: 'February 2026',
        },
        {
          id: 'placed-5',
          fullName: 'Lucas Vance',
          role: 'Backend Systems Engineer (Rust / Node.js)',
          previousRole: 'Junior Developer',
          company: 'Cognitive Systems',
          companyIndustry: 'Enterprise Search & Indexing',
          location: 'Hybrid • New York, NY',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
          salary: '$140,000',
          track: 'SOFTWARE_DEVELOPMENT',
          trackName: 'Software Engineering',
          strengths: ['Logical Thinking', 'Algorithmic Efficiency', 'Deep Focus'],
          accommodations: ['No ad-hoc interruptions', 'Async code reviews', 'Flexible arrival window'],
          story: 'I struggled with open-office environments and impromptu brainstorming sessions. Here, 90% of our architectural discussion happens in written markdown. My code output has tripled.',
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
          avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80',
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

      res.json({ success: true, candidates: placedCandidates, total: placedCandidates.length });
    } catch (err: any) {
      console.error('getPlacedCandidates error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve placed candidates.' });
    }
  }
}
