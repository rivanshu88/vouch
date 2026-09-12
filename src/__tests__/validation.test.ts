import { describe, it, expect } from "vitest";
import {
  GenerateAssessmentSchema,
  SubmitAnswerSchema,
  CreateTeamSchema,
  AssessmentEventSchema,
} from "@/lib/validation/schemas";

describe("API Boundary Validation Schemas", () => {
  it("validates assessment generation parameters", () => {
    const valid = GenerateAssessmentSchema.safeParse({
      skillId: "react",
      difficulty: "advanced",
      questionCount: 5,
    });
    expect(valid.success).toBe(true);

    const invalid = GenerateAssessmentSchema.safeParse({
      skillId: "",
      difficulty: "master", // not a valid enum
    });
    expect(invalid.success).toBe(false);
  });

  it("validates integrity event types strictly", () => {
    const valid = AssessmentEventSchema.safeParse({
      type: "TAB_HIDDEN",
      timestamp: new Date().toISOString(),
    });
    expect(valid.success).toBe(true);

    const invalid = AssessmentEventSchema.safeParse({
      type: "RANDOM_UNRECOGNIZED_EVENT",
      timestamp: new Date().toISOString(),
    });
    expect(invalid.success).toBe(false);
  });

  it("validates team creation requirements", () => {
    const valid = CreateTeamSchema.safeParse({
      name: "NeuralMesh",
      hackathonName: "ETHGlobal",
      requirements: [
        { skillId: "react", minimumLevel: "intermediate", minimumScore: 75, required: true },
      ],
    });
    expect(valid.success).toBe(true);
  });
});
