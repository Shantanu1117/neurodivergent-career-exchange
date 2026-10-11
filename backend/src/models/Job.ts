import mongoose, { Document, Schema } from 'mongoose';

export type JobCategory =
  | 'SOFTWARE_TESTING_QA'
  | 'CYBERSECURITY'
  | 'DATA_ANALYSIS_AUDIT'
  | 'SOFTWARE_DEVELOPMENT'
  | 'UI_UX_DESIGN'
  | 'RESEARCH_DOCUMENTATION'
  | 'OTHER';

export interface IJob extends Document {
  employerId: mongoose.Types.ObjectId;
  title: string;
  category: JobCategory;
  description: string;
  responsibilities: string[];
  requirements: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  matchedStrengths: string[];
  workMode: 'REMOTE' | 'HYBRID' | 'ONSITE' | 'FLEXIBLE';
  location: string;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  salaryPeriod: 'YEAR' | 'MONTH' | 'HOUR';
  experienceLevel: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD';
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT';
  accommodationsOffered: string[];
  plainLanguageSummary?: string;
  essentialRequirements?: string[];
  preferredRequirements?: string[];
  workSampleTask?: {
    enabled: boolean;
    title: string;
    instructions: string;
    estimatedMinutes: number;
  };
  sensoryEnvironment?: {
    noiseLevel: 'QUIET' | 'MODERATE' | 'DYNAMIC';
    lightingType: string;
    meetingLoad: 'MINIMAL' | 'MODERATE' | 'FREQUENT';
    communicationStyle: string;
  };
  inclusivityAnalysis?: {
    score: number;
    suggestions: string[];
  };
  interviewProcess: Array<{
    stageNumber: number;
    title: string;
    description: string;
    duration: string;
    format: string;
  }>;
  status: 'PUBLISHED' | 'DRAFT' | 'CLOSED';
  deadline?: Date;
  applicantCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    employerId: {
      type: Schema.Types.ObjectId,
      ref: 'EmployerProfile',
      required: true,
    },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: [
        'SOFTWARE_TESTING_QA',
        'CYBERSECURITY',
        'DATA_ANALYSIS_AUDIT',
        'SOFTWARE_DEVELOPMENT',
        'UI_UX_DESIGN',
        'RESEARCH_DOCUMENTATION',
        'OTHER',
      ],
      required: true,
    },
    description: { type: String, required: true },
    plainLanguageSummary: { type: String, default: '' },
    responsibilities: [{ type: String }],
    requirements: [{ type: String }],
    essentialRequirements: [{ type: String }],
    preferredRequirements: [{ type: String }],
    requiredSkills: [{ type: String }],
    preferredSkills: [{ type: String }],
    matchedStrengths: [{ type: String }],
    workMode: {
      type: String,
      enum: ['REMOTE', 'HYBRID', 'ONSITE', 'FLEXIBLE'],
      default: 'REMOTE',
    },
    location: { type: String, default: 'Remote' },
    salaryMin: { type: Number, default: 0 },
    salaryMax: { type: Number, default: 0 },
    salaryCurrency: { type: String, default: 'USD' },
    salaryPeriod: { type: String, enum: ['YEAR', 'MONTH', 'HOUR'], default: 'YEAR' },
    experienceLevel: {
      type: String,
      enum: ['ENTRY', 'MID', 'SENIOR', 'LEAD'],
      default: 'MID',
    },
    employmentType: {
      type: String,
      enum: ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT'],
      default: 'FULL_TIME',
    },
    accommodationsOffered: [{ type: String }],
    workSampleTask: {
      enabled: { type: Boolean, default: true },
      title: {
        type: String,
        default: 'Practical Role Scenario (Optional Cover-Letter Alternative)',
      },
      instructions: {
        type: String,
        default: 'Instead of a traditional cover letter, you may describe how you would approach a realistic task in this role (e.g., investigating a bug, auditing a dataset, or structuring a component). Untimed and optional.',
      },
      estimatedMinutes: { type: Number, default: 20 },
    },
    sensoryEnvironment: {
      noiseLevel: {
        type: String,
        enum: ['QUIET', 'MODERATE', 'DYNAMIC'],
        default: 'QUIET',
      },
      lightingType: { type: String, default: 'Remote / Adjustable Natural Lighting' },
      meetingLoad: {
        type: String,
        enum: ['MINIMAL', 'MODERATE', 'FREQUENT'],
        default: 'MINIMAL',
      },
      communicationStyle: { type: String, default: 'Async-first written documentation + scheduled syncs with advance agenda' },
    },
    inclusivityAnalysis: {
      score: { type: Number, default: 94 },
      suggestions: [{ type: String }],
    },
    interviewProcess: [
      {
        stageNumber: Number,
        title: String,
        description: String,
        duration: String,
        format: String,
      },
    ],
    status: {
      type: String,
      enum: ['PUBLISHED', 'DRAFT', 'CLOSED'],
      default: 'PUBLISHED',
    },
    deadline: { type: Date },
    applicantCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes for fast searching & filtering
JobSchema.index({ title: 'text', description: 'text', requiredSkills: 'text' });
JobSchema.index({ category: 1, workMode: 1, status: 1 });

export const Job = mongoose.model<IJob>('Job', JobSchema);
