import { Request, Response } from 'express';
import { Job, IJob } from '../models/Job.js';
import { EmployerProfile } from '../models/EmployerProfile.js';
import { CandidateProfile } from '../models/CandidateProfile.js';
import { SavedJob } from '../models/SavedJob.js';
import { Application } from '../models/Application.js';
import { MatchingService } from '../services/matchingService.js';

export class JobController {
  private static enrichJobPlainLanguage(job: any): any {
    const reqs: string[] = job.requirements || [];
    const essentialRequirements =
      job.essentialRequirements && job.essentialRequirements.length > 0
        ? job.essentialRequirements
        : reqs.slice(0, Math.max(1, Math.ceil(reqs.length * 0.6)));
    const preferredRequirements =
      job.preferredRequirements && job.preferredRequirements.length > 0
        ? job.preferredRequirements
        : reqs.slice(Math.max(1, Math.ceil(reqs.length * 0.6)));

    const plainLanguageSummary =
      job.plainLanguageSummary && job.plainLanguageSummary.trim().length > 0
        ? job.plainLanguageSummary
        : `What you will actually do: You will work in a ${(job.workMode || 'REMOTE').toLowerCase()} setting focusing on ${(job.requiredSkills || []).slice(0, 3).join(', ') || 'structured technical tasks'}. Tasks are shared with clear written expectations, and the team provides ${(job.accommodationsOffered || []).slice(0, 2).join(' and ') || 'neuro-inclusive workplace adjustments'}. You only need the Must-Have skills to apply—Nice-to-Have skills can be learned on the job.`;

    return {
      ...job,
      plainLanguageSummary,
      essentialRequirements,
      preferredRequirements,
      workSampleTask: job.workSampleTask || {
        enabled: true,
        title: `Practical ${job.title} Scenario (Optional Cover-Letter Alternative)`,
        instructions: `Instead of writing a traditional cover letter, briefly outline how you would approach a core task in this role using ${(job.requiredSkills || []).slice(0, 2).join(' or ') || 'your systematic approach'}. Untimed (approx. 15–20 mins).`,
        estimatedMinutes: 20,
      },
      sensoryEnvironment: {
        noiseLevel: job.sensoryEnvironment?.noiseLevel || (job.workMode === 'ONSITE' ? 'MODERATE' : 'QUIET'),
        lightingType:
          job.sensoryEnvironment?.lightingType ||
          (job.workMode === 'REMOTE' ? 'Home / Natural Adjustable' : 'Low-Glare / Sensory Safe'),
        meetingLoad: job.sensoryEnvironment?.meetingLoad || 'MINIMAL',
        communicationStyle:
          job.sensoryEnvironment?.communicationStyle ||
          'Async-first written documentation + scheduled syncs with advance agenda',
        teamAutonomy: job.sensoryEnvironment?.teamAutonomy || 'HIGH_AUTONOMY',
      },
    };
  }

  public static async analyzeJobInclusivity(req: Request, res: Response): Promise<void> {
    try {
      const {
        title = '',
        description = '',
        requirements = [],
        accommodationsOffered = [],
        workMode = 'REMOTE',
        requiredSkills = [],
      } = req.body;

      const reqList: string[] = Array.isArray(requirements)
        ? requirements
        : String(requirements)
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean);

      const combinedText = `${title} ${description} ${reqList.join(' ')}`.toLowerCase();

      const biasDictionary: Array<{
        phrase: string;
        issue: string;
        replacement: string;
        penalty: number;
      }> = [
        {
          phrase: 'fast-paced',
          issue: 'Often signals chaotic priorities and unannounced interruptions, which can deter autistic and ADHD candidates.',
          replacement: 'Structured environment with clear sprint priorities',
          penalty: 10,
        },
        {
          phrase: 'wear many hats',
          issue: 'Idiomatic phrase that creates ambiguity about actual daily duties and role boundaries.',
          replacement: 'Cross-functional collaboration with clearly defined core responsibilities',
          penalty: 8,
        },
        {
          phrase: 'eye contact',
          issue: 'Directly penalizes neurodivergent communication styles unrelated to technical competency.',
          replacement: 'Clear and respectful team communication (written or verbal)',
          penalty: 18,
        },
        {
          phrase: 'extrovert',
          issue: 'Selects for social personality traits rather than role deliverables.',
          replacement: 'Collaborative contributor across asynchronous or synchronous channels',
          penalty: 14,
        },
        {
          phrase: 'rockstar',
          issue: 'Corporate jargon that obscures concrete skill level expectations.',
          replacement: 'Experienced specialist or engineer',
          penalty: 6,
        },
        {
          phrase: 'ninja',
          issue: 'Non-literal jargon that confuses screen readers and literal thinkers.',
          replacement: 'Skilled practitioner',
          penalty: 6,
        },
        {
          phrase: 'juggle multiple',
          issue: 'Emphasizes constant context-switching over deep focus and quality execution.',
          replacement: 'Manage prioritized deliverables with clear milestones',
          penalty: 8,
        },
        {
          phrase: 'excellent verbal communication',
          issue: 'May exclude candidates who communicate brilliantly via written documentation or async channels.',
          replacement: 'Clear communication skills (written documentation, async updates, or verbal)',
          penalty: 10,
        },
        {
          phrase: 'high pressure',
          issue: 'Signals potential burnout risk instead of psychological safety.',
          replacement: 'Mission-critical systems with structured incident playbooks',
          penalty: 10,
        },
      ];

      const flags = biasDictionary.filter((item) => combinedText.includes(item.phrase));
      let score = 96 - flags.reduce((acc, f) => acc + f.penalty, 0);

      const strengths: string[] = [];
      if (reqList.length > 7) {
        score -= 8;
        flags.push({
          phrase: `${reqList.length} bundled requirements`,
          issue: 'Long requirement lists cause neurodivergent candidates to self-select out if they miss even one item.',
          replacement: 'Split requirements into 3–5 Essential (Must-Have) and 2–3 Preferred (Nice-to-Have) criteria.',
          penalty: 8,
        });
      } else if (reqList.length > 0) {
        strengths.push('Concise requirement list reduces cognitive overload and applicant self-filtering.');
      }

      if (accommodationsOffered && accommodationsOffered.length >= 2) {
        score = Math.min(100, score + 4);
        strengths.push(`Explicitly lists ${accommodationsOffered.length} concrete workplace accommodations ("Success Enablers").`);
      } else {
        flags.push({
          phrase: 'Few or no explicit accommodations listed',
          issue: 'Candidates are 3x more likely to apply when accommodations like advance agendas or written instructions are stated upfront.',
          replacement: 'Add at least 3 concrete accommodations (e.g., Written instructions, Advance interview questions, Flexible hours).',
          penalty: 10,
        });
        score -= 10;
      }

      if (combinedText.includes('async') || combinedText.includes('written') || combinedText.includes('structured')) {
        strengths.push('Uses neuro-affirming clarity indicators (structured/written/async expectations).');
      }

      score = Math.max(35, Math.min(100, score));
      const rating =
        score >= 90 ? 'EXCELLENT_NEUROINCLUSIVE' : score >= 75 ? 'GOOD_WITH_MINOR_FIXES' : 'NEEDS_REVISION';

      const splitIdx = Math.max(1, Math.ceil(reqList.length * 0.6));
      const essentialRequirements = reqList.slice(0, splitIdx);
      const preferredRequirements = reqList.slice(splitIdx);

      const plainLanguageSummary = `What you will do in plain language: As a ${title || 'team member'}, you will work in a ${String(workMode).toLowerCase()} environment using ${(requiredSkills || []).slice(0, 3).join(', ') || 'core role tools'}. Priorities are documented clearly in writing, interview questions are shared in advance, and you only need the Essential requirements to apply.`;

      res.json({
        success: true,
        analysis: {
          score,
          rating,
          flags,
          warnings: flags.map((f) => `${f.phrase}: ${f.issue} Try: "${f.replacement}"`),
          strengths,
          positives: strengths,
          plainLanguageSummary,
          essentialRequirements,
          preferredRequirements,
        },
      });
    } catch (err: any) {
      console.error('analyzeJobInclusivity error:', err);
      res.status(500).json({ success: false, message: 'Failed to analyze job inclusivity.' });
    }
  }

  public static async getJobs(req: Request, res: Response): Promise<void> {
    try {
      const {
        search,
        category,
        workMode,
        experienceLevel,
        employmentType,
        accommodation,
        sort = 'newest',
        minSalary,
        wSkills,
        wEnv,
        wStrengths,
        wExp,
        wAcc,
      } = req.query;

      const filter: any = { status: 'PUBLISHED' };

      if (category && category !== 'ALL') {
        filter.category = category;
      }

      if (workMode && workMode !== 'ALL') {
        filter.workMode = workMode;
      }

      if (experienceLevel && experienceLevel !== 'ALL') {
        filter.experienceLevel = experienceLevel;
      }

      if (employmentType && employmentType !== 'ALL') {
        filter.employmentType = employmentType;
      }

      if (accommodation) {
        filter.accommodationsOffered = { $in: [new RegExp(String(accommodation), 'i')] };
      }

      if (minSalary) {
        filter.salaryMax = { $gte: Number(minSalary) };
      }

      if (search) {
        const sRegex = new RegExp(String(search), 'i');
        filter.$or = [
          { title: sRegex },
          { description: sRegex },
          { requiredSkills: sRegex },
          { matchedStrengths: sRegex },
          { location: sRegex },
        ];
      }

      let jobs = await Job.find(filter)
        .populate('employerId', 'companyName logo industry location verified')
        .sort({ createdAt: -1 })
        .lean();

      // If user is an authenticated candidate, calculate dynamic match scores
      let candidateProfile: any = null;
      let savedJobIds: string[] = [];
      let appliedJobIds: string[] = [];

      if (req.user && req.user.role === 'CANDIDATE') {
        candidateProfile = await CandidateProfile.findOne({ userId: req.user.userId });
        if (candidateProfile) {
          const saved = await SavedJob.find({ candidateId: candidateProfile._id });
          savedJobIds = saved.map((s) => s.jobId.toString());

          const applied = await Application.find({ candidateId: candidateProfile._id });
          appliedJobIds = applied.map((a) => a.jobId.toString());
        }
      }

      const weightOverride =
        wSkills !== undefined ||
        wEnv !== undefined ||
        wStrengths !== undefined ||
        wExp !== undefined ||
        wAcc !== undefined
          ? {
              skills: wSkills !== undefined ? Number(wSkills) : undefined,
              environment: wEnv !== undefined ? Number(wEnv) : undefined,
              strengths: wStrengths !== undefined ? Number(wStrengths) : undefined,
              experience: wExp !== undefined ? Number(wExp) : undefined,
              accommodations: wAcc !== undefined ? Number(wAcc) : undefined,
            }
          : undefined;

      const enhancedJobs = jobs.map((rawJob: any) => {
        const job = JobController.enrichJobPlainLanguage(rawJob);
        let matchData: any = {
          overallScore: 84,
          breakdown: {
            skillsMatch: 85,
            environmentMatch: 90,
            strengthsMatch: 85,
            experienceMatch: 80,
            accommodationsMatch: 90,
          },
          matchedSkills: (job.requiredSkills || []).slice(0, 2),
          missingSkills: (job.requiredSkills || []).slice(2),
          transferableMatches: [],
          appliedWeights: {
            skills: 30,
            environment: 25,
            strengths: 20,
            experience: 15,
            accommodations: 10,
          },
          reasons: ['Workplace support: Neuro-inclusive employer commitment.'],
        };

        if (candidateProfile) {
          matchData = MatchingService.calculateMatch(candidateProfile, job, weightOverride);
        }

        return {
          ...job,
          matchScore: matchData.overallScore,
          matchBreakdown: matchData.breakdown,
          matchedSkills: matchData.matchedSkills,
          missingSkills: matchData.missingSkills,
          transferableMatches: matchData.transferableMatches,
          appliedWeights: matchData.appliedWeights,
          matchReasons: matchData.reasons,
          isSaved: savedJobIds.includes(job._id.toString()),
          hasApplied: appliedJobIds.includes(job._id.toString()),
        };
      });

      if (sort === 'match') {
        enhancedJobs.sort((a, b) => b.matchScore - a.matchScore);
      } else if (sort === 'salary') {
        enhancedJobs.sort((a, b) => b.salaryMax - a.salaryMax);
      }

      res.json({
        success: true,
        jobs: enhancedJobs,
        total: enhancedJobs.length,
      });
    } catch (err: any) {
      console.error('getJobs error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve jobs.' });
    }
  }

  public static async getJobById(req: Request, res: Response): Promise<void> {
    try {
      const rawJob = await Job.findById(req.params.id)
        .populate('employerId', 'companyName logo industry location about verified accommodationsOffered cultureHighlights')
        .lean();

      if (!rawJob) {
        res.status(404).json({ success: false, message: 'Job posting not found.' });
        return;
      }

      const job = JobController.enrichJobPlainLanguage(rawJob);

      let matchData = null;
      let isSaved = false;
      let hasApplied = false;
      let userApplication = null;

      if (req.user && req.user.role === 'CANDIDATE') {
        const candidateProfile = await CandidateProfile.findOne({ userId: req.user.userId });
        if (candidateProfile) {
          matchData = MatchingService.calculateMatch(candidateProfile, job as any);
          const saved = await SavedJob.findOne({ candidateId: candidateProfile._id, jobId: job._id });
          isSaved = !!saved;

          const application = await Application.findOne({ candidateId: candidateProfile._id, jobId: job._id });
          if (application) {
            hasApplied = true;
            userApplication = application;
          }
        }
      }

      res.json({
        success: true,
        job: {
          ...job,
          matchScore: matchData ? matchData.overallScore : null,
          matchBreakdown: matchData ? matchData.breakdown : null,
          matchedSkills: matchData ? matchData.matchedSkills : (job.requiredSkills || []).slice(0, 2),
          missingSkills: matchData ? matchData.missingSkills : (job.requiredSkills || []).slice(2),
          transferableMatches: matchData ? matchData.transferableMatches : [],
          appliedWeights: matchData ? matchData.appliedWeights : null,
          matchReasons: matchData ? matchData.reasons : [],
          isSaved,
          hasApplied,
          userApplication,
        },
      });
    } catch (err: any) {
      console.error('getJobById error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve job details.' });
    }
  }

  public static async createJob(req: Request, res: Response): Promise<void> {
    try {
      const employer = await EmployerProfile.findOne({ userId: req.user?.userId });
      if (!employer) {
        res.status(404).json({ success: false, message: 'Employer profile not found.' });
        return;
      }

      const {
        title,
        category,
        description,
        plainLanguageSummary,
        responsibilities,
        requirements,
        essentialRequirements,
        preferredRequirements,
        requiredSkills,
        preferredSkills,
        matchedStrengths,
        workMode,
        location,
        salaryMin,
        salaryMax,
        salaryCurrency,
        experienceLevel,
        employmentType,
        accommodationsOffered,
        workSampleTask,
        sensoryEnvironment,
        inclusivityAnalysis,
        interviewProcess,
        deadline,
      } = req.body;

      if (!title || !description || !category) {
        res.status(400).json({ success: false, message: 'Title, category, and description are required.' });
        return;
      }

      const reqs = requirements || [];
      const splitIdx = Math.max(1, Math.ceil(reqs.length * 0.6));

      const job = await Job.create({
        employerId: employer._id,
        title,
        category,
        description,
        plainLanguageSummary:
          plainLanguageSummary ||
          `What you will do in plain language: Work in a ${(workMode || 'REMOTE').toLowerCase()} setting using ${(requiredSkills || []).slice(0, 3).join(', ') || 'structured workflows'}. Tasks have clear written scopes and advance interview questions are provided.`,
        responsibilities: responsibilities || [],
        requirements: reqs,
        essentialRequirements: essentialRequirements || reqs.slice(0, splitIdx),
        preferredRequirements: preferredRequirements || reqs.slice(splitIdx),
        requiredSkills: requiredSkills || [],
        preferredSkills: preferredSkills || [],
        matchedStrengths: matchedStrengths || ['Attention to Detail', 'Deep Focus'],
        workMode: workMode || 'REMOTE',
        location: location || 'Remote',
        salaryMin: salaryMin || 60000,
        salaryMax: salaryMax || 90000,
        salaryCurrency: salaryCurrency || 'USD',
        experienceLevel: experienceLevel || 'MID',
        employmentType: employmentType || 'FULL_TIME',
        accommodationsOffered: accommodationsOffered || employer.accommodationsOffered || [],
        workSampleTask: workSampleTask || {
          enabled: true,
          title: `Practical ${title} Task (Optional Cover-Letter Alternative)`,
          instructions:
            'Instead of a traditional cover letter, you may describe how you would approach a practical scenario in this role. Untimed and optional.',
          estimatedMinutes: 20,
        },
        sensoryEnvironment: sensoryEnvironment || {
          noiseLevel: 'QUIET',
          lightingType: 'Remote / Adjustable Natural Lighting',
          meetingLoad: 'MINIMAL',
          communicationStyle: 'Async-first written documentation + scheduled syncs with advance agenda',
        },
        inclusivityAnalysis: inclusivityAnalysis || {
          score: 95,
          suggestions: [],
        },
        interviewProcess: interviewProcess || [
          {
            stageNumber: 1,
            title: 'Initial Welcome & Accommodation Review',
            description: '30-minute informal check-in discussing role scope, written questions, and required workplace adjustments.',
            duration: '30 mins',
            format: 'Video or Written Call',
          },
          {
            stageNumber: 2,
            title: 'Practical Work Sample Assessment',
            description: 'Take-home task simulating daily duties with realistic deadline and clear evaluation criteria.',
            duration: 'Async (3 days window)',
            format: 'Asynchronous Task',
          },
          {
            stageNumber: 3,
            title: 'Team Meet & Technical Q&A',
            description: 'Structured 45-minute walkthrough of work sample with engineering lead.',
            duration: '45 mins',
            format: 'Structured Video',
          },
        ],
        deadline: deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'PUBLISHED',
      });

      res.status(201).json({ success: true, job });
    } catch (err: any) {
      console.error('createJob error:', err);
      res.status(500).json({ success: false, message: 'Failed to create job posting.' });
    }
  }

  public static async updateJob(req: Request, res: Response): Promise<void> {
    try {
      const employer = await EmployerProfile.findOne({ userId: req.user?.userId });
      if (!employer) {
        res.status(404).json({ success: false, message: 'Employer profile not found.' });
        return;
      }

      const job = await Job.findOne({ _id: req.params.id, employerId: employer._id });
      if (!job) {
        res.status(404).json({ success: false, message: 'Job not found or access denied.' });
        return;
      }

      const updated = await Job.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
      res.json({ success: true, job: updated });
    } catch (err: any) {
      console.error('updateJob error:', err);
      res.status(500).json({ success: false, message: 'Failed to update job.' });
    }
  }

  public static async toggleStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.body;
      const employer = await EmployerProfile.findOne({ userId: req.user?.userId });
      if (!employer) {
        res.status(404).json({ success: false, message: 'Employer profile not found.' });
        return;
      }

      const job = await Job.findOneAndUpdate(
        { _id: req.params.id, employerId: employer._id },
        { $set: { status } },
        { new: true }
      );

      if (!job) {
        res.status(404).json({ success: false, message: 'Job not found or unauthorized.' });
        return;
      }

      res.json({ success: true, job });
    } catch (err: any) {
      console.error('toggleStatus error:', err);
      res.status(500).json({ success: false, message: 'Failed to update job status.' });
    }
  }

  public static async deleteJob(req: Request, res: Response): Promise<void> {
    try {
      const employer = await EmployerProfile.findOne({ userId: req.user?.userId });
      if (!employer) {
        res.status(404).json({ success: false, message: 'Employer profile not found.' });
        return;
      }

      const job = await Job.findOneAndDelete({ _id: req.params.id, employerId: employer._id });
      if (!job) {
        res.status(404).json({ success: false, message: 'Job not found or unauthorized.' });
        return;
      }

      res.json({ success: true, message: 'Job posting deleted.' });
    } catch (err: any) {
      console.error('deleteJob error:', err);
      res.status(500).json({ success: false, message: 'Failed to delete job.' });
    }
  }

  public static async getEmployerJobs(req: Request, res: Response): Promise<void> {
    try {
      const employer = await EmployerProfile.findOne({ userId: req.user?.userId });
      if (!employer) {
        res.status(404).json({ success: false, message: 'Employer profile not found.' });
        return;
      }

      const jobs = await Job.find({ employerId: employer._id }).sort({ createdAt: -1 }).lean();
      
      // Update real-time applicant counts
      const jobsWithCounts = await Promise.all(
        jobs.map(async (j) => {
          const count = await Application.countDocuments({ jobId: j._id });
          return { ...j, applicantCount: count };
        })
      );

      res.json({ success: true, jobs: jobsWithCounts });
    } catch (err: any) {
      console.error('getEmployerJobs error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve employer jobs.' });
    }
  }

  public static async toggleSaveJob(req: Request, res: Response): Promise<void> {
    try {
      const candidate = await CandidateProfile.findOne({ userId: req.user?.userId });
      if (!candidate) {
        res.status(404).json({ success: false, message: 'Candidate profile not found.' });
        return;
      }

      const jobId = req.params.id;
      const existing = await SavedJob.findOne({ candidateId: candidate._id, jobId });

      if (existing) {
        await SavedJob.findByIdAndDelete(existing._id);
        res.json({ success: true, isSaved: false, message: 'Job removed from saved list.' });
      } else {
        await SavedJob.create({ candidateId: candidate._id, jobId });
        res.json({ success: true, isSaved: true, message: 'Job saved successfully.' });
      }
    } catch (err: any) {
      console.error('toggleSaveJob error:', err);
      res.status(500).json({ success: false, message: 'Failed to toggle save status.' });
    }
  }

  public static async getSavedJobs(req: Request, res: Response): Promise<void> {
    try {
      const candidate = await CandidateProfile.findOne({ userId: req.user?.userId });
      if (!candidate) {
        res.status(404).json({ success: false, message: 'Candidate profile not found.' });
        return;
      }

      const saved = await SavedJob.find({ candidateId: candidate._id })
        .populate({
          path: 'jobId',
          populate: { path: 'employerId', select: 'companyName logo location verified' },
        })
        .sort({ createdAt: -1 })
        .lean();

      const jobs = saved
        .filter((s: any) => s.jobId)
        .map((s: any) => {
          const job = s.jobId;
          const matchData = MatchingService.calculateMatch(candidate, job);
          return {
            ...job,
            matchScore: matchData.overallScore,
            matchBreakdown: matchData.breakdown,
            isSaved: true,
          };
        });

      res.json({ success: true, jobs });
    } catch (err: any) {
      console.error('getSavedJobs error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve saved jobs.' });
    }
  }
}
