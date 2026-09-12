import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { VerificationDecisionSchema } from "@/lib/validation/schemas";
import { ApiError, ApiSuccess, TeamVerificationTest } from "@/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const parsed = VerificationDecisionSchema.safeParse(body);
    if (!parsed.success) {
      const errorRes: ApiError = {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid decision payload", details: parsed.error.format() },
      };
      return NextResponse.json(errorRes, { status: 400 });
    }

    const test = db.verificationTests.find((t) => t.id === id);
    if (!test) {
      const errorRes: ApiError = {
        success: false,
        error: { code: "NOT_FOUND", message: "Verification test not found" },
      };
      return NextResponse.json(errorRes, { status: 404 });
    }

    const { decision, reason } = parsed.data;
    test.status = decision;
    test.decisionReason = reason || `Decision: ${decision}`;

    const team = db.teams.find((t) => t.id === test.teamId);

    // If accepted, add candidate to team members
    if (decision === "accepted" && team) {
      const candidate = db.getProfile(test.candidateId);
      const candidateSkills = db.getCandidateSkills(test.candidateId);

      if (!team.members) team.members = [];
      const alreadyMember = team.members.some((m) => m.candidateId === test.candidateId);

      if (!alreadyMember) {
        team.members.push({
          id: `tmm-${Date.now()}`,
          teamId: team.id,
          candidateId: test.candidateId,
          candidateName: candidate?.fullName || test.candidateName,
          candidateAvatar: candidate?.avatarUrl,
          role: "Verified Specialist",
          joinedAt: new Date().toISOString(),
          skills: candidateSkills,
        });

        if (team.members.length >= (team.maxMembers || 4)) {
          team.status = "full";
        }
      }
    }

    // Notify candidate
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: test.candidateId,
      title: decision === "accepted" ? "Accepted into Team!" : "Team Decision Recorded",
      message:
        decision === "accepted"
          ? `Congratulations! ${test.teamName} accepted your verification test.`
          : `${test.teamName} reviewed your verification test result.`,
      type: "team_invite",
      link: `/teams/${test.teamId}`,
      read: false,
      createdAt: new Date().toISOString(),
    });

    const response: ApiSuccess<TeamVerificationTest> = {
      success: true,
      data: test,
    };
    return NextResponse.json(response);
  } catch {
    const errorRes: ApiError = {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to record verification decision." },
    };
    return NextResponse.json(errorRes, { status: 500 });
  }
}
