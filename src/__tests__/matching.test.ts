import { describe, it, expect } from "vitest";
import { calculateTeamSkillCoverage, matchCandidateToTeam } from "@/lib/matching/team";
import { CandidateProfile, CandidateSkill, Team } from "@/types";

describe("Team Skill Coverage & Gap Analysis", () => {
  const mockTeam: Team = {
    id: "tm-test",
    name: "Test Squad",
    hackathonName: "Testathon 2025",
    leaderId: "usr-01",
    leaderName: "Arjun Verma",
    status: "open",
    createdAt: new Date().toISOString(),
    members: [
      {
        id: "m1",
        teamId: "tm-test",
        candidateId: "usr-01",
        candidateName: "Arjun Verma",
        role: "Lead",
        joinedAt: new Date().toISOString(),
        skills: [
          {
            id: "s1",
            candidateId: "usr-01",
            skillId: "react",
            skillName: "React",
            declaredLevel: "advanced",
            verificationStatus: "verified",
            verificationScore: 92,
          },
        ],
      },
    ],
    requirements: [
      {
        id: "r1",
        teamId: "tm-test",
        skillId: "react",
        skillName: "React",
        minimumLevel: "intermediate",
        required: true,
      },
      {
        id: "r2",
        teamId: "tm-test",
        skillId: "python",
        skillName: "Python",
        minimumLevel: "advanced",
        required: true,
      },
    ],
  };

  it("identifies covered skills vs missing capability gaps", () => {
    const coverage = calculateTeamSkillCoverage(mockTeam);
    expect(coverage).toHaveLength(2);

    const reactCoverage = coverage.find((c) => c.skillId === "react");
    expect(reactCoverage).toBeDefined();
    expect(reactCoverage?.status).toBe("covered");
    expect(reactCoverage?.coveragePercentage).toBeGreaterThanOrEqual(90);

    const pythonCoverage = coverage.find((c) => c.skillId === "python");
    expect(pythonCoverage).toBeDefined();
    expect(pythonCoverage?.status).toBe("gap");
    expect(pythonCoverage?.coveragePercentage).toBe(0);
  });

  it("calculates explainable compatibility match and awards higher points for verified skills", () => {
    const candidateWithVerified: CandidateProfile & { skills: CandidateSkill[] } = {
      id: "usr-cand-1",
      fullName: "Priya Sundaram",
      email: "priya@pes.edu",
      college: "PES University",
      role: "candidate",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      skills: [
        {
          id: "cs-1",
          candidateId: "usr-cand-1",
          skillId: "python",
          skillName: "Python",
          declaredLevel: "advanced",
          verificationStatus: "verified",
          verificationScore: 95,
        },
      ],
    };

    const matchResult = matchCandidateToTeam(candidateWithVerified, mockTeam);
    expect(matchResult.matchScore).toBeGreaterThan(50);
    expect(matchResult.fillsTeamGaps).toContain("Python");
    expect(matchResult.explanation.some((e) => e.includes("Verified Python"))).toBe(true);
    expect(matchResult.explanation.some((e) => e.includes("fills team's missing"))).toBe(true);
  });
});
