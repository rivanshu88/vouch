import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { ApiError, ApiSuccess, AssessmentAttempt } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const attempt = db.attempts.find((a) => a.id === id);

  if (!attempt) {
    const errorRes: ApiError = {
      success: false,
      error: { code: "NOT_FOUND", message: "Assessment attempt not found." },
    };
    return NextResponse.json(errorRes, { status: 404 });
  }

  const response: ApiSuccess<AssessmentAttempt> = {
    success: true,
    data: attempt,
  };
  return NextResponse.json(response);
}
