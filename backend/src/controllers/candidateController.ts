import { Request, Response } from 'express';
import { CandidateProfile } from '../models/CandidateProfile.js';
import { User } from '../models/User.js';
import { Job } from '../models/Job.js';
import { Application } from '../models/Application.js';
import { SavedJob } from '../models/SavedJob.js';
import { Interview } from '../models/Interview.js';
import { Resource } from '../models/Resource.js';
import { MatchingService } from '../services/matchingService.js';

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
      let completion = 25;
      if (updateData.fullName) completion += 10;
      if (updateData.headline) completion += 10;
      if (updateData.skills && updateData.skills.length >= 3) completion += 15;
      if (updateData.strengths && updateData.strengths.length >= 2) completion += 15;
      if (updateData.howIWorkBest && updateData.howIWorkBest.length > 20) completion += 10;
      if (updateData.accommodations && updateData.accommodations.length >= 1) completion += 5;
      if (updateData.sensoryProfile) completion += 5;
      if (updateData.accommodationPlanner) completion += 5;
      
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

  public static async parseCvText(req: Request, res: Response): Promise<void> {
    try {
      const rawText = req.body.rawText || req.body.cvText || req.body.text || '';
      if (!rawText || typeof rawText !== 'string' || rawText.trim().length < 10) {
        res.status(400).json({
          success: false,
          message: 'Please paste or upload at least a brief summary, resume, or portfolio text.',
        });
        return;
      }

      const lower = rawText.toLowerCase();

      const skillCatalog = [
        'Python', 'TypeScript', 'JavaScript', 'React', 'Node.js', 'SQL', 'PostgreSQL', 'MongoDB',
        'Selenium', 'Cypress', 'Playwright', 'Automated Testing', 'Manual QA', 'Regression Testing',
        'API Testing', 'Postman', 'Jest', 'Bug Tracking', 'Jira', 'SIEM', 'Splunk', 'Wireshark',
        'Network Security', 'Incident Response', 'Threat Hunting', 'Vulnerability Assessment',
        'Linux', 'Bash', 'Docker', 'Kubernetes', 'AWS', 'Git', 'Data Analysis', 'Excel',
        'PowerBI', 'Tableau', 'Pandas', 'Data Auditing', 'Quality Assurance', 'Figma',
        'UI Design', 'UX Research', 'WCAG Accessibility', 'Design Systems', 'HTML/CSS',
        'Technical Writing', 'Markdown', 'API Documentation', 'Research Methodology', 'C++', 'Rust', 'Java',
      ];

      const extractedSkills = skillCatalog.filter((skill) =>
        lower.includes(skill.toLowerCase())
      );

      // Ensure sensible fallback skills if general terms are used
      if (extractedSkills.length === 0) {
        if (lower.includes('test') || lower.includes('bug') || lower.includes('qa')) {
          extractedSkills.push('Manual QA', 'Bug Tracking', 'Regression Testing');
        }
        if (lower.includes('data') || lower.includes('spreadsheet') || lower.includes('report')) {
          extractedSkills.push('Data Analysis', 'Data Auditing', 'SQL');
        }
        if (lower.includes('code') || lower.includes('web') || lower.includes('software')) {
          extractedSkills.push('JavaScript', 'Git', 'API Testing');
        }
        if (extractedSkills.length === 0) {
          extractedSkills.push('Technical Writing', 'Quality Assurance', 'Data Analysis');
        }
      }

      const strengthKeywords: Array<{ label: string; triggers: string[] }> = [
        { label: 'Attention to Detail', triggers: ['detail', 'thorough', 'accurate', 'precision', 'audit', 'test', 'qa'] },
        { label: 'Pattern Recognition', triggers: ['pattern', 'trend', 'anomaly', 'log', 'data', 'security', 'analyze'] },
        { label: 'Deep Focus', triggers: ['focus', 'deep', 'independent', 'research', 'complex', 'coding'] },
        { label: 'Systematic Verification', triggers: ['systematic', 'verify', 'checklist', 'compliance', 'testing', 'process'] },
        { label: 'Logical Thinking', triggers: ['logic', 'algorithm', 'architecture', 'debug', 'troubleshoot', 'math'] },
        { label: 'Systematic Documentation', triggers: ['document', 'write', 'guide', 'wiki', 'manual', 'notes'] },
        { label: 'Visual Precision', triggers: ['design', 'ui', 'ux', 'visual', 'layout', 'accessibility', 'figma'] },
      ];

      const extractedStrengths = strengthKeywords
        .filter((item) => item.triggers.some((t) => lower.includes(t)))
        .map((item) => item.label);

      if (extractedStrengths.length < 2) {
        extractedStrengths.push('Attention to Detail', 'Pattern Recognition', 'Systematic Verification');
      }

      const transferableRules: Array<{
        triggers: string[];
        sourceExperience: string;
        mappedSkill: string;
        category: string;
      }> = [
        {
          triggers: ['academic', 'thesis', 'university', 'research', 'lab', 'study'],
          sourceExperience: 'Academic / Independent Research',
          mappedSkill: 'Research Methodology & Data Auditing',
          category: 'RESEARCH_DOCUMENTATION',
        },
        {
          triggers: ['game', 'modding', 'discord', 'community', 'hobby', 'open source', 'raid'],
          sourceExperience: 'Self-Directed Technical Projects / Modding',
          mappedSkill: 'Exploratory QA & Bug Reproduction',
          category: 'SOFTWARE_TESTING_QA',
        },
        {
          triggers: ['music', 'math', 'puzzle', 'chess', 'cryptography', 'ctf'],
          sourceExperience: 'Analytical Pattern & Logic Problem Solving',
          mappedSkill: 'Anomaly Detection & Algorithmic Analysis',
          category: 'CYBERSECURITY',
        },
        {
          triggers: ['retail', 'inventory', 'admin', 'operations', 'catalog', 'finance', 'spreadsheet'],
          sourceExperience: 'Operations & Inventory Reconciliation',
          mappedSkill: 'Data Integrity Verification & SQL Reporting',
          category: 'DATA_ANALYSIS_AUDIT',
        },
      ];

      const transferableSkills = transferableRules
        .filter((r) => r.triggers.some((t) => lower.includes(t)))
        .map(({ sourceExperience, mappedSkill, category }) => ({
          sourceExperience,
          mappedSkill,
          category,
          context: sourceExperience,
          extractedSkill: mappedSkill,
          evidenceNote: `Mapped from ${sourceExperience}`,
        }));

      if (transferableSkills.length === 0) {
        transferableSkills.push({
          sourceExperience: 'Structured Problem Solving & Self-Directed Learning',
          mappedSkill: 'Systematic Quality Verification',
          category: 'SOFTWARE_TESTING_QA',
          context: 'Structured Problem Solving & Self-Directed Learning',
          extractedSkill: 'Systematic Quality Verification',
          evidenceNote: 'Mapped from structured self-directed project work',
        });
      }

      const topSkills = extractedSkills.slice(0, 3).join(', ');
      const suggestedHeadline = `Strengths-Driven Professional • ${topSkills}`;
      const suggestedBio = `Neurodivergent-affirming professional skilled in ${extractedSkills
        .slice(0, 5)
        .join(', ')}. Known for ${Array.from(new Set(extractedStrengths))
        .slice(0, 3)
        .join(', ').toLowerCase()} and delivering high-accuracy work in structured environments.`;

      const resultObj = {
        skills: Array.from(new Set(extractedSkills)),
        strengths: Array.from(new Set(extractedStrengths)),
        transferableSkills,
        suggestedHeadline,
        suggestedBio,
      };

      res.json({
        success: true,
        parsed: resultObj,
        extracted: resultObj,
      });
    } catch (err: any) {
      console.error('parseCvText error:', err);
      res.status(500).json({ success: false, message: 'Failed to parse resume text.' });
    }
  }

  public static async getSkillGapAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const candidate = await CandidateProfile.findOne({ userId: req.user?.userId });
      const job = await Job.findById(req.params.jobId);

      if (!job) {
        res.status(404).json({ success: false, message: 'Job not found.' });
        return;
      }

      if (!candidate) {
        res.status(404).json({ success: false, message: 'Candidate profile not found.' });
        return;
      }

      const matchResult = MatchingService.calculateMatch(candidate, job);
      const resources = await Resource.find({ category: job.category }).limit(3).lean();

      const learningBridge = matchResult.missingSkills.map((skill) => ({
        skill,
        estimatedHours: 6,
        actionStep: `Complete a self-paced practical module or mini-project in ${skill} and add it to your Transferable Skills mapper.`,
        recommendedResourceTitle:
          resources[0]?.title || `Self-Paced ${skill} Fundamentals for Visual & Literal Thinkers`,
      }));

      const totalCore = (matchResult.matchedSkills.length + matchResult.missingSkills.length) || 1;
      const readinessPercent = Math.round((matchResult.matchedSkills.length / totalCore) * 100);

      const gapPayload = {
        overallScore: matchResult.overallScore,
        readinessPercent,
        breakdown: matchResult.breakdown,
        matchedSkills: matchResult.matchedSkills,
        missingSkills: matchResult.missingSkills,
        matchedCoreSkills: matchResult.matchedSkills,
        missingCoreSkills: matchResult.missingSkills,
        transferableMatches: matchResult.transferableMatches,
        appliedWeights: matchResult.appliedWeights,
        learningBridge,
        encouragementNote:
          matchResult.missingSkills.length === 0
            ? 'You meet 100% of the core technical skills for this role! You can apply with high confidence.'
            : `Neurodivergent candidates often wait for 100% skill overlap before applying—but employers on NCE welcome applicants who match core strengths and are ready to learn the remaining ${matchResult.missingSkills.length} skill(s).`,
      };

      res.json({
        success: true,
        analysis: gapPayload,
        skillGap: gapPayload,
      });
    } catch (err: any) {
      console.error('getSkillGapAnalysis error:', err);
      res.status(500).json({ success: false, message: 'Failed to compute skill gap analysis.' });
    }
  }

  public static async exportCandidateData(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const user = await User.findById(userId).select('-passwordHash').lean();
      const profile = await CandidateProfile.findOne({ userId }).lean();
      const applications = profile
        ? await Application.find({ candidateId: profile._id })
            .populate('jobId', 'title category workMode location')
            .lean()
        : [];
      const savedJobs = profile
        ? await SavedJob.find({ candidateId: profile._id })
            .populate('jobId', 'title category location')
            .lean()
        : [];
      const interviews = profile
        ? await Interview.find({ candidateId: profile._id })
            .populate('jobId', 'title')
            .lean()
        : [];

      const bundle = {
        exportedAt: new Date().toISOString(),
        platform: 'Neurodivergent Career Exchange (NCE)',
        dataSovereigntyStandard: 'GDPR Article 20 (Right to Data Portability)',
        account: user,
        candidateProfile: profile,
        applications,
        savedJobs,
        interviews,
      };

      res.json({
        success: true,
        exportBundle: bundle,
        exportData: bundle,
      });
    } catch (err: any) {
      console.error('exportCandidateData error:', err);
      res.status(500).json({ success: false, message: 'Failed to export candidate data.' });
    }
  }

  public static async deleteCandidateAccount(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const profile = await CandidateProfile.findOne({ userId });
      if (profile) {
        await Application.deleteMany({ candidateId: profile._id });
        await SavedJob.deleteMany({ candidateId: profile._id });
        await Interview.deleteMany({ candidateId: profile._id });
        await CandidateProfile.deleteOne({ _id: profile._id });
      }
      await User.findByIdAndDelete(userId);

      res.json({
        success: true,
        message: 'Your account and all personal profile data have been permanently deleted.',
      });
    } catch (err: any) {
      console.error('deleteCandidateAccount error:', err);
      res.status(500).json({ success: false, message: 'Failed to delete candidate account.' });
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
        const stage = obj.disclosurePreferences?.accommodationsStage || 'AT_INTERVIEW';
        if (!obj.privacySettings?.shareAccommodationsPublicly || stage === 'PRIVATE' || stage === 'POST_OFFER') {
          obj.accommodations = ['[Candidate shares accommodations at interview/offer stage]'];
        }
        if (obj.accommodationPlanner) {
          obj.accommodationPlanner.privateNotes = '[Private to candidate]';
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
      if (candObj.accommodationPlanner) {
        candObj.accommodationPlanner.privateNotes = '[Private to candidate]';
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
