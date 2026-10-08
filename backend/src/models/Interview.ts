import mongoose, { Document, Schema } from 'mongoose';

export interface IInterview extends Document {
  applicationId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  employerId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  title: string;
  scheduledAt: Date;
  durationMinutes: number;
  meetingType: 'VIDEO' | 'PHONE' | 'WRITTEN_TASK' | 'ONSITE';
  meetingUrl: string;
  agenda: string;
  interviewers: Array<{
    name: string;
    role: string;
    bio?: string;
  }>;
  confirmedAccommodations: string[];
  questionsInAdvance: string[];
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSchema = new Schema<IInterview>(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'CandidateProfile',
      required: true,
    },
    employerId: {
      type: Schema.Types.ObjectId,
      ref: 'EmployerProfile',
      required: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    title: { type: String, required: true },
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, default: 45 },
    meetingType: {
      type: String,
      enum: ['VIDEO', 'PHONE', 'WRITTEN_TASK', 'ONSITE'],
      default: 'VIDEO',
    },
    meetingUrl: { type: String, default: 'https://meet.google.com/ndc-interviews' },
    agenda: {
      type: String,
      default: '10 min technical walkthrough, 20 min work sample discussion, 15 min candidate Q&A.',
    },
    interviewers: [
      {
        name: String,
        role: String,
        bio: String,
      },
    ],
    confirmedAccommodations: [{ type: String }],
    questionsInAdvance: [{ type: String }],
    status: {
      type: String,
      enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'],
      default: 'SCHEDULED',
    },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Interview = mongoose.model<IInterview>('Interview', InterviewSchema);
