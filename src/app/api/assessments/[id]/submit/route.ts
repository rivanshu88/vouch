import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { evaluateAssessment } from "@/lib/assessments/scoring";
import { calculateConsistencyScore } from "@/lib/integrity/consistency";
import { ApiError, ApiSuccess, AssessmentAnswer } from "@/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: attemptId } = await params;
    const body = await req.json();
    const answers: AssessmentAnswer[] = body.answers || [];

    const attempt = db.attempts.find((a) => a.id === attemptId);
    if (!attempt) {
      const errorRes: ApiError = {
        success: false,
        error: { code: "NOT_FOUND", message: "Attempt not found" },
      };
      return NextResponse.json(errorRes, { status: 404 });
    }

    if (attempt.status !== "in_progress") {
      const errorRes: ApiError = {
        success: false,
        error: { code: "ALREADY_SUBMITTED", message: "This attempt has already been submitted." },
      };
      return NextResponse.json(errorRes, { status: 400 });
    }

    // 1. Server-side scoring (Client never determines the score)
    const scoreResult = evaluateAssessment(answers, attempt.passingScore);

    // 2. Behavioral integrity & consistency score calculation
    const events = db.attemptEvents[attemptId] || [];
    const consistency = calculateConsistencyScore(events, answers);

    // 3. Update attempt state
    attempt.status = "submitted";
    attempt.submittedAt = new Date().toISOString();
    attempt.score = scoreResult.score;
    attempt.passed = scoreResult.passed;
    attempt.integrityScore = consistency.score;
    attempt.consistencyBreakdown = consistency;

    // 4. Update candidate skill verification status if passed
    if (scoreResult.passed) {
      const candidateSkill = db.candidateSkills.find(
        (cs) => cs.candidateId === attempt.candidateId && cs.skillId === attempt.skillId
      );

      if (candidateSkill) {
        candidateSkill.verificationStatus = "verified";
        candidateSkill.verificationScore = scoreResult.score;
        candidateSkill.verifiedAt = new Date().toISOString();
      } else {
        db.candidateSkills.push({
          id: `cs-${Date.now()}`,
          candidateId: attempt.candidateId,
          skillId: attempt.skillId,
          skillName: attempt.skillName,
          declaredLevel: attempt.difficulty,
          verificationStatus: "verified",
          verificationScore: scoreResult.score,
          verifiedAt: new Date().toISOString(),
        });
      }

      // Add notification for candidate
      db.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: attempt.candidateId,
        title: `Skill Verified: ${attempt.skillName}`,
        message: `Congratulations! You passed the ${attempt.difficulty} ${attempt.skillName} assessment with ${scoreResult.score}%.`,
        type: "skill_verified",
        link: "/profile",
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    // 5. Update team verification test if this was linked to one
    const verificationTest = db.verificationTests.find(
      (vt) => vt.candidateId === attempt.candidateId && vt.skillId === attempt.skillId && vt.status === "invited"
    );
    if (verificationTest) {
      verificationTest.status = "completed";
      verificationTest.candidateScore = scoreResult.score;
      verificationTest.integrityScore = consistency.score;
      verificationTest.completedAt = new Date().toISOString();
      verificationTest.assessmentAttemptId = attemptId;
    }

    const response: ApiSuccess<{
      attempt: typeof attempt;
      scoreResult: typeof scoreResult;
      consistency: typeof consistency;
    }> = {
      success: true,
      data: {
        attempt,
        scoreResult,
        consistency,
      },
    };

    return NextResponse.json(response);
  } catch {
    const errorRes: ApiError = {
      success: false,
      error: { code: "SUBMISSION_FAILED", message: "Failed to evaluate assessment submission." },
    };
    return NextResponse.json(errorRes, { status: 500 });
  }
}
