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
} from "lucide-react";
import { SkillBadge } from "@/components/SkillBadge";
import { EvidenceScoreCard } from "@/components/EvidenceScoreCard";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { CandidateProfile, CandidateSkill, Certificate, Project, Skill } from "@/types";

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
    try {
      const [profRes, skillsRes] = await Promise.all([
        fetch("/api/profile?id=usr-01"),
        fetch("/api/skills"),
      ]);

      const profJson = await profRes.json();
      const skillsJson = await skillsRes.json();

      if (profJson.success) {
        setProfileData(profJson.data);
        if (profJson.data.profile?.githubUsername) {
          setGhUsername(profJson.data.profile.githubUsername);
        }
      }
      if (skillsJson.success) setSkillsList(skillsJson.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/profile/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: "usr-01",
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
      const res = await fetch("/api/profile/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: "usr-01",
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
      const res = await fetch("/api/profile/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: "usr-01",
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
      const res = await fetch("/api/github/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: "usr-01",
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

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-44 rounded-xl bg-zinc-200"></div>
          <div className="h-72 rounded-xl bg-zinc-200"></div>
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
              <p className="text-xs text-zinc-400 text-center py-6">No projects recorded yet.</p>
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
              <p className="text-xs text-zinc-400 text-center py-6">No certificates recorded yet.</p>
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
