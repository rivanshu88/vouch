import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { ApiError, ApiSuccess, Application } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const driveId = searchParams.get("driveId");
  const candidateId = searchParams.get("candidateId");

  let result = [...db.applications];
  if (driveId) {
    result = result.filter((a) => a.driveId === driveId);
  }
  if (candidateId) {
    result = result.filter((a) => a.candidateId === candidateId);
  }

  const response: ApiSuccess<Application[]> = {
    success: true,
    data: result,
  };
  return NextResponse.json(response);
}
