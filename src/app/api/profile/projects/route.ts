import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { AddProjectSchema } from "@/lib/validation/schemas";
import { ApiError, ApiSuccess, Project } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const candidateId = body.candidateId || "usr-01";

    const parsed = AddProjectSchema.safeParse(body);
    if (!parsed.success) {
      const errorRes: ApiError = {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid project parameters", details: parsed.error.format() },
      };
      return NextResponse.json(errorRes, { status: 400 });
    }

    const newProject: Project = {
      id: `prj-${Date.now()}`,
      candidateId,
      ...parsed.data,
      createdAt: new Date().toISOString(),
    };

    db.projects.push(newProject);

    const response: ApiSuccess<Project> = {
      success: true,
      data: newProject,
    };
    return NextResponse.json(response, { status: 201 });
  } catch {
    const errorRes: ApiError = {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to add project evidence." },
    };
    return NextResponse.json(errorRes, { status: 500 });
  }
}
