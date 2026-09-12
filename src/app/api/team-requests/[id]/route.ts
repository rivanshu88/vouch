import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { ApiError, ApiSuccess, TeamJoinRequest } from "@/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const status: "accepted" | "rejected" = body.status;

    if (!["accepted", "rejected"].includes(status)) {
      const errorRes: ApiError = {
        success: false,
        error: { code: "BAD_REQUEST", message: "Status must be 'accepted' or 'rejected'." },
      };
      return NextResponse.json(errorRes, { status: 400 });
    }

    const request = db.joinRequests.find((r) => r.id === id);
    if (!request) {
      const errorRes: ApiError = {
        success: false,
        error: { code: "NOT_FOUND", message: "Request not found" },
      };
      return NextResponse.json(errorRes, { status: 404 });
    }

    request.status = status;
    request.resolvedAt = new Date().toISOString();

    const team = db.teams.find((t) => t.id === request.teamId);

    // If accepted, add member to team
    if (status === "accepted" && team) {
      const candidate = db.getProfile(request.candidateId);
      const candidateSkills = db.getCandidateSkills(request.candidateId);

      if (!team.members) team.members = [];
      const alreadyMember = team.members.some((m) => m.candidateId === request.candidateId);

      if (!alreadyMember) {
        team.members.push({
          id: `tmm-${Date.now()}`,
          teamId: team.id,
          candidateId: request.candidateId,
          candidateName: candidate?.fullName || "Member",
          candidateAvatar: candidate?.avatarUrl,
          role: "Verified Member",
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
      userId: request.candidateId,
      title: status === "accepted" ? "Welcome to the Team!" : "Team Application Update",
      message:
        status === "accepted"
          ? `Your join request to ${request.teamName} was accepted!`
          : `Your request to join ${request.teamName} was not accepted at this time.`,
      type: "team_invite",
      link: `/teams/${request.teamId}`,
      read: false,
      createdAt: new Date().toISOString(),
    });

    const response: ApiSuccess<TeamJoinRequest> = {
      success: true,
      data: request,
    };
    return NextResponse.json(response);
  } catch {
    const errorRes: ApiError = {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to update join request." },
    };
    return NextResponse.json(errorRes, { status: 500 });
  }
}
