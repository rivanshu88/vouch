import { NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { ApiSuccess } from "@/types";

export async function GET() {
  const response: ApiSuccess<typeof db.skills> = {
    success: true,
    data: db.skills,
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
