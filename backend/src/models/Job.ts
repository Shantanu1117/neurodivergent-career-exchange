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
    responsibilities: [{ type: String }],
    requirements: [{ type: String }],
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
