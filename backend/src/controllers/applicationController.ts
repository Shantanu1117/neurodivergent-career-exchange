import { Request, Response } from 'express';
import { Application, ApplicationStatus } from '../models/Application.js';
import { Job } from '../models/Job.js';
import { CandidateProfile } from '../models/CandidateProfile.js';
import { EmployerProfile } from '../models/EmployerProfile.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { MatchingService } from '../services/matchingService.js';
import { EmailService } from '../services/emailService.js';

export class ApplicationController {
  public static async apply(req: Request, res: Response): Promise<void> {
    try {
      const {
        jobId,
        candidateNote,
        requestedAccommodations,
        submissionType,
        workSampleSubmission,
        preferredInterviewFormat,
      } = req.body;

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
      const accList: string[] = requestedAccommodations || candidate.accommodations || [];

      const defaultChecklist = [
        ...accList.map((item) => ({ item: `Provision requested adjustment: ${item}`, completed: false })),
        { item: 'Send interview agenda & written questions at least 24 hours in advance', completed: false },
        { item: 'Confirm camera-optional / sensory-safe interview format with hiring panel', completed: false },
        { item: 'Prepare written Day-1 onboarding guide & assign team buddy', completed: false },
      ];

      const application = await Application.create({
        jobId,
        candidateId: candidate._id,
        status: 'APPLIED',
        matchScore: matchData.overallScore,
        matchBreakdown: matchData.breakdown,
        requestedAccommodations: accList,
        candidateNote: candidateNote || '',
        submissionType: submissionType || (workSampleSubmission ? 'WORK_SAMPLE' : 'STANDARD'),
        workSampleSubmission: workSampleSubmission || '',
        preferredInterviewFormat:
          preferredInterviewFormat || 'Written Async or Camera-Optional Video',
        accommodationChecklist: defaultChecklist,
        timeline: [
          {
            status: 'APPLIED',
            note:
              submissionType === 'WORK_SAMPLE'
                ? 'Application submitted with practical Work-Sample task.'
                : 'Application submitted by candidate.',
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

      // Send Application Confirmation Email to Candidate
      const candUser = await User.findById(req.user?.userId).lean();
      if (candUser?.email) {
        const companyName = employer?.companyName || 'Inclusive Partner';
        const confirmHtml = EmailService.wrapTemplate({
          badge: 'Application & Accommodation Receipt',
          title: `Application Confirmed: ${job.title}`,
          subtitle: `${companyName} • ${matchData.overallScore}% Strength & Sensory Alignment`,
          recipientName: candidate.fullName || 'Candidate',
          contentHtml: `
            <p style="margin:0 0 14px 0;">
              Your application for <strong>${job.title}</strong> at <strong>${companyName}</strong> has been received with a <strong>${matchData.overallScore}% Cognitive &amp; Environmental Match Score</strong>.
            </p>
            <div style="background-color:#0f172a;border:1px solid #334155;border-radius:12px;padding:16px;margin-bottom:14px;">
              <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#818cf8;font-weight:700;margin-bottom:8px;">What Happens Next</div>
              <ul style="margin:0;padding-left:18px;color:#e2e8f0;font-size:13px;line-height:1.7;">
                <li><strong>Preferred Interview Format:</strong> ${application.preferredInterviewFormat}</li>
                <li><strong>Requested Adjustments:</strong> ${accList.length ? accList.join(', ') : 'Standard Sensory-Safe Protocol'}</li>
                <li><strong>Advance Notice Guarantee:</strong> You will receive written interview questions at least 48 hours before any session.</li>
              </ul>
            </div>
          `,
          ctaText: 'Track Application Progress',
          ctaUrl: 'http://localhost:5173/candidate/applications',
        });

        await EmailService.sendEmail({
          userId: candUser._id,
          toEmail: candUser.email,
          toName: candidate.fullName || 'Candidate',
          fromName: `${companyName} via NCE`,
          subject: `[Application Confirmed] ${job.title} at ${companyName} (${matchData.overallScore}% Match)`,
          category: 'APPLICATION_CONFIRMATION',
          htmlBody: confirmHtml,
          textBody: `Your application for ${job.title} at ${companyName} has been confirmed with a ${matchData.overallScore}% match score.`,
        });
      }

      res.status(201).json({
        success: true,
        application,
        message: 'Application submitted and confirmation email dispatched!',
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
        .populate(
          'candidateId',
          'fullName headline location skills strengths accommodations howIWorkBest privacySettings sensoryProfile communicationPreferences disclosurePreferences'
        )
        .populate('jobId', 'title category workMode location')
        .sort({ createdAt: -1 })
        .lean();

      const enriched = applications.map((app: any) => {
        if (!app.accommodationChecklist || app.accommodationChecklist.length === 0) {
          const reqAcc: string[] = app.requestedAccommodations || [];
          app.accommodationChecklist = [
            ...reqAcc.map((item) => ({ item: `Provision requested adjustment: ${item}`, completed: true })),
            { item: 'Share interview questions & written agenda 24h in advance', completed: true },
            { item: 'Confirm sensory-safe / camera-optional interview format', completed: false },
            { item: 'Prepare written Day-1 onboarding checklist & team buddy', completed: false },
          ];
        }
        return app;
      });

      res.json({ success: true, applications: enriched });
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

  public static async requestFeedback(req: Request, res: Response): Promise<void> {
    try {
      const candidate = await CandidateProfile.findOne({ userId: req.user?.userId });
      if (!candidate) {
        res.status(404).json({ success: false, message: 'Candidate profile not found.' });
        return;
      }

      const application = await Application.findOne({
        _id: req.params.id,
        candidateId: candidate._id,
      }).populate('jobId');

      if (!application) {
        res.status(404).json({ success: false, message: 'Application not found.' });
        return;
      }

      application.feedbackRequested = true;
      if (!application.structuredFeedback || !application.structuredFeedback.strengthsObserved) {
        const job = application.jobId as any;
        application.structuredFeedback = {
          strengthsObserved: `Strong alignment in ${(candidate.strengths || ['Attention to Detail', 'Systematic Verification']).slice(0, 2).join(' and ')} and clear written communication.`,
          growthSuggestions: `Continue building hands-on portfolio examples in ${(job?.requiredSkills || ['Automated Testing', 'API Verification']).slice(0, 2).join(' and ')}.`,
          recommendedSkills: (job?.requiredSkills || ['Cypress', 'SQL']).slice(0, 2),
          sharedAt: new Date(),
        };
      }
      await application.save();

      res.json({
        success: true,
        application,
        message: 'Constructive feedback requested and generated.',
      });
    } catch (err: any) {
      console.error('requestFeedback error:', err);
      res.status(500).json({ success: false, message: 'Failed to request feedback.' });
    }
  }

  public static async submitStructuredFeedback(req: Request, res: Response): Promise<void> {
    try {
      const {
        strengthsObserved,
        growthSuggestions,
        recommendedSkills,
        strengthsHighlighted,
        growthAreas,
        encouragementNote,
      } = req.body;
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

      const sList = Array.isArray(strengthsHighlighted)
        ? strengthsHighlighted
        : strengthsObserved
        ? [strengthsObserved]
        : ['Systematic Problem Solving', 'Attention to Detail'];
      const gList = Array.isArray(growthAreas)
        ? growthAreas
        : growthSuggestions
        ? [growthSuggestions]
        : ['Continue expanding automated test coverage'];

      application.structuredFeedback = {
        strengthsObserved: strengthsObserved || sList.join(', '),
        growthSuggestions: growthSuggestions || gList.join(', '),
        recommendedSkills: Array.isArray(recommendedSkills) ? recommendedSkills : gList,
        strengthsHighlighted: sList,
        growthAreas: gList,
        encouragementNote:
          encouragementNote ||
          strengthsObserved ||
          'Thank you for sharing your strengths profile and work-sample with our team.',
        sharedAt: new Date(),
      };
      await application.save();

      res.json({
        success: true,
        application,
        structuredFeedback: application.structuredFeedback,
        message: 'Structured constructive feedback shared with candidate.',
      });
    } catch (err: any) {
      console.error('submitStructuredFeedback error:', err);
      res.status(500).json({ success: false, message: 'Failed to submit structured feedback.' });
    }
  }

  public static async updateAccommodationChecklist(req: Request, res: Response): Promise<void> {
    try {
      const rawList = req.body.accommodationChecklist || req.body.checklist || [];
      const normalized = rawList.map((entry: any) => ({
        item: entry.item,
        status: entry.status || (entry.completed ? 'COMPLETED' : 'PENDING'),
        completed: entry.completed ?? (entry.status === 'COMPLETED' || entry.status === 'APPROVED'),
        updatedAt: new Date(),
      }));
      const application = await Application.findByIdAndUpdate(
        req.params.id,
        { $set: { accommodationChecklist: normalized } },
        { new: true }
      );
      if (!application) {
        res.status(404).json({ success: false, message: 'Application not found.' });
        return;
      }
      res.json({
        success: true,
        application,
        accommodationChecklist: application.accommodationChecklist,
      });
    } catch (err: any) {
      console.error('updateAccommodationChecklist error:', err);
      res.status(500).json({ success: false, message: 'Failed to update accommodation checklist.' });
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
