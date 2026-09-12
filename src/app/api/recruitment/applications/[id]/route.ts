import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { ApiError, ApiSuccess, Application } from "@/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const status = body.status;

    const validStatuses = ["applied", "eligible", "shortlisted", "interview", "selected", "rejected"];
    if (!validStatuses.includes(status)) {
      const errorRes: ApiError = {
        success: false,
        error: { code: "BAD_REQUEST", message: `Status must be one of: ${validStatuses.join(", ")}` },
      };
      return NextResponse.json(errorRes, { status: 400 });
    }

    const application = db.applications.find((a) => a.id === id);
    if (!application) {
      const errorRes: ApiError = {
        success: false,
        error: { code: "NOT_FOUND", message: "Application not found" },
      };
      return NextResponse.json(errorRes, { status: 404 });
    }

    application.status = status;
    application.updatedAt = new Date().toISOString();

    // Notify candidate of status progression
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: application.candidateId,
      title: `Recruitment Update: ${application.companyName}`,
      message: `Your application status for ${application.driveTitle} is now '${status.toUpperCase()}'.`,
      type: "application_update",
      link: "/recruitment",
      read: false,
      createdAt: new Date().toISOString(),
    });

    const response: ApiSuccess<Application> = {
      success: true,
      data: application,
    };
    return NextResponse.json(response);
  } catch {
    const errorRes: ApiError = {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to update application status." },
    };
    return NextResponse.json(errorRes, { status: 500 });
  }
}
