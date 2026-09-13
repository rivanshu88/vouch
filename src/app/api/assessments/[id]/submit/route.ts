import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { evaluateAssessment } from "@/lib/assessments/scoring";
import { calculateConsistencyScore } from "@/lib/integrity/consistency";
import { ApiError, ApiSuccess, AssessmentAnswer, AssessmentEvent, RawIntegrityEvent } from "@/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: attemptId } = await params;
    const body = await req.json();
    const answers: AssessmentAnswer[] = body.answers || [];
    const clientEvents: RawIntegrityEvent[] = body.events || [];

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

    // 1. Server-side scoring of question answers (Client never determines the test score)
    const scoreResult = evaluateAssessment(answers, attempt.passingScore);

    // 2. Merge server-incremental events with client-sent full event log without duplicates
    const incrementalEvents = (db.attemptEvents[attemptId] || []) as unknown as (
      | RawIntegrityEvent
      | AssessmentEvent
    )[];
    const eventMap = new Map<string, RawIntegrityEvent | AssessmentEvent>();

    for (const ev of incrementalEvents) {
      const key = `${ev.type}_${ev.timestamp}_${(ev as any).questionId || ""}`;
      eventMap.set(key, ev);
    }
    for (const ev of clientEvents) {
      const key = `${ev.type}_${ev.timestamp}_${ev.questionId || ""}`;
      eventMap.set(key, ev);
    }

    const allEvents = Array.from(eventMap.values()).sort((a, b) => {
      const tA = typeof a.timestamp === "number" ? a.timestamp : new Date(a.timestamp).getTime();
      const tB = typeof b.timestamp === "number" ? b.timestamp : new Date(b.timestamp).getTime();
      return tA - tB;
    });

    // 3. Behavioral integrity & consistency score calculation with server wall-clock timing check
    const serverSubmittedAt = new Date().toISOString();
    const consistency = calculateConsistencyScore(allEvents, answers, {
      serverStartedAt: attempt.startedAt,
      serverSubmittedAt,
    });

    // 4. Update attempt state and persist raw events & computed scores
    attempt.status = "submitted";
    attempt.submittedAt = serverSubmittedAt;
    attempt.score = scoreResult.score;
    attempt.passed = scoreResult.passed;
    attempt.integrityScore = consistency.score;
    attempt.consistencyBreakdown = consistency;
    attempt.rawEvents = allEvents;
    db.attemptEvents[attemptId] = allEvents as any[];

    // 5. Update candidate skill verification status if passed
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

    // 6. Update team verification test if this was linked to one
    const verificationTest = db.verificationTests.find(
      (vt) =>
        vt.candidateId === attempt.candidateId &&
        vt.skillId === attempt.skillId &&
        vt.status === "invited"
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
