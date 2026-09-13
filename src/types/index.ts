export type SkillLevel = "beginner" | "intermediate" | "advanced";

export type UserRole = "candidate" | "team_leader" | "recruiter";

export interface CandidateRegistration {
  email: string;
  password?: string;
  fullName: string;
  college: string;
  branch?: string;
  graduationYear?: number;
  role?: UserRole;
}

export interface CandidateProfile {
  id: string;
  fullName: string;
  email: string;
  college: string;
  branch?: string;
  graduationYear?: number;
  bio?: string;
  avatarUrl?: string;
  githubUsername?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category: "frontend" | "backend" | "database" | "languages" | "devops";
  description?: string;
}

export interface CandidateSkill {
  id: string;
  candidateId: string;
  skillId: string;
  skillName?: string;
  declaredLevel: SkillLevel;
  verificationStatus: "unverified" | "verified";
  verificationScore?: number;
  verifiedAt?: string;
}

export interface Project {
  id: string;
  candidateId: string;
  title: string;
  description: string;
  technologies: string[];
  projectUrl?: string;
  githubUrl?: string;
  createdAt: string;
}

export interface Certificate {
  id: string;
  candidateId: string;
  title: string;
  issuer: string;
  issueDate?: string;
  credentialUrl?: string;
  filePath?: string;
  createdAt: string;
}

export interface GitHubRepoEvidence {
  name: string;
  description?: string;
  stars: number;
  forks: number;
  languages: Record<string, number>;
  primaryLanguage: string;
  pushedAt: string;
  commitCountLastYear: number;
  url: string;
}

export interface GitHubEvidence {
  id: string;
  candidateId: string;
  username: string;
  avatarUrl: string;
  publicReposCount: number;
  totalStars: number;
  topLanguages: { language: string; percentage: number; bytes: number }[];
  recentRepos: GitHubRepoEvidence[];
  connectedAt: string;
  lastSyncedAt: string;
}

export interface AssessmentBlueprintItem {
  topic: string;
  difficulty: SkillLevel;
  questionCount: number;
}

export interface AssessmentBlueprint {
  skillId: string;
  difficulty: SkillLevel;
  topics: { topic: string; count: number }[];
  totalQuestions: number;
  durationSeconds: number;
  passingScore: number;
}

export interface Assessment {
  id: string;
  skillId: string;
  skillName: string;
  difficulty: SkillLevel;
  durationSeconds: number;
  questionCount: number;
  passingScore: number;
  createdAt: string;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  skillId: string;
  topic: string;
  difficulty: SkillLevel;
  questionText: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation?: string;
  active: boolean;
}

/** Sanitized question returned to browser (NEVER includes correctOptionId) */
export interface SanitizedQuestion {
  id: string;
  skillId: string;
  topic: string;
  difficulty: SkillLevel;
  questionText: string;
  options: QuestionOption[];
}

export interface AssessmentAttempt {
  id: string;
  candidateId: string;
  candidateName?: string;
  assessmentId: string;
  skillId: string;
  skillName: string;
  difficulty: SkillLevel;
  durationSeconds: number;
  passingScore: number;
  questions: SanitizedQuestion[];
  startedAt: string;
  submittedAt?: string;
  score?: number;
  passed?: boolean;
  integrityScore?: number;
  consistencyBreakdown?: ConsistencyBreakdown;
  rawEvents?: (RawIntegrityEvent | AssessmentEvent)[];
  status: "in_progress" | "submitted" | "expired";
}

export interface AssessmentAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  selectedOptionId?: string;
  isCorrect?: boolean;
  timeSpentMs: number;
  answerChangeCount: number;
}

export type AssessmentEventType =
  | "TAB_HIDDEN"
  | "TAB_VISIBLE"
  | "WINDOW_BLUR"
  | "WINDOW_FOCUS"
  | "COPY_ATTEMPT"
  | "PASTE_ATTEMPT"
  | "CUT_ATTEMPT"
  | "FULLSCREEN_EXIT"
  | "ANSWER_CHANGED"
  | "QUESTION_OPENED"
  | "QUESTION_SUBMITTED";

export interface AssessmentEvent {
  id: string;
  attemptId: string;
  questionId?: string;
  type: AssessmentEventType;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export type RawIntegrityEventType =
  | "tab_switch"
  | "window_blur"
  | "clipboard"
  | "fullscreen_exit"
  | "question_navigation"
  | "answer_revision"
  | "presence_signal";

export interface RawIntegrityEvent {
  type: RawIntegrityEventType;
  timestamp: number; // epoch ms
  questionId?: string;
  meta?: Record<string, unknown>;
}

export interface ConsistencyCategoryDeductions {
  tabSwitches: number;
  clipboard: number;
  fullscreenExits: number;
  timingAnomalies: number;
  excessiveRevisions: number;
  timingMismatch?: number;
}

export interface BehavioralSignal {
  title: string;
  description: string;
  level: "positive" | "neutral" | "warning";
  timestamp?: string;
  pointsDeducted?: number;
}

export interface ConsistencyBreakdown {
  score: number; // 0 - 100
  timingAnomalies: number;
  tabSwitches: number;
  clipboardAttempts: number;
  fullscreenExits?: number;
  excessiveRevisions?: number;
  timingMismatch?: number;
  answerChanges: number;
  difficultyTimeCorrelation: "Normal" | "Unusual" | "Uniform";
  disclaimer: string;
  breakdown?: ConsistencyCategoryDeductions;
  deductions?: ConsistencyCategoryDeductions;
  signals: BehavioralSignal[];
}

export interface EvidenceStrengthBreakdown {
  compositeScore: number; // 0 - 100
  assessmentScore: number; // 0 - 100
  githubScore: number; // 0 - 100
  projectsScore: number; // 0 - 100
  certificatesScore: number; // 0 - 100
  explanation: string[];
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  hackathonName: string;
  leaderId: string;
  leaderName: string;
  status: "open" | "full" | "closed";
  maxMembers?: number;
  createdAt: string;
  members?: TeamMember[];
  requirements?: TeamRequirement[];
}

export interface TeamMember {
  id: string;
  teamId: string;
  candidateId: string;
  candidateName: string;
  candidateAvatar?: string;
  role: string;
  joinedAt: string;
  skills: CandidateSkill[];
}

export interface TeamRequirement {
  id: string;
  teamId: string;
  skillId: string;
  skillName?: string;
  role?: string;
  minimumLevel: SkillLevel;
  minimumScore?: number;
  required: boolean;
}

export interface TeamJoinRequest {
  id: string;
  teamId: string;
  teamName?: string;
  candidateId: string;
  candidateName?: string;
  candidateCollege?: string;
  candidateSkills?: CandidateSkill[];
  message?: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  resolvedAt?: string;
}

export interface TeamVerificationTest {
  id: string;
  teamId: string;
  teamName: string;
  candidateId: string;
  candidateName: string;
  skillId: string;
  skillName: string;
  difficulty: SkillLevel;
  requiredScore: number;
  assessmentAttemptId?: string;
  status: "invited" | "started" | "completed" | "accepted" | "rejected";
  candidateScore?: number;
  integrityScore?: number;
  decisionReason?: string;
  createdAt: string;
  completedAt?: string;
}

export interface CandidateMatch {
  candidateId: string;
  candidateName: string;
  college: string;
  avatarUrl?: string;
  matchScore: number;
  matchedSkills: {
    skillId: string;
    skillName: string;
    verified: boolean;
    level: SkillLevel;
    score?: number;
  }[];
  missingRequirements: string[];
  explanation: string[];
  fillsTeamGaps: string[];
}

export interface RecruitmentDrive {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  role: string;
  location: string;
  type: "Full-Time" | "Internship";
  description?: string;
  status: "draft" | "open" | "closed";
  requirements: RecruitmentRequirement[];
  applicantCount: number;
  createdAt: string;
}

export interface RecruitmentRequirement {
  id: string;
  driveId: string;
  skillId: string;
  skillName: string;
  minimumLevel: SkillLevel;
  minimumScore?: number;
  required: boolean;
}

export interface Application {
  id: string;
  driveId: string;
  driveTitle?: string;
  companyName?: string;
  candidateId: string;
  candidateName?: string;
  candidateCollege?: string;
  candidateSkills?: CandidateSkill[];
  matchScore?: number;
  status: "applied" | "eligible" | "shortlisted" | "interview" | "selected" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "team_invite" | "test_ready" | "test_completed" | "application_update" | "skill_verified";
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
