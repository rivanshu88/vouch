import { AssessmentAnswer, Question } from "@/types";
import { QUESTION_BANK } from "./questions";

export interface ScoreCalculationResult {
  score: number; // 0 - 100 percentage
  totalQuestions: number;
  correctCount: number;
  passed: boolean;
  passingScore: number;
  detailedAnswers: {
    questionId: string;
    topic: string;
    difficulty: string;
    questionText: string;
    selectedOptionId?: string;
    correctOptionId: string;
    isCorrect: boolean;
    explanation?: string;
    timeSpentMs: number;
    answerChangeCount: number;
  }[];
}

export function evaluateAssessment(
  submittedAnswers: AssessmentAnswer[],
  passingScore: number = 70
): ScoreCalculationResult {
  let correctCount = 0;
  const detailedAnswers = submittedAnswers.map((ans) => {
    const original = QUESTION_BANK.find((q) => q.id === ans.questionId);
    const isCorrect = original ? original.correctOptionId === ans.selectedOptionId : false;

    if (isCorrect) {
      correctCount++;
    }

    return {
      questionId: ans.questionId,
      topic: original?.topic || "General",
      difficulty: original?.difficulty || "intermediate",
      questionText: original?.questionText || "",
      selectedOptionId: ans.selectedOptionId,
      correctOptionId: original?.correctOptionId || "",
      isCorrect,
      explanation: original?.explanation,
      timeSpentMs: ans.timeSpentMs,
      answerChangeCount: ans.answerChangeCount,
    };
  });

  const totalQuestions = Math.max(submittedAnswers.length, 1);
  const score = Math.round((correctCount / totalQuestions) * 100);
  const passed = score >= passingScore;

  return {
    score,
    totalQuestions,
    correctCount,
    passed,
    passingScore,
    detailedAnswers,
  };
}
