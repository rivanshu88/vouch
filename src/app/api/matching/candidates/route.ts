import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { matchCandidateToTeam } from "@/lib/matching/team";
import { ApiError, ApiSuccess, CandidateMatch } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId");

  if (!teamId) {
    const errorRes: ApiError = {
      success: false,
      error: { code: "BAD_REQUEST", message: "teamId parameter is required" },
    };
    return NextResponse.json(errorRes, { status: 400 });
  }

  const team = db.teams.find((t) => t.id === teamId);
  if (!team) {
    const errorRes: ApiError = {
      success: false,
      error: { code: "NOT_FOUND", message: "Team not found" },
    };
    return NextResponse.json(errorRes, { status: 404 });
  }

  // Find candidates not currently in the team
  const memberIds = team.members?.map((m) => m.candidateId) || [];
  const candidateProfiles = db.profiles.filter(
    (p) => p.role === "candidate" && !memberIds.includes(p.id)
  );

  const matches: CandidateMatch[] = candidateProfiles.map((candidate) => {
    const skills = db.getCandidateSkills(candidate.id);
    return matchCandidateToTeam({ ...candidate, skills }, team);
  });

  // Sort by matchScore descending
  matches.sort((a, b) => b.matchScore - a.matchScore);

  const response: ApiSuccess<CandidateMatch[]> = {
    success: true,
    data: matches,
  };

  return NextResponse.json(response);
}
