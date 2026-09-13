import { describe, it, expect } from "vitest";
import { checkVerificationRateLimit, VERIFICATION_COOLDOWN_MS } from "@/lib/assessments/rate-limit";
import { TeamVerificationTest } from "@/types";

describe("Team Verification Rate Limiting (48-Hour Cooldown)", () => {
  const baseNow = new Date("2024-03-10T12:00:00.000Z").getTime();

  it("allows verification challenge when no prior test exists for the triplet", () => {
    const tests: TeamVerificationTest[] = [];
    const result = checkVerificationRateLimit(tests, "tm-01", "usr-01", "react", baseNow);

    expect(result.isAllowed).toBe(true);
    expect(result.retryAvailableAt).toBeUndefined();
    expect(result.hoursRemaining).toBeUndefined();
  });

  it("rejects challenge within 48-hour cooldown window for exact (team, candidate, skill) triplet", () => {
    // Issued 12 hours ago
    const twelveHoursAgo = new Date(baseNow - 12 * 60 * 60 * 1000).toISOString();
    const tests: TeamVerificationTest[] = [
      {
        id: "tvt-01",
        teamId: "tm-01",
        teamName: "NeuralMesh",
        candidateId: "usr-01",
        candidateName: "Arjun Verma",
        skillId: "react",
        skillName: "React",
        difficulty: "advanced",
        requiredScore: 80,
        status: "invited",
        createdAt: twelveHoursAgo,
      },
    ];

    const result = checkVerificationRateLimit(tests, "tm-01", "usr-01", "react", baseNow);

    expect(result.isAllowed).toBe(false);
    expect(result.hoursRemaining).toBe(36); // 48 - 12
    expect(result.retryAvailableAt).toBe(
      new Date(new Date(twelveHoursAgo).getTime() + VERIFICATION_COOLDOWN_MS).toISOString()
    );
  });

  it("calculates at least 1 hour remaining when close to 48h limit", () => {
    // Issued 47 hours and 45 minutes ago
    const almostExpired = new Date(baseNow - (47 * 60 + 45) * 60 * 1000).toISOString();
    const tests: TeamVerificationTest[] = [
      {
        id: "tvt-01",
        teamId: "tm-01",
        teamName: "NeuralMesh",
        candidateId: "usr-01",
        candidateName: "Arjun Verma",
        skillId: "react",
        skillName: "React",
        difficulty: "advanced",
        requiredScore: 80,
        status: "invited",
        createdAt: almostExpired,
      },
    ];

    const result = checkVerificationRateLimit(tests, "tm-01", "usr-01", "react", baseNow);

    expect(result.isAllowed).toBe(false);
    expect(result.hoursRemaining).toBe(1);
  });

  it("allows challenge once 48 hours have elapsed", () => {
    // Issued 49 hours ago
    const fortyNineHoursAgo = new Date(baseNow - 49 * 60 * 60 * 1000).toISOString();
    const tests: TeamVerificationTest[] = [
      {
        id: "tvt-01",
        teamId: "tm-01",
        teamName: "NeuralMesh",
        candidateId: "usr-01",
        candidateName: "Arjun Verma",
        skillId: "react",
        skillName: "React",
        difficulty: "advanced",
        requiredScore: 80,
        status: "completed",
        createdAt: fortyNineHoursAgo,
      },
    ];

    const result = checkVerificationRateLimit(tests, "tm-01", "usr-01", "react", baseNow);

    expect(result.isAllowed).toBe(true);
  });

  it("allows challenge for a different skill for the same team and candidate", () => {
    // React issued 2 hours ago
    const twoHoursAgo = new Date(baseNow - 2 * 60 * 60 * 1000).toISOString();
    const tests: TeamVerificationTest[] = [
      {
        id: "tvt-01",
        teamId: "tm-01",
        teamName: "NeuralMesh",
        candidateId: "usr-01",
        candidateName: "Arjun Verma",
        skillId: "react",
        skillName: "React",
        difficulty: "advanced",
        requiredScore: 80,
        status: "invited",
        createdAt: twoHoursAgo,
      },
    ];

    // Requesting TypeScript
    const result = checkVerificationRateLimit(tests, "tm-01", "usr-01", "typescript", baseNow);

    expect(result.isAllowed).toBe(true);
  });

  it("allows challenge for a different candidate for the same team and skill", () => {
    // usr-01 challenged 2 hours ago
    const twoHoursAgo = new Date(baseNow - 2 * 60 * 60 * 1000).toISOString();
    const tests: TeamVerificationTest[] = [
      {
        id: "tvt-01",
        teamId: "tm-01",
        teamName: "NeuralMesh",
        candidateId: "usr-01",
        candidateName: "Arjun Verma",
        skillId: "react",
        skillName: "React",
        difficulty: "advanced",
        requiredScore: 80,
        status: "invited",
        createdAt: twoHoursAgo,
      },
    ];

    // Requesting for usr-04
    const result = checkVerificationRateLimit(tests, "tm-01", "usr-04", "react", baseNow);

    expect(result.isAllowed).toBe(true);
  });

  it("allows challenge for a different team for the same candidate and skill", () => {
    // tm-01 challenged 2 hours ago
    const twoHoursAgo = new Date(baseNow - 2 * 60 * 60 * 1000).toISOString();
    const tests: TeamVerificationTest[] = [
      {
        id: "tvt-01",
        teamId: "tm-01",
        teamName: "NeuralMesh",
        candidateId: "usr-01",
        candidateName: "Arjun Verma",
        skillId: "react",
        skillName: "React",
        difficulty: "advanced",
        requiredScore: 80,
        status: "invited",
        createdAt: twoHoursAgo,
      },
    ];

    // Requesting for tm-03
    const result = checkVerificationRateLimit(tests, "tm-03", "usr-01", "react", baseNow);

    expect(result.isAllowed).toBe(true);
  });
});
