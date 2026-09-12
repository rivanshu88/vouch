"use client";

import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Building2,
  MapPin,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Users,
  Search,
  Check,
  ChevronRight,
  Send,
  Calendar,
  Layers,
  GraduationCap,
} from "lucide-react";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Application, RecruitmentDrive } from "@/types";

export default function RecruitmentPage() {
  const [drives, setDrives] = useState<RecruitmentDrive[]>([]);
  const [selectedDrive, setSelectedDrive] = useState<RecruitmentDrive | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Active tab: 'candidate_view' vs 'recruiter_pipeline'
  const [activeTab, setActiveTab] = useState<"candidate_view" | "recruiter_pipeline">("candidate_view");

  const loadData = async () => {
    try {
      const [drivesRes, appsRes] = await Promise.all([
        fetch("/api/recruitment/drives"),
        fetch("/api/recruitment/applications"),
      ]);

      const drivesJson = await drivesRes.json();
      const appsJson = await appsRes.json();

      if (drivesJson.success) {
        setDrives(drivesJson.data);
        if (!selectedDrive && drivesJson.data.length > 0) {
          setSelectedDrive(drivesJson.data[0]);
        }
      }
      if (appsJson.success) {
        setApplications(appsJson.data);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApply = async (driveId: string) => {
    try {
      const res = await fetch(`/api/recruitment/drives/${driveId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: "usr-01" }),
      });
      const json = await res.json();
      if (json.success) {
        alert("Application submitted with your verified skill profile!");
        loadData();
      } else {
        alert(json.error?.message || "Failed to apply");
      }
    } catch {}
  };

  const handleUpdateStatus = async (applicationId: string, status: string) => {
    try {
      const res = await fetch(`/api/recruitment/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        loadData();
      }
    } catch {}
  };

  const pipelineStages = [
    { id: "applied", label: "Applied" },
    { id: "eligible", label: "Eligible" },
    { id: "shortlisted", label: "Shortlisted" },
    { id: "interview", label: "Interview" },
    { id: "selected", label: "Selected" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800 uppercase tracking-wider">
              Skill-Based Campus Recruitment
            </span>
            <span className="text-xs text-zinc-400">·</span>
            <span className="text-xs text-zinc-500 font-medium">Evidence Over Self-Declared Claims</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-950 mt-1">Recruitment Drives & Pipelines</h1>
          <p className="text-xs text-zinc-600 mt-1 max-w-2xl leading-relaxed">
            Leading engineering organizations shortlist candidates based on verified skills, anti-cheat consistency, and standardized assessment benchmarks.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex rounded-lg border border-zinc-200 bg-white p-1 text-xs shadow-2xs">
          <button
            onClick={() => setActiveTab("candidate_view")}
            className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 font-semibold transition-all ${
              activeTab === "candidate_view"
                ? "bg-zinc-950 text-white shadow-2xs"
                : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" />
            Candidate Opportunities
          </button>
          <button
            onClick={() => setActiveTab("recruiter_pipeline")}
            className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 font-semibold transition-all ${
              activeTab === "recruiter_pipeline"
                ? "bg-zinc-950 text-white shadow-2xs"
                : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Recruiter Pipeline
          </button>
        </div>
      </div>

      {activeTab === "candidate_view" ? (
        /* Candidate View: Opportunities Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Drives Directory (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {drives.length === 0 ? (
              <EmptyState
                title="No active recruitment drives"
                description="Check back soon as new campus placement drives are scheduled."
              />
            ) : (
              drives.map((d) => {
                const isSelected = selectedDrive?.id === d.id;
                const hasApplied = applications.some((a) => a.driveId === d.id && a.candidateId === "usr-01");

                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDrive(d)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all shadow-2xs ${
                      isSelected
                        ? "border-sky-600 bg-sky-50/50 ring-2 ring-sky-600/20"
                        : "border-zinc-200 bg-white hover:border-zinc-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-white font-bold text-xs shadow-2xs">
                          {d.companyName[0]}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-zinc-950">{d.title}</h3>
                          <p className="text-xs text-zinc-500 font-medium">{d.companyName} · {d.location}</p>
                        </div>
                      </div>

                      {hasApplied ? (
                        <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800 border border-sky-200">
                          APPLIED
                        </span>
                      ) : (
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                          OPEN
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-600 mt-2.5 line-clamp-2 leading-relaxed">
                      {d.description}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {d.requirements.map((r) => (
                        <span
                          key={r.id}
                          className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-700 border border-zinc-200/60"
                        >
                          {r.skillName} ({r.minimumLevel})
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Selected Drive Deep Dive (7 cols) */}
          <div className="lg:col-span-7">
            {selectedDrive ? (
              <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-7 shadow-xs space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-700">{selectedDrive.companyName}</span>
                    <span className="text-xs text-zinc-400 font-medium capitalize">{selectedDrive.type}</span>
                  </div>
                  <h2 className="text-xl font-bold text-zinc-950 mt-1">{selectedDrive.title}</h2>
                  <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                    {selectedDrive.location}
                  </p>
                </div>

                <div className="text-xs text-zinc-600 leading-relaxed border-t border-zinc-100 pt-4">
                  {selectedDrive.description}
                </div>

                {/* Skill Match Explanation */}
                <div className="rounded-lg border border-sky-200 bg-sky-50/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-sky-950 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-sky-600" />
                      Candidate Verified Skill Match: 94%
                    </span>
                    <span className="text-[10px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded border border-sky-200">
                      High Eligibility
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-zinc-700">
                    <p className="flex items-center gap-1.5 text-emerald-800 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      React — 92% Verified (Advanced requirement satisfied)
                    </p>
                    <p className="flex items-center gap-1.5 text-emerald-800 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      TypeScript — 88% Verified (Advanced requirement satisfied)
                    </p>
                    <p className="flex items-center gap-1.5 text-emerald-800 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      SQL — 80% Verified (Intermediate requirement satisfied)
                    </p>
                  </div>
                  <p className="text-[11px] text-sky-800 font-medium pt-2 border-t border-sky-200/60">
                    ✓ 3/3 required skills verified through standardized blueprint tests & GitHub code signals
                  </p>
                </div>

                {/* Apply Button */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                  <span className="text-xs text-zinc-500 font-medium">{selectedDrive.applicantCount} Verified Applicants</span>
                  <button
                    onClick={() => handleApply(selectedDrive.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors shadow-2xs"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Submit Application with Verified Profile
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center text-xs text-zinc-400 shadow-2xs">
                Select a recruitment drive to inspect requirements.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Recruiter Hiring Pipeline Kanban */
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs">
            <div>
              <h2 className="font-bold text-sm text-zinc-950">Active Candidate Pipeline Kanban</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Review verified candidate claims, match scores, and move candidates through the hiring pipeline
              </p>
            </div>
            <span className="rounded bg-zinc-100 px-2.5 py-1 font-mono text-xs font-semibold text-zinc-700 border border-zinc-200">
              {applications.length} Active Candidates
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {pipelineStages.map((stage) => {
              const stageApps = applications.filter((a) => a.status === stage.id);
              return (
                <div key={stage.id} className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 space-y-3 min-h-80 shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-700 pb-2 border-b border-zinc-200">
                    <span className="uppercase tracking-wider text-[11px] text-zinc-600">{stage.label}</span>
                    <span className="rounded-full bg-zinc-200 px-1.5 py-0.5 text-[10px] font-mono text-zinc-700 font-bold">
                      {stageApps.length}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {stageApps.length === 0 ? (
                      <p className="text-[11px] text-zinc-400 text-center py-6">Empty stage</p>
                    ) : (
                      stageApps.map((app) => (
                        <div
                          key={app.id}
                          className="rounded-lg border border-zinc-200 bg-white p-3.5 shadow-2xs space-y-2 hover:border-zinc-300 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <h4 className="font-bold text-xs text-zinc-950">{app.candidateName}</h4>
                            <span className="rounded bg-sky-50 px-1.5 py-0.5 text-[10px] font-bold text-sky-800 border border-sky-100">
                              {app.matchScore}%
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-500">{app.candidateCollege}</p>
                          <p className="text-[10px] text-zinc-400 font-medium">{app.driveTitle}</p>

                          {/* Fast Pipeline Advance Controls */}
                          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                            <span className="text-[10px] text-zinc-400">Stage:</span>
                            <select
                              value={app.status}
                              onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                              className="text-[10px] rounded border border-zinc-200 bg-zinc-50 py-0.5 px-1.5 font-medium text-zinc-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
                            >
                              <option value="applied">Applied</option>
                              <option value="eligible">Eligible</option>
                              <option value="shortlisted">Shortlisted</option>
                              <option value="interview">Interview</option>
                              <option value="selected">Selected</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
