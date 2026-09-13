import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { ProfileUpdateSchema } from "@/lib/validation/schemas";
import { ApiError, ApiSuccess } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const candidateId = searchParams.get("id") || "usr-01"; // Default to active candidate

  const profile = db.getProfile(candidateId);
  if (!profile) {
    const errorRes: ApiError = {
      success: false,
      error: { code: "PROFILE_NOT_FOUND", message: "Candidate profile not found." },
    };
    return NextResponse.json(errorRes, { status: 404 });
  }

  const skills = db.getCandidateSkills(candidateId);
  const projects = db.getCandidateProjects(candidateId);
  const certificates = db.getCandidateCertificates(candidateId);
  const github = db.getGitHubEvidence(candidateId);
  const evidenceStrength = db.calculateEvidenceStrengthScore(candidateId);

  const candidateAttempts = db.attempts.filter(
    (a) => a.candidateId === candidateId && a.status === "submitted"
  );
  const recentAttempt =
    candidateAttempts.sort(
      (a, b) =>
        new Date(b.submittedAt || b.startedAt).getTime() -
        new Date(a.submittedAt || a.startedAt).getTime()
    )[0] || null;

  const response: ApiSuccess<any> = {
    success: true,
    data: {
      profile,
      skills,
      projects,
      certificates,
      github,
      evidenceStrength,
      recentAttempt,
    },
  };

  return NextResponse.json(response);
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const candidateId = body.id || "usr-01";

    const parsed = ProfileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      const errorRes: ApiError = {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid profile data",
          details: parsed.error.format(),
        },
      };
      return NextResponse.json(errorRes, { status: 400 });
    }

    const profile = db.getProfile(candidateId);
    if (!profile) {
      const errorRes: ApiError = {
        success: false,
        error: { code: "NOT_FOUND", message: "Candidate not found." },
      };
      return NextResponse.json(errorRes, { status: 404 });
    }

    // Apply updates
    Object.assign(profile, parsed.data, { updatedAt: new Date().toISOString() });

    const response: ApiSuccess<typeof profile> = {
      success: true,
      data: profile,
    };
    return NextResponse.json(response);
  } catch {
    const errorRes: ApiError = {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to update profile." },
    };
    return NextResponse.json(errorRes, { status: 500 });
  }
}
