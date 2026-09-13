import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { CreateVerificationRequestSchema } from "@/lib/validation/schemas";
import { ApiError, ApiSuccess, TeamVerificationTest } from "@/types";
import { checkVerificationRateLimit } from "@/lib/assessments/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const teamId = body.teamId;

    const parsed = CreateVerificationRequestSchema.safeParse(body);
    if (!parsed.success) {
      const errorRes: ApiError = {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid verification parameters", details: parsed.error.format() },
      };
      return NextResponse.json(errorRes, { status: 400 });
    }

    const { candidateId, skillId, difficulty, requiredScore } = parsed.data;

    const team = db.teams.find((t) => t.id === teamId);
    if (!team) {
      const errorRes: ApiError = {
        success: false,
        error: { code: "NOT_FOUND", message: "Team not found" },
      };
      return NextResponse.json(errorRes, { status: 404 });
    }

    const candidate = db.getProfile(candidateId);
    const skillMeta = db.skills.find((s) => s.id === skillId);

    // Rate-limiting: Max 1 verification test per (team, candidate, skill) per 48 hours
    const rateLimit = checkVerificationRateLimit(db.verificationTests, teamId, candidateId, skillId);
    if (!rateLimit.isAllowed) {
      const errorRes: ApiError = {
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: `A verification test for ${skillMeta?.name || skillId} was already issued to this candidate within the last 48 hours.`,
          details: {
            retryAvailableAt: rateLimit.retryAvailableAt,
            hoursRemaining: rateLimit.hoursRemaining,
          },
        },
      };
      return NextResponse.json(errorRes, { status: 429 });
    }

    const testId = `tvt-${Date.now()}`;
    const newTest: TeamVerificationTest = {
      id: testId,
      teamId,
      teamName: team.name,
      candidateId,
      candidateName: candidate?.fullName || "Candidate",
      skillId,
      skillName: skillMeta?.name || skillId,
      difficulty,
      requiredScore,
      status: "invited",
      createdAt: new Date().toISOString(),
    };

    db.verificationTests.push(newTest);

    // Notify candidate that a verification test is ready
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: candidateId,
      title: `Team Verification Test: ${team.name}`,
      message: `${team.name} invited you to complete a ${difficulty} ${skillMeta?.name} verification test (passing score: ${requiredScore}%).`,
      type: "test_ready",
      link: `/assessments?skill=${skillId}&difficulty=${difficulty}&testId=${testId}`,
      read: false,
      createdAt: new Date().toISOString(),
    });

    const response: ApiSuccess<TeamVerificationTest> = {
      success: true,
      data: newTest,
    };
    return NextResponse.json(response, { status: 201 });
  } catch {
    const errorRes: ApiError = {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to issue verification test." },
    };
    return NextResponse.json(errorRes, { status: 500 });
  }
}
