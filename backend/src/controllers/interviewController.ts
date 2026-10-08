import { Request, Response } from 'express';
import { Interview } from '../models/Interview.js';
import { Application } from '../models/Application.js';
import { Job } from '../models/Job.js';
import { CandidateProfile } from '../models/CandidateProfile.js';
import { EmployerProfile } from '../models/EmployerProfile.js';
import { Notification } from '../models/Notification.js';

export class InterviewController {
  public static async scheduleInterview(req: Request, res: Response): Promise<void> {
    try {
      const employer = await EmployerProfile.findOne({ userId: req.user?.userId });
      if (!employer) {
        res.status(404).json({ success: false, message: 'Employer profile not found.' });
        return;
      }

      const {
        applicationId,
        title,
        scheduledAt,
        durationMinutes,
        meetingType,
        meetingUrl,
        agenda,
        interviewers,
        confirmedAccommodations,
        questionsInAdvance,
      } = req.body;

      const application = await Application.findById(applicationId)
        .populate('jobId')
        .populate('candidateId');

      if (!application) {
        res.status(404).json({ success: false, message: 'Application not found.' });
        return;
      }

      const job = application.jobId as any;
      const candidate = application.candidateId as any;

      const interview = await Interview.create({
        applicationId,
        candidateId: candidate._id,
        employerId: employer._id,
        jobId: job._id,
        title: title || `Technical Assessment & Discussion — ${job.title}`,
        scheduledAt: new Date(scheduledAt),
        durationMinutes: durationMinutes || 45,
        meetingType: meetingType || 'VIDEO',
        meetingUrl: meetingUrl || 'https://meet.google.com/ndc-interview',
        agenda:
          agenda ||
          '1. Overview & Accommodation Check (5m)\n2. Practical Task Walkthrough (25m)\n3. Candidate Q&A and Next Steps (15m)',
        interviewers: interviewers || [
          {
            name: employer.companyName + ' Hiring Team',
            role: 'Hiring Lead',
            bio: 'Advocate for neuro-inclusive, strength-based engineering.',
          },
        ],
        confirmedAccommodations: confirmedAccommodations || application.requestedAccommodations || [],
        questionsInAdvance: questionsInAdvance || [
          'Can you walk us through a complex bug or inconsistency you discovered and how you verified it?',
          'What working conditions or communication rhythms help you maintain uninterrupted focus?',
          'What questions do you have about our team, day-to-day cadence, or technical stack?',
        ],
        status: 'SCHEDULED',
      });

      // Update application stage to INTERVIEW
      application.status = 'INTERVIEW';
      application.timeline.push({
        status: 'INTERVIEW',
        note: `Interview scheduled for ${new Date(scheduledAt).toLocaleDateString()}.`,
        changedAt: new Date(),
      });
      await application.save();

      // Notify candidate
      if (candidate.userId) {
        await Notification.create({
          userId: candidate.userId,
          title: `Interview Scheduled: ${job.title}`,
          message: `${employer.companyName} scheduled an interview. Check your interview hub to preview the agenda and advance questions.`,
          type: 'INTERVIEW_SCHEDULED',
          linkUrl: '/candidate/interviews',
        });
      }

      res.status(201).json({ success: true, interview });
    } catch (err: any) {
      console.error('scheduleInterview error:', err);
      res.status(500).json({ success: false, message: 'Failed to schedule interview.' });
    }
  }

  public static async getMyInterviews(req: Request, res: Response): Promise<void> {
    try {
      let filter: any = {};

      if (req.user?.role === 'CANDIDATE') {
        const candidate = await CandidateProfile.findOne({ userId: req.user.userId });
        if (!candidate) {
          res.status(404).json({ success: false, message: 'Candidate profile not found.' });
          return;
        }
        filter.candidateId = candidate._id;
      } else if (req.user?.role === 'EMPLOYER') {
        const employer = await EmployerProfile.findOne({ userId: req.user.userId });
        if (!employer) {
          res.status(404).json({ success: false, message: 'Employer profile not found.' });
          return;
        }
        filter.employerId = employer._id;
      }

      const interviews = await Interview.find(filter)
        .populate('jobId', 'title category workMode location')
        .populate('employerId', 'companyName logo location')
        .populate('candidateId', 'fullName headline location avatar')
        .sort({ scheduledAt: 1 })
        .lean();

      res.json({ success: true, interviews });
    } catch (err: any) {
      console.error('getMyInterviews error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve interviews.' });
    }
  }

  public static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status, notes } = req.body;
      const interview = await Interview.findByIdAndUpdate(
        req.params.id,
        { $set: { status, notes } },
        { new: true }
      );

      if (!interview) {
        res.status(404).json({ success: false, message: 'Interview not found.' });
        return;
      }

      res.json({ success: true, interview });
    } catch (err: any) {
      console.error('updateStatus error:', err);
      res.status(500).json({ success: false, message: 'Failed to update interview status.' });
    }
  }
}
