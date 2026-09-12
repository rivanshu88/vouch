import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { ApiError, ApiSuccess, TeamVerificationTest } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const test = db.verificationTests.find((t) => t.id === id);

  if (!test) {
    const errorRes: ApiError = {
      success: false,
      error: { code: "NOT_FOUND", message: "Verification test not found." },
    };
    return NextResponse.json(errorRes, { status: 404 });
  }

  const response: ApiSuccess<TeamVerificationTest> = {
    success: true,
    data: test,
  };
  return NextResponse.json(response);
}
