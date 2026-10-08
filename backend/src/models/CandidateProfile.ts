import mongoose, { Document, Schema } from 'mongoose';

export interface ICandidateProfile extends Document {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  headline: string;
  location: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startYear?: number;
    endYear?: number;
  }>;
  experience: Array<{
    title: string;
    company: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    description?: string;
  }>;
  skills: string[];
  strengths: string[];
  careerInterests: string[];
  workPreferences: {
    workMode: 'REMOTE' | 'HYBRID' | 'ONSITE' | 'FLEXIBLE';
    employmentType: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT';
    preferredHours?: string;
    teamSize?: 'SMALL' | 'MEDIUM' | 'LARGE' | 'NO_PREFERENCE';
    environmentStructure: 'STRUCTURED' | 'FLEXIBLE' | 'HYBRID';
    soundPreference: 'QUIET' | 'MODERATE' | 'DYNAMIC';
  };
  communicationPreferences: {
    primaryModality: 'WRITTEN' | 'VERBAL' | 'BALANCED';
    meetingFrequency: 'MINIMAL' | 'MODERATE' | 'STANDARD';
    meetingStyle?: string;
  };
  accommodations: string[];
  howIWorkBest: string;
  privacySettings: {
    shareAccommodationsPublicly: boolean;
    isSearchableByRecruiters: boolean;
  };
  assessmentResults?: {
    qaTesting: number;
    cybersecurity: number;
    dataAudit: number;
    softwareDev: number;
    uiUx: number;
    researchDoc: number;
    primaryMatch: string;
    completedAt: Date;
  };
  profileCompletion: number;
  createdAt: Date;
  updatedAt: Date;
}

const CandidateProfileSchema = new Schema<ICandidateProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    fullName: { type: String, required: true },
    headline: { type: String, default: 'Candidate exploring neuro-inclusive opportunities' },
    location: { type: String, default: 'Remote' },
    phone: { type: String },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    education: [
      {
        institution: String,
        degree: String,
        fieldOfStudy: String,
        startYear: Number,
        endYear: Number,
      },
    ],
    experience: [
      {
        title: String,
        company: String,
        location: String,
        startDate: String,
        endDate: String,
        current: Boolean,
        description: String,
      },
    ],
    skills: [{ type: String }],
    strengths: [{ type: String }],
    careerInterests: [{ type: String }],
    workPreferences: {
      workMode: {
        type: String,
        enum: ['REMOTE', 'HYBRID', 'ONSITE', 'FLEXIBLE'],
        default: 'REMOTE',
      },
      employmentType: {
        type: String,
        enum: ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT'],
        default: 'FULL_TIME',
      },
      preferredHours: { type: String, default: 'Flexible Daytime' },
      teamSize: {
        type: String,
        enum: ['SMALL', 'MEDIUM', 'LARGE', 'NO_PREFERENCE'],
        default: 'SMALL',
      },
      environmentStructure: {
        type: String,
        enum: ['STRUCTURED', 'FLEXIBLE', 'HYBRID'],
        default: 'STRUCTURED',
      },
      soundPreference: {
        type: String,
        enum: ['QUIET', 'MODERATE', 'DYNAMIC'],
        default: 'QUIET',
      },
    },
    communicationPreferences: {
      primaryModality: {
        type: String,
        enum: ['WRITTEN', 'VERBAL', 'BALANCED'],
        default: 'WRITTEN',
      },
      meetingFrequency: {
        type: String,
        enum: ['MINIMAL', 'MODERATE', 'STANDARD'],
        default: 'MINIMAL',
      },
      meetingStyle: { type: String, default: 'Advance agenda + written recap preferred' },
    },
    accommodations: [{ type: String }],
    howIWorkBest: {
      type: String,
      default: 'I perform best with clear written task expectations, uninterrupted focus periods, and asynchronous communications.',
    },
    privacySettings: {
      shareAccommodationsPublicly: { type: Boolean, default: true },
      isSearchableByRecruiters: { type: Boolean, default: true },
    },
    assessmentResults: {
      qaTesting: { type: Number, default: 0 },
      cybersecurity: { type: Number, default: 0 },
      dataAudit: { type: Number, default: 0 },
      softwareDev: { type: Number, default: 0 },
      uiUx: { type: Number, default: 0 },
      researchDoc: { type: Number, default: 0 },
      primaryMatch: { type: String, default: '' },
      completedAt: { type: Date },
    },
    profileCompletion: { type: Number, default: 45 },
  },
  { timestamps: true }
);

export const CandidateProfile = mongoose.model<ICandidateProfile>('CandidateProfile', CandidateProfileSchema);
