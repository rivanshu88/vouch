import {
  Application,
  AssessmentAttempt,
  AssessmentEvent,
  CandidateProfile,
  CandidateSkill,
  Certificate,
  GitHubEvidence,
  InAppNotification,
  Project,
  RecruitmentDrive,
  Skill,
  Team,
  TeamJoinRequest,
  TeamVerificationTest,
} from "@/types";
import { INITIAL_SKILLS } from "@/config/design-system";

/**
 * In-Memory persistent state store for Vouch application.
 * Initialized with senior engineering seed data representing candidates,
 * verified claims, hackathon teams, and recruitment drives.
 */
class VouchStore {
  public skills: Skill[] = [...INITIAL_SKILLS];

  public profiles: CandidateProfile[] = [
    {
      id: "usr-01",
      fullName: "Arjun Verma",
      email: "arjun@vouch.tech",
      college: "Indian Institute of Technology, Bombay",
      branch: "Computer Science & Engineering",
      graduationYear: 2025,
      bio: "Systems and fullstack engineer focused on high-throughput distributed systems and React performance architecture.",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      githubUsername: "arjunv-code",
      role: "candidate",
      createdAt: "2024-01-15T10:00:00.000Z",
      updatedAt: "2024-03-10T12:00:00.000Z",
    },
    {
      id: "usr-02",
      fullName: "Rohan Kulkarni",
      email: "rohan@hackers.io",
      college: "BITS Pilani",
      branch: "Information Systems",
      graduationYear: 2025,
      bio: "Hackathon veteran and backend architect. Leading Team NeuralMesh for ETHGlobal.",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      githubUsername: "rohank-dev",
      role: "team_leader",
      createdAt: "2024-02-01T08:00:00.000Z",
      updatedAt: "2024-03-01T14:00:00.000Z",
    },
    {
      id: "usr-03",
      fullName: "Sneha Patel",
      email: "sneha.patel@stripe.com",
      college: "Stanford University",
      bio: "Technical Talent Partner hiring infrastructure and frontend systems engineers for Stripe.",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      role: "recruiter",
      createdAt: "2024-01-01T10:00:00.000Z",
      updatedAt: "2024-03-01T10:00:00.000Z",
    },
    {
      id: "usr-04",
      fullName: "Priya Sundaram",
      email: "priya@pes.edu",
      college: "PES University, Bengaluru",
      branch: "Data Science",
      graduationYear: 2026,
      bio: "Data structures enthusiast and Python backend developer.",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      githubUsername: "priyasun",
      role: "candidate",
      createdAt: "2024-02-10T09:00:00.000Z",
      updatedAt: "2024-03-12T11:00:00.000Z",
    },
  ];

  public candidateSkills: CandidateSkill[] = [
    {
      id: "cs-01",
      candidateId: "usr-01",
      skillId: "react",
      skillName: "React",
      declaredLevel: "advanced",
      verificationStatus: "verified",
      verificationScore: 92,
      verifiedAt: "2024-02-20T14:30:00.000Z",
    },
    {
      id: "cs-02",
      candidateId: "usr-01",
      skillId: "typescript",
      skillName: "TypeScript",
      declaredLevel: "advanced",
      verificationStatus: "verified",
      verificationScore: 88,
      verifiedAt: "2024-02-22T16:00:00.000Z",
    },
    {
      id: "cs-03",
      candidateId: "usr-01",
      skillId: "sql",
      skillName: "SQL",
      declaredLevel: "intermediate",
      verificationStatus: "verified",
      verificationScore: 80,
      verifiedAt: "2024-02-25T11:15:00.000Z",
    },
    {
      id: "cs-04",
      candidateId: "usr-01",
      skillId: "python",
      skillName: "Python",
      declaredLevel: "beginner",
      verificationStatus: "unverified",
    },
    {
      id: "cs-05",
      candidateId: "usr-04",
      skillId: "python",
      skillName: "Python",
      declaredLevel: "advanced",
      verificationStatus: "verified",
      verificationScore: 94,
      verifiedAt: "2024-03-01T15:00:00.000Z",
    },
    {
      id: "cs-06",
      candidateId: "usr-04",
      skillId: "sql",
      skillName: "SQL",
      declaredLevel: "intermediate",
      verificationStatus: "unverified",
    },
  ];

  public projects: Project[] = [
    {
      id: "prj-01",
      candidateId: "usr-01",
      title: "HyperQueue — Distributed Event Mesh",
      description: "Low-latency message broker capable of handling 50k events/sec with zero disk IO bottleneck, implementing Raft consensus in TypeScript.",
      technologies: ["TypeScript", "Node.js", "Redis", "Docker"],
      githubUrl: "https://github.com/arjunv-code/hyperqueue",
      projectUrl: "https://hyperqueue.dev",
      createdAt: "2024-01-20T10:00:00.000Z",
    },
    {
      id: "prj-02",
      candidateId: "usr-01",
      title: "FiberProfiler — React Render Inspector",
      description: "Chrome DevTools extension that visualizes component re-renders, hook dependency changes, and reconciler fiber updates in real-time.",
      technologies: ["React", "TypeScript", "WebExtensions API"],
      githubUrl: "https://github.com/arjunv-code/fiber-profiler",
      createdAt: "2024-02-05T12:00:00.000Z",
    },
  ];

  public certificates: Certificate[] = [
    {
      id: "cert-01",
      candidateId: "usr-01",
      title: "AWS Certified Developer — Associate",
      issuer: "Amazon Web Services",
      issueDate: "2023-11-15",
      credentialUrl: "https://aws.amazon.com/verification/mock-id-99812",
      createdAt: "2024-01-16T10:00:00.000Z",
    },
  ];

  public githubEvidence: Record<string, GitHubEvidence> = {
    "usr-01": {
      id: "gh-usr-01",
      candidateId: "usr-01",
      username: "arjunv-code",
      avatarUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
      publicReposCount: 22,
      totalStars: 147,
      topLanguages: [
        { language: "TypeScript", percentage: 58, bytes: 184000 },
        { language: "Rust", percentage: 24, bytes: 76000 },
        { language: "SQL", percentage: 18, bytes: 57000 },
      ],
      recentRepos: [
        {
          name: "hyperqueue",
          description: "Low-latency message broker implementing Raft consensus in TypeScript",
          stars: 84,
          forks: 12,
          languages: { TypeScript: 100 },
          primaryLanguage: "TypeScript",
          pushedAt: "2024-03-08T18:30:00.000Z",
          commitCountLastYear: 142,
          url: "https://github.com/arjunv-code/hyperqueue",
        },
        {
          name: "fiber-profiler",
          description: "Chrome DevTools extension that visualizes component re-renders",
          stars: 63,
          forks: 9,
          languages: { TypeScript: 100 },
          primaryLanguage: "TypeScript",
          pushedAt: "2024-03-02T11:20:00.000Z",
          commitCountLastYear: 88,
          url: "https://github.com/arjunv-code/fiber-profiler",
        },
      ],
      connectedAt: "2024-01-18T10:00:00.000Z",
      lastSyncedAt: "2024-03-12T09:00:00.000Z",
    },
  };

  public attempts: AssessmentAttempt[] = [
    {
      id: "att-001",
      candidateId: "usr-01",
      candidateName: "Arjun Verma",
      assessmentId: "asm-react",
      skillId: "react",
      skillName: "React",
      difficulty: "advanced",
      durationSeconds: 600,
      passingScore: 70,
      questions: [],
      startedAt: "2024-02-20T14:15:00.000Z",
      submittedAt: "2024-02-20T14:26:40.000Z",
      score: 92,
      passed: true,
      integrityScore: 95,
      status: "submitted",
      consistencyBreakdown: {
        score: 95,
        timingAnomalies: 0,
        tabSwitches: 1,
        clipboardAttempts: 0,
        answerChanges: 2,
        difficultyTimeCorrelation: "Normal",
        disclaimer:
          "These are assessment-behavior signals and should be considered alongside the candidate's result. They do not establish cheating.",
        signals: [
          {
            title: "Continuous Window Focus",
            description: "Candidate maintained uninterrupted focus with only 1 brief tab variation.",
            level: "positive",
          },
          {
            title: "Clean Clipboard Log",
            description: "No clipboard interactions detected during test.",
            level: "positive",
          },
        ],
      },
    },
  ];

  public attemptEvents: Record<string, AssessmentEvent[]> = {};

  public teams: Team[] = [
    {
      id: "tm-01",
      name: "NeuralMesh",
      hackathonName: "ETHGlobal London 2025",
      leaderId: "usr-02",
      leaderName: "Rohan Kulkarni",
      description: "Building an on-chain automated verifiable AI agent mesh for cross-rollup state settlement.",
      status: "open",
      maxMembers: 4,
      createdAt: "2024-02-15T10:00:00.000Z",
      members: [
        {
          id: "tmm-01",
          teamId: "tm-01",
          candidateId: "usr-02",
          candidateName: "Rohan Kulkarni",
          candidateAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
          role: "Team Leader / Smart Contracts",
          joinedAt: "2024-02-15T10:00:00.000Z",
          skills: [
            {
              id: "cs-rk-01",
              candidateId: "usr-02",
              skillId: "python",
              skillName: "Python",
              declaredLevel: "advanced",
              verificationStatus: "verified",
              verificationScore: 90,
            },
          ],
        },
      ],
      requirements: [
        {
          id: "req-01",
          teamId: "tm-01",
          skillId: "react",
          skillName: "React",
          role: "Frontend Lead",
          minimumLevel: "advanced",
          minimumScore: 80,
          required: true,
        },
        {
          id: "req-02",
          teamId: "tm-01",
          skillId: "typescript",
          skillName: "TypeScript",
          role: "Frontend Lead",
          minimumLevel: "intermediate",
          minimumScore: 75,
          required: true,
        },
        {
          id: "req-03",
          teamId: "tm-01",
          skillId: "sql",
          skillName: "SQL",
          role: "Data & Indexing",
          minimumLevel: "intermediate",
          minimumScore: 70,
          required: false,
        },
      ],
    },
    {
      id: "tm-02",
      name: "SentinelGuard",
      hackathonName: "HackWestern 11",
      leaderId: "usr-01",
      leaderName: "Arjun Verma",
      description: "Autonomous incident response agent using eBPF probes and streaming anomaly detection.",
      status: "open",
      maxMembers: 3,
      createdAt: "2024-02-28T14:00:00.000Z",
      members: [
        {
          id: "tmm-02",
          teamId: "tm-02",
          candidateId: "usr-01",
          candidateName: "Arjun Verma",
          candidateAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          role: "Fullstack Architecture",
          joinedAt: "2024-02-28T14:00:00.000Z",
          skills: [
            {
              id: "cs-01",
              candidateId: "usr-01",
              skillId: "react",
              skillName: "React",
              declaredLevel: "advanced",
              verificationStatus: "verified",
              verificationScore: 92,
            },
          ],
        },
      ],
      requirements: [
        {
          id: "req-04",
          teamId: "tm-02",
          skillId: "python",
          skillName: "Python",
          role: "Systems & ML",
          minimumLevel: "advanced",
          minimumScore: 85,
          required: true,
        },
      ],
    },
  ];

  public joinRequests: TeamJoinRequest[] = [
    {
      id: "tjr-01",
      teamId: "tm-01",
      teamName: "NeuralMesh",
      candidateId: "usr-01",
      candidateName: "Arjun Verma",
      candidateCollege: "IIT Bombay",
      status: "pending",
      createdAt: "2024-03-01T10:00:00.000Z",
    },
  ];

  public verificationTests: TeamVerificationTest[] = [
    {
      id: "tvt-01",
      teamId: "tm-01",
      teamName: "NeuralMesh",
      candidateId: "usr-01",
      candidateName: "Arjun Verma",
      skillId: "react",
      skillName: "React",
      difficulty: "advanced",
      requiredScore: 80,
      status: "completed",
      candidateScore: 92,
      integrityScore: 95,
      createdAt: "2024-03-01T11:00:00.000Z",
      completedAt: "2024-03-01T11:25:00.000Z",
      decisionReason: "Exceeded required React threshold (92% vs 80%) with excellent integrity metrics.",
    },
  ];

  public recruitmentDrives: RecruitmentDrive[] = [
    {
      id: "drv-01",
      companyId: "comp-stripe",
      companyName: "Stripe",
      title: "Software Engineer — Frontend Infrastructure",
      role: "Frontend Systems Engineer",
      location: "Bengaluru, India / Remote",
      type: "Full-Time",
      description: "Design and build core merchant dashboards, payment flow performance optimizations, and design system components at scale.",
      status: "open",
      applicantCount: 18,
      createdAt: "2024-02-10T10:00:00.000Z",
      requirements: [
        {
          id: "rreq-01",
          driveId: "drv-01",
          skillId: "react",
          skillName: "React",
          minimumLevel: "advanced",
          minimumScore: 80,
          required: true,
        },
        {
          id: "rreq-02",
          driveId: "drv-01",
          skillId: "typescript",
          skillName: "TypeScript",
          minimumLevel: "advanced",
          minimumScore: 80,
          required: true,
        },
        {
          id: "rreq-03",
          driveId: "drv-01",
          skillId: "sql",
          skillName: "SQL",
          minimumLevel: "intermediate",
          minimumScore: 70,
          required: false,
        },
      ],
    },
    {
      id: "drv-02",
      companyId: "comp-datadog",
      companyName: "Datadog",
      title: "Systems Backend Engineer — Metrics & Ingestion",
      role: "Backend Engineer",
      location: "Hyderabad, India",
      type: "Full-Time",
      description: "Build distributed data ingestion pipelines handling millions of points per second with Python and modern database architectures.",
      status: "open",
      applicantCount: 24,
      createdAt: "2024-02-18T12:00:00.000Z",
      requirements: [
        {
          id: "rreq-04",
          driveId: "drv-02",
          skillId: "python",
          skillName: "Python",
          minimumLevel: "advanced",
          minimumScore: 85,
          required: true,
        },
        {
          id: "rreq-05",
          driveId: "drv-02",
          skillId: "sql",
          skillName: "SQL",
          minimumLevel: "intermediate",
          minimumScore: 75,
          required: true,
        },
      ],
    },
  ];

  public applications: Application[] = [
    {
      id: "app-01",
      driveId: "drv-01",
      driveTitle: "Software Engineer — Frontend Infrastructure",
      companyName: "Stripe",
      candidateId: "usr-01",
      candidateName: "Arjun Verma",
      candidateCollege: "IIT Bombay",
      matchScore: 94,
      status: "shortlisted",
      createdAt: "2024-02-25T10:00:00.000Z",
      updatedAt: "2024-03-01T15:00:00.000Z",
    },
  ];

  public notifications: InAppNotification[] = [
    {
      id: "notif-01",
      userId: "usr-01",
      title: "Team Verification Cleared",
      message: "NeuralMesh approved your verification test with 92% score.",
      type: "test_completed",
      link: "/teams",
      read: false,
      createdAt: "2024-03-01T11:30:00.000Z",
    },
    {
      id: "notif-02",
      userId: "usr-01",
      title: "Application Shortlisted",
      message: "Stripe shortlisted your application for Frontend Systems Engineer.",
      type: "application_update",
      link: "/recruitment",
      read: false,
      createdAt: "2024-03-01T15:05:00.000Z",
    },
  ];

  // ==========================================
  // Helper methods
  // ==========================================

  public getProfile(id: string): CandidateProfile | undefined {
    return this.profiles.find((p) => p.id === id);
  }

  public getCandidateSkills(candidateId: string): CandidateSkill[] {
    return this.candidateSkills.filter((cs) => cs.candidateId === candidateId);
  }

  public getCandidateProjects(candidateId: string): Project[] {
    return this.projects.filter((p) => p.candidateId === candidateId);
  }

  public getCandidateCertificates(candidateId: string): Certificate[] {
    return this.certificates.filter((c) => c.candidateId === candidateId);
  }

  public getGitHubEvidence(candidateId: string): GitHubEvidence | undefined {
    return this.githubEvidence[candidateId];
  }

  public calculateEvidenceStrengthScore(candidateId: string) {
    const skills = this.getCandidateSkills(candidateId);
    const projects = this.getCandidateProjects(candidateId);
    const certs = this.getCandidateCertificates(candidateId);
    const gh = this.getGitHubEvidence(candidateId);

    // 1. Assessment score component
    const verifiedSkills = skills.filter((s) => s.verificationStatus === "verified");
    const avgAssessmentScore =
      verifiedSkills.length > 0
        ? Math.round(
            verifiedSkills.reduce((acc, s) => acc + (s.verificationScore || 70), 0) /
              verifiedSkills.length
          )
        : 0;

    // 2. GitHub score component
    const ghScore = gh
      ? Math.min(100, Math.round(gh.totalStars * 0.4 + gh.publicReposCount * 2 + 50))
      : 0;

    // 3. Projects score
    const projScore = Math.min(100, projects.length * 40);

    // 4. Certificates score
    const certScore = Math.min(100, certs.length * 35);

    // Weighted composite score (Assessment carries highest weight)
    const composite = Math.round(
      avgAssessmentScore * 0.45 + ghScore * 0.25 + projScore * 0.2 + certScore * 0.1
    );

    const explanation = [
      `Assessment Signal: ${avgAssessmentScore}/100 (${verifiedSkills.length} verified skill tests)`,
      `GitHub Technical Signal: ${ghScore}/100 (${gh?.publicReposCount || 0} repos, ${gh?.totalStars || 0} stars)`,
      `Verified Projects: ${projScore}/100 (${projects.length} repository-backed artifacts)`,
      `Certifications: ${certScore}/100 (${certs.length} verified credentials)`,
    ];

    return {
      compositeScore: composite,
      assessmentScore: avgAssessmentScore,
      githubScore: ghScore,
      projectsScore: projScore,
      certificatesScore: certScore,
      explanation,
    };
  }
}

// Global singleton instance
const globalForStore = globalThis as unknown as { vouchStore: VouchStore };
export const db = globalForStore.vouchStore || new VouchStore();
if (process.env.NODE_ENV !== "production") globalForStore.vouchStore = db;
