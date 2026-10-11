import { Request, Response } from 'express';
import { User } from '../models/User.js';
import { CandidateProfile } from '../models/CandidateProfile.js';
import { EmployerProfile } from '../models/EmployerProfile.js';
import { Job } from '../models/Job.js';
import { Application } from '../models/Application.js';
import { Interview } from '../models/Interview.js';
import { AccessibilityReport } from '../models/AccessibilityReport.js';

export class AdminController {
  public static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const totalCandidates = await CandidateProfile.countDocuments();
      const totalEmployers = await EmployerProfile.countDocuments();
      const activeJobs = await Job.countDocuments({ status: 'PUBLISHED' });
      const totalApplications = await Application.countDocuments();
      const totalInterviews = await Interview.countDocuments();
      const successfulOffers = await Application.countDocuments({ status: 'OFFER' });
      const openAccessibilityReports = await AccessibilityReport.countDocuments({ status: 'OPEN' });

      // Breakdown by categories
      const categoryBreakdown = await Job.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      // Application status distribution
      const applicationStatusBreakdown = await Application.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);

      res.json({
        success: true,
        stats: {
          totalCandidates,
          totalEmployers,
          activeJobs,
          totalApplications,
          totalInterviews,
          successfulOffers,
          openAccessibilityReports,
          categoryBreakdown,
          applicationStatusBreakdown,
        },
      });
    } catch (err: any) {
      console.error('admin getStats error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve administrative statistics.' });
    }
  }

  public static async createAccessibilityReport(req: Request, res: Response): Promise<void> {
    try {
      const { pageUrl, category, severity, description, reporterEmail } = req.body;
      if (!description || String(description).trim().length < 5) {
        res.status(400).json({
          success: false,
          message: 'Please provide a brief description of the accessibility barrier.',
        });
        return;
      }

      const report = await AccessibilityReport.create({
        pageUrl: pageUrl || '/',
        category: category || 'COGNITIVE_CLARITY',
        severity: severity || 'MEDIUM',
        description: String(description).trim(),
        reporterEmail: reporterEmail || '',
        status: 'OPEN',
      });

      res.status(201).json({
        success: true,
        report,
        message: 'Accessibility feedback submitted. Thank you for helping keep NCE barrier-free.',
      });
    } catch (err: any) {
      console.error('createAccessibilityReport error:', err);
      res.status(500).json({ success: false, message: 'Failed to submit accessibility report.' });
    }
  }

  public static async getAccessibilityReports(req: Request, res: Response): Promise<void> {
    try {
      const reports = await AccessibilityReport.find().sort({ createdAt: -1 }).limit(100).lean();
      res.json({ success: true, reports });
    } catch (err: any) {
      console.error('getAccessibilityReports error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve accessibility reports.' });
    }
  }

  public static async updateAccessibilityReport(req: Request, res: Response): Promise<void> {
    try {
      const { status, adminNote } = req.body;
      const report = await AccessibilityReport.findByIdAndUpdate(
        req.params.id,
        { $set: { status, adminNote } },
        { new: true }
      );
      if (!report) {
        res.status(404).json({ success: false, message: 'Accessibility report not found.' });
        return;
      }
      res.json({ success: true, report });
    } catch (err: any) {
      console.error('updateAccessibilityReport error:', err);
      res.status(500).json({ success: false, message: 'Failed to update accessibility report.' });
    }
  }

  public static async toggleEmployerVerification(req: Request, res: Response): Promise<void> {
    try {
      const employer = await EmployerProfile.findById(req.params.id);
      if (!employer) {
        res.status(404).json({ success: false, message: 'Employer profile not found.' });
        return;
      }
      employer.verified = !employer.verified;
      await employer.save();
      res.json({ success: true, employer });
    } catch (err: any) {
      console.error('toggleEmployerVerification error:', err);
      res.status(500).json({ success: false, message: 'Failed to toggle employer verification.' });
    }
  }

  public static async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const { role, search } = req.query;
      const filter: any = {};

      if (role && role !== 'ALL') {
        filter.role = role;
      }

      if (search) {
        filter.email = new RegExp(String(search), 'i');
      }

      const users = await User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).lean();

      // Enrich users with profiles
      const enriched = await Promise.all(
        users.map(async (u) => {
          let profile = null;
          if (u.role === 'CANDIDATE') {
            profile = await CandidateProfile.findOne({ userId: u._id }).select('fullName location headline');
          } else if (u.role === 'EMPLOYER') {
            profile = await EmployerProfile.findOne({ userId: u._id }).select('companyName industry location verified');
          }
          return { ...u, profile };
        })
      );

      res.json({ success: true, users: enriched });
    } catch (err: any) {
      console.error('admin getUsers error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
    }
  }

  public static async toggleUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
      } else {
        user.isActive = !user.isActive;
        await user.save();
        res.json({ success: true, user: { id: user._id, isActive: user.isActive } });
      }
    } catch (err: any) {
      console.error('toggleUserStatus error:', err);
      res.status(500).json({ success: false, message: 'Failed to toggle user status.' });
    }
  }

  public static async getAllJobs(req: Request, res: Response): Promise<void> {
    try {
      const jobs = await Job.find()
        .populate('employerId', 'companyName location verified')
        .sort({ createdAt: -1 })
        .lean();

      res.json({ success: true, jobs });
    } catch (err: any) {
      console.error('admin getAllJobs error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve platform jobs.' });
    }
  }

  public static async getAllApplications(req: Request, res: Response): Promise<void> {
    try {
      const applications = await Application.find()
        .populate('candidateId', 'fullName location headline')
        .populate({
          path: 'jobId',
          populate: { path: 'employerId', select: 'companyName' },
        })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

      res.json({ success: true, applications });
    } catch (err: any) {
      console.error('admin getAllApplications error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve applications.' });
    }
  }

  public static async toggleJobStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const job = await Job.findByIdAndUpdate(id, { $set: { status } }, { new: true });
      if (!job) {
        res.status(404).json({ success: false, message: 'Job not found.' });
        return;
      }
      res.json({ success: true, job });
    } catch (err: any) {
      console.error('admin toggleJobStatus error:', err);
      res.status(500).json({ success: false, message: 'Failed to update job status.' });
    }
  }

  public static async deleteJob(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const job = await Job.findByIdAndDelete(id);
      if (!job) {
        res.status(404).json({ success: false, message: 'Job not found.' });
        return;
      }
      res.json({ success: true, message: 'Job deleted successfully.' });
    } catch (err: any) {
      console.error('admin deleteJob error:', err);
      res.status(500).json({ success: false, message: 'Failed to delete job.' });
    }
  }
}
