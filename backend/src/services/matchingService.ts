import { ICandidateProfile } from '../models/CandidateProfile.js';
import { IJob } from '../models/Job.js';

export interface MatchResult {
  overallScore: number;
  breakdown: {
    skillsMatch: number;
    environmentMatch: number;
    strengthsMatch: number;
    experienceMatch: number;
    accommodationsMatch: number;
  };
  reasons: string[];
}

export class MatchingService {
  public static calculateMatch(candidate: ICandidateProfile, job: IJob): MatchResult {
    const reasons: string[] = [];

    // 1. Skills Matching
    const candidateSkillsNormalized = (candidate.skills || []).map((s) => s.toLowerCase().trim());
    const jobRequiredSkills = (job.requiredSkills || []).map((s) => s.toLowerCase().trim());
    const jobPreferredSkills = (job.preferredSkills || []).map((s) => s.toLowerCase().trim());

    let matchedRequired = 0;
    const matchedSkillsNames: string[] = [];
    jobRequiredSkills.forEach((reqSkill) => {
      const match = candidateSkillsNormalized.some(
        (cSkill) => cSkill.includes(reqSkill) || reqSkill.includes(cSkill)
      );
      if (match) {
        matchedRequired++;
        matchedSkillsNames.push(reqSkill);
      }
    });

    let matchedPreferred = 0;
    jobPreferredSkills.forEach((prefSkill) => {
      const match = candidateSkillsNormalized.some(
        (cSkill) => cSkill.includes(prefSkill) || prefSkill.includes(cSkill)
      );
      if (match) {
        matchedPreferred++;
      }
    });

    let skillsScore = 70; // baseline if applicant has relevant profile
    if (jobRequiredSkills.length > 0) {
      const reqRatio = matchedRequired / jobRequiredSkills.length;
      skillsScore = Math.min(100, Math.round(50 + reqRatio * 45 + (matchedPreferred > 0 ? 5 : 0)));
    }
    if (matchedSkillsNames.length > 0) {
      reasons.push(`Skills match: Strong overlap in ${matchedSkillsNames.slice(0, 3).join(', ')}.`);
    }

    // 2. Strengths Matching
    const candidateStrengths = (candidate.strengths || []).map((s) => s.toLowerCase().trim());
    const jobStrengths = (job.matchedStrengths || []).map((s) => s.toLowerCase().trim());

    let matchedStrengthsCount = 0;
    const matchedStrengthNames: string[] = [];
    jobStrengths.forEach((jStr) => {
      const match = candidateStrengths.some((cStr) => cStr.includes(jStr) || jStr.includes(cStr));
      if (match) {
        matchedStrengthsCount++;
        matchedStrengthNames.push(jStr);
      }
    });

    let strengthsScore = 80;
    if (jobStrengths.length > 0) {
      strengthsScore = Math.min(
        100,
        Math.round(60 + (matchedStrengthsCount / jobStrengths.length) * 40)
      );
    }
    if (matchedStrengthNames.length > 0) {
      reasons.push(`Cognitive strengths fit: Your ${matchedStrengthNames.slice(0, 2).join(' and ')} directly fit this role's profile.`);
    }

    // 3. Environment & Work Mode Matching
    let environmentScore = 85;
    const candMode = candidate.workPreferences?.workMode || 'REMOTE';
    const jobMode = job.workMode || 'REMOTE';

    if (candMode === jobMode || jobMode === 'FLEXIBLE' || candMode === 'FLEXIBLE') {
      environmentScore = 98;
      reasons.push(`Work environment: Excellent match on ${jobMode.toLowerCase()} work mode.`);
    } else if (candMode === 'REMOTE' && jobMode === 'HYBRID') {
      environmentScore = 75;
    } else {
      environmentScore = 65;
    }

    // 4. Experience Level
    let experienceScore = 85;
    const expCount = (candidate.experience || []).length;
    if (job.experienceLevel === 'ENTRY') {
      experienceScore = 95;
    } else if (job.experienceLevel === 'MID' && expCount >= 1) {
      experienceScore = 90;
    } else if (job.experienceLevel === 'SENIOR' && expCount >= 3) {
      experienceScore = 92;
    } else {
      experienceScore = 78;
    }

    // 5. Accommodations Matching
    let accommodationsScore = 85;
    const candAccommodations = (candidate.accommodations || []).map((a) => a.toLowerCase().trim());
    const jobAccommodations = (job.accommodationsOffered || []).map((a) => a.toLowerCase().trim());

    const overlappingAccommodations: string[] = [];
    candAccommodations.forEach((cAcc) => {
      if (jobAccommodations.some((jAcc) => jAcc.includes(cAcc) || cAcc.includes(jAcc))) {
        overlappingAccommodations.push(cAcc);
      }
    });

    if (overlappingAccommodations.length > 0) {
      accommodationsScore = Math.min(100, 80 + overlappingAccommodations.length * 7);
      reasons.push(`Workplace support: Employer actively offers ${overlappingAccommodations.length} of your requested accommodations.`);
    } else if (jobAccommodations.length > 0) {
      accommodationsScore = 88;
      reasons.push(`Inclusive workplace: Employer provides dedicated neuro-inclusive adjustments.`);
    }

    // Weighted Overall
    const overallScore = Math.min(
      99,
      Math.max(
        50,
        Math.round(
          skillsScore * 0.30 +
            environmentScore * 0.25 +
            strengthsScore * 0.20 +
            experienceScore * 0.15 +
            accommodationsScore * 0.10
        )
      )
    );

    return {
      overallScore,
      breakdown: {
        skillsMatch: skillsScore,
        environmentMatch: environmentScore,
        strengthsMatch: strengthsScore,
        experienceMatch: experienceScore,
        accommodationsMatch: accommodationsScore,
      },
      reasons: reasons.slice(0, 4),
    };
  }
}
