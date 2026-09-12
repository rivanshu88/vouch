import { describe, it, expect } from "vitest";
import { calculateConsistencyScore } from "@/lib/integrity/consistency";
import { AssessmentAnswer, AssessmentEvent } from "@/types";

describe("Assessment Integrity & Consistency Score Engine", () => {
  it("computes 100 focus score for optimal uninterrupted session", () => {
    const events: AssessmentEvent[] = [
      { id: "e1", attemptId: "att-1", type: "QUESTION_OPENED", timestamp: new Date().toISOString() },
    ];
    const answers: AssessmentAnswer[] = [
      { id: "a1", attemptId: "att-1", questionId: "q1", selectedOptionId: "opt-1", timeSpentMs: 12000, answerChangeCount: 0 },
      { id: "a2", attemptId: "att-1", questionId: "q2", selectedOptionId: "opt-2", timeSpentMs: 15000, answerChangeCount: 0 },
    ];

    const result = calculateConsistencyScore(events, answers);
    expect(result.score).toBe(100);
    expect(result.tabSwitches).toBe(0);
    expect(result.clipboardAttempts).toBe(0);
    expect(result.timingAnomalies).toBe(0);
    expect(result.disclaimer).toContain("These are assessment-behavior signals");
  });

  it("identifies focus departure events and deducts transparently", () => {
    const events: AssessmentEvent[] = [
      { id: "e1", attemptId: "att-1", type: "TAB_HIDDEN", timestamp: new Date().toISOString() },
      { id: "e2", attemptId: "att-1", type: "WINDOW_BLUR", timestamp: new Date().toISOString() },
      { id: "e3", attemptId: "att-1", type: "COPY_ATTEMPT", timestamp: new Date().toISOString() },
    ];
    const answers: AssessmentAnswer[] = [
      { id: "a1", attemptId: "att-1", questionId: "q1", selectedOptionId: "opt-1", timeSpentMs: 2000, answerChangeCount: 3 }, // < 4.5s timing anomaly
    ];

    const result = calculateConsistencyScore(events, answers);
    expect(result.tabSwitches).toBe(2);
    expect(result.clipboardAttempts).toBe(1);
    expect(result.timingAnomalies).toBe(1);
    expect(result.score).toBeLessThan(100);
    expect(result.signals.some((s) => s.title.includes("Clipboard"))).toBe(true);
  });
});
