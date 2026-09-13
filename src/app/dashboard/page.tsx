"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Users,
  Briefcase,
  ArrowRight,
  Sparkles,
  Award,
  AlertCircle,
  TrendingUp,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  Layers,
  UserCheck,
} from "lucide-react";
import { EvidenceScoreCard } from "@/components/EvidenceScoreCard";
import { ConsistencyScoreCard } from "@/components/ConsistencyScoreCard";
import { SkillBadge } from "@/components/SkillBadge";
import { SkillCoverageBar } from "@/components/SkillCoverageBar";
import { CandidateMatchCard } from "@/components/CandidateMatchCard";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Application,
  CandidateMatch,
  CandidateProfile,
  CandidateSkill,
  RecruitmentDrive,
  Team,
  TeamVerificationTest,
} from "@/types";

import { useAuth, DEMO_PERSONAS } from "@/lib/auth/auth-context";

export default function DashboardPage() {
  const { user, role: userRole, loading: authLoading, isAuthenticated, loginWithPersona } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [teamData, setTeamData] = useState<any>(null);
  const [drives, setDrives] = useState<RecruitmentDrive[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [candidateMatches, setCandidateMatches] = useState<CandidateMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active persona view: 'candidate' | 'team_leader' | 'recruiter'
  const [activePersona, setActivePersona] = useState<"candidate" | "team_leader" | "recruiter">("candidate");

  useEffect(() => {
    if (userRole) {
      setActivePersona(userRole);
    }
  }, [userRole]);

  const loadDashboard = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const activeId = user.id || "usr-01";
      const [profRes, appsRes, teamRes, drivesRes, matchRes] = await Promise.all([
        fetch(`/api/profile?id=${activeId}`),
        fetch(`/api/recruitment/applications?candidateId=${activeId}`),
        fetch("/api/teams/tm-01"),
        fetch("/api/recruitment/drives"),
        fetch("/api/matching/candidates?teamId=tm-01"),
      ]);

      const profJson = await profRes.json();
      const appsJson = await appsRes.json();
      const teamJson = await teamRes.json();
      const drivesJson = await drivesRes.json();
      const matchJson = await matchRes.json();

      if (!profJson.success && profRes.status !== 200) {
        throw new Error(profJson.error?.message || "Failed to load candidate profile.");
      }

      if (profJson.success) setProfileData(profJson.data);
      if (appsJson.success) setApplications(appsJson.data);
      if (teamJson.success) setTeamData(teamJson.data);
      if (drivesJson.success) setDrives(drivesJson.data);
      if (matchJson.success) setCandidateMatches(matchJson.data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Unable to connect to verification services. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        loadDashboard();
      } else {
        setLoading(false);
      }
    }
  }, [authLoading, isAuthenticated, user?.id]);

  const handleDecision = async (testId: string, decision: "accepted" | "rejected") => {
    try {
      const res = await fetch(`/api/team-verification/${testId}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      if (res.ok) {
        // Refresh team details
        const teamRes = await fetch("/api/teams/tm-01");
        const teamJson = await teamRes.json();
        if (teamJson.success) setTeamData(teamJson.data);
      }
    } catch {}
  };

  const handleUpdateAppStatus = async (appId: string, status: string) => {
    try {
      const res = await fetch(`/api/recruitment/applications/${appId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const appsRes = await fetch("/api/recruitment/applications");
        const appsJson = await appsRes.json();
        if (appsJson.success) setApplications(appsJson.data);
      }
    } catch {}
  };

  // 1. Loading State
  if (authLoading || (loading && isAuthenticated)) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-24 rounded-xl bg-zinc-200"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 rounded-xl bg-zinc-200"></div>
            <div className="h-64 rounded-xl bg-zinc-200"></div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Logged Out State (Clear prompt, never a silent blank page)
  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 sm:p-12 shadow-xs text-center max-w-3xl mx-auto space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-md shadow-zinc-900/10">
            <ShieldCheck className="h-8 w-8 text-sky-400" />
          </div>

          <div>
            <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800 uppercase tracking-wider">
              Authentication Required
            </span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
              Sign in to view your Verified Dashboard
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-zinc-600 max-w-xl mx-auto leading-relaxed">
              Access your evidence-backed skills, standardized blueprint assessment results, anti-cheat consistency signals, and hackathon team match queues.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-950 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-zinc-800 transition"
            >
              <span>Sign In to Account</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
            >
              Create Account
            </Link>
          </div>

          {/* 1-Click Evaluation Demo Personas */}
          <div className="mt-8 pt-8 border-t border-zinc-100 text-left">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Or Instant 1-Click Demo Evaluation:
              </span>
              <span className="inline-flex items-center gap-1 rounded bg-sky-50 px-1.5 py-0.5 text-[10px] font-medium text-sky-700">
                <Sparkles className="h-3 w-3" /> Quick Switch
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {DEMO_PERSONAS.slice(0, 3).map((p) => (
                <button
                  key={p.id}
                  onClick={() => loginWithPersona(p.id)}
                  className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3.5 text-left hover:border-sky-300 hover:bg-sky-50/50 transition shadow-2xs group"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={p.avatarUrl}
                      alt={p.name}
                      className="h-8 w-8 rounded-full object-cover border border-zinc-200"
                    />
                    <div>
                      <p className="font-semibold text-xs text-zinc-950 group-hover:text-sky-900">{p.name}</p>
                      <p className="text-[10px] text-zinc-500 capitalize">{p.role.replace("_", " ")}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-600 mt-2 line-clamp-2">{p.description}</p>
                  <span className="inline-block mt-2 text-[10px] font-semibold text-sky-600">
                    Load {p.role.replace("_", " ")} View →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Error State (Never silent fail)
  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-6 text-center max-w-lg mx-auto space-y-4 shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-rose-950">Unable to Load Dashboard</h2>
            <p className="text-xs text-rose-700 mt-1">{error}</p>
          </div>
          <button
            onClick={loadDashboard}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-700 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-800 transition"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const { profile, skills, evidenceStrength } = profileData || {};
  const verifiedSkills = skills?.filter((s: CandidateSkill) => s.verificationStatus === "verified") || [];
  const unverifiedSkills = skills?.filter((s: CandidateSkill) => s.verificationStatus === "unverified") || [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Persona View Switcher Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Interactive Multi-Persona Workspace
          </span>
          <p className="text-xs text-zinc-600 font-medium mt-0.5">
            Switch perspective to view how Vouch unifies candidates, hackathon squads, and campus recruiters:
          </p>
        </div>

        <div className="flex rounded-lg border border-zinc-200 bg-zinc-100/80 p-1 text-xs">
          <button
            onClick={() => setActivePersona("candidate")}
            className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 font-semibold transition-all ${
              activePersona === "candidate"
                ? "bg-white text-zinc-950 shadow-2xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <UserCheck className="h-3.5 w-3.5 text-sky-600" />
            Candidate View
          </button>
          <button
            onClick={() => setActivePersona("team_leader")}
            className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 font-semibold transition-all ${
              activePersona === "team_leader"
                ? "bg-white text-zinc-950 shadow-2xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <Users className="h-3.5 w-3.5 text-indigo-600" />
            Team Leader View
          </button>
          <button
            onClick={() => setActivePersona("recruiter")}
            className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 font-semibold transition-all ${
              activePersona === "recruiter"
                ? "bg-white text-zinc-950 shadow-2xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <Briefcase className="h-3.5 w-3.5 text-emerald-600" />
            Recruiter View
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: CANDIDATE DASHBOARD */}
      {/* ========================================================================= */}
      {activePersona === "candidate" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Header Profile Identity */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-4">
              <img
                src={profile?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                alt={profile?.fullName}
                className="h-14 w-14 rounded-full object-cover border-2 border-zinc-100 shadow-2xs"
              />
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-bold text-zinc-950">{profile?.fullName}</h1>
                  <VerifiedBadge level="tier_1" showScore score={evidenceStrength?.totalScore || 90} />
                </div>
                <p className="text-xs text-zinc-500 font-medium mt-1">
                  {profile?.college} · Class of {profile?.graduationYear}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/assessments"
                className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3.5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors shadow-2xs"
              >
                <Sparkles className="h-3.5 w-3.5 text-sky-400" />
                Take Skill Assessment
              </Link>
              <Link
                href="/teams"
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors shadow-2xs"
              >
                <Users className="h-3.5 w-3.5 text-zinc-500" />
                Browse Teams
              </Link>
            </div>
          </div>

          {/* Core Score Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EvidenceScoreCard
              data={
                evidenceStrength || {
                  compositeScore: 0,
                  assessmentScore: 0,
                  githubScore: 0,
                  projectsScore: 0,
                  certificatesScore: 0,
                  explanation: ["No verified evidence recorded yet. Take an assessment or connect GitHub to build strength."],
                }
              }
            />

            <ConsistencyScoreCard
              breakdown={
                (profileData as any)?.recentAttempt?.consistencyBreakdown || {
                  score: 100,
                  timingAnomalies: 0,
                  tabSwitches: 0,
                  clipboardAttempts: 0,
                  answerChanges: 0,
                  difficultyTimeCorrelation: "Normal",
                  disclaimer:
                    "These are assessment-behavior signals and should be considered alongside the candidate's result. They do not establish cheating.",
                  signals: [
                    {
                      title: "Continuous Window Focus",
                      description: "Candidate maintained uninterrupted focus in assessment browser tab (0 pts).",
                      level: "positive",
                      pointsDeducted: 0,
                    },
                    {
                      title: "Clean Clipboard Log",
                      description: "No copy, paste, or cut attempts detected during session (0 pts).",
                      level: "positive",
                      pointsDeducted: 0,
                    },
                  ],
                }
              }
              attemptId={(profileData as any)?.recentAttempt?.id}
              rawEvents={(profileData as any)?.recentAttempt?.rawEvents}
            />
          </div>

          {/* Verified Skills Display */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-zinc-950">Verified Technical Capabilities</h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Standardized blueprint assessments back every verified credential
                </p>
              </div>
              <Link
                href="/profile"
                className="text-xs font-semibold text-sky-600 hover:text-sky-800 inline-flex items-center gap-1"
              >
                Manage Profile Evidence <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Verified Skills ({verifiedSkills.length})
                </span>
                {verifiedSkills.length === 0 ? (
                  <div className="mt-2.5">
                    <EmptyState
                      title="No verified skills yet"
                      description="Complete a 15-minute standardized blueprint assessment to benchmark your technical capabilities and earn verified badges."
                      actionLabel="Take Skill Assessment"
                      onAction={() => (window.location.href = "/assessments")}
                    />
                  </div>
                ) : (
                  <div className="mt-2.5 flex flex-wrap gap-2.5">
                    {verifiedSkills.map((s: CandidateSkill) => (
                      <SkillBadge
                        key={s.id}
                        name={s.skillName || s.skillId}
                        level={s.declaredLevel}
                        verified={true}
                        score={s.verificationScore}
                      />
                    ))}
                  </div>
                )}
              </div>

              {unverifiedSkills.length > 0 && (
                <div className="pt-3 border-t border-zinc-100">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Self-Declared Claims ({unverifiedSkills.length})
                  </span>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    {unverifiedSkills.map((s: CandidateSkill) => (
                      <SkillBadge
                        key={s.id}
                        name={s.skillName || s.skillId}
                        level={s.declaredLevel}
                        verified={false}
                      />
                    ))}
                    <Link
                      href="/assessments"
                      className="text-xs text-sky-600 hover:underline font-semibold ml-1"
                    >
                      Verify these now →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: TEAM LEADER DASHBOARD */}
      {/* ========================================================================= */}
      {activePersona === "team_leader" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-zinc-950">NeuralMesh · Squad Operations</h1>
                  <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800 uppercase tracking-wider">
                    ETHGlobal London 2025
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Team Leader: Rohan Kulkarni · 2 of 4 Members Joined
                </p>
              </div>

              <Link
                href="/teams"
                className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3.5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors shadow-2xs"
              >
                <Users className="h-3.5 w-3.5" />
                Manage Team Portal
              </Link>
            </div>
          </div>

          {/* Team Skill Coverage & Gap Visualizer */}
          {teamData?.coverage && <SkillCoverageBar coverage={teamData.coverage} />}

          {/* Verification Challenge History & Decision Queue */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-zinc-950 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-sky-600" />
                  Candidate Verification Test Queue (Pre-Join Evaluation)
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Review test results and integrity signals before accepting new members
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {teamData?.verificationTests?.length === 0 ? (
                <EmptyState
                  title="No candidate test challenges pending"
                  description="When prospective members request to join, you can issue custom blueprint tests here."
                />
              ) : (
                teamData?.verificationTests?.map((vt: TeamVerificationTest) => (
                  <div key={vt.id} className="rounded-lg border border-zinc-200 p-4 bg-zinc-50/40 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-zinc-950 text-sm">{vt.candidateName}</span>
                        <span className="text-zinc-400"> · </span>
                        <span className="text-zinc-600 font-medium">{vt.skillName} ({vt.difficulty})</span>
                      </div>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          vt.status === "completed" || vt.status === "accepted"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {vt.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-600 pt-1">
                      <span>Required Passing Score: <strong>{vt.requiredScore}%</strong></span>
                      <span>
                        Candidate Score:{" "}
                        <strong className={vt.candidateScore && vt.candidateScore >= vt.requiredScore ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                          {vt.candidateScore || 0}%
                        </strong>
                      </span>
                      <span>Assessment Focus Score: <strong>{vt.integrityScore || 95}/100</strong></span>
                    </div>

                    {vt.status === "completed" && (
                      <div className="flex items-center gap-2 pt-2 border-t border-zinc-200/60">
                        <button
                          onClick={() => handleDecision(vt.id, "accepted")}
                          className="inline-flex items-center gap-1 rounded bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 shadow-2xs"
                        >
                          <Check className="h-3.5 w-3.5" /> Accept into Team
                        </button>
                        <button
                          onClick={() => handleDecision(vt.id, "rejected")}
                          className="inline-flex items-center gap-1 rounded border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 shadow-2xs"
                        >
                          <X className="h-3.5 w-3.5" /> Decline
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recommended Candidates for Missing Capability Gaps */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-zinc-950">
              Recommended Candidates Matching Team Gaps
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {candidateMatches.map((match) => (
                <CandidateMatchCard
                  key={match.candidateId}
                  match={match}
                  teamId="tm-01"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: RECRUITER DASHBOARD */}
      {/* ========================================================================= */}
      {activePersona === "recruiter" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-zinc-950">Stripe · Campus Recruitment Operations</h1>
                  <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800 uppercase tracking-wider">
                    Campus Talent SaaS
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Lead Recruiter: Sneha Patel · 2 Active Drives · 42 Total Applicants
                </p>
              </div>

              <Link
                href="/recruitment"
                className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3.5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors shadow-2xs"
              >
                <Briefcase className="h-3.5 w-3.5" />
                Open Hiring Pipeline
              </Link>
            </div>
          </div>

          {/* Hiring Funnel Analytics */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { stage: "Applied", count: 42, color: "text-zinc-900" },
              { stage: "Eligible", count: 28, color: "text-sky-700" },
              { stage: "Shortlisted", count: 14, color: "text-indigo-700" },
              { stage: "Interview", count: 6, color: "text-purple-700" },
              { stage: "Selected", count: 2, color: "text-emerald-700" },
            ].map((f) => (
              <div key={f.stage} className="rounded-xl border border-zinc-200 bg-white p-4 text-center shadow-2xs">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{f.stage}</span>
                <p className={`text-2xl font-extrabold mt-1 ${f.color}`}>{f.count}</p>
              </div>
            ))}
          </div>

          {/* Top Matched Candidates Table with Explainable Verification Data */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-zinc-950">
                  Verified Candidate Shortlist (Stripe Frontend Infrastructure)
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Ranked by verified skills match against core drive requirements
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-700">
                <thead className="bg-zinc-50 text-[11px] font-semibold uppercase text-zinc-500 border-b border-zinc-200">
                  <tr>
                    <th className="py-2.5 px-3">Candidate</th>
                    <th className="py-2.5 px-3">College / Grad</th>
                    <th className="py-2.5 px-3">Verified Skills</th>
                    <th className="py-2.5 px-3">Evidence Score</th>
                    <th className="py-2.5 px-3">Match %</th>
                    <th className="py-2.5 px-3">Pipeline Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  <tr className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-zinc-950">Arjun Verma</div>
                      <div className="text-[11px] text-zinc-400">arjun@vouch.tech</div>
                    </td>
                    <td className="py-3 px-3">
                      <div>IIT Bombay</div>
                      <div className="text-[11px] text-zinc-400">2025</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        <span className="rounded bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-bold">
                          React 92%
                        </span>
                        <span className="rounded bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-bold">
                          TypeScript 88%
                        </span>
                        <span className="rounded bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-bold">
                          SQL 80%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-bold text-zinc-950">84/100</td>
                    <td className="py-3 px-3">
                      <span className="rounded bg-sky-100 text-sky-800 font-bold px-2 py-0.5 text-[11px] border border-sky-200">
                        94% Match
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="rounded bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 text-[11px] uppercase tracking-wide border border-indigo-200">
                        Shortlisted
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-zinc-950">Priya Sundaram</div>
                      <div className="text-[11px] text-zinc-400">priya@pes.edu</div>
                    </td>
                    <td className="py-3 px-3">
                      <div>PES University</div>
                      <div className="text-[11px] text-zinc-400">2026</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        <span className="rounded bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-bold">
                          Python 94%
                        </span>
                        <span className="rounded bg-zinc-100 text-zinc-600 px-1.5 py-0.5 text-[10px] border border-zinc-200">
                          SQL Claimed
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-bold text-zinc-950">76/100</td>
                    <td className="py-3 px-3">
                      <span className="rounded bg-zinc-100 text-zinc-700 font-bold px-2 py-0.5 text-[11px] border border-zinc-200">
                        65% Match
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="rounded bg-zinc-100 text-zinc-700 font-semibold px-2 py-0.5 text-[11px] uppercase tracking-wide border border-zinc-200">
                        Eligible
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
