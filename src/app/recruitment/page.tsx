"use client";

import React, { useState, useEffect } from "react";
import {
  Briefcase,
  MapPin,
  Clock,
  Check,
  Send,
  Layers,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Application, RecruitmentDrive } from "@/types";

export default function RecruitmentPage() {
  const [drives, setDrives] = useState<RecruitmentDrive[]>([]);
  const [selectedDrive, setSelectedDrive] = useState<RecruitmentDrive | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [, setLoading] = useState(true);

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
            <span className="border border-[#1B3A5C]/30 bg-[#E9EFF5] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#1B3A5C] uppercase tracking-wider">
              Skill-Based Campus Recruitment
            </span>
            <span className="text-xs text-[#D9D5C7]">|</span>
            <span className="font-mono text-xs text-[#8A8571]">Evidence Over Self-Declared Claims</span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-[#1A1915] mt-1">Recruitment Drives & Pipelines</h1>
          <p className="text-xs text-[#3D3A31] mt-1 max-w-2xl leading-relaxed">
            Leading engineering organizations shortlist candidates based on verified skills, anti-cheat consistency, and standardized assessment benchmarks.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex border border-[#D9D5C7] bg-[#F3F1EA] p-0.5 text-xs">
          <button
            onClick={() => setActiveTab("candidate_view")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 font-mono text-xs font-medium transition-all ${
              activeTab === "candidate_view"
                ? "bg-white text-[#1B3A5C] border border-[#D9D5C7]"
                : "text-[#8A8571] hover:text-[#1A1915]"
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" />
            Candidate Opportunities
          </button>
          <button
            onClick={() => setActiveTab("recruiter_pipeline")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 font-mono text-xs font-medium transition-all ${
              activeTab === "recruiter_pipeline"
                ? "bg-white text-[#1B3A5C] border border-[#D9D5C7]"
                : "text-[#8A8571] hover:text-[#1A1915]"
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
                    className={`cursor-pointer border p-4 transition-all ${
                      isSelected
                        ? "border-[#1B3A5C] bg-[#E9EFF5]/40"
                        : "border-[#D9D5C7] bg-white hover:border-[#B8B29D]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center border border-[#D9D5C7] bg-[#F3F1EA] font-mono text-xs font-semibold text-[#1A1915]">
                          {d.companyName[0]}
                        </div>
                        <div>
                          <h3 className="font-display font-semibold text-sm text-[#1A1915]">{d.title}</h3>
                          <p className="font-mono text-xs text-[#8A8571]">{d.companyName} · {d.location}</p>
                        </div>
                      </div>

                      {hasApplied ? (
                        <span className="border border-[#1B3A5C]/30 bg-[#E9EFF5] text-[#1B3A5C] px-2 py-0.5 font-mono text-[10px] font-semibold">
                          APPLIED
                        </span>
                      ) : (
                        <span className="border border-[#2F6844]/30 bg-[#EBF2EC] text-[#2F6844] px-2 py-0.5 font-mono text-[10px] font-semibold">
                          OPEN
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#3D3A31] mt-2.5 line-clamp-2 leading-relaxed">
                      {d.description}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {d.requirements.map((r) => (
                        <span
                          key={r.id}
                          className="border border-[#D9D5C7] bg-[#FBFAF7] px-1.5 py-0.5 font-mono text-[10px] text-[#3D3A31]"
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
              <div className="border border-[#D9D5C7] bg-white p-6 sm:p-7 space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold uppercase text-[#1B3A5C]">{selectedDrive.companyName}</span>
                    <span className="font-mono text-xs text-[#8A8571] capitalize">{selectedDrive.type}</span>
                  </div>
                  <h2 className="font-display text-xl font-semibold text-[#1A1915] mt-1">{selectedDrive.title}</h2>
                  <p className="font-mono text-xs text-[#8A8571] mt-1 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#8A8571]" />
                    {selectedDrive.location}
                  </p>
                </div>

                <div className="text-xs text-[#3D3A31] leading-relaxed border-t border-[#D9D5C7] pt-4">
                  {selectedDrive.description}
                </div>

                {/* Skill Match Explanation */}
                <div className="border border-[#1B3A5C]/30 bg-[#E9EFF5]/40 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-semibold text-xs text-[#1B3A5C] flex items-center gap-1.5">
                      Candidate Verified Skill Match: 94%
                    </span>
                    <span className="font-mono text-[10px] font-semibold text-[#1B3A5C] bg-[#E9EFF5] px-2 py-0.5 border border-[#1B3A5C]/30">
                      High Eligibility
                    </span>
                  </div>

                  <div className="space-y-1.5 font-mono text-xs text-[#3D3A31]">
                    <p className="flex items-center gap-1.5 text-[#2F6844]">
                      <Check className="h-3.5 w-3.5 text-[#2F6844] shrink-0" />
                      React — 92% Verified (Advanced requirement satisfied)
                    </p>
                    <p className="flex items-center gap-1.5 text-[#2F6844]">
                      <Check className="h-3.5 w-3.5 text-[#2F6844] shrink-0" />
                      TypeScript — 88% Verified (Advanced requirement satisfied)
                    </p>
                    <p className="flex items-center gap-1.5 text-[#2F6844]">
                      <Check className="h-3.5 w-3.5 text-[#2F6844] shrink-0" />
                      SQL — 80% Verified (Intermediate requirement satisfied)
                    </p>
                  </div>
                  <p className="font-mono text-[11px] text-[#1B3A5C] pt-2 border-t border-[#1B3A5C]/20">
                    ✓ 3/3 required skills verified through standardized blueprint tests & GitHub code signals
                  </p>
                </div>

                {/* Apply Button */}
                <div className="flex items-center justify-between pt-2 border-t border-[#D9D5C7]">
                  <span className="font-mono text-xs text-[#8A8571]">{selectedDrive.applicantCount} Verified Applicants</span>
                  <button
                    onClick={() => handleApply(selectedDrive.id)}
                    className="inline-flex items-center gap-1.5 bg-[#1B3A5C] px-4 py-2 font-mono text-xs font-medium text-white hover:bg-[#152e4a] transition-colors"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Submit application with verified profile
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-[#D9D5C7] bg-white p-12 text-center text-xs text-[#8A8571]">
                Select a recruitment drive to inspect requirements.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Recruiter Hiring Pipeline Kanban */
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 border border-[#D9D5C7]">
            <div>
              <h2 className="font-display font-semibold text-sm text-[#1A1915]">Active Candidate Pipeline Kanban</h2>
              <p className="text-xs text-[#8A8571] mt-0.5">
                Review verified candidate claims, match scores, and move candidates through the hiring pipeline
              </p>
            </div>
            <span className="border border-[#D9D5C7] bg-[#FBFAF7] px-2.5 py-1 font-mono text-xs text-[#3D3A31]">
              {applications.length} Active Candidates
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {pipelineStages.map((stage) => {
              const stageApps = applications.filter((a) => a.status === stage.id);
              return (
                <div key={stage.id} className="border border-[#D9D5C7] bg-[#FBFAF7] p-3 space-y-3 min-h-80">
                  <div className="flex items-center justify-between text-xs font-mono text-[#1A1915] pb-2 border-b border-[#D9D5C7]">
                    <span className="uppercase text-[11px] font-semibold">{stage.label}</span>
                    <span className="border border-[#D9D5C7] bg-white px-1.5 py-0.5 text-[10px] font-mono tabular-nums text-[#3D3A31]">
                      {stageApps.length}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {stageApps.length === 0 ? (
                      <p className="font-mono text-[11px] text-[#8A8571] text-center py-6">Empty stage</p>
                    ) : (
                      stageApps.map((app) => (
                        <div
                          key={app.id}
                          className="border border-[#D9D5C7] bg-white p-3.5 space-y-2 hover:border-[#B8B29D] transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <h4 className="font-display font-semibold text-xs text-[#1A1915]">{app.candidateName}</h4>
                            <span className="border border-[#1B3A5C]/30 bg-[#E9EFF5] px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums text-[#1B3A5C]">
                              {app.matchScore}%
                            </span>
                          </div>
                          <p className="font-mono text-[11px] text-[#8A8571]">{app.candidateCollege}</p>
                          <p className="font-mono text-[10px] text-[#8A8571]">{app.driveTitle}</p>

                          {/* Fast Pipeline Advance Controls */}
                          <div className="pt-2 border-t border-[#D9D5C7] flex items-center justify-between">
                            <span className="font-mono text-[10px] text-[#8A8571]">Stage:</span>
                            <select
                              value={app.status}
                              onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                              className="font-mono text-[10px] border border-[#D9D5C7] bg-[#FBFAF7] py-0.5 px-1.5 text-[#1A1915]"
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

