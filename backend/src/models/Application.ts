import mongoose, { Document, Schema } from 'mongoose';

export type ApplicationStatus =
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'ASSESSMENT'
  | 'OFFER'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface IApplication extends Document {
  jobId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  status: ApplicationStatus;
  matchScore: number;
  matchBreakdown: {
    skillsMatch: number;
    environmentMatch: number;
    strengthsMatch: number;
    experienceMatch: number;
    accommodationsMatch: number;
  };
  requestedAccommodations: string[];
  candidateNote?: string;
  submissionType?: 'STANDARD' | 'WORK_SAMPLE' | 'ASYNC_WALKTHROUGH';
  workSampleSubmission?: any;
  preferredInterviewFormat?: string;
  feedbackRequested?: boolean;
  structuredFeedback?: {
    strengthsObserved?: string;
    growthSuggestions?: string;
    recommendedSkills?: string[];
    strengthsHighlighted?: string[];
    growthAreas?: string[];
    encouragementNote?: string;
    sharedAt: Date;
  };
  accommodationChecklist?: Array<{
    item: string;
    completed?: boolean;
    status?: 'PENDING' | 'APPROVED' | 'COMPLETED';
    updatedAt?: Date;
  }>;
  employerNotes: Array<{
    authorName: string;
    note: string;
    createdAt: Date;
  }>;
  timeline: Array<{
    status: ApplicationStatus;
    note?: string;
    changedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'CandidateProfile',
      required: true,
    },
    status: {
      type: String,
      enum: [
        'APPLIED',
        'UNDER_REVIEW',
        'SHORTLISTED',
        'INTERVIEW',
        'ASSESSMENT',
        'OFFER',
        'REJECTED',
        'WITHDRAWN',
      ],
      default: 'APPLIED',
    },
    matchScore: { type: Number, default: 85 },
    matchBreakdown: {
      skillsMatch: { type: Number, default: 85 },
      environmentMatch: { type: Number, default: 90 },
      strengthsMatch: { type: Number, default: 90 },
      experienceMatch: { type: Number, default: 80 },
      accommodationsMatch: { type: Number, default: 95 },
    },
    requestedAccommodations: [{ type: String }],
    candidateNote: { type: String, default: '' },
    submissionType: {
      type: String,
      enum: ['STANDARD', 'WORK_SAMPLE', 'ASYNC_WALKTHROUGH'],
      default: 'STANDARD',
    },
    workSampleSubmission: { type: Schema.Types.Mixed, default: '' },
    preferredInterviewFormat: { type: String, default: 'Written Async or Camera-Optional Video' },
    feedbackRequested: { type: Boolean, default: false },
    structuredFeedback: {
      strengthsObserved: { type: String, default: '' },
      growthSuggestions: { type: String, default: '' },
      recommendedSkills: [{ type: String }],
      strengthsHighlighted: [{ type: String }],
      growthAreas: [{ type: String }],
      encouragementNote: { type: String, default: '' },
      sharedAt: { type: Date },
    },
    accommodationChecklist: [
      {
        item: { type: String },
        completed: { type: Boolean, default: false },
        status: { type: String, default: 'PENDING' },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    employerNotes: [
      {
        authorName: String,
        note: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    timeline: [
      {
        status: { type: String },
        note: String,
        changedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

ApplicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

export const Application = mongoose.model<IApplication>('Application', ApplicationSchema);
