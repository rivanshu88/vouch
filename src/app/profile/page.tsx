"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileCode2,
  Award,
  Plus,
  ExternalLink,
  RefreshCw,
  Star,
  ArrowRight,
  FileCheck2,
  AlertCircle,
} from "lucide-react";
import { VerificationSeal } from "@/components/ui/VerificationSeal";
import { EvidenceScoreCard } from "@/components/EvidenceScoreCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { CandidateSkill, Certificate, Project, Skill } from "@/types";

import { useAuth, DEMO_PERSONAS } from "@/lib/auth/auth-context";

export default function ProfilePage() {
  const { user, loading: authLoading, isAuthenticated, loginWithPersona } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skillsList, setSkillsList] = useState<Skill[]>([]);

  // Modals / Form toggles
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddCert, setShowAddCert] = useState(false);

  // Forms state
  const [skillForm, setSkillForm] = useState({ skillId: "javascript", declaredLevel: "intermediate" });
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    technologies: "React, TypeScript",
    githubUrl: "",
    projectUrl: "",
  });
  const [certForm, setCertForm] = useState({
    title: "",
    issuer: "",
    issueDate: "2024-01-01",
    credentialUrl: "",
  });
  const [ghUsername, setGhUsername] = useState("");
  const [syncingGh, setSyncingGh] = useState(false);

  const loadData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const activeId = user.id || "usr-01";
      const [profRes, skillsRes] = await Promise.all([
        fetch(`/api/profile?id=${activeId}`),
        fetch("/api/skills"),
      ]);

      const profJson = await profRes.json();
      const skillsJson = await skillsRes.json();

      if (!profJson.success && profRes.status !== 200) {
        throw new Error(profJson.error?.message || "Failed to load candidate profile.");
      }

      if (profJson.success) {
        setProfileData(profJson.data);
        if (profJson.data.profile?.githubUsername) {
          setGhUsername(profJson.data.profile.githubUsername);
        }
      }
      if (skillsJson.success) setSkillsList(skillsJson.data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load profile evidence.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        loadData();
      } else {
        setLoading(false);
      }
    }
  }, [authLoading, isAuthenticated, user?.id]);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const activeId = user?.id || "usr-01";
      const res = await fetch("/api/profile/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: activeId,
          skillId: skillForm.skillId,
          declaredLevel: skillForm.declaredLevel,
        }),
      });
      if (res.ok) {
        setShowAddSkill(false);
        loadData();
      }
    } catch {}
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const activeId = user?.id || "usr-01";
      const res = await fetch("/api/profile/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: activeId,
          title: projectForm.title,
          description: projectForm.description,
          technologies: projectForm.technologies.split(",").map((t) => t.trim()),
          githubUrl: projectForm.githubUrl,
          projectUrl: projectForm.projectUrl,
        }),
      });
      if (res.ok) {
        setShowAddProject(false);
        setProjectForm({ title: "", description: "", technologies: "React, TypeScript", githubUrl: "", projectUrl: "" });
        loadData();
      }
    } catch {}
  };

  const handleAddCert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const activeId = user?.id || "usr-01";
      const res = await fetch("/api/profile/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: activeId,
          title: certForm.title,
          issuer: certForm.issuer,
          issueDate: certForm.issueDate,
          credentialUrl: certForm.credentialUrl,
        }),
      });
      if (res.ok) {
        setShowAddCert(false);
        setCertForm({ title: "", issuer: "", issueDate: "2024-01-01", credentialUrl: "" });
        loadData();
      }
    } catch {}
  };

  const handleSyncGitHub = async () => {
    if (!ghUsername) return;
    setSyncingGh(true);
    try {
      const activeId = user?.id || "usr-01";
      const res = await fetch("/api/github/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: activeId,
          username: ghUsername,
        }),
      });
      if (res.ok) {
        loadData();
      }
    } catch {} finally {
      setSyncingGh(false);
    }
  };

  // 1. Loading State
  if (authLoading || (loading && isAuthenticated)) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-44 bg-[#F3F1EA] border border-[#D9D5C7]"></div>
          <div className="h-72 bg-[#F3F1EA] border border-[#D9D5C7]"></div>
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
              Profile Evidence
            </span>
            <h1 className="mt-3 font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#1A1915]">
              Sign in to examine profile evidence ledger
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#8A8571] max-w-xl mx-auto leading-relaxed">
              Manage your technical skill registry, sync GitHub commit metrics, upload verified certificates, and showcase real project artifacts.
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
                    View profile →
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
            <h2 className="font-display text-base font-semibold text-[#8C2F2F]">Unable to load profile</h2>
            <p className="text-xs text-[#8C2F2F] mt-1">{error}</p>
          </div>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 bg-[#8C2F2F] px-4 py-2 font-mono text-xs font-medium text-white hover:bg-[#722626] transition-colors"
          >
            Retry connection
          </button>
        </div>
      </div>
    );
  }

  const { profile, skills, projects, certificates, github, evidenceStrength } = profileData || {};

  const verifiedSkills = skills?.filter((s: CandidateSkill) => s.verificationStatus === "verified") || [];
  const declaredSkills = skills?.filter((s: CandidateSkill) => s.verificationStatus !== "verified") || [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Identity */}
      <div className="border border-[#D9D5C7] bg-white p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-start sm:items-center gap-5">
            <div className="relative">
              <img
                src={profile?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                alt={profile?.fullName}
                className="h-16 w-16 border border-[#D9D5C7] object-cover"
              />
              <span
                className="absolute bottom-0 right-0 h-3.5 w-3.5 border border-white bg-[#2F6844]"
                title="Identity Verified Active"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-2xl font-semibold tracking-tight text-[#1A1915]">{profile?.fullName}</h1>
                <span className="font-mono text-xs text-[#2F6844] border border-[#2F6844]/30 bg-[#EBF2EC] px-2 py-0.5">
                  Tier 1 Verified ({evidenceStrength?.compositeScore || 90}/100)
                </span>
              </div>
              <p className="font-mono text-xs text-[#8A8571] mt-1">
                {profile?.college} · {profile?.branch} · Class of {profile?.graduationYear}
              </p>
              <p className="text-xs text-[#3D3A31] mt-2 max-w-2xl leading-relaxed">
                {profile?.bio}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="border border-[#D9D5C7] bg-[#FBFAF7] px-2 py-0.5 font-mono text-[11px] text-[#3D3A31]">
                  SPECIMEN ID: {profile?.id || "usr-01"}
                </span>
                <span className="border border-[#1B3A5C]/30 bg-[#E9EFF5] px-2 py-0.5 font-mono text-[11px] text-[#1B3A5C]">
                  {profile?.targetRole || "Full Stack Engineer"}
                </span>
              </div>
            </div>
          </div>

          {evidenceStrength && (
            <div className="shrink-0 w-full lg:w-96">
              <EvidenceScoreCard data={evidenceStrength} />
            </div>
          )}
        </div>
      </div>

      {/* Skills Section */}
      <div className="border border-[#D9D5C7] bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-[#D9D5C7] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-base font-semibold text-[#1A1915]">Technical Skills & Verification Ledger</h2>
            </div>
            <p className="text-xs text-[#8A8571] mt-0.5">
              Evidence-backed skill registry with benchmarked scores and anti-cheat consistency
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddSkill(!showAddSkill)}
              className="inline-flex items-center gap-1.5 border border-[#D9D5C7] bg-[#FBFAF7] px-3 py-1.5 font-mono text-xs font-medium text-[#3D3A31] hover:bg-[#F3F1EA] transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Declare claim
            </button>
            <Link
              href="/assessments"
              className="inline-flex items-center gap-1.5 bg-[#1B3A5C] px-3 py-1.5 font-mono text-xs font-medium text-white hover:bg-[#152e4a] transition-colors"
            >
              <FileCheck2 className="h-3.5 w-3.5 text-white" />
              Take assessment
            </Link>
          </div>
        </div>

        {/* Add Skill Form */}
        {showAddSkill && (
          <form
            onSubmit={handleAddSkill}
            className="mb-6 border border-[#1B3A5C]/30 bg-[#E9EFF5]/40 p-4 animate-in fade-in duration-200"
          >
            <p className="font-mono text-xs font-semibold text-[#1B3A5C] mb-2">Declare New Technical Skill</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-mono text-xs text-[#3D3A31] mb-1">Select skill</label>
                <select
                  value={skillForm.skillId}
                  onChange={(e) => setSkillForm({ ...skillForm, skillId: e.target.value })}
                  className="w-full border border-[#D9D5C7] bg-white px-3 py-1.5 font-mono text-xs text-[#1A1915]"
                >
                  {skillsList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-xs text-[#3D3A31] mb-1">Self-declared level</label>
                <select
                  value={skillForm.declaredLevel}
                  onChange={(e) => setSkillForm({ ...skillForm, declaredLevel: e.target.value as any })}
                  className="w-full border border-[#D9D5C7] bg-white px-3 py-1.5 font-mono text-xs text-[#1A1915]"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="bg-[#1B3A5C] px-4 py-1.5 font-mono text-xs font-medium text-white hover:bg-[#152e4a]"
                >
                  Save claim
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSkill(false)}
                  className="border border-[#D9D5C7] bg-white px-3 py-1.5 font-mono text-xs text-[#8A8571] hover:bg-[#F3F1EA]"
                >
                  Cancel
                </button>
              </div>
            </div>
            <p className="mt-2 font-mono text-[11px] text-[#8A8571]">
              * Newly declared claims will show as unverified until you pass the corresponding blueprint assessment.
            </p>
          </form>
        )}

        {/* Verified Skills Partition */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-2 w-2 bg-[#2F6844]" />
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#1A1915]">
                Verified Skills ({verifiedSkills.length})
              </h3>
            </div>
            {verifiedSkills.length === 0 ? (
              <EmptyState
                title="No verified skills yet"
                description="Complete standardized blueprint assessments to prove your technical competence and earn verified badges."
                actionLabel="Take skill assessment"
                onAction={() => (window.location.href = "/assessments")}
              />
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {verifiedSkills.map((s: CandidateSkill) => (
                  <VerificationSeal
                    key={s.id}
                    skillName={s.skillName || s.skillId}
                    verified={true}
                    score={s.verificationScore}
                    tier={s.verificationScore && s.verificationScore >= 85 ? "gold" : "silver"}
                    size="md"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Declared Claims Partition */}
          {declaredSkills.length > 0 && (
            <div className="border-t border-[#D9D5C7] pt-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 bg-[#8A8571]" />
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#8A8571]">
                    Self-Declared Claims ({declaredSkills.length})
                  </h3>
                </div>
                <Link
                  href="/assessments"
                  className="font-mono text-[11px] text-[#1B3A5C] hover:underline flex items-center gap-1"
                >
                  Verify all pending claims <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {declaredSkills.map((s: CandidateSkill) => (
                  <VerificationSeal
                    key={s.id}
                    skillName={s.skillName || s.skillId}
                    verified={false}
                    size="md"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* GitHub External Technical Evidence */}
      <div className="border border-[#D9D5C7] bg-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#D9D5C7] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-base font-semibold text-[#1A1915]">GitHub Technical Evidence</h2>
            </div>
            <p className="text-xs text-[#8A8571] mt-0.5">
              Sync repositories, commit frequency, and language distributions to strengthen your profile
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="github-username"
              value={ghUsername}
              onChange={(e) => setGhUsername(e.target.value)}
              className="border border-[#D9D5C7] px-3 py-1.5 font-mono text-xs text-[#1A1915] bg-[#FBFAF7]"
            />
            <button
              onClick={handleSyncGitHub}
              disabled={syncingGh}
              className="inline-flex items-center gap-1.5 bg-[#1B3A5C] px-3 py-1.5 font-mono text-xs font-medium text-white hover:bg-[#152e4a] disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncingGh ? "animate-spin" : ""}`} />
              {syncingGh ? "Syncing..." : "Sync evidence"}
            </button>
          </div>
        </div>

        {github ? (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#FBFAF7] p-3.5 border border-[#D9D5C7]">
                <span className="font-mono text-[11px] font-medium text-[#8A8571]">Public Repos</span>
                <p className="font-mono text-xl font-semibold tabular-nums text-[#1A1915] mt-0.5">{github.publicReposCount}</p>
              </div>
              <div className="bg-[#FBFAF7] p-3.5 border border-[#D9D5C7]">
                <span className="font-mono text-[11px] font-medium text-[#8A8571]">Total Stars</span>
                <p className="font-mono text-xl font-semibold tabular-nums text-[#1A1915] mt-0.5">{github.totalStars}</p>
              </div>
              <div className="bg-[#FBFAF7] p-3.5 border border-[#D9D5C7]">
                <span className="font-mono text-[11px] font-medium text-[#8A8571]">Primary Language</span>
                <p className="font-mono text-xl font-semibold text-[#1B3A5C] mt-0.5">
                  {github.topLanguages?.[0]?.language || "TypeScript"}
                </p>
              </div>
              <div className="bg-[#FBFAF7] p-3.5 border border-[#D9D5C7]">
                <span className="font-mono text-[11px] font-medium text-[#8A8571]">Last Synchronized</span>
                <p className="font-mono text-xs font-medium text-[#3D3A31] mt-1.5">
                  {new Date(github.lastSyncedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>

            {/* Language distribution bar */}
            <div>
              <span className="font-mono text-xs font-semibold text-[#1A1915]">Codebase Language Distribution</span>
              <div className="mt-2 flex h-2 w-full bg-[#F3F1EA] overflow-hidden">
                {github.topLanguages?.map((l: any, idx: number) => {
                  const colors = ["bg-[#1B3A5C]", "bg-[#2F6844]", "bg-[#3D3A31]", "bg-[#9A6B1F]"];
                  return (
                    <div
                      key={l.language}
                      className={colors[idx % colors.length]}
                      style={{ width: `${l.percentage}%` }}
                      title={`${l.language}: ${l.percentage}%`}
                    />
                  );
                })}
              </div>
              <div className="mt-2.5 flex flex-wrap gap-3 font-mono text-[11px] text-[#8A8571]">
                {github.topLanguages?.map((l: any) => (
                  <span key={l.language} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 bg-[#8A8571]"></span>
                    <span className="font-medium text-[#1A1915]">{l.language}</span> {l.percentage}%
                  </span>
                ))}
              </div>
            </div>

            {/* Repositories cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              {github.recentRepos?.map((repo: any) => (
                <div key={repo.name} className="border border-[#D9D5C7] bg-white p-4 hover:border-[#B8B29D] transition-colors">
                  <div className="flex items-center justify-between">
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-display font-semibold text-xs text-[#1B3A5C] hover:underline inline-flex items-center gap-1"
                    >
                      {repo.name} <ExternalLink className="h-3 w-3" />
                    </a>
                    <span className="flex items-center gap-1 font-mono text-[11px] text-[#3D3A31] bg-[#FBFAF7] border border-[#D9D5C7] px-2 py-0.5">
                      <Star className="h-3 w-3 text-[#9A6B1F]" />
                      {repo.stars}
                    </span>
                  </div>
                  <p className="text-xs text-[#3D3A31] mt-2 line-clamp-2 leading-relaxed">
                    {repo.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between font-mono text-[11px] text-[#8A8571] border-t border-[#D9D5C7] pt-2">
                    <span className="text-[#1A1915] font-medium">{repo.primaryLanguage}</span>
                    <span>{repo.commitCountLastYear} commits last year</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title="No GitHub evidence linked"
            description="Connect your GitHub handle to automatically import repository activity, commit frequency, and verified language breakdown."
            actionLabel="Sync profile"
            onAction={() => handleSyncGitHub()}
          />
        )}
      </div>

      {/* Projects & Certificates Supporting Evidence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Evidence */}
        <div className="border border-[#D9D5C7] bg-white p-6">
          <div className="flex items-center justify-between mb-4 border-b border-[#D9D5C7] pb-3">
            <div>
              <h2 className="font-display text-sm font-semibold text-[#1A1915] flex items-center gap-1.5">
                <FileCode2 className="h-4 w-4 text-[#1B3A5C]" />
                Technical Projects ({projects?.length || 0})
              </h2>
              <p className="font-mono text-[11px] text-[#8A8571]">Real projects with public repositories</p>
            </div>
            <button
              onClick={() => setShowAddProject(!showAddProject)}
              className="inline-flex items-center gap-1 border border-[#D9D5C7] bg-[#FBFAF7] px-2.5 py-1 font-mono text-xs font-medium text-[#3D3A31] hover:bg-[#F3F1EA]"
            >
              <Plus className="h-3 w-3" /> Add project
            </button>
          </div>

          {showAddProject && (
            <form onSubmit={handleAddProject} className="mb-4 bg-[#FBFAF7] p-3.5 border border-[#D9D5C7] space-y-2.5 text-xs">
              <input
                type="text"
                placeholder="Project title"
                required
                value={projectForm.title}
                onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                className="w-full border border-[#D9D5C7] p-1.5 bg-white text-[#1A1915]"
              />
              <textarea
                placeholder="Technical architecture, challenges, and measurable results"
                rows={2}
                required
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                className="w-full border border-[#D9D5C7] p-1.5 bg-white text-[#1A1915]"
              />
              <input
                type="text"
                placeholder="Technologies (comma-separated, e.g. React, Next.js, Redis)"
                value={projectForm.technologies}
                onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value })}
                className="w-full border border-[#D9D5C7] p-1.5 bg-white text-[#1A1915]"
              />
              <input
                type="url"
                placeholder="GitHub repo URL"
                value={projectForm.githubUrl}
                onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                className="w-full border border-[#D9D5C7] p-1.5 bg-white text-[#1A1915]"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setShowAddProject(false)} className="px-2.5 py-1 font-mono text-xs text-[#8A8571]">Cancel</button>
                <button type="submit" className="bg-[#1B3A5C] px-3 py-1 font-mono text-xs text-white font-medium">Save project</button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {projects?.length === 0 ? (
              <EmptyState
                title="No technical projects recorded yet"
                description="Showcase real projects and GitHub repositories to strengthen your evidence score."
                actionLabel="Add project"
                onAction={() => setShowAddProject(true)}
              />
            ) : (
              projects?.map((p: Project) => (
                <div key={p.id} className="border border-[#D9D5C7] p-3.5 bg-[#FBFAF7] hover:bg-white transition-colors">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-semibold text-xs text-[#1A1915]">{p.title}</h3>
                    {p.githubUrl && (
                      <a href={p.githubUrl} target="_blank" rel="noreferrer" className="font-mono text-[#1B3A5C] hover:underline inline-flex items-center gap-1 text-[11px]">
                        Repository <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-[#3D3A31] text-xs mt-1.5 leading-relaxed">{p.description}</p>
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {p.technologies?.map((tech) => (
                      <span key={tech} className="border border-[#D9D5C7] bg-white px-1.5 py-0.5 font-mono text-[10px] text-[#3D3A31]">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Certificate Evidence */}
        <div className="border border-[#D9D5C7] bg-white p-6">
          <div className="flex items-center justify-between mb-4 border-b border-[#D9D5C7] pb-3">
            <div>
              <h2 className="font-display text-sm font-semibold text-[#1A1915] flex items-center gap-1.5">
                <Award className="h-4 w-4 text-[#1B3A5C]" />
                Certificates & Credentials ({certificates?.length || 0})
              </h2>
              <p className="font-mono text-[11px] text-[#8A8571]">Supporting external credentials</p>
            </div>
            <button
              onClick={() => setShowAddCert(!showAddCert)}
              className="inline-flex items-center gap-1 border border-[#D9D5C7] bg-[#FBFAF7] px-2.5 py-1 font-mono text-xs font-medium text-[#3D3A31] hover:bg-[#F3F1EA]"
            >
              <Plus className="h-3 w-3" /> Add certificate
            </button>
          </div>

          {showAddCert && (
            <form onSubmit={handleAddCert} className="mb-4 bg-[#FBFAF7] p-3.5 border border-[#D9D5C7] space-y-2.5 text-xs">
              <input
                type="text"
                placeholder="Certificate title (e.g. AWS Certified Developer)"
                required
                value={certForm.title}
                onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                className="w-full border border-[#D9D5C7] p-1.5 bg-white text-[#1A1915]"
              />
              <input
                type="text"
                placeholder="Issuing organization (e.g. Amazon Web Services)"
                required
                value={certForm.issuer}
                onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                className="w-full border border-[#D9D5C7] p-1.5 bg-white text-[#1A1915]"
              />
              <input
                type="url"
                placeholder="Verification / credential URL"
                value={certForm.credentialUrl}
                onChange={(e) => setCertForm({ ...certForm, credentialUrl: e.target.value })}
                className="w-full border border-[#D9D5C7] p-1.5 bg-white text-[#1A1915]"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setShowAddCert(false)} className="px-2.5 py-1 font-mono text-xs text-[#8A8571]">Cancel</button>
                <button type="submit" className="bg-[#1B3A5C] px-3 py-1 font-mono text-xs text-white font-medium">Save certificate</button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {certificates?.length === 0 ? (
              <EmptyState
                title="No certificates linked yet"
                description="Attach cloud credentials, hackathon honors, or certificates to enrich your evidence profile."
                actionLabel="Add certificate"
                onAction={() => setShowAddCert(true)}
              />
            ) : (
              certificates?.map((c: Certificate) => (
                <div key={c.id} className="border border-[#D9D5C7] p-3.5 bg-[#FBFAF7] hover:bg-white transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-semibold text-xs text-[#1A1915]">{c.title}</h3>
                      <p className="font-mono text-[11px] text-[#8A8571]">{c.issuer} · Issued {c.issueDate}</p>
                    </div>
                    {c.credentialUrl && (
                      <a href={c.credentialUrl} target="_blank" rel="noreferrer" className="font-mono text-[#1B3A5C] hover:underline inline-flex items-center gap-1 text-[11px]">
                        Verify <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

