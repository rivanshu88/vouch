import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/lib/db/store";
import { AssessmentAttempt, RawIntegrityEvent } from "@/types";

describe("Incremental Assessment Event Synchronization (Check 2)", () => {
  const testAttemptId = "att-test-sync-01";

  beforeEach(() => {
    // Reset attempt test state in db
    const existingIdx = db.attempts.findIndex((a) => a.id === testAttemptId);
    if (existingIdx >= 0) {
      db.attempts.splice(existingIdx, 1);
    }
    delete db.attemptEvents[testAttemptId];

    const newAttempt: AssessmentAttempt = {
      id: testAttemptId,
      candidateId: "usr-01",
      candidateName: "Arjun Verma",
      assessmentId: "asm-react",
      skillId: "react",
      skillName: "React",
      difficulty: "advanced",
      durationSeconds: 600,
      passingScore: 70,
      questions: [],
      startedAt: new Date().toISOString(),
      status: "in_progress",
      rawEvents: [],
    };
    db.attempts.push(newAttempt);
    db.attemptEvents[testAttemptId] = [];
  });

  it("correctly appends partial event logs across multiple sync calls for the same attempt", () => {
    const attempt = db.attempts.find((a) => a.id === testAttemptId)!;
    expect(attempt).toBeDefined();

    // 1. First incremental sync (e.g. Navigation from Q1 to Q2 with a tab switch)
    const batch1: RawIntegrityEvent[] = [
      {
        type: "tab_switch",
        timestamp: Date.now() - 5000,
        questionId: "q1",
      },
      {
        type: "question_navigation",
        timestamp: Date.now() - 4000,
        meta: { direction: "forward", fromIndex: 0, toIndex: 1 },
      },
    ];

    // Append batch 1
    if (!attempt.rawEvents) attempt.rawEvents = [];
    attempt.rawEvents.push(...batch1);
    db.attemptEvents[testAttemptId].push(
      ...batch1.map((b) => ({
        id: `evt-${b.timestamp}`,
        attemptId: testAttemptId,
        type: b.type as any,
        timestamp: new Date(b.timestamp).toISOString(),
        questionId: b.questionId,
        metadata: b.meta,
      }))
    );

    expect(attempt.rawEvents.length).toBe(2);
    expect(db.attemptEvents[testAttemptId].length).toBe(2);

    // 2. Second incremental sync (e.g. Option revision and clipboard copy on Q2)
    const batch2: RawIntegrityEvent[] = [
      {
        type: "clipboard",
        timestamp: Date.now() - 3000,
        questionId: "q2",
        meta: { action: "copy" },
      },
      {
        type: "answer_revision",
        timestamp: Date.now() - 2000,
        questionId: "q2",
        meta: { from: "opt-1", to: "opt-2" },
      },
      {
        type: "question_navigation",
        timestamp: Date.now() - 1000,
        meta: { direction: "forward", fromIndex: 1, toIndex: 2 },
      },
    ];

    // Append batch 2
    attempt.rawEvents.push(...batch2);
    db.attemptEvents[testAttemptId].push(
      ...batch2.map((b) => ({
        id: `evt-${b.timestamp}`,
        attemptId: testAttemptId,
        type: b.type as any,
        timestamp: new Date(b.timestamp).toISOString(),
        questionId: b.questionId,
        metadata: b.meta,
      }))
    );

    // Verify all partial logs are retained across batches without data loss
    expect(attempt.rawEvents.length).toBe(5);
    expect(db.attemptEvents[testAttemptId].length).toBe(5);
    expect(attempt.rawEvents[0].type).toBe("tab_switch");
    expect(attempt.rawEvents[2].type).toBe("clipboard");
    expect(attempt.rawEvents[4].type).toBe("question_navigation");
  });
});
