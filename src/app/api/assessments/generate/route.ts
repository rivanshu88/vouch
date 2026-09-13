import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { generateAssessmentQuestions } from "@/lib/assessments/blueprint";
import { GenerateAssessmentSchema } from "@/lib/validation/schemas";
import { ApiError, ApiSuccess, AssessmentAttempt } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const candidateId = body.candidateId || "usr-01";

    const parsed = GenerateAssessmentSchema.safeParse(body);
    if (!parsed.success) {
      const errorRes: ApiError = {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid parameters", details: parsed.error.format() },
      };
      return NextResponse.json(errorRes, { status: 400 });
    }

    const { skillId, difficulty, questionCount } = parsed.data;
    const skillMeta = db.skills.find((s) => s.id === skillId);
    const candidate = db.getProfile(candidateId);

    // Generate sanitized questions using blueprint logic
    const { questions } = generateAssessmentQuestions({
      skillId,
      difficulty,
      questionCount,
    });

    const attemptId = `att-${Date.now()}`;
    const attempt: AssessmentAttempt = {
      id: attemptId,
      candidateId,
      candidateName: candidate?.fullName || "Candidate",
      assessmentId: `asm-${skillId}`,
      skillId,
      skillName: skillMeta?.name || skillId,
      difficulty,
      durationSeconds: questionCount * 60, // 1 minute per question
      passingScore: 70,
      questions,
      startedAt: new Date().toISOString(),
      status: "in_progress",
    };

    // Store attempt in database store
    db.attempts.push(attempt);
    db.attemptEvents[attemptId] = [];

    // Return sanitized attempt (correctOptionId is completely absent)
    const response: ApiSuccess<AssessmentAttempt> = {
      success: true,
      data: attempt,
    };
    return NextResponse.json(response, { status: 201 });
  } catch (err: any) {
    console.error("GENERATE ERROR:", err);
    const errorRes: ApiError = {
      success: false,
      error: { code: "GENERATION_FAILED", message: err?.message || "Failed to generate assessment attempt." },
    };
    return NextResponse.json(errorRes, { status: 500 });
  }
}
