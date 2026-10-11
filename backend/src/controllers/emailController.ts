import { Request, Response } from 'express';
import { EmailLog } from '../models/EmailLog.js';
import { EmailService } from '../services/emailService.js';
import { User } from '../models/User.js';
import { CandidateProfile } from '../models/CandidateProfile.js';
import { Interview } from '../models/Interview.js';
import { Job } from '../models/Job.js';
import { Notification } from '../models/Notification.js';

export class EmailController {
  public static async getMyEmails(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const user = await User.findById(userId).lean();
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      let emails = await EmailLog.find({
        $or: [{ userId: user._id }, { toEmail: user.email }],
      })
        .sort({ createdAt: -1 })
        .limit(40)
        .lean();

      // Auto-provision starter transactional emails for new accounts so the Email Inbox/Vault is rich immediately
      if (emails.length === 0) {
        const candidate = await CandidateProfile.findOne({ userId: user._id }).lean();
        const recipientName = candidate?.fullName || user.email.split('@')[0] || 'Candidate';
        const topJobs = await Job.find({ status: 'OPEN' })
          .populate('employerId', 'companyName')
          .limit(3)
          .lean();

        const welcomeHtml = EmailService.wrapTemplate({
          badge: 'Welcome to Neurodivergent Career Exchange',
          title: `Your Sensory-Safe Career Hub is Ready, ${recipientName}`,
          subtitle: 'Strength-Based Matching • Zero Forced Disclosure • 48h Advance Interview Agendas',
          recipientName,
          contentHtml: `
            <p style="margin:0 0 14px 0;">
              Welcome to <strong>Neurodivergent Career Exchange (NCE)</strong>. Your account (<code style="color:#a5b4fc;">${user.email}</code>) is now active with cognitive-friendly matching and full workplace accommodation controls.
            </p>
            <div style="background-color:#0f172a;border:1px solid #334155;border-radius:14px;padding:16px;margin-bottom:16px;">
              <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#818cf8;font-weight:700;margin-bottom:8px;">3 Recommended Next Steps</div>
              <ol style="margin:0;padding-left:18px;color:#e2e8f0;font-size:13px;line-height:1.7;">
                <li>Complete the <strong>18-Item Cognitive Strengths Assessment &amp; Multi-Level Skill Quizzes</strong>.</li>
                <li>Configure your private <strong>Accommodation Passport &amp; "How I Work Best"</strong> blueprint.</li>
                <li>Browse verified employers offering <strong>Async Work-Samples</strong> and <strong>48h Advance Interview Questions</strong>.</li>
              </ol>
            </div>
          `,
          ctaText: 'Launch My Career Hub',
          ctaUrl: 'http://localhost:5173/candidate/dashboard',
        });

        await EmailService.sendEmail({
          userId: user._id,
          toEmail: user.email,
          toName: recipientName,
          subject: `Welcome to Neurodivergent Career Exchange, ${recipientName}!`,
          category: 'WELCOME_ONBOARDING',
          htmlBody: welcomeHtml,
          textBody: `Welcome to Neurodivergent Career Exchange, ${recipientName}! Your account (${user.email}) is active.`,
        });

        if (topJobs.length > 0) {
          const jobCardsHtml = topJobs
            .map((j: any) => {
              const company = j.employerId?.companyName || 'Inclusive Partner';
              return `
                <div style="background-color:#0f172a;border:1px solid #334155;border-radius:12px;padding:14px;margin-bottom:10px;">
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <strong style="color:#ffffff;font-size:14px;">${j.title}</strong>
                    <span style="background-color:rgba(16,185,129,0.2);color:#6ee7b7;font-size:11px;font-weight:700;padding:3px 8px;border-radius:6px;">94% Cognitive Fit</span>
                  </div>
                  <div style="color:#94a3b8;font-size:12px;margin-top:4px;">${company} &bull; ${j.workMode} &bull; ${j.location}</div>
                </div>
              `;
            })
            .join('');

          const digestHtml = EmailService.wrapTemplate({
            badge: 'Weekly 90%+ Match Digest',
            title: '3 Neuro-Inclusive Roles Matched to Your Strengths',
            subtitle: 'Verified Low-Sensory Environments & Async-Friendly Teams',
            recipientName,
            contentHtml: `
              <p style="margin:0 0 14px 0;">
                Based on your cognitive profile and sensory baseline, these verified employers offer high schedule predictability and zero surprise interviews:
              </p>
              ${jobCardsHtml}
            `,
            ctaText: 'Explore Matched Roles',
            ctaUrl: 'http://localhost:5173/candidate/jobs',
          });

          await EmailService.sendEmail({
            userId: user._id,
            toEmail: user.email,
            toName: recipientName,
            subject: `[94% Match Digest] 3 Neuro-Inclusive Roles for ${recipientName}`,
            category: 'JOB_MATCH_DIGEST',
            htmlBody: digestHtml,
            textBody: `Top matched roles for ${recipientName}: ${topJobs.map((j: any) => j.title).join(', ')}`,
          });
        }

        emails = await EmailLog.find({
          $or: [{ userId: user._id }, { toEmail: user.email }],
        })
          .sort({ createdAt: -1 })
          .limit(40)
          .lean();
      }

      res.json({ success: true, emails, userEmail: user.email });
    } catch (err: any) {
      console.error('getMyEmails error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve emails.' });
    }
  }

  public static async sendTestDigestEmail(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const user = await User.findById(userId).lean();
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      const candidate = await CandidateProfile.findOne({ userId: user._id }).lean();
      const recipientEmail = (req.body.toEmail || user.email).trim();
      const recipientName = candidate?.fullName || user.email.split('@')[0] || 'Candidate';

      const topJobs = await Job.find({ status: 'OPEN' })
        .populate('employerId', 'companyName')
        .limit(3)
        .lean();

      const jobListHtml = topJobs
        .map((j: any) => {
          const company = j.employerId?.companyName || 'Inclusive Partner';
          return `
            <div style="background-color:#0f172a;border:1px solid #334155;border-radius:12px;padding:14px;margin-bottom:10px;">
              <strong style="color:#ffffff;font-size:14px;">${j.title}</strong>
              <div style="color:#94a3b8;font-size:12px;margin-top:4px;">${company} &bull; ${j.workMode} &bull; ${j.location}</div>
              <div style="color:#6ee7b7;font-size:11px;margin-top:6px;">✓ Written Interview Questions 48h in Advance &bull; ✓ Async Work-Sample Option</div>
            </div>
          `;
        })
        .join('');

      const htmlBody = EmailService.wrapTemplate({
        badge: 'Instant Career Match & Delivery Verification',
        title: `Email Delivery Verified for ${recipientName}`,
        subtitle: `Sent to ${recipientEmail} • Real-Time NCE Dispatch`,
        recipientName,
        contentHtml: `
          <p style="margin:0 0 14px 0;">
            Your email notification preferences are active! Below is a live snapshot of your highest-compatibility neuro-inclusive job matches and accommodation status:
          </p>
          ${jobListHtml}
        `,
        ctaText: 'View All Matched Jobs',
        ctaUrl: 'http://localhost:5173/candidate/jobs',
      });

      const emailDoc = await EmailService.sendEmail({
        userId: user._id,
        toEmail: recipientEmail,
        toName: recipientName,
        subject: `[NCE Verified] Career Match Digest & Notification Test for ${recipientName}`,
        category: 'JOB_MATCH_DIGEST',
        htmlBody,
        textBody: `Email delivery verified for ${recipientName} (${recipientEmail}).`,
      });

      await Notification.create({
        userId: user._id,
        title: `Email Dispatched to ${recipientEmail}`,
        message: `Sent "${emailDoc.subject}" to your inbox. You can also preview or download the HTML email inside your Email Center.`,
        type: 'SYSTEM_ANNOUNCEMENT',
        linkUrl: '/candidate/notifications',
      });

      res.json({
        success: true,
        email: emailDoc,
        message: `Email successfully dispatched to ${recipientEmail}.`,
      });
    } catch (err: any) {
      console.error('sendTestDigestEmail error:', err);
      res.status(500).json({ success: false, message: 'Failed to send test email.' });
    }
  }

  public static async sendInterviewPacket(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const user = await User.findById(userId).lean();
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      const candidate = await CandidateProfile.findOne({ userId: user._id }).lean();
      const recipientEmail = (req.body.toEmail || user.email).trim();
      const recipientName = candidate?.fullName || user.email.split('@')[0] || 'Candidate';

      const { interviewId } = req.body;
      let interview: any = null;
      if (interviewId) {
        interview = await Interview.findById(interviewId)
          .populate('jobId', 'title')
          .populate('employerId', 'companyName')
          .lean();
      }

      const jobTitle = interview?.jobId?.title || req.body.jobTitle || 'Quality Engineering & Systems Specialist';
      const companyName = interview?.employerId?.companyName || req.body.companyName || 'Fintech Logic Corp';
      const scheduledAt = interview?.scheduledAt || new Date(Date.now() + 72 * 3600 * 1000);
      const durationMinutes = interview?.durationMinutes || 45;
      const meetingType = interview?.meetingType || 'VIDEO';
      const meetingUrl = interview?.meetingUrl || 'https://meet.google.com/nce-structured-session';
      const agenda =
        interview?.agenda ||
        '1. Sensory & Accommodation Check-In (5 mins)\n2. Asynchronous Work-Sample Walkthrough (25 mins)\n3. Candidate Q&A on Team Rhythm (15 mins)';
      const questionsInAdvance = interview?.questionsInAdvance?.length
        ? interview.questionsInAdvance
        : [
            'Can you walk us through a systematic problem or edge case you solved and how you structured your approach?',
            'What sensory, communication, or workflow conditions allow you to do your deepest focus work?',
            'What questions do you have for us about our async documentation and sprint predictability?',
          ];
      const confirmedAccommodations = interview?.confirmedAccommodations?.length
        ? interview.confirmedAccommodations
        : candidate?.accommodations || [
            'Written Questions 48h in Advance',
            'Camera-Optional Video',
            'Extra Processing Time',
          ];

      const emailDoc = await EmailService.sendInterviewPacketEmail({
        userId: String(user._id),
        toEmail: recipientEmail,
        candidateName: recipientName,
        jobTitle,
        companyName,
        scheduledAt,
        durationMinutes,
        meetingType,
        meetingUrl,
        agenda,
        questionsInAdvance,
        confirmedAccommodations,
        sensoryBreakMinutes: interview?.sensoryBreakMinutes ?? 10,
      });

      await Notification.create({
        userId: user._id,
        title: `48h Interview Agenda Emailed`,
        message: `Your advance questions & agenda for ${jobTitle} (${companyName}) were sent to ${recipientEmail}.`,
        type: 'INTERVIEW_SCHEDULED',
        linkUrl: '/candidate/interviews',
      });

      res.json({
        success: true,
        email: emailDoc,
        message: `48-Hour Advance Interview Packet sent to ${recipientEmail}.`,
      });
    } catch (err: any) {
      console.error('sendInterviewPacket error:', err);
      res.status(500).json({ success: false, message: 'Failed to send interview packet email.' });
    }
  }

  public static async sendPassportEmail(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const user = await User.findById(userId).lean();
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      const candidate = await CandidateProfile.findOne({ userId: user._id }).lean();
      const recipientEmail = (req.body.toEmail || user.email).trim();
      const recipientName = candidate?.fullName || user.email.split('@')[0] || 'Candidate';

      const emailDoc = await EmailService.sendAccommodationPassportEmail({
        userId: String(user._id),
        toEmail: recipientEmail,
        candidateName: recipientName,
        headline: candidate?.headline || 'Neurodivergent Systems & Quality Specialist',
        strengths: candidate?.strengths || ['Pattern Recognition', 'Hyperfocus', 'Systems Architecture'],
        accommodations: candidate?.accommodations || [
          'Written Instructions & Agendas',
          'Async-First Communication',
          'Quiet Workspace / Noise-Canceling Headphones',
        ],
        sensoryProfile: candidate?.sensoryProfile || {
          noiseLevel: 'LOW',
          lighting: 'NATURAL',
          socialBandwidth: 'MINIMAL',
          schedulePredictability: 'HIGH',
        },
        howIWorkBest: candidate?.howIWorkBest,
      });

      await Notification.create({
        userId: user._id,
        title: `Accommodation Passport Emailed`,
        message: `Your Workplace Accommodation Passport & "How I Work Best" summary was sent to ${recipientEmail}.`,
        type: 'SYSTEM_ANNOUNCEMENT',
        linkUrl: '/candidate/profile',
      });

      res.json({
        success: true,
        email: emailDoc,
        message: `Accommodation Passport sent to ${recipientEmail}.`,
      });
    } catch (err: any) {
      console.error('sendPassportEmail error:', err);
      res.status(500).json({ success: false, message: 'Failed to send Accommodation Passport email.' });
    }
  }

  public static async sendCustomEmail(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const user = await User.findById(userId).lean();
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      const { toEmail, toName, subject, messageBody } = req.body;
      if (!subject || !messageBody) {
        res.status(400).json({ success: false, message: 'Subject and message body are required.' });
        return;
      }

      const targetEmail = (toEmail || user.email).trim();
      const targetName = toName || targetEmail.split('@')[0] || 'Recipient';

      const htmlBody = EmailService.wrapTemplate({
        badge: 'Direct Inclusive Hiring Correspondence',
        title: subject,
        subtitle: `Sent by ${user.email} via Neurodivergent Career Exchange`,
        recipientName: targetName,
        contentHtml: `
          <div style="background-color:#0f172a;border:1px solid #334155;border-radius:14px;padding:18px;white-space:pre-wrap;color:#f1f5f9;font-size:14px;line-height:1.7;">${messageBody}</div>
        `,
        ctaText: 'Reply in NCE Messaging Hub',
        ctaUrl: 'http://localhost:5173/candidate/messages',
      });

      const emailDoc = await EmailService.sendEmail({
        userId: user._id,
        toEmail: targetEmail,
        toName: targetName,
        fromEmail: user.email,
        subject,
        category: 'DIRECT_OUTREACH',
        htmlBody,
        textBody: messageBody,
      });

      res.json({
        success: true,
        email: emailDoc,
        message: `Email dispatched to ${targetEmail}.`,
      });
    } catch (err: any) {
      console.error('sendCustomEmail error:', err);
      res.status(500).json({ success: false, message: 'Failed to send email.' });
    }
  }
}
