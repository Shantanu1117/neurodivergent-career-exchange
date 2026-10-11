import mongoose from 'mongoose';
import { EmailLog, EmailCategory, IEmailLog } from '../models/EmailLog.js';

export interface SendEmailOptions {
  userId?: string | mongoose.Types.ObjectId;
  toEmail: string;
  toName?: string;
  fromName?: string;
  fromEmail?: string;
  subject: string;
  category: EmailCategory;
  htmlBody: string;
  textBody: string;
  metadata?: Record<string, any>;
}

export class EmailService {
  /**
   * Wraps email content in a high-contrast, WCAG AAA neuro-accessible HTML template
   */
  public static wrapTemplate(params: {
    badge: string;
    title: string;
    subtitle: string;
    recipientName: string;
    contentHtml: string;
    ctaText?: string;
    ctaUrl?: string;
    footerNote?: string;
  }): string {
    const frontendUrl = process.env.FRONTEND_URL?.split(',')[0]?.trim() || 'http://localhost:5173';
    const actionUrl = params.ctaUrl || `${frontendUrl}/candidate/dashboard`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${params.title}</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#0f172a;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:620px;background-color:#1e293b;border:1px solid #334155;border-radius:20px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#312e81 0%,#4f46e5 55%,#0d9488 100%);padding:28px 32px;">
              <div style="display:inline-block;background-color:rgba(255,255,255,0.16);color:#e0e7ff;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;padding:5px 12px;border-radius:999px;margin-bottom:12px;">
                ${params.badge}
              </div>
              <h1 style="margin:0;font-size:22px;line-height:1.3;font-weight:800;color:#ffffff;">
                ${params.title}
              </h1>
              <p style="margin:6px 0 0 0;font-size:13px;color:#cbd5e1;">
                ${params.subtitle}
              </p>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding:28px 32px;color:#e2e8f0;font-size:14px;line-height:1.65;">
              <p style="margin:0 0 16px 0;font-size:15px;font-weight:600;color:#ffffff;">
                Hi ${params.recipientName},
              </p>
              ${params.contentHtml}

              ${
                params.ctaText
                  ? `<div style="margin-top:26px;margin-bottom:10px;">
                      <a href="${actionUrl}" style="display:inline-block;background-color:#4f46e5;color:#ffffff;text-decoration:none;font-weight:700;font-size:13px;padding:12px 22px;border-radius:12px;">
                        ${params.ctaText} &rarr;
                      </a>
                    </div>`
                  : ''
              }
            </td>
          </tr>

          <!-- Sensory & Cognitive Accessibility Footer -->
          <tr>
            <td style="padding:20px 32px;background-color:#0f172a;border-top:1px solid #334155;font-size:12px;color:#94a3b8;line-height:1.5;">
              <strong style="color:#cbd5e1;">Neurodivergent Career Exchange (NCE)</strong> &bull; Predictable, Zero-Surprise Communication<br/>
              ${
                params.footerNote ||
                'This email is formatted in plain, predictable blocks with zero flashing media or hidden tracking pixels in accordance with W3C COGA & WCAG 2.2 AA guidelines.'
              }
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  /**
   * Sends an email via configured provider (Resend / Webhook) and logs to EmailLog
   */
  public static async sendEmail(options: SendEmailOptions): Promise<IEmailLog> {
    let deliveryStatus: 'DELIVERED' | 'QUEUED' | 'SENT_VIA_SMTP' = 'DELIVERED';

    // Optional external Resend API integration if RESEND_API_KEY is configured
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `${options.fromName || 'Neurodivergent Career Exchange'} <${
              options.fromEmail || 'onboarding@resend.dev'
            }>`,
            to: [options.toEmail],
            subject: options.subject,
            html: options.htmlBody,
            text: options.textBody,
          }),
        });
        if (res.ok) {
          deliveryStatus = 'SENT_VIA_SMTP';
        }
      } catch (e) {
        console.warn('[EmailService] External Resend API call skipped, falling back to local EmailVault:', e);
      }
    }

    const emailDoc = await EmailLog.create({
      userId: options.userId ? new mongoose.Types.ObjectId(String(options.userId)) : undefined,
      toEmail: options.toEmail,
      toName: options.toName || 'Candidate',
      fromEmail: options.fromEmail || 'inclusive-hiring@neurocareer.exchange',
      fromName: options.fromName || 'Neurodivergent Career Exchange',
      subject: options.subject,
      category: options.category,
      htmlBody: options.htmlBody,
      textBody: options.textBody,
      status: deliveryStatus,
      metadata: options.metadata || {},
      read: false,
    });

    console.log(`[EmailService] Dispatched [${options.category}] to ${options.toEmail} — "${options.subject}"`);
    return emailDoc;
  }

  /**
   * Generates and dispatches a 48-Hour Advance Interview Packet Email
   */
  public static async sendInterviewPacketEmail(params: {
    userId?: string;
    toEmail: string;
    candidateName: string;
    jobTitle: string;
    companyName: string;
    scheduledAt: string | Date;
    durationMinutes: number;
    meetingType: string;
    meetingUrl: string;
    agenda: string;
    questionsInAdvance: string[];
    confirmedAccommodations: string[];
    sensoryBreakMinutes?: number;
  }): Promise<IEmailLog> {
    const dateStr = new Date(params.scheduledAt).toLocaleString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    const questionsHtml = params.questionsInAdvance
      .map(
        (q, idx) =>
          `<li style="margin-bottom:10px;background-color:#0f172a;padding:12px 14px;border-radius:10px;border:1px solid #334155;color:#f1f5f9;">
            <strong style="color:#818cf8;">Q${idx + 1}:</strong> ${q}
          </li>`
      )
      .join('');

    const accHtml = (params.confirmedAccommodations.length
      ? params.confirmedAccommodations
      : ['Written Questions in Advance', 'Camera-Optional Video', 'Extra Processing Time']
    )
      .map(
        (acc) =>
          `<span style="display:inline-block;background-color:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.4);color:#6ee7b7;font-size:12px;font-weight:600;padding:4px 10px;border-radius:8px;margin:0 6px 6px 0;">✓ ${acc}</span>`
      )
      .join('');

    const contentHtml = `
      <p style="margin:0 0 16px 0;">
        Here is your <strong>48-Hour Advance Interview Preparation Packet</strong> for <strong>${params.jobTitle}</strong> with <strong>${params.companyName}</strong>. There are zero trick questions or unannounced coding puzzles.
      </p>

      <div style="background-color:#0f172a;border:1px solid #334155;border-radius:14px;padding:18px;margin-bottom:20px;">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700;margin-bottom:8px;">Session Logistics</div>
        <p style="margin:4px 0;color:#f8fafc;"><strong>Date & Time:</strong> ${dateStr} (${params.durationMinutes} mins)</p>
        <p style="margin:4px 0;color:#f8fafc;"><strong>Format:</strong> ${params.meetingType} (Camera Optional &bull; ${params.sensoryBreakMinutes ?? 10}m Sensory Pause Included)</p>
        <p style="margin:4px 0;color:#f8fafc;"><strong>Meeting Link:</strong> <a href="${params.meetingUrl}" style="color:#818cf8;">${params.meetingUrl}</a></p>
      </div>

      <div style="margin-bottom:20px;">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700;margin-bottom:8px;">Confirmed Workplace & Interview Accommodations</div>
        <div>${accHtml}</div>
      </div>

      <div style="background-color:#0f172a;border:1px solid #334155;border-radius:14px;padding:18px;margin-bottom:20px;">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700;margin-bottom:8px;">Time-Boxed Agenda</div>
        <pre style="margin:0;white-space:pre-wrap;font-family:inherit;color:#e2e8f0;font-size:13px;">${params.agenda}</pre>
      </div>

      <div style="margin-bottom:16px;">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700;margin-bottom:10px;">Exact Questions Prepared in Advance</div>
        <ul style="list-style:none;padding:0;margin:0;">
          ${questionsHtml}
        </ul>
      </div>
    `;

    const htmlBody = this.wrapTemplate({
      badge: '48-Hour Advance Interview Packet',
      title: `Interview Prep: ${params.jobTitle}`,
      subtitle: `${params.companyName} • Predictable, Accommodation-Verified Session`,
      recipientName: params.candidateName,
      contentHtml,
      ctaText: 'Open Predictable Interview Hub',
      ctaUrl: 'http://localhost:5173/candidate/interviews',
    });

    const textBody = `Hi ${params.candidateName},\n\n48-Hour Advance Interview Packet for ${params.jobTitle} at ${params.companyName}.\nDate: ${dateStr} (${params.durationMinutes}m)\nFormat: ${params.meetingType}\nMeeting URL: ${params.meetingUrl}\n\nAgenda:\n${params.agenda}\n\nAdvance Questions:\n${params.questionsInAdvance.map((q, i) => `${i + 1}. ${q}`).join('\n')}`;

    return this.sendEmail({
      userId: params.userId,
      toEmail: params.toEmail,
      toName: params.candidateName,
      fromName: `${params.companyName} via NCE`,
      subject: `[48h Advance Agenda] ${params.jobTitle} Interview Packet — ${params.companyName}`,
      category: 'INTERVIEW_PACKET_48H',
      htmlBody,
      textBody,
      metadata: {
        jobTitle: params.jobTitle,
        companyName: params.companyName,
        scheduledAt: params.scheduledAt,
      },
    });
  }

  /**
   * Generates and dispatches a Candidate Accommodation Passport & Work Style Email
   */
  public static async sendAccommodationPassportEmail(params: {
    userId?: string;
    toEmail: string;
    candidateName: string;
    headline: string;
    strengths: string[];
    accommodations: string[];
    sensoryProfile?: any;
    howIWorkBest?: any;
  }): Promise<IEmailLog> {
    const strengthsTags = (params.strengths.length
      ? params.strengths
      : ['Pattern Recognition', 'Deep Focus & Hyperfocus', 'Systems Thinking', 'Quality Assurance']
    )
      .map(
        (s) =>
          `<span style="display:inline-block;background-color:rgba(99,102,241,0.2);border:1px solid rgba(99,102,241,0.45);color:#c7d2fe;font-size:12px;font-weight:600;padding:4px 10px;border-radius:8px;margin:0 6px 6px 0;">★ ${s}</span>`
      )
      .join('');

    const accItems = (params.accommodations.length
      ? params.accommodations
      : ['Async-First Communication', 'Written Instructions & Agendas', 'Noise-Canceling / Quiet Workspace', 'Flexible Focus Blocks']
    )
      .map((a) => `<li style="margin-bottom:6px;color:#6ee7b7;">✓ <span style="color:#f1f5f9;">${a}</span></li>`)
      .join('');

    const sp = params.sensoryProfile || {};
    const howBestText =
      typeof params.howIWorkBest === 'string' && params.howIWorkBest.trim()
        ? params.howIWorkBest
        : params.howIWorkBest?.environment ||
          'Quiet remote or hybrid setup with uninterrupted focus blocks and written async agendas.';

    const contentHtml = `
      <p style="margin:0 0 16px 0;">
        Attached below is your verified <strong>Workplace Accommodation Passport &amp; "How I Work Best" Blueprint</strong>. You can keep this copy for your records or forward it directly to any hiring manager or HR coordinator—zero medical disclosure required.
      </p>

      <div style="background-color:#0f172a;border:1px solid #334155;border-radius:14px;padding:18px;margin-bottom:18px;">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700;margin-bottom:8px;">Candidate Identity &amp; Strengths</div>
        <p style="margin:0 0 10px 0;font-size:15px;font-weight:700;color:#ffffff;">${params.candidateName} — <span style="color:#818cf8;">${params.headline || 'Neurodivergent Specialist'}</span></p>
        <div>${strengthsTags}</div>
      </div>

      <div style="background-color:#0f172a;border:1px solid #334155;border-radius:14px;padding:18px;margin-bottom:18px;">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700;margin-bottom:8px;">Sensory &amp; Environmental Baseline</div>
        <p style="margin:4px 0;color:#e2e8f0;"><strong>Auditory / Noise Tolerance:</strong> ${sp.noiseTolerance || sp.auditorySensitivity || sp.noiseLevel || 'LOW'} (Quiet or headphones-friendly)</p>
        <p style="margin:4px 0;color:#e2e8f0;"><strong>Visual Lighting Preference:</strong> ${sp.lightingPreference || sp.visualStimulationPreference || sp.lighting || 'NATURAL'} (No harsh fluorescent flicker)</p>
        <p style="margin:4px 0;color:#e2e8f0;"><strong>Meeting &amp; Interruption Cadence:</strong> ${sp.interruptionTolerance || sp.socialConcurrencyTolerance || sp.socialBandwidth || 'MINIMAL'} (Protected deep-work blocks)</p>
        <p style="margin:4px 0;color:#e2e8f0;"><strong>Focus Style:</strong> ${sp.multitaskingStyle || sp.schedulePredictability || 'SINGLE_TASK_FOCUS'} (Advance notice for context switches)</p>
      </div>

      <div style="background-color:#0f172a;border:1px solid #334155;border-radius:14px;padding:18px;margin-bottom:18px;">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700;margin-bottom:8px;">How I Work Best</div>
        <p style="margin:4px 0;color:#e2e8f0;">${howBestText}</p>
      </div>

      <div style="background-color:#0f172a;border:1px solid #334155;border-radius:14px;padding:18px;">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700;margin-bottom:8px;">Requested Workplace Adjustments</div>
        <ul style="list-style:none;padding:0;margin:0;">
          ${accItems}
        </ul>
      </div>
    `;

    const htmlBody = this.wrapTemplate({
      badge: 'Verified Accommodation Passport',
      title: `Workplace Blueprint: ${params.candidateName}`,
      subtitle: 'Strength-Based Sensory, Communication & Adjustment Summary',
      recipientName: params.candidateName,
      contentHtml,
      ctaText: 'Manage My Accommodation Passport',
      ctaUrl: 'http://localhost:5173/candidate/profile',
    });

    const textBody = `Accommodation Passport for ${params.candidateName} (${params.headline})\nStrengths: ${params.strengths.join(', ')}\nAccommodations: ${params.accommodations.join(', ')}`;

    return this.sendEmail({
      userId: params.userId,
      toEmail: params.toEmail,
      toName: params.candidateName,
      subject: `[Accommodation Passport] ${params.candidateName} — Work Style & Sensory Blueprint`,
      category: 'ACCOMMODATION_PASSPORT',
      htmlBody,
      textBody,
    });
  }
}
