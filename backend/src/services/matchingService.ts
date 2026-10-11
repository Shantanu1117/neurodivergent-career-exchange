import { ICandidateProfile } from '../models/CandidateProfile.js';
import { IJob } from '../models/Job.js';

export interface CustomMatchingWeights {
  skills: number;
  environment: number;
  strengths: number;
  experience: number;
  accommodations: number;
}

export interface MatchResult {
  overallScore: number;
  breakdown: {
    skillsMatch: number;
    environmentMatch: number;
    strengthsMatch: number;
    experienceMatch: number;
    accommodationsMatch: number;
  };
  matchedSkills: string[];
  missingSkills: string[];
  transferableMatches: string[];
  appliedWeights: CustomMatchingWeights;
  reasons: string[];
}

export class MatchingService {
  public static calculateMatch(
    candidate: ICandidateProfile,
    job: IJob,
    weightOverride?: Partial<CustomMatchingWeights>
  ): MatchResult {
    const reasons: string[] = [];

    // 1. Skills & Transferable Skills Matching
    const candidateSkillsNormalized = (candidate.skills || []).map((s) => s.toLowerCase().trim());
    const transferableSkillsList = (candidate.transferableSkills || []).map((t) => ({
      source: t.sourceExperience,
      mapped: (t.mappedSkill || '').toLowerCase().trim(),
    }));

    const jobRequiredOriginal = job.requiredSkills || [];
    const jobPreferredOriginal = job.preferredSkills || [];

    let matchedRequired = 0;
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];
    const transferableMatches: string[] = [];

    jobRequiredOriginal.forEach((origSkill) => {
      const reqSkill = origSkill.toLowerCase().trim();
      const directMatch = candidateSkillsNormalized.some(
        (cSkill) => cSkill.includes(reqSkill) || reqSkill.includes(cSkill)
      );
      if (directMatch) {
        matchedRequired++;
        matchedSkills.push(origSkill);
      } else {
        const transMatch = transferableSkillsList.find(
          (t) => t.mapped && (t.mapped.includes(reqSkill) || reqSkill.includes(t.mapped))
        );
        if (transMatch) {
          matchedRequired += 0.85;
          matchedSkills.push(origSkill);
          transferableMatches.push(`${origSkill} (via ${transMatch.source})`);
        } else {
          missingSkills.push(origSkill);
        }
      }
    });

    let matchedPreferred = 0;
    jobPreferredOriginal.forEach((origPref) => {
      const prefSkill = origPref.toLowerCase().trim();
      const match =
        candidateSkillsNormalized.some(
          (cSkill) => cSkill.includes(prefSkill) || prefSkill.includes(cSkill)
        ) ||
        transferableSkillsList.some(
          (t) => t.mapped && (t.mapped.includes(prefSkill) || prefSkill.includes(t.mapped))
        );
      if (match) {
        matchedPreferred++;
        if (!matchedSkills.includes(origPref)) {
          matchedSkills.push(origPref);
        }
      }
    });

    let skillsScore = 72; // baseline if applicant has relevant profile
    if (jobRequiredOriginal.length > 0) {
      const reqRatio = matchedRequired / jobRequiredOriginal.length;
      skillsScore = Math.min(100, Math.round(52 + reqRatio * 43 + (matchedPreferred > 0 ? 5 : 0)));
    }
    if (matchedSkills.length > 0) {
      reasons.push(`Skills match: Strong overlap in ${matchedSkills.slice(0, 3).join(', ')}.`);
    }
    if (transferableMatches.length > 0) {
      reasons.push(`Transferable competency recognized: ${transferableMatches[0]}.`);
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

    let strengthsScore = 82;
    if (jobStrengths.length > 0) {
      strengthsScore = Math.min(
        100,
        Math.round(62 + (matchedStrengthsCount / jobStrengths.length) * 38)
      );
    }
    if (matchedStrengthNames.length > 0) {
      reasons.push(
        `Cognitive strengths fit: Your ${matchedStrengthNames.slice(0, 2).join(' and ')} directly fit this role's profile.`
      );
    }

    // 3. Environment, Sensory & Work Mode Matching
    let environmentScore = 85;
    const candMode = candidate.workPreferences?.workMode || 'REMOTE';
    const jobMode = job.workMode || 'REMOTE';

    if (candMode === jobMode || jobMode === 'FLEXIBLE' || candMode === 'FLEXIBLE') {
      environmentScore = 96;
      reasons.push(`Work environment: Excellent match on ${jobMode.toLowerCase()} work mode.`);
    } else if (candMode === 'REMOTE' && jobMode === 'HYBRID') {
      environmentScore = 76;
    } else {
      environmentScore = 66;
    }

    // Sensory refinement
    const candNoise = candidate.sensoryProfile?.noiseTolerance || 'LOW';
    const jobNoise = job.sensoryEnvironment?.noiseLevel || 'QUIET';
    if (candNoise === 'LOW' && jobNoise === 'QUIET') {
      environmentScore = Math.min(100, environmentScore + 4);
      reasons.push('Sensory alignment: Quiet/low-interruption environment matches your sensory profile.');
    } else if (candNoise === 'LOW' && jobNoise === 'DYNAMIC') {
      environmentScore = Math.max(55, environmentScore - 10);
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
    const candAccommodations = [
      ...(candidate.accommodations || []),
      ...(candidate.accommodationPlanner?.interviewStage || []),
      ...(candidate.accommodationPlanner?.dayOneOnboarding || []),
    ].map((a) => a.toLowerCase().trim());
    const jobAccommodations = (job.accommodationsOffered || []).map((a) => a.toLowerCase().trim());

    const overlappingAccommodations: string[] = [];
    candAccommodations.forEach((cAcc) => {
      if (
        cAcc &&
        jobAccommodations.some((jAcc) => jAcc.includes(cAcc) || cAcc.includes(jAcc)) &&
        !overlappingAccommodations.includes(cAcc)
      ) {
        overlappingAccommodations.push(cAcc);
      }
    });

    if (overlappingAccommodations.length > 0) {
      accommodationsScore = Math.min(100, 82 + overlappingAccommodations.length * 6);
      reasons.push(
        `Workplace support: Employer actively offers ${overlappingAccommodations.length} of your preferred adjustments.`
      );
    } else if (jobAccommodations.length > 0) {
      accommodationsScore = 88;
      reasons.push(`Inclusive workplace: Employer provides dedicated neuro-inclusive adjustments.`);
    }

    // 6. Candidate-Controlled Weighted Overall Calculation
    const rawWeights: CustomMatchingWeights = {
      skills: weightOverride?.skills ?? candidate.matchingWeights?.skills ?? 30,
      environment: weightOverride?.environment ?? candidate.matchingWeights?.environment ?? 25,
      strengths: weightOverride?.strengths ?? candidate.matchingWeights?.strengths ?? 20,
      experience: weightOverride?.experience ?? candidate.matchingWeights?.experience ?? 15,
      accommodations: weightOverride?.accommodations ?? candidate.matchingWeights?.accommodations ?? 10,
    };

    const totalWeight =
      rawWeights.skills +
      rawWeights.environment +
      rawWeights.strengths +
      rawWeights.experience +
      rawWeights.accommodations || 100;

    const normalizedWeights: CustomMatchingWeights = {
      skills: Math.round((rawWeights.skills / totalWeight) * 100),
      environment: Math.round((rawWeights.environment / totalWeight) * 100),
      strengths: Math.round((rawWeights.strengths / totalWeight) * 100),
      experience: Math.round((rawWeights.experience / totalWeight) * 100),
      accommodations: Math.round((rawWeights.accommodations / totalWeight) * 100),
    };

    const weightedSum =
      (skillsScore * rawWeights.skills +
        environmentScore * rawWeights.environment +
        strengthsScore * rawWeights.strengths +
        experienceScore * rawWeights.experience +
        accommodationsScore * rawWeights.accommodations) /
      totalWeight;

    const overallScore = Math.min(99, Math.max(50, Math.round(weightedSum)));

    return {
      overallScore,
      breakdown: {
        skillsMatch: skillsScore,
        environmentMatch: environmentScore,
        strengthsMatch: strengthsScore,
        experienceMatch: experienceScore,
        accommodationsMatch: accommodationsScore,
      },
      matchedSkills,
      missingSkills,
      transferableMatches,
      appliedWeights: normalizedWeights,
      reasons: reasons.slice(0, 4),
    };
  }
}
