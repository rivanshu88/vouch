import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { syncGitHubEvidence } from "@/lib/github/service";
import { ApiError, ApiSuccess, GitHubEvidence } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const candidateId = body.candidateId || "usr-01";
    const username = body.username?.trim();

    if (!username) {
      const errorRes: ApiError = {
        success: false,
        error: { code: "BAD_REQUEST", message: "GitHub username is required" },
      };
      return NextResponse.json(errorRes, { status: 400 });
    }

    const evidence = await syncGitHubEvidence(candidateId, username);

    // Save to store
    db.githubEvidence[candidateId] = evidence;

    // Update profile with github username
    const profile = db.getProfile(candidateId);
    if (profile) {
      profile.githubUsername = username;
      profile.avatarUrl = evidence.avatarUrl || profile.avatarUrl;
    }

    const response: ApiSuccess<GitHubEvidence> = {
      success: true,
      data: evidence,
    };
    return NextResponse.json(response);
  } catch {
    const errorRes: ApiError = {
      success: false,
      error: { code: "SYNC_FAILED", message: "Failed to synchronize GitHub evidence." },
    };
    return NextResponse.json(errorRes, { status: 500 });
  }
}
