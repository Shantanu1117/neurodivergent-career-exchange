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
  sensoryProfile?: {
    auditorySensitivity?: 'LOW' | 'MODERATE' | 'HIGH';
    visualStimulationPreference?: 'MINIMAL' | 'BALANCED' | 'HIGH';
    socialConcurrencyTolerance?: 'ONE_ON_ONE' | 'SMALL_GROUP' | 'FLEXIBLE';
    contextSwitchingStyle?: 'DEEP_FOCUS_BLOCKS' | 'INTERLEAVED' | 'FLEXIBLE';
    predictabilityNeeds?: 'HIGH_ROUTINE' | 'MODERATE' | 'ADAPTIVE';
    noiseTolerance?: 'LOW' | 'MODERATE' | 'HIGH';
    lightingPreference?: 'NATURAL_DIM' | 'MODERATE' | 'ANY';
    interruptionTolerance?: 'MINIMAL' | 'MODERATE' | 'FLEXIBLE';
    multitaskingStyle?: 'SINGLE_TASK_FOCUS' | 'BALANCED' | 'CONTEXT_SWITCHING';
    maxDailyMeetings?: number;
    sensoryTriggers?: string[];
  };
  matchingWeights?: {
    skills: number;
    environment: number;
    strengths: number;
    experience: number;
    accommodations: number;
  };
  accommodationPlanner?: {
    applicationStage?: string[];
    interviewStage: string[];
    onboardingStage?: string[];
    workplaceStage?: string[];
    offerStage?: string[];
    dayOneOnboarding?: string[];
    privateNotes: string;
  };
  disclosurePreferences?: {
    shareAtStage?: 'APPLICATION' | 'INTERVIEW' | 'OFFER' | 'POST_HIRE' | 'NEVER';
    shareSensoryProfile?: boolean;
    shareStrengthsMatrix?: boolean;
    shareAdjustmentPassport?: boolean;
    accommodationsStage?: 'AT_APPLICATION' | 'AT_INTERVIEW' | 'POST_OFFER' | 'PRIVATE';
    sensoryProfileStage?: 'AT_APPLICATION' | 'AT_INTERVIEW' | 'POST_OFFER' | 'PRIVATE';
    shareAssessmentScores?: boolean;
  };
  transferableSkills?: Array<{
    context?: string;
    extractedSkill?: string;
    evidenceNote?: string;
    sourceExperience?: string;
    mappedSkill?: string;
    category?: string;
  }>;
  learningMilestones?: string[];
  onboardingCompleted?: boolean;
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
    sensoryProfile: {
      auditorySensitivity: { type: String, default: 'MODERATE' },
      visualStimulationPreference: { type: String, default: 'MINIMAL' },
      socialConcurrencyTolerance: { type: String, default: 'ONE_ON_ONE' },
      contextSwitchingStyle: { type: String, default: 'DEEP_FOCUS_BLOCKS' },
      predictabilityNeeds: { type: String, default: 'HIGH_ROUTINE' },
      noiseTolerance: {
        type: String,
        enum: ['LOW', 'MODERATE', 'HIGH'],
        default: 'LOW',
      },
      lightingPreference: {
        type: String,
        enum: ['NATURAL_DIM', 'MODERATE', 'ANY'],
        default: 'NATURAL_DIM',
      },
      interruptionTolerance: {
        type: String,
        enum: ['MINIMAL', 'MODERATE', 'FLEXIBLE'],
        default: 'MINIMAL',
      },
      multitaskingStyle: {
        type: String,
        enum: ['SINGLE_TASK_FOCUS', 'BALANCED', 'CONTEXT_SWITCHING'],
        default: 'SINGLE_TASK_FOCUS',
      },
      maxDailyMeetings: { type: Number, default: 2 },
      sensoryTriggers: {
        type: [String],
        default: ['Unannounced video calls', 'High background chatter'],
      },
    },
    matchingWeights: {
      skills: { type: Number, default: 35 },
      environment: { type: Number, default: 25 },
      strengths: { type: Number, default: 20 },
      experience: { type: Number, default: 10 },
      accommodations: { type: Number, default: 10 },
    },
    accommodationPlanner: {
      applicationStage: {
        type: [String],
        default: ['Plain-language role expectations', 'Work-sample option instead of cover letter'],
      },
      interviewStage: {
        type: [String],
        default: ['Interview questions shared 24h in advance', 'Camera-optional video interview'],
      },
      onboardingStage: {
        type: [String],
        default: ['Written onboarding documentation', 'Dedicated onboarding buddy'],
      },
      workplaceStage: {
        type: [String],
        default: ['Quiet focus blocks (no meetings 1pm-5pm)', 'Written task expectations & checklists'],
      },
      offerStage: {
        type: [String],
        default: ['Written offer breakdown with clear role expectations', 'Flexible start-time discussion'],
      },
      dayOneOnboarding: {
        type: [String],
        default: ['Written onboarding documentation', 'Quiet workspace or remote setup', 'Dedicated onboarding buddy'],
      },
      privateNotes: {
        type: String,
        default: 'Personal notes (never shared with employers): I do my deepest debugging work between 9 AM and 1 PM when notifications are snoozed.',
      },
    },
    disclosurePreferences: {
      shareAtStage: {
        type: String,
        default: 'INTERVIEW',
      },
      shareSensoryProfile: { type: Boolean, default: true },
      shareStrengthsMatrix: { type: Boolean, default: true },
      shareAdjustmentPassport: { type: Boolean, default: true },
      accommodationsStage: {
        type: String,
        enum: ['AT_APPLICATION', 'AT_INTERVIEW', 'POST_OFFER', 'PRIVATE'],
        default: 'AT_INTERVIEW',
      },
      sensoryProfileStage: {
        type: String,
        enum: ['AT_APPLICATION', 'AT_INTERVIEW', 'POST_OFFER', 'PRIVATE'],
        default: 'AT_APPLICATION',
      },
      shareAssessmentScores: { type: Boolean, default: true },
    },
    transferableSkills: [
      {
        context: { type: String },
        extractedSkill: { type: String },
        evidenceNote: { type: String },
        sourceExperience: { type: String },
        mappedSkill: { type: String },
        category: { type: String },
      },
    ],
    learningMilestones: [{ type: String }],
    onboardingCompleted: { type: Boolean, default: false },
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
