import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { ApiError, ApiSuccess, Application } from "@/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: driveId } = await params;
    const body = await req.json();
    const candidateId = body.candidateId || "usr-01";

    const drive = db.recruitmentDrives.find((d) => d.id === driveId);
    if (!drive) {
      const errorRes: ApiError = {
        success: false,
        error: { code: "NOT_FOUND", message: "Recruitment drive not found" },
      };
      return NextResponse.json(errorRes, { status: 404 });
    }

    const candidate = db.getProfile(candidateId);
    const candidateSkills = db.getCandidateSkills(candidateId);

    // Calculate match score
    let totalScore = 0;
    const maxScore = Math.max(drive.requirements.length * 20, 20);

    drive.requirements.forEach((req) => {
      const cs = candidateSkills.find((s) => s.skillId === req.skillId);
      if (cs) {
        totalScore += cs.verificationStatus === "verified" ? 20 : 10;
      }
    });

    const matchScore = Math.min(98, Math.max(30, Math.round((totalScore / maxScore) * 100)));

    const existingApp = db.applications.find(
      (a) => a.driveId === driveId && a.candidateId === candidateId
    );

    if (existingApp) {
      const errorRes: ApiError = {
        success: false,
        error: { code: "ALREADY_APPLIED", message: "You have already applied to this drive." },
      };
      return NextResponse.json(errorRes, { status: 400 });
    }

    const newApp: Application = {
      id: `app-${Date.now()}`,
      driveId,
      driveTitle: drive.title,
      companyName: drive.companyName,
      candidateId,
      candidateName: candidate?.fullName || "Candidate",
      candidateCollege: candidate?.college,
      candidateSkills,
      matchScore,
      status: "applied",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.applications.push(newApp);
    drive.applicantCount += 1;

    const response: ApiSuccess<Application> = {
      success: true,
      data: newApp,
    };
    return NextResponse.json(response, { status: 201 });
  } catch {
    const errorRes: ApiError = {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to apply." },
    };
    return NextResponse.json(errorRes, { status: 500 });
  }
}
