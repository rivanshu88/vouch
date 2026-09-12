import { describe, it, expect } from "vitest";
import { evaluateAssessment } from "@/lib/assessments/scoring";
import { QUESTION_BANK } from "@/lib/assessments/questions";
import { AssessmentAnswer } from "@/types";

describe("Server-Side Assessment Scoring Engine", () => {
  it("accurately computes 100% score when all questions are correct and marks as passed", () => {
    const q1 = QUESTION_BANK[0];
    const q2 = QUESTION_BANK[1];

    const answers: AssessmentAnswer[] = [
      { id: "a1", attemptId: "att-1", questionId: q1.id, selectedOptionId: q1.correctOptionId, timeSpentMs: 10000, answerChangeCount: 0 },
      { id: "a2", attemptId: "att-1", questionId: q2.id, selectedOptionId: q2.correctOptionId, timeSpentMs: 12000, answerChangeCount: 0 },
    ];

    const result = evaluateAssessment(answers, 70);
    expect(result.score).toBe(100);
    expect(result.correctCount).toBe(2);
    expect(result.totalQuestions).toBe(2);
    expect(result.passed).toBe(true);
    expect(result.detailedAnswers[0].isCorrect).toBe(true);
    expect(result.detailedAnswers[0].explanation).toBeDefined();
  });

  it("marks assessment as failed if score does not meet passingScore threshold", () => {
    const q1 = QUESTION_BANK[0];
    const q2 = QUESTION_BANK[1];

    const answers: AssessmentAnswer[] = [
      { id: "a1", attemptId: "att-1", questionId: q1.id, selectedOptionId: "wrong-option", timeSpentMs: 10000, answerChangeCount: 0 },
      { id: "a2", attemptId: "att-1", questionId: q2.id, selectedOptionId: "wrong-option", timeSpentMs: 12000, answerChangeCount: 0 },
    ];

    const result = evaluateAssessment(answers, 70);
    expect(result.score).toBe(0);
    expect(result.passed).toBe(false);
  });
});
