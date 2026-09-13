"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Briefcase,
  ArrowRight,
  AlertCircle,
  Check,
  X,
  UserCheck,
  FileCheck2,
} from "lucide-react";
import { EvidenceScoreCard } from "@/components/EvidenceScoreCard";
import { ConsistencyScoreCard } from "@/components/ConsistencyScoreCard";
import { VerificationSeal } from "@/components/ui/VerificationSeal";
import { SkillCoverageBar } from "@/components/SkillCoverageBar";
import { CandidateMatchCard } from "@/components/CandidateMatchCard";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Application,
  CandidateMatch,
  CandidateSkill,
  RecruitmentDrive,
  TeamVerificationTest,
} from "@/types";

import { useAuth, DEMO_PERSONAS } from "@/lib/auth/auth-context";

export default function DashboardPage() {
  const { user, role: userRole, loading: authLoading, isAuthenticated, loginWithPersona } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [teamData, setTeamData] = useState<any>(null);
  const [, setDrives] = useState<RecruitmentDrive[]>([]);
  const [, setApplications] = useState<Application[]>([]);
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
        const teamRes = await fetch("/api/teams/tm-01");
        const teamJson = await teamRes.json();
        if (teamJson.success) setTeamData(teamJson.data);
      }
    } catch {}
  };

  // 1. Loading State
  if (authLoading || (loading && isAuthenticated)) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-24 bg-[#F3F1EA] border border-[#D9D5C7]"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-[#F3F1EA] border border-[#D9D5C7]"></div>
            <div className="h-64 bg-[#F3F1EA] border border-[#D9D5C7]"></div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Logged Out State
  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="border border-[#D9D5C7] bg-white p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center border border-[#1B3A5C] bg-[#1B3A5C] text-white">
            <FileCheck2 className="h-6 w-6 text-white" />
          </div>

          <div>
            <span className="border border-[#1B3A5C]/30 bg-[#E9EFF5] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#1B3A5C] uppercase tracking-wider">
              Authentication Required
            </span>
            <h1 className="mt-3 font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#1A1915]">
              Sign in to examine your verification ledger
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#8A8571] max-w-xl mx-auto leading-relaxed">
              Access your evidence-backed skills, standardized blueprint assessment results, anti-cheat consistency signals, and hackathon team match queues.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1B3A5C] px-5 py-2.5 font-mono text-xs font-medium text-white hover:bg-[#152e4a] transition-colors"
            >
              <span>Sign in to account</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-[#D9D5C7] bg-[#FBFAF7] px-5 py-2.5 font-mono text-xs font-medium text-[#3D3A31] hover:bg-[#F3F1EA] transition-colors"
            >
              Create account
            </Link>
          </div>

          {/* 1-Click Evaluation Demo Personas */}
          <div className="mt-8 pt-8 border-t border-[#D9D5C7] text-left">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[11px] font-medium uppercase text-[#8A8571]">
                Instant evaluation specimen personas:
              </span>
              <span className="inline-flex items-center gap-1 border border-[#1B3A5C]/30 bg-[#E9EFF5] px-1.5 py-0.5 font-mono text-[10px] font-medium text-[#1B3A5C]">
                1-click switch
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {DEMO_PERSONAS.slice(0, 3).map((p) => (
                <button
                  key={p.id}
                  onClick={() => loginWithPersona(p.id)}
                  className="border border-[#D9D5C7] bg-[#FBFAF7] p-3.5 text-left hover:border-[#1B3A5C] transition group"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={p.avatarUrl}
                      alt={p.name}
                      className="h-8 w-8 border border-[#D9D5C7] object-cover"
                    />
                    <div>
                      <p className="font-display font-medium text-xs text-[#1A1915] group-hover:text-[#1B3A5C]">{p.name}</p>
                      <p className="font-mono text-[10px] text-[#8A8571] capitalize">{p.role.replace("_", " ")}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#3D3A31] mt-2 line-clamp-2">{p.description}</p>
                  <span className="inline-block mt-2 font-mono text-[10px] font-medium text-[#1B3A5C]">
                    Load {p.role.replace("_", " ")} ledger →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Error State
  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="border border-[#8C2F2F]/30 bg-[#FDF2F2] p-6 text-center max-w-lg mx-auto space-y-4">
          <div className="mx-auto flex h-10 w-10 items-center justify-center border border-[#8C2F2F] bg-white text-[#8C2F2F]">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-base font-semibold text-[#8C2F2F]">Unable to load ledger</h2>
            <p className="text-xs text-[#8C2F2F] mt-1">{error}</p>
          </div>
          <button
            onClick={loadDashboard}
            className="inline-flex items-center gap-1.5 bg-[#8C2F2F] px-4 py-2 font-mono text-xs font-medium text-white hover:bg-[#722626] transition-colors"
          >
            Retry connection
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#D9D5C7] bg-white p-4">
        <div>
          <span className="font-mono text-[11px] font-medium uppercase text-[#8A8571]">
            Ledger Persona Perspective
          </span>
          <p className="text-xs text-[#3D3A31] mt-0.5">
            Switch perspective to audit how VOUCH certifies candidates, squads, and campus recruiters:
          </p>
        </div>

        <div className="flex border border-[#D9D5C7] bg-[#F3F1EA] p-0.5 text-xs">
          <button
            onClick={() => setActivePersona("candidate")}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-medium transition-all ${
              activePersona === "candidate"
                ? "bg-white text-[#1B3A5C] border border-[#D9D5C7]"
                : "text-[#8A8571] hover:text-[#1A1915]"
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            Candidate Ledger
          </button>
          <button
            onClick={() => setActivePersona("team_leader")}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-medium transition-all ${
              activePersona === "team_leader"
                ? "bg-white text-[#1B3A5C] border border-[#D9D5C7]"
                : "text-[#8A8571] hover:text-[#1A1915]"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            Squad Leader
          </button>
          <button
            onClick={() => setActivePersona("recruiter")}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-medium transition-all ${
              activePersona === "recruiter"
                ? "bg-white text-[#1B3A5C] border border-[#D9D5C7]"
                : "text-[#8A8571] hover:text-[#1A1915]"
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" />
            Recruiter Audit
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: CANDIDATE DASHBOARD */}
      {/* ========================================================================= */}
      {activePersona === "candidate" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Header Profile Identity */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#D9D5C7] bg-white p-6">
            <div className="flex items-center gap-4">
              <img
                src={profile?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                alt={profile?.fullName}
                className="h-12 w-12 border border-[#D9D5C7] object-cover"
              />
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-display text-xl font-semibold text-[#1A1915]">{profile?.fullName}</h1>
                  <span className="font-mono text-xs text-[#2F6844] border border-[#2F6844]/30 bg-[#EBF2EC] px-2 py-0.5">
                    Tier 1 Verified ({evidenceStrength?.compositeScore || 90}/100)
                  </span>
                </div>
                <p className="font-mono text-xs text-[#8A8571] mt-1">
                  {profile?.college} · Class of {profile?.graduationYear}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/assessments"
                className="inline-flex items-center gap-1.5 bg-[#1B3A5C] px-3.5 py-2 font-mono text-xs font-medium text-white hover:bg-[#152e4a] transition-colors"
              >
                <FileCheck2 className="h-3.5 w-3.5 text-white" />
                Take skill assessment
              </Link>
              <Link
                href="/teams"
                className="inline-flex items-center gap-1.5 border border-[#D9D5C7] bg-[#FBFAF7] px-3.5 py-2 font-mono text-xs font-medium text-[#3D3A31] hover:bg-[#F3F1EA] transition-colors"
              >
                <Users className="h-3.5 w-3.5 text-[#8A8571]" />
                Browse squads
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
          <div className="border border-[#D9D5C7] bg-white p-6">
            <div className="flex items-center justify-between mb-4 border-b border-[#D9D5C7] pb-3">
              <div>
                <h2 className="font-display text-sm font-semibold text-[#1A1915]">Verified Technical Capabilities</h2>
                <p className="text-xs text-[#8A8571] mt-0.5">
                  Standardized blueprint assessments back every verified credential
                </p>
              </div>
              <Link
                href="/profile"
                className="font-mono text-xs text-[#1B3A5C] hover:underline inline-flex items-center gap-1"
              >
                Inspect full ledger evidence <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-4">
              <div>
                <span className="font-mono text-[11px] font-medium uppercase text-[#8A8571]">
                  Verified Skills ({verifiedSkills.length})
                </span>
                {verifiedSkills.length === 0 ? (
                  <div className="mt-2.5">
                    <EmptyState
                      title="No verified skills yet"
                      description="Complete a 15-minute standardized blueprint assessment to benchmark your technical capabilities and earn verified badges."
                      actionLabel="Take skill assessment"
                      onAction={() => (window.location.href = "/assessments")}
                    />
                  </div>
                ) : (
                  <div className="mt-2.5 flex flex-wrap gap-2.5">
                    {verifiedSkills.map((s: CandidateSkill) => (
                      <VerificationSeal
                        key={s.id}
                        skillName={s.skillName || s.skillId}
                        verified={true}
                        score={s.verificationScore}
                        tier={s.verificationScore && s.verificationScore >= 85 ? "gold" : "silver"}
                      />
                    ))}
                  </div>
                )}
              </div>

              {unverifiedSkills.length > 0 && (
                <div className="pt-3 border-t border-[#D9D5C7]">
                  <span className="font-mono text-[11px] font-medium uppercase text-[#8A8571]">
                    Self-Declared Claims ({unverifiedSkills.length})
                  </span>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    {unverifiedSkills.map((s: CandidateSkill) => (
                      <VerificationSeal
                        key={s.id}
                        skillName={s.skillName || s.skillId}
                        verified={false}
                      />
                    ))}
                    <Link
                      href="/assessments"
                      className="font-mono text-xs text-[#1B3A5C] hover:underline ml-1"
                    >
                      verify these now →
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
          <div className="border border-[#D9D5C7] bg-white p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-xl font-semibold text-[#1A1915]">NeuralMesh · Squad Operations</h1>
                  <span className="border border-[#1B3A5C]/30 bg-[#E9EFF5] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#1B3A5C] uppercase tracking-wider">
                    ETHGlobal London 2025
                  </span>
                </div>
                <p className="font-mono text-xs text-[#8A8571] mt-1">
                  Team Leader: Rohan Kulkarni · 2 of 4 Members Joined
                </p>
              </div>

              <Link
                href="/teams"
                className="inline-flex items-center gap-1.5 bg-[#1B3A5C] px-3.5 py-2 font-mono text-xs font-medium text-white hover:bg-[#152e4a] transition-colors"
              >
                <Users className="h-3.5 w-3.5" />
                Manage squad portal
              </Link>
            </div>
          </div>

          {/* Team Skill Coverage & Gap Visualizer */}
          {teamData?.coverage && <SkillCoverageBar coverage={teamData.coverage} />}

          {/* Verification Challenge History & Decision Queue */}
          <div className="border border-[#D9D5C7] bg-white p-6">
            <div className="flex items-center justify-between mb-4 border-b border-[#D9D5C7] pb-3">
              <div>
                <h2 className="font-display text-sm font-semibold text-[#1A1915] flex items-center gap-1.5">
                  Candidate Verification Test Queue (Pre-Join Evaluation)
                </h2>
                <p className="text-xs text-[#8A8571] mt-0.5">
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
                  <div key={vt.id} className="border border-[#D9D5C7] p-4 bg-[#FBFAF7] text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-display font-semibold text-[#1A1915] text-sm">{vt.candidateName}</span>
                        <span className="text-[#8A8571]"> · </span>
                        <span className="font-mono text-[#3D3A31]">{vt.skillName} ({vt.difficulty})</span>
                      </div>
                      <span
                        className={`border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${
                          vt.status === "completed" || vt.status === "accepted"
                            ? "bg-[#EBF2EC] text-[#2F6844] border-[#2F6844]/30"
                            : "bg-[#FDF6EC] text-[#9A6B1F] border-[#9A6B1F]/30"
                        }`}
                      >
                        {vt.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-[#8A8571] pt-1">
                      <span>Required passing score: <strong className="text-[#1A1915]">{vt.requiredScore}%</strong></span>
                      <span>
                        Candidate score:{" "}
                        <strong className={vt.candidateScore && vt.candidateScore >= vt.requiredScore ? "text-[#2F6844]" : "text-[#9A6B1F]"}>
                          {vt.candidateScore || 0}%
                        </strong>
                      </span>
                      <span>Integrity focus score: <strong className="text-[#1A1915]">{vt.integrityScore || 95}/100</strong></span>
                    </div>

                    {vt.status === "completed" && (
                      <div className="flex items-center gap-2 pt-2 border-t border-[#D9D5C7]">
                        <button
                          onClick={() => handleDecision(vt.id, "accepted")}
                          className="inline-flex items-center gap-1 bg-[#2F6844] px-3 py-1.5 font-mono text-xs font-medium text-white hover:bg-[#265337] transition-colors"
                        >
                          <Check className="h-3.5 w-3.5" /> Accept into squad
                        </button>
                        <button
                          onClick={() => handleDecision(vt.id, "rejected")}
                          className="inline-flex items-center gap-1 border border-[#D9D5C7] bg-white px-3 py-1.5 font-mono text-xs font-medium text-[#8C2F2F] hover:bg-[#FDF2F2] transition-colors"
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
            <h2 className="font-display text-sm font-semibold text-[#1A1915]">
              Recommended Candidates Matching Squad Gaps
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
          <div className="border border-[#D9D5C7] bg-white p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-xl font-semibold text-[#1A1915]">Stripe · Campus Recruitment Operations</h1>
                  <span className="border border-[#1B3A5C]/30 bg-[#E9EFF5] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#1B3A5C] uppercase tracking-wider">
                    Campus Talent SaaS
                  </span>
                </div>
                <p className="font-mono text-xs text-[#8A8571] mt-1">
                  Lead Recruiter: Sneha Patel · 2 Active Drives · 42 Total Applicants
                </p>
              </div>

              <Link
                href="/recruitment"
                className="inline-flex items-center gap-1.5 bg-[#1B3A5C] px-3.5 py-2 font-mono text-xs font-medium text-white hover:bg-[#152e4a] transition-colors"
              >
                <Briefcase className="h-3.5 w-3.5" />
                Open hiring pipeline
              </Link>
            </div>
          </div>

          {/* Hiring Funnel Analytics */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { stage: "Applied", count: 42, color: "text-[#1A1915]" },
              { stage: "Eligible", count: 28, color: "text-[#1B3A5C]" },
              { stage: "Shortlisted", count: 14, color: "text-[#1B3A5C]" },
              { stage: "Interview", count: 6, color: "text-[#9A6B1F]" },
              { stage: "Selected", count: 2, color: "text-[#2F6844]" },
            ].map((f) => (
              <div key={f.stage} className="border border-[#D9D5C7] bg-white p-4 text-center">
                <span className="font-mono text-[11px] font-medium text-[#8A8571] uppercase">{f.stage}</span>
                <p className={`font-mono text-2xl font-semibold tabular-nums mt-1 ${f.color}`}>{f.count}</p>
              </div>
            ))}
          </div>

          {/* Top Matched Candidates Table with Explainable Verification Data */}
          <div className="border border-[#D9D5C7] bg-white p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#D9D5C7] pb-3">
              <div>
                <h2 className="font-display text-sm font-semibold text-[#1A1915]">
                  Verified Candidate Shortlist (Stripe Frontend Infrastructure)
                </h2>
                <p className="text-xs text-[#8A8571] mt-0.5">
                  Ranked by verified skills match against core drive requirements
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#3D3A31]">
                <thead className="bg-[#F3F1EA] font-mono text-[11px] font-medium uppercase text-[#8A8571] border-b border-[#D9D5C7]">
                  <tr>
                    <th className="py-2.5 px-3">Candidate</th>
                    <th className="py-2.5 px-3">College / Grad</th>
                    <th className="py-2.5 px-3">Verified Skills</th>
                    <th className="py-2.5 px-3">Evidence Score</th>
                    <th className="py-2.5 px-3">Match %</th>
                    <th className="py-2.5 px-3">Pipeline Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9D5C7]">
                  <tr className="hover:bg-[#FBFAF7] transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-display font-semibold text-[#1A1915]">Arjun Verma</div>
                      <div className="font-mono text-[11px] text-[#8A8571]">arjun@vouch.tech</div>
                    </td>
                    <td className="py-3 px-3">
                      <div>IIT Bombay</div>
                      <div className="font-mono text-[11px] text-[#8A8571]">2025</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        <span className="border border-[#2F6844]/30 bg-[#EBF2EC] text-[#2F6844] px-1.5 py-0.5 font-mono text-[10px] font-medium tabular-nums">
                          React 92%
                        </span>
                        <span className="border border-[#2F6844]/30 bg-[#EBF2EC] text-[#2F6844] px-1.5 py-0.5 font-mono text-[10px] font-medium tabular-nums">
                          TypeScript 88%
                        </span>
                        <span className="border border-[#2F6844]/30 bg-[#EBF2EC] text-[#2F6844] px-1.5 py-0.5 font-mono text-[10px] font-medium tabular-nums">
                          SQL 80%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold tabular-nums text-[#1A1915]">84/100</td>
                    <td className="py-3 px-3">
                      <span className="border border-[#1B3A5C]/30 bg-[#E9EFF5] text-[#1B3A5C] font-mono font-semibold px-2 py-0.5 text-[11px] tabular-nums">
                        94% Match
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="border border-[#1B3A5C]/30 bg-[#E9EFF5] text-[#1B3A5C] font-mono font-medium px-2 py-0.5 text-[11px] uppercase">
                        Shortlisted
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#FBFAF7] transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-display font-semibold text-[#1A1915]">Priya Sundaram</div>
                      <div className="font-mono text-[11px] text-[#8A8571]">priya@pes.edu</div>
                    </td>
                    <td className="py-3 px-3">
                      <div>PES University</div>
                      <div className="font-mono text-[11px] text-[#8A8571]">2026</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        <span className="border border-[#2F6844]/30 bg-[#EBF2EC] text-[#2F6844] px-1.5 py-0.5 font-mono text-[10px] font-medium tabular-nums">
                          Python 94%
                        </span>
                        <span className="font-mono text-[10px] text-[#8A8571] px-1.5 py-0.5 lowercase">
                          sql (claimed)
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold tabular-nums text-[#1A1915]">76/100</td>
                    <td className="py-3 px-3">
                      <span className="border border-[#D9D5C7] bg-[#FBFAF7] text-[#8A8571] font-mono font-semibold px-2 py-0.5 text-[11px] tabular-nums">
                        65% Match
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="border border-[#D9D5C7] bg-[#FBFAF7] text-[#8A8571] font-mono font-medium px-2 py-0.5 text-[11px] uppercase">
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

