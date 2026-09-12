import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { AddSkillSchema } from "@/lib/validation/schemas";
import { ApiError, ApiSuccess, CandidateSkill } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const candidateId = body.candidateId || "usr-01";

    const parsed = AddSkillSchema.safeParse(body);
    if (!parsed.success) {
      const errorRes: ApiError = {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid skill data", details: parsed.error.format() },
      };
      return NextResponse.json(errorRes, { status: 400 });
    }

    const { skillId, declaredLevel } = parsed.data;
    const skillMeta = db.skills.find((s) => s.id === skillId);

    // Check if skill already declared
    let existing = db.candidateSkills.find(
      (cs) => cs.candidateId === candidateId && cs.skillId === skillId
    );

    if (existing) {
      existing.declaredLevel = declaredLevel;
    } else {
      existing = {
        id: `cs-${Date.now()}`,
        candidateId,
        skillId,
        skillName: skillMeta?.name || skillId,
        declaredLevel,
        verificationStatus: "unverified",
      };
      db.candidateSkills.push(existing);
    }

    const response: ApiSuccess<CandidateSkill> = {
      success: true,
      data: existing,
    };
    return NextResponse.json(response, { status: 201 });
  } catch {
    const errorRes: ApiError = {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to save skill claim." },
    };
    return NextResponse.json(errorRes, { status: 500 });
  }
}
