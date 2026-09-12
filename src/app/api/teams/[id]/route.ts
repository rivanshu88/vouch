import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { calculateTeamSkillCoverage } from "@/lib/matching/team";
import { ApiError, ApiSuccess, Team } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const team = db.teams.find((t) => t.id === id);

  if (!team) {
    const errorRes: ApiError = {
      success: false,
      error: { code: "NOT_FOUND", message: "Team not found." },
    };
    return NextResponse.json(errorRes, { status: 404 });
  }

  const coverage = calculateTeamSkillCoverage(team);
  const requests = db.joinRequests.filter((r) => r.teamId === id);
  const verificationTests = db.verificationTests.filter((vt) => vt.teamId === id);

  const response: ApiSuccess<{
    team: Team;
    coverage: typeof coverage;
    requests: typeof requests;
    verificationTests: typeof verificationTests;
  }> = {
    success: true,
    data: {
      team,
      coverage,
      requests,
      verificationTests,
    },
  };

  return NextResponse.json(response);
}
