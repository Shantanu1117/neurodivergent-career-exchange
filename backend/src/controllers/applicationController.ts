import { Request, Response } from 'express';
import { Application, ApplicationStatus } from '../models/Application.js';
import { Job } from '../models/Job.js';
import { CandidateProfile } from '../models/CandidateProfile.js';
import { EmployerProfile } from '../models/EmployerProfile.js';
import { Notification } from '../models/Notification.js';
import { MatchingService } from '../services/matchingService.js';

export class ApplicationController {
  public static async apply(req: Request, res: Response): Promise<void> {
    try {
      const { jobId, candidateNote, requestedAccommodations } = req.body;

      if (!jobId) {
        res.status(400).json({ success: false, message: 'Job ID is required.' });
        return;
      }

      const candidate = await CandidateProfile.findOne({ userId: req.user?.userId });
      if (!candidate) {
        res.status(404).json({ success: false, message: 'Candidate profile not found.' });
        return;
      }

      const job = await Job.findById(jobId).populate('employerId');
      if (!job) {
        res.status(404).json({ success: false, message: 'Job posting not found.' });
        return;
      }

      const existing = await Application.findOne({ jobId, candidateId: candidate._id });
      if (existing) {
        res.status(400).json({ success: false, message: 'You have already applied to this job.' });
        return;
      }

      const matchData = MatchingService.calculateMatch(candidate, job as any);

      const application = await Application.create({
        jobId,
        candidateId: candidate._id,
        status: 'APPLIED',
        matchScore: matchData.overallScore,
        matchBreakdown: matchData.breakdown,
        requestedAccommodations: requestedAccommodations || candidate.accommodations || [],
        candidateNote: candidateNote || '',
        timeline: [
          {
            status: 'APPLIED',
            note: 'Application submitted by candidate.',
            changedAt: new Date(),
          },
        ],
      });

      // Increment job applicant count
      await Job.findByIdAndUpdate(jobId, { $inc: { applicantCount: 1 } });

      // Notify employer
      const employer = job.employerId as any;
      if (employer && employer.userId) {
        await Notification.create({
          userId: employer.userId,
          title: 'New Application Received',
          message: `${candidate.fullName} applied for ${job.title} with a ${matchData.overallScore}% match score.`,
          type: 'APPLICATION_STATUS_CHANGED',
          linkUrl: `/employer/applications?jobId=${job._id}`,
        });
      }

      res.status(201).json({
        success: true,
        application,
        message: 'Application submitted successfully.',
      });
    } catch (err: any) {
      console.error('apply error:', err);
      res.status(500).json({ success: false, message: 'Failed to submit application.' });
    }
  }

  public static async getMyApplications(req: Request, res: Response): Promise<void> {
    try {
      const candidate = await CandidateProfile.findOne({ userId: req.user?.userId });
      if (!candidate) {
        res.status(404).json({ success: false, message: 'Candidate profile not found.' });
        return;
      }

      const applications = await Application.find({ candidateId: candidate._id })
        .populate({
          path: 'jobId',
          populate: { path: 'employerId', select: 'companyName logo location verified' },
        })
        .sort({ updatedAt: -1 })
        .lean();

      res.json({ success: true, applications });
    } catch (err: any) {
      console.error('getMyApplications error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve applications.' });
    }
  }

  public static async getJobApplications(req: Request, res: Response): Promise<void> {
    try {
      const { jobId, status } = req.query;
      const employer = await EmployerProfile.findOne({ userId: req.user?.userId });

      if (!employer) {
        res.status(404).json({ success: false, message: 'Employer profile not found.' });
        return;
      }

      const filter: any = {};
      if (jobId) {
        // Verify ownership
        const job = await Job.findOne({ _id: jobId, employerId: employer._id });
        if (!job) {
          res.status(403).json({ success: false, message: 'Unauthorized job access.' });
          return;
        }
        filter.jobId = jobId;
      } else {
        // Find all jobs for this employer
        const myJobs = await Job.find({ employerId: employer._id }).select('_id');
        filter.jobId = { $in: myJobs.map((j) => j._id) };
      }

      if (status && status !== 'ALL') {
        filter.status = status;
      }

      const applications = await Application.find(filter)
        .populate('candidateId', 'fullName headline location skills strengths accommodations howIWorkBest privacySettings')
        .populate('jobId', 'title category workMode location')
        .sort({ createdAt: -1 })
        .lean();

      res.json({ success: true, applications });
    } catch (err: any) {
      console.error('getJobApplications error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve applications.' });
    }
  }

  public static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status, note } = req.body;
      const employer = await EmployerProfile.findOne({ userId: req.user?.userId });

      if (!employer) {
        res.status(404).json({ success: false, message: 'Employer profile not found.' });
        return;
      }

      const application = await Application.findById(req.params.id)
        .populate('jobId')
        .populate('candidateId');

      if (!application) {
        res.status(404).json({ success: false, message: 'Application not found.' });
        return;
      }

      const job = application.jobId as any;
      if (job.employerId.toString() !== employer._id.toString()) {
        res.status(403).json({ success: false, message: 'Unauthorized to update this application.' });
        return;
      }

      application.status = status as ApplicationStatus;
      application.timeline.push({
        status: status as ApplicationStatus,
        note: note || `Application stage updated to ${status}.`,
        changedAt: new Date(),
      });
      await application.save();

      // Notify candidate
      const candidate = application.candidateId as any;
      if (candidate && candidate.userId) {
        await Notification.create({
          userId: candidate.userId,
          title: `Application Update: ${job.title}`,
          message: `Your application with ${employer.companyName} has progressed to: ${status.replace('_', ' ')}.`,
          type: 'APPLICATION_STATUS_CHANGED',
          linkUrl: '/candidate/applications',
        });
      }

      res.json({ success: true, application, message: 'Application stage updated.' });
    } catch (err: any) {
      console.error('updateStatus error:', err);
      res.status(500).json({ success: false, message: 'Failed to update application status.' });
    }
  }

  public static async addEmployerNote(req: Request, res: Response): Promise<void> {
    try {
      const { note } = req.body;
      const employer = await EmployerProfile.findOne({ userId: req.user?.userId });

      if (!employer) {
        res.status(404).json({ success: false, message: 'Employer profile not found.' });
        return;
      }

      const application = await Application.findById(req.params.id).populate('jobId');
      if (!application) {
        res.status(404).json({ success: false, message: 'Application not found.' });
        return;
      }

      const job = application.jobId as any;
      if (job.employerId.toString() !== employer._id.toString()) {
        res.status(403).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      application.employerNotes.push({
        authorName: employer.companyName,
        note,
        createdAt: new Date(),
      });
      await application.save();

      res.json({ success: true, employerNotes: application.employerNotes });
    } catch (err: any) {
      console.error('addEmployerNote error:', err);
      res.status(500).json({ success: false, message: 'Failed to add note.' });
    }
  }

  public static async withdrawApplication(req: Request, res: Response): Promise<void> {
    try {
      const candidate = await CandidateProfile.findOne({ userId: req.user?.userId });
      if (!candidate) {
        res.status(404).json({ success: false, message: 'Candidate profile not found.' });
        return;
      }

      const application = await Application.findOne({
        _id: req.params.id,
        candidateId: candidate._id,
      });

      if (!application) {
        res.status(404).json({ success: false, message: 'Application not found.' });
        return;
      }

      application.status = 'WITHDRAWN';
      application.timeline.push({
        status: 'WITHDRAWN',
        note: 'Application withdrawn by candidate.',
        changedAt: new Date(),
      });
      await application.save();

      res.json({ success: true, message: 'Application withdrawn successfully.' });
    } catch (err: any) {
      console.error('withdrawApplication error:', err);
      res.status(500).json({ success: false, message: 'Failed to withdraw application.' });
    }
  }
}
