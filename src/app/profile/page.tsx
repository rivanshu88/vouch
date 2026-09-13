"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  FileCode2,
  Award,
  Plus,
  ExternalLink,
  RefreshCw,
  Star,
  GitBranch,
  ArrowRight,
  Code2,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { SkillBadge } from "@/components/SkillBadge";
import { EvidenceScoreCard } from "@/components/EvidenceScoreCard";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { CandidateProfile, CandidateSkill, Certificate, Project, Skill } from "@/types";

import { useAuth, DEMO_PERSONAS } from "@/lib/auth/auth-context";
import { AlertCircle } from "lucide-react";

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
          <div className="h-44 rounded-xl bg-zinc-200"></div>
          <div className="h-72 rounded-xl bg-zinc-200"></div>
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
              Profile Evidence
            </span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
              Sign in to view Candidate Profile & Evidence
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-zinc-600 max-w-xl mx-auto leading-relaxed">
              Manage your technical skill registry, sync GitHub commit metrics, upload verified certificates, and showcase real project artifacts.
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
                    View Profile →
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
            <h2 className="text-base font-bold text-rose-950">Unable to Load Profile</h2>
            <p className="text-xs text-rose-700 mt-1">{error}</p>
          </div>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-700 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-800 transition"
          >
            Retry Connection
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
      <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-start sm:items-center gap-5">
            <div className="relative">
              <img
                src={profile?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                alt={profile?.fullName}
                className="h-20 w-20 rounded-full object-cover border-2 border-zinc-100 shadow-xs"
              />
              <span
                className="absolute bottom-0 right-0 h-5 w-5 rounded-full border-2 border-white bg-emerald-500"
                title="Identity Verified Active"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-950">{profile?.fullName}</h1>
                <VerifiedBadge level="tier_1" showScore score={evidenceStrength?.totalScore || 90} />
              </div>
              <p className="text-xs font-medium text-zinc-500 mt-1">
                {profile?.college} · {profile?.branch} · Class of {profile?.graduationYear}
              </p>
              <p className="text-xs text-zinc-600 mt-2.5 max-w-2xl leading-relaxed">
                {profile?.bio}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded bg-zinc-100 px-2.5 py-0.5 text-[11px] font-mono text-zinc-700">
                  ID: {profile?.id || "usr-01"}
                </span>
                <span className="rounded bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-800 border border-sky-100">
                  {profile?.targetRole || "Full Stack Engineer"}
                </span>
              </div>
            </div>
          </div>

          {evidenceStrength && (
            <div className="shrink-0 w-full lg:w-84">
              <EvidenceScoreCard data={evidenceStrength} />
            </div>
          )}
        </div>
      </div>

      {/* Skills Section */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-sky-600" />
              <h2 className="text-base font-bold text-zinc-950">Technical Skills & Verification Engine</h2>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Evidence-backed skill registry with benchmarked scores and anti-cheat consistency
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddSkill(!showAddSkill)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Declare Claim
            </button>
            <Link
              href="/assessments"
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors shadow-2xs"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Take Assessment
            </Link>
          </div>
        </div>

        {/* Add Skill Form */}
        {showAddSkill && (
          <form
            onSubmit={handleAddSkill}
            className="mb-6 rounded-lg border border-sky-200 bg-sky-50/40 p-4 animate-in fade-in duration-200"
          >
            <p className="text-xs font-semibold text-sky-950 mb-2">Declare New Technical Skill</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Select Skill</label>
                <select
                  value={skillForm.skillId}
                  onChange={(e) => setSkillForm({ ...skillForm, skillId: e.target.value })}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900"
                >
                  {skillsList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Self-Declared Level</label>
                <select
                  value={skillForm.declaredLevel}
                  onChange={(e) => setSkillForm({ ...skillForm, declaredLevel: e.target.value as any })}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="rounded-md bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800"
                >
                  Save Claim
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSkill(false)}
                  className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100"
                >
                  Cancel
                </button>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-zinc-500">
              * Newly declared claims will show as unverified until you pass the corresponding blueprint assessment.
            </p>
          </form>
        )}

        {/* Verified Skills Partition */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                Verified Skills ({verifiedSkills.length})
              </h3>
            </div>
            {verifiedSkills.length === 0 ? (
              <EmptyState
                title="No verified skills yet"
                description="Complete standardized blueprint assessments to prove your technical competence and earn verified badges."
                actionLabel="Take Skill Assessment"
                onAction={() => (window.location.href = "/assessments")}
              />
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {verifiedSkills.map((s: CandidateSkill) => (
                  <SkillBadge
                    key={s.id}
                    name={s.skillName || s.skillId}
                    level={s.declaredLevel}
                    verified={true}
                    score={s.verificationScore}
                    size="lg"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Declared Claims Partition */}
          {declaredSkills.length > 0 && (
            <div className="border-t border-zinc-100 pt-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-zinc-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Self-Declared Claims ({declaredSkills.length})
                  </h3>
                </div>
                <Link
                  href="/assessments"
                  className="text-[11px] font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1"
                >
                  Verify all pending claims <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {declaredSkills.map((s: CandidateSkill) => (
                  <SkillBadge
                    key={s.id}
                    name={s.skillName || s.skillId}
                    level={s.declaredLevel}
                    verified={false}
                    score={s.verificationScore}
                    size="lg"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* GitHub External Technical Evidence */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-zinc-900 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <h2 className="text-base font-bold text-zinc-950">GitHub Technical Evidence</h2>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Sync repositories, commit frequency, and language distributions to strengthen your profile
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="github-username"
              value={ghUsername}
              onChange={(e) => setGhUsername(e.target.value)}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500"
            />
            <button
              onClick={handleSyncGitHub}
              disabled={syncingGh}
              className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-2xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncingGh ? "animate-spin" : ""}`} />
              {syncingGh ? "Syncing..." : "Sync Evidence"}
            </button>
          </div>
        </div>

        {github ? (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg bg-zinc-50/80 p-3.5 border border-zinc-100">
                <span className="text-[11px] font-medium text-zinc-500">Public Repos</span>
                <p className="text-xl font-bold text-zinc-950 mt-0.5">{github.publicReposCount}</p>
              </div>
              <div className="rounded-lg bg-zinc-50/80 p-3.5 border border-zinc-100">
                <span className="text-[11px] font-medium text-zinc-500">Total Stars</span>
                <p className="text-xl font-bold text-zinc-950 mt-0.5">{github.totalStars}</p>
              </div>
              <div className="rounded-lg bg-zinc-50/80 p-3.5 border border-zinc-100">
                <span className="text-[11px] font-medium text-zinc-500">Primary Language</span>
                <p className="text-xl font-bold text-sky-700 mt-0.5">
                  {github.topLanguages?.[0]?.language || "TypeScript"}
                </p>
              </div>
              <div className="rounded-lg bg-zinc-50/80 p-3.5 border border-zinc-100">
                <span className="text-[11px] font-medium text-zinc-500">Last Synchronized</span>
                <p className="text-xs font-semibold text-zinc-700 mt-1.5">
                  {new Date(github.lastSyncedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>

            {/* Language distribution bar */}
            <div>
              <span className="text-xs font-semibold text-zinc-800">Codebase Language Distribution</span>
              <div className="mt-2 flex h-2 w-full rounded-full overflow-hidden bg-zinc-100">
                {github.topLanguages?.map((l: any, idx: number) => {
                  const colors = ["bg-sky-500", "bg-emerald-500", "bg-indigo-500", "bg-amber-500"];
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
              <div className="mt-2.5 flex flex-wrap gap-3 text-[11px] text-zinc-500">
                {github.topLanguages?.map((l: any) => (
                  <span key={l.language} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-zinc-400"></span>
                    <span className="font-semibold text-zinc-800">{l.language}</span> {l.percentage}%
                  </span>
                ))}
              </div>
            </div>

            {/* Repositories cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              {github.recentRepos?.map((repo: any) => (
                <div key={repo.name} className="rounded-lg border border-zinc-200 bg-white p-4 hover:border-zinc-300 transition-colors shadow-2xs">
                  <div className="flex items-center justify-between">
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-xs text-sky-700 hover:underline inline-flex items-center gap-1"
                    >
                      {repo.name} <ExternalLink className="h-3 w-3" />
                    </a>
                    <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-400" />
                      {repo.stars}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 mt-2 line-clamp-2 leading-relaxed">
                    {repo.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-100 pt-2">
                    <span className="font-mono text-zinc-700 font-medium">{repo.primaryLanguage}</span>
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
            actionLabel="Sync Profile"
            onAction={() => handleSyncGitHub()}
          />
        )}
      </div>

      {/* Projects & Certificates Supporting Evidence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Evidence */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                <FileCode2 className="h-4 w-4 text-emerald-600" />
                Technical Projects ({projects?.length || 0})
              </h2>
              <p className="text-[11px] text-zinc-500">Real projects with public repositories</p>
            </div>
            <button
              onClick={() => setShowAddProject(!showAddProject)}
              className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
            >
              <Plus className="h-3 w-3" /> Add Project
            </button>
          </div>

          {showAddProject && (
            <form onSubmit={handleAddProject} className="mb-4 rounded-lg bg-zinc-50 p-3.5 border border-zinc-200 space-y-2.5 text-xs">
              <input
                type="text"
                placeholder="Project Title"
                required
                value={projectForm.title}
                onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                className="w-full rounded border border-zinc-300 p-1.5 bg-white text-zinc-900"
              />
              <textarea
                placeholder="Technical architecture, challenges, and measurable results"
                rows={2}
                required
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                className="w-full rounded border border-zinc-300 p-1.5 bg-white text-zinc-900"
              />
              <input
                type="text"
                placeholder="Technologies (comma-separated, e.g. React, Next.js, Redis)"
                value={projectForm.technologies}
                onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value })}
                className="w-full rounded border border-zinc-300 p-1.5 bg-white text-zinc-900"
              />
              <input
                type="url"
                placeholder="GitHub Repo URL"
                value={projectForm.githubUrl}
                onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                className="w-full rounded border border-zinc-300 p-1.5 bg-white text-zinc-900"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setShowAddProject(false)} className="px-2.5 py-1 text-zinc-600">Cancel</button>
                <button type="submit" className="rounded bg-zinc-900 px-3 py-1 text-white font-semibold">Save Project</button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {projects?.length === 0 ? (
              <EmptyState
                title="No technical projects recorded yet"
                description="Showcase real projects and GitHub repositories to strengthen your evidence score."
                actionLabel="Add Project"
                onAction={() => setShowAddProject(true)}
              />
            ) : (
              projects?.map((p: Project) => (
                <div key={p.id} className="rounded-lg border border-zinc-200 p-3.5 bg-zinc-50/40 hover:bg-zinc-50/70 transition-colors">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-xs text-zinc-900">{p.title}</h3>
                    {p.githubUrl && (
                      <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1 text-[11px]">
                        Repository <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-zinc-600 text-xs mt-1.5 leading-relaxed">{p.description}</p>
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {p.technologies?.map((tech) => (
                      <span key={tech} className="rounded bg-zinc-200/70 px-1.5 py-0.5 text-[10px] font-medium text-zinc-700">
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
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                <Award className="h-4 w-4 text-purple-600" />
                Certificates & Credentials ({certificates?.length || 0})
              </h2>
              <p className="text-[11px] text-zinc-500">Supporting external credentials</p>
            </div>
            <button
              onClick={() => setShowAddCert(!showAddCert)}
              className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
            >
              <Plus className="h-3 w-3" /> Add Certificate
            </button>
          </div>

          {showAddCert && (
            <form onSubmit={handleAddCert} className="mb-4 rounded-lg bg-zinc-50 p-3.5 border border-zinc-200 space-y-2.5 text-xs">
              <input
                type="text"
                placeholder="Certificate Title (e.g. AWS Certified Developer)"
                required
                value={certForm.title}
                onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                className="w-full rounded border border-zinc-300 p-1.5 bg-white text-zinc-900"
              />
              <input
                type="text"
                placeholder="Issuing Organization (e.g. Amazon Web Services)"
                required
                value={certForm.issuer}
                onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                className="w-full rounded border border-zinc-300 p-1.5 bg-white text-zinc-900"
              />
              <input
                type="url"
                placeholder="Verification / Credential URL"
                value={certForm.credentialUrl}
                onChange={(e) => setCertForm({ ...certForm, credentialUrl: e.target.value })}
                className="w-full rounded border border-zinc-300 p-1.5 bg-white text-zinc-900"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setShowAddCert(false)} className="px-2.5 py-1 text-zinc-600">Cancel</button>
                <button type="submit" className="rounded bg-zinc-900 px-3 py-1 text-white font-semibold">Save Certificate</button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {certificates?.length === 0 ? (
              <EmptyState
                title="No certificates linked yet"
                description="Attach cloud credentials, hackathon honors, or certificates to enrich your evidence profile."
                actionLabel="Add Certificate"
                onAction={() => setShowAddCert(true)}
              />
            ) : (
              certificates?.map((c: Certificate) => (
                <div key={c.id} className="rounded-lg border border-zinc-200 p-3.5 bg-zinc-50/40 hover:bg-zinc-50/70 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-xs text-zinc-900">{c.title}</h3>
                      <p className="text-[11px] text-zinc-500">{c.issuer} · Issued {c.issueDate}</p>
                    </div>
                    {c.credentialUrl && (
                      <a href={c.credentialUrl} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1 text-[11px]">
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
