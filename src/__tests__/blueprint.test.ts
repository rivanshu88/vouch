import { describe, it, expect } from "vitest";
import { generateAssessmentQuestions, sanitizeQuestion } from "@/lib/assessments/blueprint";
import { Question } from "@/types";

describe("Assessment Blueprint & Question Sanitization", () => {
  it("generates the requested number of questions across topic pools", () => {
    const { questions, rawQuestions } = generateAssessmentQuestions({
      skillId: "javascript",
      difficulty: "intermediate",
      questionCount: 4,
    });

    expect(questions).toHaveLength(4);
    expect(rawQuestions).toHaveLength(4);
  });

  it("CRITICAL: completely strips correctOptionId from questions sent to the client", () => {
    const mockQuestion: Question = {
      id: "test-01",
      skillId: "react",
      topic: "Hooks",
      difficulty: "intermediate",
      questionText: "What is useState?",
      options: [
        { id: "opt-1", text: "Hook for state" },
        { id: "opt-2", text: "Compiler tool" },
      ],
      correctOptionId: "opt-1",
      explanation: "Secret internal explanation",
      active: true,
    };

    const sanitized: any = sanitizeQuestion(mockQuestion);

    expect(sanitized.id).toBe("test-01");
    expect(sanitized.questionText).toBe("What is useState?");
    expect(sanitized.options).toHaveLength(2);

    // Absolute security check: correctOptionId and explanation must NOT exist on sanitized question
    expect(sanitized.correctOptionId).toBeUndefined();
    expect(sanitized.explanation).toBeUndefined();
  });
});
