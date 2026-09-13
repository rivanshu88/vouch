import { CandidateMatch, CandidateProfile, CandidateSkill, SkillLevel, Team } from "@/types";

const LEVEL_WEIGHTS: Record<SkillLevel, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

export interface TeamSkillCoverageItem {
  skillId: string;
  skillName: string;
  category: string;
  coveragePercentage: number;
  coveredBy: string[];
  status: "covered" | "partial" | "gap";
}

/**
 * Calculates team skill coverage across requirements
 */
export function calculateTeamSkillCoverage(team: Team): TeamSkillCoverageItem[] {
  const requirements = team.requirements || [];
  const members = team.members || [];

  return requirements.map((req) => {
    const matchingMembers: string[] = [];
    let maxLevel = 0;

    members.forEach((member) => {
      const candidateSkill = member.skills?.find((s) => s.skillId === req.skillId);
      if (candidateSkill) {
        const levelWeight = LEVEL_WEIGHTS[candidateSkill.declaredLevel] || 1;
        const verificationMultiplier = candidateSkill.verificationStatus === "verified" ? 1.25 : 0.8;
        const weightedScore = levelWeight * verificationMultiplier;

        if (weightedScore > maxLevel) {
          maxLevel = weightedScore;
        }
        matchingMembers.push(
          `${member.candidateName} (${candidateSkill.verificationStatus === "verified" ? "Verified" : "Declared"})`
        );
      }
    });

    const requiredLevelWeight = LEVEL_WEIGHTS[req.minimumLevel] || 2;
    const coveragePercentage = Math.min(
      100,
      Math.round((maxLevel / requiredLevelWeight) * 100)
    );

    let status: TeamSkillCoverageItem["status"] = "gap";
    if (coveragePercentage >= 90) status = "covered";
    else if (coveragePercentage > 0) status = "partial";

    return {
      skillId: req.skillId,
      skillName: req.skillName || req.skillId,
      category: "Technical",
      coveragePercentage,
      coveredBy: matchingMembers,
      status,
    };
  });
}

/**
 * Evaluates candidate compatibility for a team with explainable factors
 */
export function matchCandidateToTeam(
  candidate: CandidateProfile & { skills: CandidateSkill[] },
  team: Team
): CandidateMatch {
  const requirements = team.requirements || [];
  const candidateSkills = candidate.skills || [];
  const teamCoverage = calculateTeamSkillCoverage(team);
  const gaps = teamCoverage.filter((c) => c.status === "gap" || c.status === "partial").map((c) => c.skillId);

  const matchedSkills: CandidateMatch["matchedSkills"] = [];
  const missingRequirements: string[] = [];
  const explanation: string[] = [];
  const fillsTeamGaps: string[] = [];

  let requirementScoreTotal = 0;
  const maxPossibleScore = Math.max(requirements.length * 30, 30);

  requirements.forEach((req) => {
    const candidateSkill = candidateSkills.find((s) => s.skillId === req.skillId);

    if (candidateSkill) {
      const candidateLvlVal = LEVEL_WEIGHTS[candidateSkill.declaredLevel] || 1;
      const requiredLvlVal = LEVEL_WEIGHTS[req.minimumLevel] || 2;
      const isVerified = candidateSkill.verificationStatus === "verified";

      let points = 0;
      if (candidateLvlVal >= requiredLvlVal) {
        points += 20;
      } else {
        points += 10;
      }

      // Verification bonus (verified skills receive higher weight)
      if (isVerified) {
        points += 10;
        explanation.push(
          `✓ Verified ${candidateSkill.skillName || req.skillName} (${candidateSkill.verificationScore || 85}%) matches required ${req.minimumLevel} level`
        );
      } else {
        explanation.push(
          `○ Declared ${candidateSkill.skillName || req.skillName} (${candidateSkill.declaredLevel}) matches requirement`
        );
      }

      // Check if this candidate fills a missing team gap
      if (gaps.includes(req.skillId)) {
        points += 5;
        fillsTeamGaps.push(candidateSkill.skillName || req.skillName || req.skillId);
        explanation.push(
          `★ Directly fills team's missing ${candidateSkill.skillName || req.skillName} capability gap`
        );
      }

      requirementScoreTotal += points;

      matchedSkills.push({
        skillId: req.skillId,
        skillName: candidateSkill.skillName || req.skillName || req.skillId,
        verified: isVerified,
        level: candidateSkill.declaredLevel,
        score: candidateSkill.verificationScore,
      });
    } else {
      if (req.required) {
        missingRequirements.push(req.skillName || req.skillId);
      }
    }
  });

  if (missingRequirements.length > 0) {
    explanation.push(`⚠ Missing ${missingRequirements.length} required skill(s): ${missingRequirements.join(", ")}`);
  }

  const baseMatch = Math.round((requirementScoreTotal / maxPossibleScore) * 100);
  const matchScore = Math.min(98, Math.max(20, baseMatch));

  return {
    candidateId: candidate.id,
    candidateName: candidate.fullName,
    college: candidate.college,
    avatarUrl: candidate.avatarUrl,
    matchScore,
    matchedSkills,
    missingRequirements,
    explanation,
    fillsTeamGaps,
  };
}
