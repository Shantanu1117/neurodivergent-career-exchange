import mongoose, { Schema, Document } from 'mongoose';

export type EmailCategory =
  | 'WELCOME_ONBOARDING'
  | 'APPLICATION_CONFIRMATION'
  | 'INTERVIEW_PACKET_48H'
  | 'ACCOMMODATION_PASSPORT'
  | 'JOB_MATCH_DIGEST'
  | 'DIRECT_OUTREACH'
  | 'SYSTEM_TEST';

export interface IEmailLog extends Document {
  userId?: mongoose.Types.ObjectId;
  toEmail: string;
  toName: string;
  fromEmail: string;
  fromName: string;
  subject: string;
  category: EmailCategory;
  htmlBody: string;
  textBody: string;
  status: 'DELIVERED' | 'QUEUED' | 'SENT_VIA_SMTP';
  metadata?: Record<string, any>;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EmailLogSchema = new Schema<IEmailLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    toEmail: { type: String, required: true, index: true },
    toName: { type: String, default: 'Candidate' },
    fromEmail: { type: String, default: 'inclusive-hiring@neurocareer.exchange' },
    fromName: { type: String, default: 'Neurodivergent Career Exchange' },
    subject: { type: String, required: true },
    category: {
      type: String,
      enum: [
        'WELCOME_ONBOARDING',
        'APPLICATION_CONFIRMATION',
        'INTERVIEW_PACKET_48H',
        'ACCOMMODATION_PASSPORT',
        'JOB_MATCH_DIGEST',
        'DIRECT_OUTREACH',
        'SYSTEM_TEST',
      ],
      default: 'SYSTEM_TEST',
    },
    htmlBody: { type: String, required: true },
    textBody: { type: String, required: true },
    status: {
      type: String,
      enum: ['DELIVERED', 'QUEUED', 'SENT_VIA_SMTP'],
      default: 'DELIVERED',
    },
    metadata: { type: Schema.Types.Mixed, default: {} },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const EmailLog = mongoose.model<IEmailLog>('EmailLog', EmailLogSchema);
