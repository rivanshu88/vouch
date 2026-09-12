import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { ApiError, ApiSuccess, TeamJoinRequest } from "@/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await params;
    const body = await req.json();
    const candidateId = body.candidateId || "usr-01";

    const team = db.teams.find((t) => t.id === teamId);
    if (!team) {
      const errorRes: ApiError = {
        success: false,
        error: { code: "NOT_FOUND", message: "Team not found" },
      };
      return NextResponse.json(errorRes, { status: 404 });
    }

    const candidate = db.getProfile(candidateId);
    const candidateSkills = db.getCandidateSkills(candidateId);

    // Check if already requested
    const existing = db.joinRequests.find(
      (r) => r.teamId === teamId && r.candidateId === candidateId && r.status === "pending"
    );
    if (existing) {
      const errorRes: ApiError = {
        success: false,
        error: { code: "DUPLICATE_REQUEST", message: "Join request already pending for this team." },
      };
      return NextResponse.json(errorRes, { status: 400 });
    }

    const newRequest: TeamJoinRequest = {
      id: `tjr-${Date.now()}`,
      teamId,
      teamName: team.name,
      candidateId,
      candidateName: candidate?.fullName || "Candidate",
      candidateCollege: candidate?.college,
      candidateSkills,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    db.joinRequests.push(newRequest);

    // Notify team leader
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: team.leaderId,
      title: "New Team Join Request",
      message: `${candidate?.fullName} requested to join ${team.name}.`,
      type: "team_invite",
      link: `/teams/${teamId}`,
      read: false,
      createdAt: new Date().toISOString(),
    });

    const response: ApiSuccess<TeamJoinRequest> = {
      success: true,
      data: newRequest,
    };
    return NextResponse.json(response, { status: 201 });
  } catch {
    const errorRes: ApiError = {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to submit join request." },
    };
    return NextResponse.json(errorRes, { status: 500 });
  }
}
