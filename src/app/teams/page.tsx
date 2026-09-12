"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Filter,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Send,
  Check,
  X,
  UserPlus,
  SlidersHorizontal,
  Target,
  Layers,
} from "lucide-react";
import { SkillCoverageBar } from "@/components/SkillCoverageBar";
import { CandidateMatchCard } from "@/components/CandidateMatchCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { CandidateMatch, Skill, Team, TeamJoinRequest, TeamVerificationTest } from "@/types";

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamDetails, setTeamDetails] = useState<any | null>(null);
  const [candidateMatches, setCandidateMatches] = useState<CandidateMatch[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkillFilter, setSelectedSkillFilter] = useState("");

  // Create Team Modal
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamHackathon, setNewTeamHackathon] = useState("");
  const [newTeamDesc, setNewTeamDesc] = useState("");

  // Issue Verification Challenge Modal
  const [verifyModalCandidate, setVerifyModalCandidate] = useState<string | null>(null);
  const [verifySkill, setVerifySkill] = useState("react");
  const [verifyDifficulty, setVerifyDifficulty] = useState("intermediate");
  const [verifyRequiredScore, setVerifyRequiredScore] = useState(75);

  const loadTeams = async () => {
    try {
      const res = await fetch("/api/teams");
      const json = await res.json();
      if (json.success) {
        setTeams(json.data);
        if (!selectedTeam && json.data.length > 0) {
          loadTeamDetails(json.data[0].id);
        }
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  const loadTeamDetails = async (teamId: string) => {
    try {
      const [detailRes, matchRes] = await Promise.all([
        fetch(`/api/teams/${teamId}`),
        fetch(`/api/matching/candidates?teamId=${teamId}`),
      ]);
      const detailJson = await detailRes.json();
      const matchJson = await matchRes.json();

      if (detailJson.success) {
        setSelectedTeam(detailJson.data.team);
        setTeamDetails(detailJson.data);
      }
      if (matchJson.success) {
        setCandidateMatches(matchJson.data);
      }
    } catch {}
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTeamName,
          hackathonName: newTeamHackathon,
          description: newTeamDesc,
          requirements: [
            { skillId: "react", role: "Frontend", minimumLevel: "intermediate", minimumScore: 75, required: true },
            { skillId: "python", role: "ML / Backend", minimumLevel: "intermediate", minimumScore: 70, required: true },
          ],
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowCreateTeam(false);
        setNewTeamName("");
        setNewTeamHackathon("");
        setNewTeamDesc("");
        loadTeams();
        loadTeamDetails(json.data.id);
      }
    } catch {}
  };

  const handleJoinRequest = async (teamId: string) => {
    try {
      const res = await fetch(`/api/teams/${teamId}/join-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: "usr-01" }),
      });
      const json = await res.json();
      if (json.success) {
        alert("Join request submitted to team leader!");
        loadTeamDetails(teamId);
      } else {
        alert(json.error?.message || "Failed to submit request.");
      }
    } catch {}
  };

  const handleIssueVerificationTest = async () => {
    if (!selectedTeam || !verifyModalCandidate) return;
    try {
      const res = await fetch("/api/team-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: selectedTeam.id,
          candidateId: verifyModalCandidate,
          skillId: verifySkill,
          difficulty: verifyDifficulty,
          requiredScore: Number(verifyRequiredScore),
        }),
      });
      const json = await res.json();
      if (json.success) {
        alert(`Verification challenge successfully issued to candidate!`);
        setVerifyModalCandidate(null);
        loadTeamDetails(selectedTeam.id);
      }
    } catch {}
  };

  const handleDecision = async (testId: string, decision: "accepted" | "rejected") => {
    try {
      const res = await fetch(`/api/team-verification/${testId}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          reason: decision === "accepted" ? "Satisfied all technical test requirements" : "Score below threshold",
        }),
      });
      if (res.ok && selectedTeam) {
        loadTeamDetails(selectedTeam.id);
        loadTeams();
      }
    } catch {}
  };

  const filteredTeams = teams.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.hackathonName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSkill =
      !selectedSkillFilter ||
      t.requirements?.some((r) => r.skillId === selectedSkillFilter);
    return matchesSearch && matchesSkill;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800 uppercase tracking-wider">
              Hackathon Capability Matching
            </span>
            <span className="text-xs text-zinc-400">·</span>
            <span className="text-xs text-zinc-500 font-medium">Complementarity over Similarity</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-950 mt-1">Hackathon Teams & Verification</h1>
          <p className="text-xs text-zinc-600 mt-1 max-w-2xl leading-relaxed">
            Form high-performing teams based on missing technical skills. Test potential candidates before accepting them into your squad.
          </p>
        </div>

        <button
          onClick={() => setShowCreateTeam(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors shadow-2xs"
        >
          <Plus className="h-4 w-4" />
          Create Team
        </button>
      </div>

      {/* Create Team Modal */}
      {showCreateTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <form
            onSubmit={handleCreateTeam}
            className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h2 className="font-bold text-base text-zinc-950">Create Hackathon Team</h2>
              <button
                type="button"
                onClick={() => setShowCreateTeam(false)}
                className="rounded p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Team Name</label>
              <input
                type="text"
                required
                placeholder="e.g. ZeroLag Protocol"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className="w-full rounded-md border border-zinc-300 p-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Hackathon Name</label>
              <input
                type="text"
                required
                placeholder="e.g. ETHGlobal London 2025"
                value={newTeamHackathon}
                onChange={(e) => setNewTeamHackathon(e.target.value)}
                className="w-full rounded-md border border-zinc-300 p-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Project Description</label>
              <textarea
                rows={2}
                placeholder="What are you planning to build?"
                value={newTeamDesc}
                onChange={(e) => setNewTeamDesc(e.target.value)}
                className="w-full rounded-md border border-zinc-300 p-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setShowCreateTeam(false)}
                className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-zinc-950 px-4 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 shadow-2xs"
              >
                Create Team
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid: Left Team List & Right Team Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Team Directory (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search teams or hackathons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-8 pr-3 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 shadow-2xs"
              />
            </div>

            <select
              value={selectedSkillFilter}
              onChange={(e) => setSelectedSkillFilter(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-xs text-zinc-700 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 shadow-2xs"
            >
              <option value="">All Skills</option>
              <option value="react">React</option>
              <option value="python">Python</option>
              <option value="typescript">TypeScript</option>
              <option value="sql">SQL</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredTeams.length === 0 ? (
              <EmptyState
                title="No teams found"
                description="Try adjusting your search terms or skill filter to discover hackathon squads."
              />
            ) : (
              filteredTeams.map((t) => {
                const isSelected = selectedTeam?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => loadTeamDetails(t.id)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all shadow-2xs ${
                      isSelected
                        ? "border-sky-600 bg-sky-50/50 ring-2 ring-sky-600/20"
                        : "border-zinc-200 bg-white hover:border-zinc-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-zinc-950">{t.name}</h3>
                        <p className="text-xs text-zinc-500">{t.hackathonName}</p>
                      </div>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          t.status === "open"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-600 mt-2 line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {t.requirements?.map((req) => (
                        <span
                          key={req.id}
                          className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-700 border border-zinc-200/60"
                        >
                          {req.skillName || req.skillId}
                        </span>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-100">
                      <span>Leader: <strong className="text-zinc-600 font-semibold">{t.leaderName}</strong></span>
                      <span className="font-medium text-zinc-600">{t.members?.length || 1}/{t.maxMembers || 4} Members</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Team Deep-Dive (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {selectedTeam && teamDetails ? (
            <>
              {/* Selected Team Banner */}
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-zinc-950">{selectedTeam.name}</h2>
                      <span className="rounded bg-sky-100 px-2.5 py-0.5 text-[10px] font-bold text-sky-800 uppercase tracking-wider">
                        {selectedTeam.hackathonName}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">{selectedTeam.description}</p>
                  </div>

                  <button
                    onClick={() => handleJoinRequest(selectedTeam.id)}
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3.5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors shadow-2xs"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Request to Join
                  </button>
                </div>

                {/* Members list */}
                <div className="mt-5 border-t border-zinc-100 pt-3.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Current Members</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedTeam.members?.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50/80 px-2.5 py-1 text-xs"
                      >
                        <span className="font-semibold text-zinc-850">{m.candidateName}</span>
                        <span className="text-[10px] text-zinc-400">({m.role})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Team Skill Coverage & Gap Visualizer */}
              {teamDetails.coverage && <SkillCoverageBar coverage={teamDetails.coverage} />}

              {/* Team Verification Challenge Requests */}
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-sm text-zinc-950 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-sky-600" />
                      Team Verification Tests & Decisions
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Test potential candidates before accepting them into the squad
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {teamDetails.verificationTests?.length === 0 ? (
                    <EmptyState
                      title="No verification tests issued"
                      description="When candidates apply or are invited, test challenges and score results will appear here."
                    />
                  ) : (
                    teamDetails.verificationTests.map((vt: TeamVerificationTest) => (
                      <div key={vt.id} className="rounded-lg border border-zinc-200 p-3.5 bg-zinc-50/40 text-xs">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-zinc-950">{vt.candidateName}</span>
                            <span className="text-zinc-400"> · </span>
                            <span className="text-zinc-600 font-medium">{vt.skillName} ({vt.difficulty})</span>
                          </div>
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              vt.status === "completed" || vt.status === "accepted"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : vt.status === "rejected"
                                ? "bg-rose-100 text-rose-800 border border-rose-200"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {vt.status}
                          </span>
                        </div>

                        {vt.candidateScore !== undefined && (
                          <div className="mt-2 flex items-center gap-4 text-[11px]">
                            <span>
                              Required: <strong>{vt.requiredScore}%</strong>
                            </span>
                            <span>
                              Candidate Result:{" "}
                              <strong className={vt.candidateScore >= vt.requiredScore ? "text-emerald-700" : "text-amber-700"}>
                                {vt.candidateScore}%
                              </strong>
                            </span>
                            {vt.integrityScore && (
                              <span className="text-zinc-500 font-mono">Focus Score: {vt.integrityScore}/100</span>
                            )}
                          </div>
                        )}

                        {/* Leader Accept / Reject Controls */}
                        {vt.status === "completed" && (
                          <div className="mt-3 flex items-center gap-2 border-t border-zinc-200/60 pt-2.5">
                            <button
                              onClick={() => handleDecision(vt.id, "accepted")}
                              className="inline-flex items-center gap-1 rounded bg-emerald-700 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-800 shadow-2xs"
                            >
                              <Check className="h-3 w-3" /> Accept into Team
                            </button>
                            <button
                              onClick={() => handleDecision(vt.id, "rejected")}
                              className="inline-flex items-center gap-1 rounded border border-zinc-300 bg-white px-3 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 shadow-2xs"
                            >
                              <X className="h-3 w-3" /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Explainable Candidate Recommendations */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-zinc-950 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-sky-600" />
                      Recommended Candidates for Missing Gaps
                    </h3>
                    <p className="text-xs text-zinc-500">Ranked by algorithmic compatibility score</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {candidateMatches.length === 0 ? (
                    <EmptyState
                      title="No matching candidates found"
                      description="All required skills are covered or candidate profiles are currently unverified."
                    />
                  ) : (
                    candidateMatches.map((match) => (
                      <CandidateMatchCard
                        key={match.candidateId}
                        match={match}
                        teamId={selectedTeam.id}
                        onInviteToVerify={(candidateId) => setVerifyModalCandidate(candidateId)}
                      />
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center text-zinc-400 text-xs shadow-2xs">
              Select a team on the left to view requirements, capability coverage, and candidates.
            </div>
          )}
        </div>
      </div>

      {/* Issue Verification Challenge Modal */}
      {verifyModalCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h2 className="font-bold text-base text-zinc-950">Issue Team Verification Challenge</h2>
              <button
                onClick={() => setVerifyModalCandidate(null)}
                className="rounded p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-500 leading-relaxed">
              The candidate will receive an invitation to take this technical assessment. You can evaluate their result and integrity signals before accepting.
            </p>

            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Select Skill</label>
              <select
                value={verifySkill}
                onChange={(e) => setVerifySkill(e.target.value)}
                className="w-full rounded-md border border-zinc-300 p-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500"
              >
                <option value="react">React</option>
                <option value="python">Python</option>
                <option value="typescript">TypeScript</option>
                <option value="sql">SQL</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Difficulty</label>
              <select
                value={verifyDifficulty}
                onChange={(e) => setVerifyDifficulty(e.target.value)}
                className="w-full rounded-md border border-zinc-300 p-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-zinc-800">
                  Required Passing Score
                </label>
                <span className="font-mono text-xs font-bold text-sky-700">{verifyRequiredScore}%</span>
              </div>
              <input
                type="range"
                min={60}
                max={95}
                step={5}
                value={verifyRequiredScore}
                onChange={(e) => setVerifyRequiredScore(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setVerifyModalCandidate(null)}
                className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                onClick={handleIssueVerificationTest}
                className="rounded-md bg-zinc-950 px-4 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 shadow-2xs"
              >
                Send Challenge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
