import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { CreateTeamSchema } from "@/lib/validation/schemas";
import { ApiError, ApiSuccess, Team } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const skill = searchParams.get("skill");
  const status = searchParams.get("status");
  const hackathon = searchParams.get("hackathon");

  let result = [...db.teams];

  if (status) {
    result = result.filter((t) => t.status === status);
  }

  if (hackathon) {
    result = result.filter((t) =>
      t.hackathonName.toLowerCase().includes(hackathon.toLowerCase())
    );
  }

  if (skill) {
    result = result.filter((t) =>
      t.requirements?.some((r) => r.skillId === skill || r.skillName?.toLowerCase() === skill.toLowerCase())
    );
  }

  const response: ApiSuccess<Team[]> = {
    success: true,
    data: result,
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const leaderId = body.leaderId || "usr-02";

    const parsed = CreateTeamSchema.safeParse(body);
    if (!parsed.success) {
      const errorRes: ApiError = {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid team parameters", details: parsed.error.format() },
      };
      return NextResponse.json(errorRes, { status: 400 });
    }

    const leader = db.getProfile(leaderId);
    const leaderSkills = db.getCandidateSkills(leaderId);

    const teamId = `tm-${Date.now()}`;
    const newTeam: Team = {
      id: teamId,
      name: parsed.data.name,
      description: parsed.data.description,
      hackathonName: parsed.data.hackathonName,
      leaderId,
      leaderName: leader?.fullName || "Team Leader",
      status: "open",
      maxMembers: 4,
      createdAt: new Date().toISOString(),
      members: [
        {
          id: `tmm-${Date.now()}`,
          teamId,
          candidateId: leaderId,
          candidateName: leader?.fullName || "Leader",
          candidateAvatar: leader?.avatarUrl,
          role: "Team Leader",
          joinedAt: new Date().toISOString(),
          skills: leaderSkills,
        },
      ],
      requirements: parsed.data.requirements.map((r, idx) => {
        const skillMeta = db.skills.find((s) => s.id === r.skillId);
        return {
          id: `req-${Date.now()}-${idx}`,
          teamId,
          skillId: r.skillId,
          skillName: skillMeta?.name || r.skillId,
          role: r.role,
          minimumLevel: r.minimumLevel,
          minimumScore: r.minimumScore,
          required: r.required,
        };
      }),
    };

    db.teams.push(newTeam);

    const response: ApiSuccess<Team> = {
      success: true,
      data: newTeam,
    };
    return NextResponse.json(response, { status: 201 });
  } catch {
    const errorRes: ApiError = {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to create team." },
    };
    return NextResponse.json(errorRes, { status: 500 });
  }
}
