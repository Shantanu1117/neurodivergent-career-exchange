export type UserRole = 'CANDIDATE' | 'EMPLOYER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive?: boolean;
}

export interface CandidateProfile {
  _id?: string;
  userId?: string;
  fullName: string;
  headline: string;
  location: string;
  phone?: string;
  avatar?: string;
  bio?: string;
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
  };
  matchingWeights?: {
    skills: number;
    environment: number;
    strengths: number;
    experience: number;
    accommodations: number;
  };
  accommodationPlanner?: {
    applicationStage: string[];
    interviewStage: string[];
    onboardingStage: string[];
    workplaceStage: string[];
    privateNotes?: string;
  };
  disclosurePreferences?: {
    shareAtStage: 'APPLICATION' | 'INTERVIEW' | 'OFFER' | 'POST_HIRE' | 'NEVER';
    shareSensoryProfile: boolean;
    shareStrengthsMatrix: boolean;
    shareAdjustmentPassport: boolean;
  };
  transferableSkills?: Array<{
    context: string;
    extractedSkill: string;
    evidenceNote?: string;
  }>;
  learningMilestones?: string[];
  onboardingCompleted?: boolean;
  education?: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startYear?: number;
    endYear?: number;
  }>;
  experience?: Array<{
    title: string;
    company: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    description?: string;
  }>;
  assessmentResults?: {
    qaTesting: number;
    cybersecurity: number;
    dataAudit: number;
    softwareDev: number;
    uiUx: number;
    researchDoc: number;
    primaryMatch: string;
    completedAt?: string;
  };
  profileCompletion: number;
}

export interface EmployerProfile {
  _id?: string;
  userId?: string;
  companyName: string;
  logo?: string;
  website?: string;
  industry: string;
  companySize: string;
  location: string;
  about: string;
  accommodationsOffered: string[];
  verified: boolean;
  cultureHighlights: string[];
}

export type JobCategory =
  | 'SOFTWARE_TESTING_QA'
  | 'CYBERSECURITY'
  | 'DATA_ANALYSIS_AUDIT'
  | 'SOFTWARE_DEVELOPMENT'
  | 'UI_UX_DESIGN'
  | 'RESEARCH_DOCUMENTATION'
  | 'OTHER';

export interface Job {
  _id: string;
  employerId: EmployerProfile;
  title: string;
  category: JobCategory;
  description: string;
  plainLanguageSummary?: string;
  responsibilities: string[];
  requirements: string[];
  essentialRequirements?: string[];
  preferredRequirements?: string[];
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
  workSampleTask?: {
    enabled: boolean;
    title: string;
    instructions: string;
    estimatedMinutes: number;
  };
  sensoryEnvironment?: {
    noiseLevel: 'QUIET' | 'MODERATE' | 'DYNAMIC';
    meetingLoad: 'MINIMAL' | 'MODERATE' | 'HIGH';
    communicationStyle: 'ASYNC_FIRST' | 'BALANCED' | 'SYNC_HEAVY';
    teamAutonomy: 'HIGH_STRUCTURE' | 'BALANCED' | 'SELF_DIRECTED';
  };
  inclusivityAnalysis?: {
    score: number;
    warnings: string[];
    positives: string[];
  };
  status: 'PUBLISHED' | 'DRAFT' | 'CLOSED';
  deadline?: string;
  applicantCount?: number;
  createdAt: string;
  matchScore?: number;
  matchBreakdown?: {
    skillsMatch: number;
    environmentMatch: number;
    strengthsMatch: number;
    experienceMatch: number;
    accommodationsMatch: number;
  };
  matchReasons?: string[];
  matchedSkills?: string[];
  missingSkills?: string[];
  transferableMatches?: string[];
  isSaved?: boolean;
  hasApplied?: boolean;
  userApplication?: Application;
}

export type ApplicationStatus =
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'ASSESSMENT'
  | 'OFFER'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface Application {
  _id: string;
  jobId: Job;
  candidateId: CandidateProfile;
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
  workSampleSubmission?: {
    taskPrompt?: string;
    responseText?: string;
    artifactUrl?: string;
    submittedAt?: string;
  };
  preferredInterviewFormat?: 'VIDEO' | 'WRITTEN_ASYNC' | 'TAKE_HOME_TASK' | 'PHONE' | 'FLEXIBLE';
  feedbackRequested?: boolean;
  structuredFeedback?: {
    strengthsHighlighted: string[];
    growthAreas: string[];
    encouragementNote: string;
    sharedAt: string;
  };
  accommodationChecklist?: Array<{
    item: string;
    status: 'PENDING' | 'APPROVED' | 'COMPLETED';
    updatedAt?: string;
  }>;
  employerNotes?: Array<{
    authorName: string;
    note: string;
    createdAt: string;
  }>;
  timeline: Array<{
    status: ApplicationStatus;
    note?: string;
    changedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Interview {
  _id: string;
  applicationId: string;
  candidateId: CandidateProfile;
  employerId: EmployerProfile;
  jobId: Job;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  timeZone?: string;
  sensoryBreakMinutes?: number;
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
  evaluationRubric?: {
    technicalExecution: number;
    problemSolvingClarity: number;
    asyncCommunication: number;
    taskCompletionQuality: number;
    evaluatorSummary: string;
    completedAt?: string;
  };
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  notes?: string;
}

export interface Conversation {
  _id: string;
  participants: User[];
  jobId?: { _id: string; title: string };
  lastMessageText: string;
  lastMessageAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  linkUrl: string;
  read: boolean;
  createdAt: string;
}

export interface ResourceItem {
  _id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedTime: string;
  contentMarkdown: string;
  skillsGained: string[];
  featured: boolean;
}
