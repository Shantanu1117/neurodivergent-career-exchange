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
  isSaved?: boolean;
  hasApplied?: boolean;
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
