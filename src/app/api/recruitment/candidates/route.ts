import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { ApiError, ApiSuccess, CandidateSkill } from "@/types";

export interface RecruiterCandidateMatch {
  candidateId: string;
  candidateName: string;
  college: string;
  branch?: string;
  graduationYear?: number;
  avatarUrl?: string;
  githubUsername?: string;
  matchScore: number;
  matchedRequirements: {
    skillId: string;
    skillName: string;
    requiredLevel: string;
    candidateLevel: string;
    verified: boolean;
    score?: number;
  }[];
  missingRequirements: string[];
  explanation: string[];
  evidenceStrengthScore: number;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const driveId = searchParams.get("driveId");
  const skill = searchParams.get("skill");
  const verifiedOnly = searchParams.get("verifiedOnly") === "true";
  const college = searchParams.get("college");
  const gradYear = searchParams.get("gradYear");

  // Get active recruitment drive
  const drive = driveId
    ? db.recruitmentDrives.find((d) => d.id === driveId)
    : db.recruitmentDrives[0];

  const requirements = drive ? drive.requirements : [];

  // Filter candidates
  let candidates = db.profiles.filter((p) => p.role === "candidate");

  if (college) {
    candidates = candidates.filter((c) =>
      c.college.toLowerCase().includes(college.toLowerCase())
    );
  }

  if (gradYear) {
    candidates = candidates.filter((c) => c.graduationYear === Number(gradYear));
  }

  const results: RecruiterCandidateMatch[] = candidates.map((candidate) => {
    const candidateSkills = db.getCandidateSkills(candidate.id);
    const evidence = db.calculateEvidenceStrengthScore(candidate.id);

    const matchedRequirements: RecruiterCandidateMatch["matchedRequirements"] = [];
    const missingRequirements: string[] = [];
    const explanation: string[] = [];

    let totalPoints = 0;
    const maxPoints = Math.max(requirements.length * 30, 30);

    requirements.forEach((req) => {
      const cs = candidateSkills.find((s) => s.skillId === req.skillId);

      if (cs) {
        const isVerified = cs.verificationStatus === "verified";
        let points = 15;

        if (isVerified) {
          points += 15;
          explanation.push(
            `✓ ${cs.skillName || req.skillName} — ${cs.verificationScore || 85}% (Verified ${cs.declaredLevel})`
          );
        } else {
          explanation.push(
            `○ ${cs.skillName || req.skillName} — Declared ${cs.declaredLevel} (Unverified)`
          );
        }

        totalPoints += points;
        matchedRequirements.push({
          skillId: req.skillId,
          skillName: cs.skillName || req.skillName,
          requiredLevel: req.minimumLevel,
          candidateLevel: cs.declaredLevel,
          verified: isVerified,
          score: cs.verificationScore,
        });
      } else {
        if (req.required) {
          missingRequirements.push(req.skillName);
        }
      }
    });

    const verifiedCount = matchedRequirements.filter((r) => r.verified).length;
    explanation.unshift(
      `${verifiedCount}/${requirements.length} required skills verified via standardized assessments`
    );

    const matchScore = Math.min(98, Math.max(20, Math.round((totalPoints / maxPoints) * 100)));

    return {
      candidateId: candidate.id,
      candidateName: candidate.fullName,
      college: candidate.college,
      branch: candidate.branch,
      graduationYear: candidate.graduationYear,
      avatarUrl: candidate.avatarUrl,
      githubUsername: candidate.githubUsername,
      matchScore,
      matchedRequirements,
      missingRequirements,
      explanation,
      evidenceStrengthScore: evidence.compositeScore,
    };
  });

  // Apply skill and verified filters
  let filteredResults = results;
  if (skill) {
    filteredResults = filteredResults.filter((r) =>
      r.matchedRequirements.some((mr) => mr.skillId === skill || mr.skillName.toLowerCase() === skill.toLowerCase())
    );
  }

  if (verifiedOnly) {
    filteredResults = filteredResults.filter((r) =>
      r.matchedRequirements.some((mr) => mr.verified)
    );
  }

  // Rank by matchScore descending
  filteredResults.sort((a, b) => b.matchScore - a.matchScore);

  const response: ApiSuccess<RecruiterCandidateMatch[]> = {
    success: true,
    data: filteredResults,
  };

  return NextResponse.json(response);
}
