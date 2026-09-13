import { describe, it, expect } from "vitest";
import {
  calculateConsistencyScore,
  MANDATORY_INTEGRITY_DISCLAIMER,
} from "@/lib/integrity/consistency";
import { AssessmentAnswer, AssessmentEvent, RawIntegrityEvent } from "@/types";

describe("Consistency / Integrity Scoring Model with Grace Threshold & Timing Sanity", () => {
  it("clean run produces a perfect score of 100 with 0 deductions", () => {
    const events: AssessmentEvent[] = [
      { id: "e1", attemptId: "att-1", type: "QUESTION_OPENED", timestamp: "0:01" },
    ];
    const answers: AssessmentAnswer[] = [
      { id: "a1", attemptId: "att-1", questionId: "q1", timeSpentMs: 14000, answerChangeCount: 0 },
      { id: "a2", attemptId: "att-1", questionId: "q2", timeSpentMs: 15000, answerChangeCount: 1 },
      { id: "a3", attemptId: "att-1", questionId: "q3", timeSpentMs: 16000, answerChangeCount: 2 },
    ];

    const result = calculateConsistencyScore(events, answers);
    expect(result.score).toBe(100);
    expect(result.tabSwitches).toBe(0);
    expect(result.clipboardAttempts).toBe(0);
    expect(result.fullscreenExits).toBe(0);
    expect(result.timingAnomalies).toBe(0);
    expect(result.excessiveRevisions).toBe(0);
    expect(result.breakdown).toEqual({
      tabSwitches: 0,
      clipboard: 0,
      fullscreenExits: 0,
      timingAnomalies: 0,
      excessiveRevisions: 0,
      timingMismatch: 0,
    });
    expect(result.disclaimer).toBe(MANDATORY_INTEGRITY_DISCLAIMER);
  });

  // Grace Threshold: Tab Switches
  it("applies 1 free occurrence grace threshold for tab switches (1st = 0 pts, 2nd = -5 pts)", () => {
    const singleEvent: AssessmentEvent[] = [
      { id: "e1", attemptId: "att-1", type: "TAB_HIDDEN", timestamp: "1:20" },
    ];
    const singleResult = calculateConsistencyScore(singleEvent, []);
    expect(singleResult.tabSwitches).toBe(1);
    expect(singleResult.breakdown!.tabSwitches).toBe(0);
    expect(singleResult.score).toBe(100);
    expect(singleResult.signals.some((s) => s.pointsDeducted === 0 && s.title.includes("grace threshold applied"))).toBe(true);

    const twoEvents: AssessmentEvent[] = [
      { id: "e1", attemptId: "att-1", type: "TAB_HIDDEN", timestamp: "1:20" },
      { id: "e2", attemptId: "att-1", type: "WINDOW_BLUR", timestamp: "2:15" },
    ];
    const twoResult = calculateConsistencyScore(twoEvents, []);
    expect(twoResult.tabSwitches).toBe(2);
    expect(twoResult.breakdown!.tabSwitches).toBe(5); // (2 - 1) * 5 = 5
    expect(twoResult.score).toBe(95);
  });

  it("enforces cap of -20 points on tab switches / window blur with grace threshold", () => {
    // 1st free, 2nd (-5), 3rd (-10), 4th (-15), 5th (-20, cap), 6th (capped at -20)
    const events: AssessmentEvent[] = [
      { id: "e1", attemptId: "att-1", type: "TAB_HIDDEN", timestamp: "1:00" },
      { id: "e2", attemptId: "att-1", type: "TAB_HIDDEN", timestamp: "2:00" },
      { id: "e3", attemptId: "att-1", type: "TAB_HIDDEN", timestamp: "3:00" },
      { id: "e4", attemptId: "att-1", type: "TAB_HIDDEN", timestamp: "4:00" },
      { id: "e5", attemptId: "att-1", type: "TAB_HIDDEN", timestamp: "5:00" },
      { id: "e6", attemptId: "att-1", type: "TAB_HIDDEN", timestamp: "6:00" },
    ];
    const result = calculateConsistencyScore(events, []);
    expect(result.tabSwitches).toBe(6);
    expect(result.breakdown!.tabSwitches).toBe(20);
    expect(result.score).toBe(80);
  });

  // Grace Threshold: Clipboard
  it("applies 1 free occurrence grace threshold for clipboard interactions (1st = 0 pts, 2nd = -8 pts)", () => {
    const singleEvent: AssessmentEvent[] = [
      { id: "e1", attemptId: "att-1", type: "COPY_ATTEMPT", timestamp: "1:15" },
    ];
    const singleResult = calculateConsistencyScore(singleEvent, []);
    expect(singleResult.clipboardAttempts).toBe(1);
    expect(singleResult.breakdown!.clipboard).toBe(0);
    expect(singleResult.score).toBe(100);

    const twoEvents: AssessmentEvent[] = [
      { id: "e1", attemptId: "att-1", type: "COPY_ATTEMPT", timestamp: "1:15" },
      { id: "e2", attemptId: "att-1", type: "PASTE_ATTEMPT", timestamp: "1:18" },
    ];
    const twoResult = calculateConsistencyScore(twoEvents, []);
    expect(twoResult.clipboardAttempts).toBe(2);
    expect(twoResult.breakdown!.clipboard).toBe(8); // (2 - 1) * 8 = 8
    expect(twoResult.score).toBe(92);
  });

  // Grace Threshold: Fullscreen
  it("applies 1 free occurrence grace threshold for fullscreen exits (1st = 0 pts, 2nd = -10 pts)", () => {
    const singleEvent: AssessmentEvent[] = [
      { id: "e1", attemptId: "att-1", type: "FULLSCREEN_EXIT", timestamp: "3:45" },
    ];
    const singleResult = calculateConsistencyScore(singleEvent, []);
    expect(singleResult.fullscreenExits).toBe(1);
    expect(singleResult.breakdown!.fullscreenExits).toBe(0);
    expect(singleResult.score).toBe(100);

    const twoEvents: AssessmentEvent[] = [
      { id: "e1", attemptId: "att-1", type: "FULLSCREEN_EXIT", timestamp: "3:45" },
      { id: "e2", attemptId: "att-1", type: "FULLSCREEN_EXIT", timestamp: "4:15" },
    ];
    const twoResult = calculateConsistencyScore(twoEvents, []);
    expect(twoResult.fullscreenExits).toBe(2);
    expect(twoResult.breakdown!.fullscreenExits).toBe(10); // (2 - 1) * 10 = 10
    expect(twoResult.score).toBe(90);
  });

  // Grace Threshold: Timing Anomalies
  it("applies 1 free occurrence grace threshold for timing anomalies (1st = 0 pts, 2nd = -6 pts)", () => {
    // 1 anomaly:
    const answersWith1Anomaly: AssessmentAnswer[] = [
      { id: "a1", attemptId: "att-1", questionId: "q1", timeSpentMs: 15000, answerChangeCount: 0 },
      { id: "a2", attemptId: "att-1", questionId: "q2", timeSpentMs: 15000, answerChangeCount: 0 },
      { id: "a3", attemptId: "att-1", questionId: "q3", timeSpentMs: 500, answerChangeCount: 0 }, // Outlier 1
    ];
    const singleResult = calculateConsistencyScore([], answersWith1Anomaly);
    expect(singleResult.timingAnomalies).toBe(1);
    expect(singleResult.breakdown!.timingAnomalies).toBe(0);
    expect(singleResult.score).toBe(100);

    // 2 anomalies:
    const answersWith2Anomalies: AssessmentAnswer[] = [
      { id: "a1", attemptId: "att-1", questionId: "q1", timeSpentMs: 15000, answerChangeCount: 0 },
      { id: "a2", attemptId: "att-1", questionId: "q2", timeSpentMs: 15000, answerChangeCount: 0 },
      { id: "a3", attemptId: "att-1", questionId: "q3", timeSpentMs: 500, answerChangeCount: 0 }, // Outlier 1
      { id: "a4", attemptId: "att-1", questionId: "q4", timeSpentMs: 500, answerChangeCount: 0 }, // Outlier 2
    ];
    const twoResult = calculateConsistencyScore([], answersWith2Anomalies);
    expect(twoResult.timingAnomalies).toBe(2);
    expect(twoResult.breakdown!.timingAnomalies).toBe(6); // (2 - 1) * 6 = 6
    expect(twoResult.score).toBe(94);
  });

  // Grace Threshold: Excessive Revisions
  it("applies 1 free occurrence grace threshold for excessive answer revisions (>3 revisions, 1st = 0 pts, 2nd = -4 pts)", () => {
    const singleRevision: AssessmentAnswer[] = [
      { id: "a1", attemptId: "att-1", questionId: "q1", timeSpentMs: 14000, answerChangeCount: 4 }, // >3 revisions (free)
      { id: "a2", attemptId: "att-1", questionId: "q2", timeSpentMs: 15000, answerChangeCount: 2 },
    ];
    const singleResult = calculateConsistencyScore([], singleRevision);
    expect(singleResult.excessiveRevisions).toBe(1);
    expect(singleResult.breakdown!.excessiveRevisions).toBe(0);
    expect(singleResult.score).toBe(100);

    const twoRevisions: AssessmentAnswer[] = [
      { id: "a1", attemptId: "att-1", questionId: "q1", timeSpentMs: 14000, answerChangeCount: 4 }, // >3 revisions
      { id: "a2", attemptId: "att-1", questionId: "q2", timeSpentMs: 15000, answerChangeCount: 5 }, // >3 revisions
    ];
    const twoResult = calculateConsistencyScore([], twoRevisions);
    expect(twoResult.excessiveRevisions).toBe(2);
    expect(twoResult.breakdown!.excessiveRevisions).toBe(4); // (2 - 1) * 4 = 4
    expect(twoResult.score).toBe(96);
  });

  it("accurately computes combined deductions across all categories with grace threshold", () => {
    // 3 tabs: (3-1)*5 = 10 pts
    // 2 clipboard: (2-1)*8 = 8 pts
    // 2 fullscreen: (2-1)*10 = 10 pts
    // 2 excessive revisions: (2-1)*4 = 4 pts
    const events: AssessmentEvent[] = [
      { id: "e1", attemptId: "att-1", type: "TAB_HIDDEN", timestamp: "1:00" },
      { id: "e2", attemptId: "att-1", type: "WINDOW_BLUR", timestamp: "2:00" },
      { id: "e3", attemptId: "att-1", type: "TAB_HIDDEN", timestamp: "2:30" },
      { id: "e4", attemptId: "att-1", type: "COPY_ATTEMPT", timestamp: "3:00" },
      { id: "e5", attemptId: "att-1", type: "PASTE_ATTEMPT", timestamp: "3:30" },
      { id: "e6", attemptId: "att-1", type: "FULLSCREEN_EXIT", timestamp: "4:00" },
      { id: "e7", attemptId: "att-1", type: "FULLSCREEN_EXIT", timestamp: "4:30" },
    ];
    const answers: AssessmentAnswer[] = [
      { id: "a1", attemptId: "att-1", questionId: "q1", timeSpentMs: 15000, answerChangeCount: 4 }, // revision 1
      { id: "a2", attemptId: "att-1", questionId: "q2", timeSpentMs: 15000, answerChangeCount: 5 }, // revision 2
      { id: "a3", attemptId: "att-1", questionId: "q3", timeSpentMs: 15000, answerChangeCount: 0 },
    ];

    const result = calculateConsistencyScore(events, answers);
    // Deductions: 10 + 8 + 10 + 0 + 4 = 32. Score = 100 - 32 = 68.
    expect(result.breakdown).toEqual({
      tabSwitches: 10,
      clipboard: 8,
      fullscreenExits: 10,
      timingAnomalies: 0,
      excessiveRevisions: 4,
      timingMismatch: 0,
    });
    expect(result.score).toBe(68);
  });

  // Server Timing Sanity Check
  it("server timing sanity check: applies -10 pts when client question times diverge > 10% from wall clock", () => {
    const answers: AssessmentAnswer[] = [
      { id: "a1", attemptId: "att-1", questionId: "q1", timeSpentMs: 10000, answerChangeCount: 0 },
      { id: "a2", attemptId: "att-1", questionId: "q2", timeSpentMs: 10000, answerChangeCount: 0 },
    ];
    // Client total = 20,000ms.
    // Server elapsed = 50,000ms (150% divergence > 10% tolerance)
    const serverStartedAt = new Date(100000).toISOString();
    const serverSubmittedAt = new Date(150000).toISOString();

    const result = calculateConsistencyScore([], answers, { serverStartedAt, serverSubmittedAt });
    expect(result.timingMismatch).toBe(10);
    expect(result.breakdown?.timingMismatch).toBe(10);
    expect(result.score).toBe(90); // 100 - 10
    expect(result.signals.some((s) => s.title.includes("Server timing mismatch detected"))).toBe(true);
  });

  it("server timing sanity check: passes with 0 deduction when client duration is within 10% of server elapsed time", () => {
    const answers: AssessmentAnswer[] = [
      { id: "a1", attemptId: "att-1", questionId: "q1", timeSpentMs: 15000, answerChangeCount: 0 },
      { id: "a2", attemptId: "att-1", questionId: "q2", timeSpentMs: 15000, answerChangeCount: 0 },
    ];
    // Client total = 30,000ms. Server elapsed = 31,000ms (3.2% divergence <= 10% tolerance)
    const serverStartedAt = 100000;
    const serverSubmittedAt = 131000;

    const result = calculateConsistencyScore([], answers, { serverStartedAt, serverSubmittedAt });
    expect(result.timingMismatch).toBe(0);
    expect(result.breakdown?.timingMismatch).toBe(0);
    expect(result.score).toBe(100);
    expect(result.signals.some((s) => s.title.includes("Server Timing Verification Passed"))).toBe(true);
  });

  // Support for RawIntegrityEvent shape
  it("correctly scores RawIntegrityEvent items from live browser capture hook", () => {
    const rawEvents: RawIntegrityEvent[] = [
      { type: "tab_switch", timestamp: 1710000000000 },
      { type: "tab_switch", timestamp: 1710000005000 },
      { type: "clipboard", timestamp: 1710000010000, meta: { action: "copy" } },
      { type: "clipboard", timestamp: 1710000012000, meta: { action: "paste" } },
      { type: "fullscreen_exit", timestamp: 1710000020000 },
      { type: "fullscreen_exit", timestamp: 1710000025000 },
      {
        type: "question_navigation",
        timestamp: 1710000015000,
        meta: { direction: "forward", fromIndex: 0, toIndex: 1 },
      },
    ];

    const result = calculateConsistencyScore(rawEvents, []);
    // 2 tab switches: (2 - 1) * 5 = 5
    // 2 clipboards: (2 - 1) * 8 = 8
    // 2 fullscreen exits: (2 - 1) * 10 = 10
    // Total deductions = 23 -> Score = 77
    expect(result.breakdown?.tabSwitches).toBe(5);
    expect(result.breakdown?.clipboard).toBe(8);
    expect(result.breakdown?.fullscreenExits).toBe(10);
    expect(result.score).toBe(77);
    expect(result.signals.some((s) => s.title.includes("Question forward (Q1 -> Q2)"))).toBe(true);
  });

  it("floors score at 0 and never returns a negative number", () => {
    const events: AssessmentEvent[] = [
      ...Array.from({ length: 15 }, (_, i) => ({
        id: `c-${i}`,
        attemptId: "att-1",
        type: "PASTE_ATTEMPT" as const,
        timestamp: `${i}:00`,
      })),
      ...Array.from({ length: 10 }, (_, i) => ({
        id: `f-${i}`,
        attemptId: "att-1",
        type: "FULLSCREEN_EXIT" as const,
        timestamp: `${i + 10}:00`,
      })),
    ];

    const result = calculateConsistencyScore(events, []);
    expect(result.score).toBe(0);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it("includes the mandatory non-accusatory disclaimer verbatim", () => {
    const result = calculateConsistencyScore([], []);
    expect(result.disclaimer).toBe(
      "These are assessment-behavior signals and should be considered alongside the candidate's result. They do not establish cheating."
    );
  });
});
