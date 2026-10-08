import { Request, Response } from 'express';
import { EmployerProfile } from '../models/EmployerProfile.js';
import { Job } from '../models/Job.js';
import { Application } from '../models/Application.js';
import { Interview } from '../models/Interview.js';

export class EmployerController {
  public static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const employer = await EmployerProfile.findOne({ userId: req.user?.userId });
      if (!employer) {
        res.status(404).json({ success: false, message: 'Employer profile not found.' });
        return;
      }
      res.json({ success: true, profile: employer });
    } catch (err: any) {
      console.error('getEmployerProfile error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve employer profile.' });
    }
  }

  public static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const updated = await EmployerProfile.findOneAndUpdate(
        { userId: req.user?.userId },
        { $set: req.body },
        { new: true, upsert: true }
      );
      res.json({ success: true, profile: updated });
    } catch (err: any) {
      console.error('updateEmployerProfile error:', err);
      res.status(500).json({ success: false, message: 'Failed to update employer profile.' });
    }
  }

  public static async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      const employer = await EmployerProfile.findOne({ userId: req.user?.userId });
      if (!employer) {
        res.status(404).json({ success: false, message: 'Employer profile not found.' });
        return;
      }

      const activeJobsCount = await Job.countDocuments({
        employerId: employer._id,
        status: 'PUBLISHED',
      });

      const employerJobs = await Job.find({ employerId: employer._id }).select('_id');
      const jobIds = employerJobs.map((j) => j._id);

      const totalApplications = await Application.countDocuments({ jobId: { $in: jobIds } });
      const shortlistedCount = await Application.countDocuments({
        jobId: { $in: jobIds },
        status: 'SHORTLISTED',
      });
      const interviewCount = await Application.countDocuments({
        jobId: { $in: jobIds },
        status: 'INTERVIEW',
      });
      const offerCount = await Application.countDocuments({
        jobId: { $in: jobIds },
        status: 'OFFER',
      });

      const upcomingInterviews = await Interview.find({
        employerId: employer._id,
        status: 'SCHEDULED',
        scheduledAt: { $gte: new Date() },
      })
        .populate('candidateId', 'fullName avatar headline')
        .populate('jobId', 'title')
        .sort({ scheduledAt: 1 })
        .limit(5);

      res.json({
        success: true,
        stats: {
          activeJobs: activeJobsCount,
          totalApplications,
          shortlisted: shortlistedCount,
          interviews: interviewCount,
          offers: offerCount,
          upcomingInterviews,
        },
      });
    } catch (err: any) {
      console.error('getEmployerStats error:', err);
      res.status(500).json({ success: false, message: 'Failed to calculate employer statistics.' });
    }
  }
}
