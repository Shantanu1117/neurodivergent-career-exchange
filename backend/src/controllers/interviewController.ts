import { Request, Response } from 'express';
import { Interview } from '../models/Interview.js';
import { Application } from '../models/Application.js';
import { Job } from '../models/Job.js';
import { CandidateProfile } from '../models/CandidateProfile.js';
import { EmployerProfile } from '../models/EmployerProfile.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { EmailService } from '../services/emailService.js';

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
        timeZone,
        sensoryBreakMinutes,
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
        timeZone: timeZone || 'America/New_York (EST/EDT)',
        sensoryBreakMinutes: sensoryBreakMinutes !== undefined ? Number(sensoryBreakMinutes) : 10,
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

      // Notify candidate + send 48h Advance Interview Packet Email
      if (candidate.userId) {
        await Notification.create({
          userId: candidate.userId,
          title: `Interview Scheduled: ${job.title}`,
          message: `${employer.companyName} scheduled an interview. Check your interview hub to preview the agenda and advance questions.`,
          type: 'INTERVIEW_SCHEDULED',
          linkUrl: '/candidate/interviews',
        });

        const candUser = await User.findById(candidate.userId).lean();
        if (candUser?.email) {
          await EmailService.sendInterviewPacketEmail({
            userId: String(candUser._id),
            toEmail: candUser.email,
            candidateName: candidate.fullName || 'Candidate',
            jobTitle: job.title,
            companyName: employer.companyName,
            scheduledAt: interview.scheduledAt,
            durationMinutes: interview.durationMinutes,
            meetingType: interview.meetingType,
            meetingUrl: interview.meetingUrl || 'https://meet.google.com/ndc-interview',
            agenda: interview.agenda,
            questionsInAdvance: interview.questionsInAdvance,
            confirmedAccommodations: interview.confirmedAccommodations,
            sensoryBreakMinutes: interview.sensoryBreakMinutes,
          });
        }
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

        // Auto-provision a starter predictable interview session for newly registered candidates
        const existingCount = await Interview.countDocuments({ candidateId: candidate._id });
        if (existingCount === 0) {
          const sampleJob = await Job.findOne({ status: 'OPEN' }).populate('employerId').lean();
          if (sampleJob && sampleJob.employerId) {
            const emp = sampleJob.employerId as any;
            let appDoc = await Application.findOne({
              candidateId: candidate._id,
              jobId: sampleJob._id,
            });
            if (!appDoc) {
              appDoc = await Application.create({
                jobId: sampleJob._id,
                candidateId: candidate._id,
                status: 'INTERVIEW',
                matchScore: 94,
                matchBreakdown: {
                  skillsMatch: 92,
                  environmentMatch: 96,
                  strengthsMatch: 95,
                  experienceMatch: 90,
                  accommodationsMatch: 98,
                },
                requestedAccommodations:
                  candidate.accommodations?.length > 0
                    ? candidate.accommodations
                    : ['Written Questions 48h in Advance', 'Camera-Optional Video', 'Extra Processing Time'],
                candidateNote: 'Excited to explore strength-based engineering collaboration.',
                preferredInterviewFormat: 'Camera-Optional Video with Written Questions in Advance',
                timeline: [
                  {
                    status: 'APPLIED',
                    note: 'Strength-based profile matched with hiring team.',
                    changedAt: new Date(Date.now() - 48 * 3600 * 1000),
                  },
                  {
                    status: 'INTERVIEW',
                    note: '48-Hour Advance Interview Packet provisioned.',
                    changedAt: new Date(),
                  },
                ],
              });
            }

            const futureDate = new Date(Date.now() + 72 * 3600 * 1000);
            futureDate.setHours(14, 0, 0, 0);

            await Interview.create({
              applicationId: appDoc._id,
              candidateId: candidate._id,
              employerId: emp._id,
              jobId: sampleJob._id,
              title: `Predictable Technical & Work-Style Walkthrough — ${sampleJob.title}`,
              scheduledAt: futureDate,
              durationMinutes: 45,
              meetingType: 'VIDEO',
              meetingUrl: 'https://meet.google.com/nce-structured-walkthrough',
              agenda:
                '1. Warm Welcome & Sensory/Accommodation Check-In (5 mins)\n2. Practical Work-Sample & Architecture Walkthrough (25 mins)\n3. Candidate Q&A on Async Team Workflows (15 mins)',
              interviewers: [
                {
                  name: `${emp.companyName} Inclusive Hiring Lead`,
                  role: 'Principal Systems Lead',
                  bio: 'Trained in W3C COGA & neuro-affirming structured interviews. Zero trick questions.',
                },
              ],
              confirmedAccommodations:
                candidate.accommodations?.length > 0
                  ? candidate.accommodations
                  : [
                      'Written Interview Questions 48h in Advance',
                      'Camera-Optional Video Format',
                      'Extra Processing Time Between Questions',
                      'No Unannounced Whiteboard Puzzles',
                    ],
              questionsInAdvance: [
                'Can you walk us through a project, bug, or system pattern where your attention to detail or deep focus made a measurable difference?',
                'What sensory, communication, and documentation workflows help you perform at your best day-to-day?',
                'What questions can we answer about our team cadence, async communication norms, and onboarding support?',
              ],
              timeZone: 'Local Browser Time (UTC/EST Synced)',
              sensoryBreakMinutes: 10,
              status: 'SCHEDULED',
            });
          }
        }
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

  public static async requestPracticeInterview(req: Request, res: Response): Promise<void> {
    try {
      const candidate = await CandidateProfile.findOne({ userId: req.user?.userId });
      if (!candidate) {
        res.status(404).json({ success: false, message: 'Candidate profile not found.' });
        return;
      }

      const { meetingType, preferredTopic, sensoryBreakMinutes, customAccommodations } = req.body;
      const sampleJob = await Job.findOne({ status: 'OPEN' }).populate('employerId').lean();
      if (!sampleJob || !sampleJob.employerId) {
        res.status(404).json({ success: false, message: 'No active employer available.' });
        return;
      }

      const emp = sampleJob.employerId as any;
      let appDoc = await Application.findOne({
        candidateId: candidate._id,
        jobId: sampleJob._id,
      });
      if (!appDoc) {
        appDoc = await Application.create({
          jobId: sampleJob._id,
          candidateId: candidate._id,
          status: 'INTERVIEW',
          matchScore: 95,
          requestedAccommodations: candidate.accommodations || ['Written Questions 48h in Advance'],
        });
      }

      const scheduledDate = new Date(Date.now() + 48 * 3600 * 1000);
      scheduledDate.setHours(15, 0, 0, 0);

      const interview = await Interview.create({
        applicationId: appDoc._id,
        candidateId: candidate._id,
        employerId: emp._id,
        jobId: sampleJob._id,
        title: preferredTopic || `Neuro-Affirming Mock & Portfolio Session — ${sampleJob.title}`,
        scheduledAt: scheduledDate,
        durationMinutes: 40,
        meetingType: meetingType || 'VIDEO',
        meetingUrl: 'https://meet.google.com/nce-practice-room',
        agenda:
          '1. Accommodation & Pacing Check (5 mins)\n2. Guided Portfolio / Code Walkthrough (20 mins)\n3. Constructive Strengths Feedback & Q&A (15 mins)',
        interviewers: [
          {
            name: `${emp.companyName} Neuro-Inclusion Coach`,
            role: 'Engineering Mentor',
            bio: 'Dedicated to low-stress, predictable technical conversations.',
          },
        ],
        confirmedAccommodations:
          customAccommodations ||
          candidate.accommodations || [
            'Written Questions 48h in Advance',
            'Camera-Optional Video',
            'Extra Processing Time',
          ],
        questionsInAdvance: [
          'Which technical or analytical problem from your recent work or coursework are you proudest of solving?',
          'How do you prefer to receive code review or architectural feedback from teammates?',
          'What workspace adjustments should we have ready for your Day-1 onboarding?',
        ],
        timeZone: 'Local Timezone',
        sensoryBreakMinutes: sensoryBreakMinutes !== undefined ? Number(sensoryBreakMinutes) : 10,
        status: 'SCHEDULED',
      });

      const populated = await Interview.findById(interview._id)
        .populate('jobId', 'title category workMode location')
        .populate('employerId', 'companyName logo location')
        .populate('candidateId', 'fullName headline location avatar')
        .lean();

      const user = await User.findById(req.user?.userId).lean();
      if (user?.email) {
        await EmailService.sendInterviewPacketEmail({
          userId: String(user._id),
          toEmail: user.email,
          candidateName: candidate.fullName || 'Candidate',
          jobTitle: sampleJob.title,
          companyName: emp.companyName,
          scheduledAt: interview.scheduledAt,
          durationMinutes: interview.durationMinutes,
          meetingType: interview.meetingType,
          meetingUrl: interview.meetingUrl || 'https://meet.google.com/nce-practice-room',
          agenda: interview.agenda,
          questionsInAdvance: interview.questionsInAdvance,
          confirmedAccommodations: interview.confirmedAccommodations,
          sensoryBreakMinutes: interview.sensoryBreakMinutes,
        });
      }

      res.status(201).json({
        success: true,
        interview: populated,
        message: 'Structured session scheduled and 48h Advance Packet emailed to your inbox!',
      });
    } catch (err: any) {
      console.error('requestPracticeInterview error:', err);
      res.status(500).json({ success: false, message: 'Failed to schedule session.' });
    }
  }

  public static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status, notes, evaluationRubric } = req.body;
      const updatePayload: any = {};
      if (status !== undefined) updatePayload.status = status;
      if (notes !== undefined) updatePayload.notes = notes;
      if (evaluationRubric !== undefined) updatePayload.evaluationRubric = evaluationRubric;

      const interview = await Interview.findByIdAndUpdate(
        req.params.id,
        { $set: updatePayload },
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
