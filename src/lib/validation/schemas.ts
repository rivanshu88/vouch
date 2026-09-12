import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  college: z.string().min(2, "College name is required"),
  branch: z.string().optional(),
  graduationYear: z.number().int().min(2020).max(2035).optional(),
  role: z.enum(["candidate", "team_leader", "recruiter"]).default("candidate"),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const ProfileUpdateSchema = z.object({
  fullName: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  college: z.string().min(2).optional(),
  branch: z.string().optional(),
  graduationYear: z.number().int().min(2020).max(2035).optional(),
  githubUsername: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

export const AddSkillSchema = z.object({
  skillId: z.string().min(1),
  declaredLevel: z.enum(["beginner", "intermediate", "advanced"]),
});

export const AddProjectSchema = z.object({
  title: z.string().min(2, "Project title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  technologies: z.array(z.string()).min(1, "Specify at least one technology"),
  projectUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
});

export const AddCertificateSchema = z.object({
  title: z.string().min(2, "Certificate title is required"),
  issuer: z.string().min(2, "Issuer is required"),
  issueDate: z.string().optional(),
  credentialUrl: z.string().url().optional().or(z.literal("")),
});

export const GenerateAssessmentSchema = z.object({
  skillId: z.string().min(1),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  questionCount: z.number().int().min(3).max(20).default(5),
});

export const SubmitAnswerSchema = z.object({
  questionId: z.string().min(1),
  selectedOptionId: z.string().min(1),
  timeSpentMs: z.number().int().nonnegative(),
  answerChangeCount: z.number().int().nonnegative().default(0),
});

export const AssessmentEventSchema = z.object({
  type: z.enum([
    "TAB_HIDDEN",
    "TAB_VISIBLE",
    "WINDOW_BLUR",
    "WINDOW_FOCUS",
    "COPY_ATTEMPT",
    "PASTE_ATTEMPT",
    "CUT_ATTEMPT",
    "FULLSCREEN_EXIT",
    "ANSWER_CHANGED",
    "QUESTION_OPENED",
    "QUESTION_SUBMITTED",
  ]),
  timestamp: z.string(),
  questionId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const CreateTeamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters"),
  hackathonName: z.string().min(2, "Hackathon name is required"),
  description: z.string().max(400).optional(),
  requirements: z
    .array(
      z.object({
        skillId: z.string(),
        role: z.string().optional(),
        minimumLevel: z.enum(["beginner", "intermediate", "advanced"]),
        minimumScore: z.number().min(0).max(100).default(70),
        required: z.boolean().default(true),
      })
    )
    .min(1, "At least one skill requirement is required"),
});

export const CreateVerificationRequestSchema = z.object({
  candidateId: z.string().min(1),
  skillId: z.string().min(1),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  requiredScore: z.number().min(50).max(100).default(75),
});

export const VerificationDecisionSchema = z.object({
  decision: z.enum(["accepted", "rejected"]),
  reason: z.string().max(300).optional(),
});

export const CreateRecruitmentDriveSchema = z.object({
  companyName: z.string().min(2),
  title: z.string().min(2),
  role: z.string().min(2),
  location: z.string().min(2),
  type: z.enum(["Full-Time", "Internship"]).default("Full-Time"),
  description: z.string().optional(),
  requirements: z.array(
    z.object({
      skillId: z.string(),
      minimumLevel: z.enum(["beginner", "intermediate", "advanced"]),
      minimumScore: z.number().default(70),
      required: z.boolean().default(true),
    })
  ),
});
