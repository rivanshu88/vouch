/**
 * VOUCH Database Seeder
 * Populates realistic demo dataset:
 * - Hackathon teams with skill requirements and intentional gaps
 * - Active campus recruitment drives with tiered benchmark requirements
 * - Verified & unverified skill evidence for demo personas (Arjun, Rohan, Sneha, Priya)
 *
 * SAFETY GUARD:
 * To prevent accidental modification of production Supabase data,
 * execution against a live Supabase instance requires CONFIRM_LIVE_SEED=true.
 */

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

// Load .env.local if present
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [key, ...rest] = trimmed.split("=");
        const value = rest.join("=").replace(/^["']|["']$/g, "");
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
} catch {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const isLiveSupabase =
  supabaseUrl &&
  supabaseUrl !== "https://placeholder-project.supabase.co" &&
  !supabaseUrl.includes("localhost") &&
  !supabaseUrl.includes("127.0.0.1");

async function runSeed() {
  console.log("=========================================");
  console.log("🌱 VOUCH Database Seeder");
  console.log("Target:", supabaseUrl);
  console.log("=========================================");

  if (isLiveSupabase && process.env.CONFIRM_LIVE_SEED !== "true") {
    console.warn("\n⚠️  SAFETY WARNING: Remote Supabase database detected!");
    console.warn("Target URL:", supabaseUrl);
    console.warn("To run this seed script against your live Supabase project, execute:");
    console.warn("  $env:CONFIRM_LIVE_SEED=\"true\"; npm run seed  (PowerShell)");
    console.warn("  CONFIRM_LIVE_SEED=true npm run seed            (Bash)");
    console.warn("\nAborting seed to protect remote data as instructed.\n");
    process.exit(0);
  }

  if (!supabaseServiceKey) {
    console.error("❌ SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing in .env.local");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log("Connected to Supabase. Inserting demo personas, teams, and drives...");

  // 1. Demo Personas
  const profiles = [
    {
      id: "00000000-0000-0000-0000-000000000001",
      full_name: "Arjun Verma",
      email: "arjun@vouch.tech",
      college: "Indian Institute of Technology, Bombay",
      branch: "Computer Science & Engineering",
      graduation_year: 2025,
      bio: "Systems and fullstack engineer focused on high-throughput distributed systems and React performance architecture.",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      github_username: "arjunv-code",
      role: "candidate",
    },
    {
      id: "00000000-0000-0000-0000-000000000002",
      full_name: "Rohan Kulkarni",
      email: "rohan@hackers.io",
      college: "BITS Pilani",
      branch: "Information Systems",
      graduation_year: 2025,
      bio: "Hackathon veteran and backend architect. Leading Team NeuralMesh for ETHGlobal.",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      github_username: "rohank-dev",
      role: "team_leader",
    },
    {
      id: "00000000-0000-0000-0000-000000000003",
      full_name: "Sneha Patel",
      email: "sneha.patel@stripe.com",
      college: "Stanford University",
      bio: "Technical Talent Partner hiring infrastructure and frontend systems engineers for Stripe.",
      avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
      role: "recruiter",
    },
    {
      id: "00000000-0000-0000-0000-000000000004",
      full_name: "Priya Sundaram",
      email: "priya@pes.edu",
      college: "PES University, Bengaluru",
      branch: "Data Science",
      graduation_year: 2026,
      bio: "Data structures enthusiast and Python backend developer.",
      avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      github_username: "priyasun",
      role: "candidate",
    },
  ];

  for (const prof of profiles) {
    const { error } = await (supabase as any).from("profiles").upsert(prof, { onConflict: "email" });
    if (error) console.warn(`Profile upsert (${prof.full_name}):`, error.message);
  }

  // 2. Skills Taxonomy
  const skills = [
    { id: "react", name: "React", category: "frontend", description: "Modern React architecture, hooks, concurrent features, and fiber reconciler" },
    { id: "typescript", name: "TypeScript", category: "languages", description: "Advanced type gymnastics, generics, type-narrowing, and sound system design" },
    { id: "python", name: "Python", category: "backend", description: "AsyncIO, data manipulation, FastAPI, and algorithm optimization" },
    { id: "sql", name: "SQL", category: "database", description: "Query optimization, indexing strategies, normalization, and window functions" },
    { id: "solidity", name: "Solidity", category: "languages", description: "Smart contracts, EVM execution, ERC standards, and gas optimization" },
    { id: "pytorch", name: "PyTorch", category: "backend", description: "Tensor operations, neural architectures, training loops, and inference" },
    { id: "go", name: "Go", category: "languages", description: "Concurrency primitives, channels, goroutines, and high-throughput networking" },
    { id: "docker", name: "Docker", category: "devops", description: "Multi-stage container builds, orchestration, and volume networking" },
    { id: "linux", name: "Linux", category: "devops", description: "POSIX system calls, eBPF telemetry, shell automation, and performance tuning" },
    { id: "rust", name: "Rust", category: "languages", description: "Borrow checker, lifetimes, fearless concurrency, and zero-cost abstractions" },
  ];

  for (const skill of skills) {
    const { error } = await (supabase as any).from("skills").upsert(skill, { onConflict: "id" });
    if (error) console.warn(`Skill upsert (${skill.id}):`, error.message);
  }

  // 3. Candidate Skills
  const candidateSkills = [
    // Arjun Verma: verified in React (88%), TS (82%), unverified in Rust & Docker
    { candidate_id: "00000000-0000-0000-0000-000000000001", skill_id: "react", declared_level: "advanced", verification_status: "verified", verification_score: 88, verified_at: new Date().toISOString() },
    { candidate_id: "00000000-0000-0000-0000-000000000001", skill_id: "typescript", declared_level: "advanced", verification_status: "verified", verification_score: 82, verified_at: new Date().toISOString() },
    { candidate_id: "00000000-0000-0000-0000-000000000001", skill_id: "rust", declared_level: "intermediate", verification_status: "unverified", verification_score: null, verified_at: null },
    { candidate_id: "00000000-0000-0000-0000-000000000001", skill_id: "docker", declared_level: "intermediate", verification_status: "unverified", verification_score: null, verified_at: null },
    // Priya Sundaram: verified in Python (84%), SQL (78%)
    { candidate_id: "00000000-0000-0000-0000-000000000004", skill_id: "python", declared_level: "advanced", verification_status: "verified", verification_score: 84, verified_at: new Date().toISOString() },
    { candidate_id: "00000000-0000-0000-0000-000000000004", skill_id: "sql", declared_level: "intermediate", verification_status: "verified", verification_score: 78, verified_at: new Date().toISOString() },
    // Rohan Kulkarni: verified in Python (90%), SQL (82%)
    { candidate_id: "00000000-0000-0000-0000-000000000002", skill_id: "python", declared_level: "advanced", verification_status: "verified", verification_score: 90, verified_at: new Date().toISOString() },
    { candidate_id: "00000000-0000-0000-0000-000000000002", skill_id: "sql", declared_level: "intermediate", verification_status: "verified", verification_score: 82, verified_at: new Date().toISOString() },
  ];

  for (const cs of candidateSkills) {
    const { error } = await (supabase as any).from("candidate_skills").upsert(cs, { onConflict: "candidate_id,skill_id" });
    if (error) console.warn(`Candidate skill upsert:`, error.message);
  }

  // 4. Teams with intentional gaps
  const teams = [
    {
      id: "10000000-0000-0000-0000-000000000001",
      name: "NeuralMesh",
      description: "Decentralized AI inference network running verifiable neural execution environments.",
      hackathon_name: "ETHGlobal New York",
      leader_id: "00000000-0000-0000-0000-000000000002",
      status: "open",
      max_members: 4,
    },
    {
      id: "10000000-0000-0000-0000-000000000002",
      name: "SentinelGuard",
      description: "Autonomous incident response agent using eBPF probes and streaming anomaly detection.",
      hackathon_name: "HackMIT 2024",
      leader_id: "00000000-0000-0000-0000-000000000001",
      status: "open",
      max_members: 3,
    },
    {
      id: "10000000-0000-0000-0000-000000000003",
      name: "OmniChain Labs",
      description: "Decentralized automated oracle network verifying cross-chain data feeds with cryptographic proofs.",
      hackathon_name: "PennApps XXV",
      leader_id: "00000000-0000-0000-0000-000000000004",
      status: "open",
      max_members: 4,
    },
  ];

  for (const team of teams) {
    const { error } = await (supabase as any).from("teams").upsert(team, { onConflict: "id" });
    if (error) console.warn(`Team upsert (${team.name}):`, error.message);
  }

  // 5. Team Requirements (Intentional gaps)
  const teamRequirements = [
    // Team 1: Needs Solidity/Smart Contracts (gap!)
    { team_id: "10000000-0000-0000-0000-000000000001", skill_id: "solidity", role: "Smart Contracts Architect", minimum_level: "advanced", minimum_score: 80, required: true },
    { team_id: "10000000-0000-0000-0000-000000000001", skill_id: "typescript", role: "Web3 Fullstack", minimum_level: "intermediate", minimum_score: 75, required: true },
    // Team 2: Needs ML/PyTorch (gap!)
    { team_id: "10000000-0000-0000-0000-000000000002", skill_id: "pytorch", role: "ML / Anomaly Detection", minimum_level: "advanced", minimum_score: 80, required: true },
    { team_id: "10000000-0000-0000-0000-000000000002", skill_id: "python", role: "Backend Systems", minimum_level: "intermediate", minimum_score: 70, required: false },
    // Team 3: Needs Frontend Lead React/Next.js (gap!)
    { team_id: "10000000-0000-0000-0000-000000000003", skill_id: "react", role: "Frontend Lead", minimum_level: "advanced", minimum_score: 75, required: true },
    { team_id: "10000000-0000-0000-0000-000000000003", skill_id: "sql", role: "Database Lead", minimum_level: "intermediate", minimum_score: 65, required: true },
  ];

  for (const tr of teamRequirements) {
    const { error } = await (supabase as any).from("team_requirements").upsert(tr);
    if (error) console.warn(`Team requirement upsert:`, error.message);
  }

  // 6. Recruitment Drives
  const recruitmentDrives = [
    {
      id: "20000000-0000-0000-0000-000000000001",
      company_name: "Stripe",
      title: "Software Engineer — Frontend Infrastructure",
      role: "Frontend Systems Engineer",
      location: "Bengaluru, India / Remote",
      type: "Full-Time",
      description: "Design and build core merchant dashboards, payment flow performance optimizations, and design system components at scale.",
      status: "open",
    },
    {
      id: "20000000-0000-0000-0000-000000000002",
      company_name: "Datadog",
      title: "Systems Engineer — Distributed Telemetry & Ingestion",
      role: "Systems / Distributed Engineer",
      location: "Hyderabad, India / Hybrid",
      type: "Full-Time",
      description: "Build distributed data ingestion pipelines handling millions of telemetry data points per second with Go, Docker containers, and Linux kernels.",
      status: "open",
    },
  ];

  for (const rd of recruitmentDrives) {
    const { error } = await (supabase as any).from("recruitment_drives").upsert(rd, { onConflict: "id" });
    if (error) console.warn(`Recruitment drive upsert (${rd.company_name}):`, error.message);
  }

  // 7. Recruitment Requirements
  const recruitmentRequirements = [
    // Stripe: React >= 75%, TS >= 70%, SQL >= 65%
    { drive_id: "20000000-0000-0000-0000-000000000001", skill_id: "react", minimum_level: "advanced", minimum_score: 75, required: true },
    { drive_id: "20000000-0000-0000-0000-000000000001", skill_id: "typescript", minimum_level: "intermediate", minimum_score: 70, required: true },
    { drive_id: "20000000-0000-0000-0000-000000000001", skill_id: "sql", minimum_level: "intermediate", minimum_score: 65, required: true },
    // Datadog: Go >= 80%, Docker >= 75%, Linux >= 70%
    { drive_id: "20000000-0000-0000-0000-000000000002", skill_id: "go", minimum_level: "advanced", minimum_score: 80, required: true },
    { drive_id: "20000000-0000-0000-0000-000000000002", skill_id: "docker", minimum_level: "intermediate", minimum_score: 75, required: true },
    { drive_id: "20000000-0000-0000-0000-000000000002", skill_id: "linux", minimum_level: "intermediate", minimum_score: 70, required: true },
  ];

  for (const rr of recruitmentRequirements) {
    const { error } = await (supabase as any).from("recruitment_requirements").upsert(rr);
    if (error) console.warn(`Recruitment requirement upsert:`, error.message);
  }

  console.log("✅ Skills, Profiles, Teams, and Drives seeded successfully.");
  console.log("Demo seed complete!");
}

runSeed().catch((err) => {
  console.error("Seeder error:", err);
  process.exit(1);
});
