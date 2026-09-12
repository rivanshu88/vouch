import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { CreateRecruitmentDriveSchema } from "@/lib/validation/schemas";
import { ApiError, ApiSuccess, RecruitmentDrive } from "@/types";

export async function GET() {
  const response: ApiSuccess<RecruitmentDrive[]> = {
    success: true,
    data: db.recruitmentDrives,
  };
  return NextResponse.json(response);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateRecruitmentDriveSchema.safeParse(body);

    if (!parsed.success) {
      const errorRes: ApiError = {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid recruitment drive parameters", details: parsed.error.format() },
      };
      return NextResponse.json(errorRes, { status: 400 });
    }

    const driveId = `drv-${Date.now()}`;
    const newDrive: RecruitmentDrive = {
      id: driveId,
      companyId: `comp-${Date.now()}`,
      companyName: parsed.data.companyName,
      title: parsed.data.title,
      role: parsed.data.role,
      location: parsed.data.location,
      type: parsed.data.type,
      description: parsed.data.description,
      status: "open",
      applicantCount: 0,
      createdAt: new Date().toISOString(),
      requirements: parsed.data.requirements.map((r, idx) => {
        const skillMeta = db.skills.find((s) => s.id === r.skillId);
        return {
          id: `rreq-${Date.now()}-${idx}`,
          driveId,
          skillId: r.skillId,
          skillName: skillMeta?.name || r.skillId,
          minimumLevel: r.minimumLevel,
          minimumScore: r.minimumScore,
          required: r.required,
        };
      }),
    };

    db.recruitmentDrives.push(newDrive);

    const response: ApiSuccess<RecruitmentDrive> = {
      success: true,
      data: newDrive,
    };
    return NextResponse.json(response, { status: 201 });
  } catch {
    const errorRes: ApiError = {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to create recruitment drive." },
    };
    return NextResponse.json(errorRes, { status: 500 });
  }
}
