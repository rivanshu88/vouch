import { TeamVerificationTest } from "@/types";

export const VERIFICATION_COOLDOWN_HOURS = 48;
export const VERIFICATION_COOLDOWN_MS = VERIFICATION_COOLDOWN_HOURS * 60 * 60 * 1000;

export interface RateLimitCheckResult {
  isAllowed: boolean;
  recentTest?: TeamVerificationTest;
  retryAvailableAt?: string;
  hoursRemaining?: number;
}

/**
 * Checks if a verification challenge can be issued for a (team, candidate, skill) triplet.
 * Enforces a strict 48-hour cooldown between challenges for the same triplet.
 */
export function checkVerificationRateLimit(
  tests: TeamVerificationTest[],
  teamId: string,
  candidateId: string,
  skillId: string,
  now: number = Date.now()
): RateLimitCheckResult {
  // Find matching tests for this exact triplet
  const matchingTests = tests.filter(
    (t) => t.teamId === teamId && t.candidateId === candidateId && t.skillId === skillId
  );

  if (matchingTests.length === 0) {
    return { isAllowed: true };
  }

  // Sort by createdAt descending to inspect the most recent attempt
  const sorted = [...matchingTests].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const mostRecent = sorted[0];
  const testTime = new Date(mostRecent.createdAt).getTime();
  const elapsedMs = now - testTime;

  if (elapsedMs < VERIFICATION_COOLDOWN_MS) {
    const retryTimestamp = testTime + VERIFICATION_COOLDOWN_MS;
    const remainingMs = VERIFICATION_COOLDOWN_MS - elapsedMs;
    const hoursRemaining = Math.max(1, Math.ceil(remainingMs / (60 * 60 * 1000)));

    return {
      isAllowed: false,
      recentTest: mostRecent,
      retryAvailableAt: new Date(retryTimestamp).toISOString(),
      hoursRemaining,
    };
  }

  return { isAllowed: true, recentTest: mostRecent };
}
