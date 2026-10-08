import { Request, Response } from 'express';
import { Job, IJob } from '../models/Job.js';
import { EmployerProfile } from '../models/EmployerProfile.js';
import { CandidateProfile } from '../models/CandidateProfile.js';
import { SavedJob } from '../models/SavedJob.js';
import { Application } from '../models/Application.js';
import { MatchingService } from '../services/matchingService.js';

export class JobController {
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

      const enhancedJobs = jobs.map((job: any) => {
        let matchData = {
          overallScore: 84,
          breakdown: {
            skillsMatch: 85,
            environmentMatch: 90,
            strengthsMatch: 85,
            experienceMatch: 80,
            accommodationsMatch: 90,
          },
          reasons: ['Workplace support: Neuro-inclusive employer commitment.'],
        };

        if (candidateProfile) {
          matchData = MatchingService.calculateMatch(candidateProfile, job);
        }

        return {
          ...job,
          matchScore: matchData.overallScore,
          matchBreakdown: matchData.breakdown,
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
      const job = await Job.findById(req.params.id)
        .populate('employerId', 'companyName logo industry location about verified accommodationsOffered cultureHighlights')
        .lean();

      if (!job) {
        res.status(404).json({ success: false, message: 'Job posting not found.' });
        return;
      }

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
        responsibilities,
        requirements,
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
        interviewProcess,
        deadline,
      } = req.body;

      if (!title || !description || !category) {
        res.status(400).json({ success: false, message: 'Title, category, and description are required.' });
        return;
      }

      const job = await Job.create({
        employerId: employer._id,
        title,
        category,
        description,
        responsibilities: responsibilities || [],
        requirements: requirements || [],
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
