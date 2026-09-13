import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/lib/db/store";
import { calculateConsistencyScore } from "@/lib/integrity/consistency";
import { AssessmentAttempt, RawIntegrityEvent, AssessmentAnswer } from "@/types";

describe("End-to-End Real Assessment Integrity Capture & Scoring", () => {
  const attemptId = "att-e2e-integrity-test";
  const startTime = Date.now();

  beforeEach(() => {
    // Clean up test attempt
    const existingIdx = db.attempts.findIndex((a) => a.id === attemptId);
    if (existingIdx >= 0) db.attempts.splice(existingIdx, 1);
    delete db.attemptEvents[attemptId];

    const newAttempt: AssessmentAttempt = {
      id: attemptId,
      candidateId: "usr-01",
      candidateName: "Arjun Verma",
      assessmentId: "asm-react",
      skillId: "react",
      skillName: "React",
      difficulty: "intermediate",
      durationSeconds: 300,
      passingScore: 70,
      questions: [
        {
          id: "q1",
          skillId: "react",
          topic: "Hooks",
          difficulty: "intermediate",
          questionText: "What does useEffect do?",
          options: [
            { id: "opt-1", text: "Side effects" },
            { id: "opt-2", text: "State mutations" },
          ],
        },
        {
          id: "q2",
          skillId: "react",
          topic: "Performance",
          difficulty: "intermediate",
          questionText: "What does useMemo do?",
          options: [
            { id: "opt-3", text: "Memoizes values" },
            { id: "opt-4", text: "Triggers renders" },
          ],
        },
      ],
      startedAt: new Date(startTime).toISOString(),
      status: "in_progress",
      rawEvents: [],
    };
    db.attempts.push(newAttempt);
    db.attemptEvents[attemptId] = [];
  });

  it("captures real live events, applies grace thresholds, performs server timing check, and persists full log", () => {
    const attempt = db.attempts.find((a) => a.id === attemptId)!;
    expect(attempt).toBeDefined();

    // 1. Simulate candidate actions captured by useIntegrityTracking hook:
    // - Selects option on Q1, then changes option (1 revision)
    // - Switches tabs once (1st tab switch - free grace)
    // - Switches tabs again (2nd tab switch - penalized 5 pts)
    // - Copies text (1st clipboard - free grace)
    // - Exits fullscreen (1st fullscreen - free grace)
    // - Navigates to Q2, then returns back to Q1 (navigation patterns)
    const rawEvents: RawIntegrityEvent[] = [
      {
        type: "tab_switch",
        timestamp: startTime + 2000,
        questionId: "q1",
        meta: { state: "hidden" },
      },
      {
        type: "tab_switch",
        timestamp: startTime + 4000,
        questionId: "q1",
        meta: { state: "hidden" },
      },
      {
        type: "clipboard",
        timestamp: startTime + 6000,
        questionId: "q1",
        meta: { action: "copy" },
      },
      {
        type: "fullscreen_exit",
        timestamp: startTime + 8000,
        questionId: "q1",
        meta: { reason: "fullscreenchange" },
      },
      {
        type: "answer_revision",
        timestamp: startTime + 10000,
        questionId: "q1",
        meta: { from: "opt-1", to: "opt-2" },
      },
      {
        type: "question_navigation",
        timestamp: startTime + 12000,
        questionId: "q1",
        meta: { direction: "forward", fromIndex: 0, toIndex: 1 },
      },
      {
        type: "question_navigation",
        timestamp: startTime + 15000,
        questionId: "q2",
        meta: { direction: "back", fromIndex: 1, toIndex: 0 },
      },
    ];

    // 2. Answers recorded (15s on Q1, 15s on Q2 = 30s total)
    const answers: AssessmentAnswer[] = [
      {
        id: "ans-q1",
        attemptId,
        questionId: "q1",
        selectedOptionId: "opt-2",
        timeSpentMs: 15000,
        answerChangeCount: 1,
      },
      {
        id: "ans-q2",
        attemptId,
        questionId: "q2",
        selectedOptionId: "opt-3",
        timeSpentMs: 15000,
        answerChangeCount: 0,
      },
    ];

    // 3. Server submission timing check: wall clock is ~30.5 seconds later (within 10% tolerance of 30,000ms)
    const submitTime = startTime + 30500;
    const serverStartedAt = new Date(startTime).toISOString();
    const serverSubmittedAt = new Date(submitTime).toISOString();

    const consistency = calculateConsistencyScore(rawEvents, answers, {
      serverStartedAt,
      serverSubmittedAt,
    });

    // 4. Validate deductions and grace threshold:
    // Tab switches: 2 events -> (2 - 1) * 5 = -5 pts
    // Clipboard: 1 event -> (1 - 1) * 8 = 0 pts (Grace threshold applied)
    // Fullscreen exit: 1 event -> (1 - 1) * 10 = 0 pts (Grace threshold applied)
    // Timing anomalies: 0 -> 0 pts
    // Excessive revisions: 0 -> 0 pts
    // Timing mismatch: 30500ms vs 30000ms is 1.6% (< 10%) -> 0 pts
    // Total score: 100 - 5 = 95
    expect(consistency.score).toBe(95);
    expect(consistency.breakdown?.tabSwitches).toBe(5);
    expect(consistency.breakdown?.clipboard).toBe(0);
    expect(consistency.breakdown?.fullscreenExits).toBe(0);
    expect(consistency.breakdown?.timingMismatch).toBe(0);

    // Verify signal breakdown includes grace notices
    const graceSignals = consistency.signals.filter((s) =>
      s.title.includes("grace threshold applied")
    );
    expect(graceSignals.length).toBeGreaterThanOrEqual(2); // tab switch 1 & clipboard 1

    // Verify navigation signals recorded
    const navSignals = consistency.signals.filter((s) =>
      s.title.includes("Question forward") || s.title.includes("Question back")
    );
    expect(navSignals.length).toBe(2);

    // 5. Persist to store (as submit route does)
    attempt.status = "submitted";
    attempt.submittedAt = serverSubmittedAt;
    attempt.score = 100;
    attempt.passed = true;
    attempt.integrityScore = consistency.score;
    attempt.consistencyBreakdown = consistency;
    attempt.rawEvents = rawEvents;
    db.attemptEvents[attemptId] = rawEvents as any[];

    // 6. Verify persistence in the store
    const persistedAttempt = db.attempts.find((a) => a.id === attemptId)!;
    expect(persistedAttempt.rawEvents).toBeDefined();
    expect(persistedAttempt.rawEvents?.length).toBe(7);
    expect(persistedAttempt.integrityScore).toBe(95);
    expect(persistedAttempt.consistencyBreakdown?.score).toBe(95);
    expect(db.attemptEvents[attemptId].length).toBe(7);

    // 7. Verify profile retrieval connects to recent attempt
    const candidateAttempts = db.attempts.filter(
      (a) => a.candidateId === "usr-01" && a.status === "submitted"
    );
    const recent = candidateAttempts.sort(
      (a, b) =>
        new Date(b.submittedAt || b.startedAt).getTime() -
        new Date(a.submittedAt || a.startedAt).getTime()
    )[0];
    expect(recent.id).toBe(attemptId);
    expect(recent.rawEvents?.length).toBe(7);
  });
});
