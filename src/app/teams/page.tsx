"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  AlertCircle,
  Check,
  X,
  UserPlus,
} from "lucide-react";
import { SkillCoverageBar } from "@/components/SkillCoverageBar";
import { CandidateMatchCard } from "@/components/CandidateMatchCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { CandidateMatch, Team, TeamVerificationTest } from "@/types";

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamDetails, setTeamDetails] = useState<any | null>(null);
  const [candidateMatches, setCandidateMatches] = useState<CandidateMatch[]>([]);
  const [, setLoading] = useState(true);

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
  const [verifyError, setVerifyError] = useState<{
    message: string;
    retryAvailableAt?: string;
    hoursRemaining?: number;
  } | null>(null);
  const [isSubmittingVerify, setIsSubmittingVerify] = useState(false);

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
        alert("Join request submitted to squad leader!");
        loadTeamDetails(teamId);
      } else {
        alert(json.error?.message || "Failed to submit request.");
      }
    } catch {}
  };

  const handleIssueVerificationTest = async () => {
    if (!selectedTeam || !verifyModalCandidate) return;
    setVerifyError(null);
    setIsSubmittingVerify(true);
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
        setVerifyError(null);
        loadTeamDetails(selectedTeam.id);
      } else {
        setVerifyError({
          message: json.error?.message || "Failed to issue verification test.",
          retryAvailableAt: json.error?.details?.retryAvailableAt,
          hoursRemaining: json.error?.details?.hoursRemaining,
        });
      }
    } catch {
      setVerifyError({ message: "Network error occurred while issuing verification challenge." });
    } finally {
      setIsSubmittingVerify(false);
    }
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
            <span className="border border-[#1B3A5C]/30 bg-[#E9EFF5] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#1B3A5C] uppercase tracking-wider">
              Hackathon Capability Matching
            </span>
            <span className="text-xs text-[#D9D5C7]">|</span>
            <span className="font-mono text-xs text-[#8A8571]">Complementarity over Similarity</span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-[#1A1915] mt-1">Hackathon Squads & Verification</h1>
          <p className="text-xs text-[#3D3A31] mt-1 max-w-2xl leading-relaxed">
            Form high-performing teams based on missing technical skills. Test potential candidates before accepting them into your squad.
          </p>
        </div>

        <button
          onClick={() => setShowCreateTeam(true)}
          className="inline-flex items-center gap-1.5 bg-[#1B3A5C] px-4 py-2 font-mono text-xs font-medium text-white hover:bg-[#152e4a] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create squad
        </button>
      </div>

      {/* Create Team Modal */}
      {showCreateTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-150">
          <form
            onSubmit={handleCreateTeam}
            className="w-full max-w-md border border-[#D9D5C7] bg-white p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#D9D5C7] pb-3">
              <h2 className="font-display font-semibold text-base text-[#1A1915]">Create Hackathon Squad</h2>
              <button
                type="button"
                onClick={() => setShowCreateTeam(false)}
                className="p-1 text-[#8A8571] hover:text-[#1A1915]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label className="block font-mono text-xs text-[#1A1915] mb-1">Squad Name</label>
              <input
                type="text"
                required
                placeholder="e.g. ZeroLag Protocol"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className="w-full border border-[#D9D5C7] p-2 font-mono text-xs text-[#1A1915] bg-[#FBFAF7]"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-[#1A1915] mb-1">Hackathon Name</label>
              <input
                type="text"
                required
                placeholder="e.g. ETHGlobal London 2025"
                value={newTeamHackathon}
                onChange={(e) => setNewTeamHackathon(e.target.value)}
                className="w-full border border-[#D9D5C7] p-2 font-mono text-xs text-[#1A1915] bg-[#FBFAF7]"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-[#1A1915] mb-1">Project Description</label>
              <textarea
                rows={2}
                placeholder="What are you planning to build?"
                value={newTeamDesc}
                onChange={(e) => setNewTeamDesc(e.target.value)}
                className="w-full border border-[#D9D5C7] p-2 text-xs text-[#1A1915] bg-[#FBFAF7]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#D9D5C7]">
              <button
                type="button"
                onClick={() => setShowCreateTeam(false)}
                className="border border-[#D9D5C7] bg-[#FBFAF7] px-3 py-1.5 font-mono text-xs font-medium text-[#8A8571] hover:bg-[#F3F1EA]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#1B3A5C] px-4 py-1.5 font-mono text-xs font-medium text-white hover:bg-[#152e4a]"
              >
                Create squad
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
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#8A8571]" />
              <input
                type="text"
                placeholder="Search squads or hackathons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-[#D9D5C7] bg-white py-2 pl-8 pr-3 font-mono text-xs text-[#1A1915]"
              />
            </div>

            <select
              value={selectedSkillFilter}
              onChange={(e) => setSelectedSkillFilter(e.target.value)}
              className="border border-[#D9D5C7] bg-white px-2.5 py-2 font-mono text-xs text-[#3D3A31]"
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
                title="No squads found"
                description="Try adjusting your search terms or skill filter to discover hackathon squads."
              />
            ) : (
              filteredTeams.map((t) => {
                const isSelected = selectedTeam?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => loadTeamDetails(t.id)}
                    className={`cursor-pointer border p-4 transition-all ${
                      isSelected
                        ? "border-[#1B3A5C] bg-[#E9EFF5]/40"
                        : "border-[#D9D5C7] bg-white hover:border-[#B8B29D]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-display font-semibold text-sm text-[#1A1915]">{t.name}</h3>
                        <p className="font-mono text-xs text-[#8A8571]">{t.hackathonName}</p>
                      </div>
                      <span
                        className={`border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase ${
                          t.status === "open"
                            ? "border-[#2F6844]/30 bg-[#EBF2EC] text-[#2F6844]"
                            : "border-[#D9D5C7] bg-[#FBFAF7] text-[#8A8571]"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#3D3A31] mt-2 line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {t.requirements?.map((req) => (
                        <span
                          key={req.id}
                          className="border border-[#D9D5C7] bg-[#FBFAF7] px-1.5 py-0.5 font-mono text-[10px] text-[#3D3A31]"
                        >
                          {req.skillName || req.skillId}
                        </span>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center justify-between font-mono text-[11px] text-[#8A8571] pt-2 border-t border-[#D9D5C7]">
                      <span>Leader: <strong className="text-[#1A1915]">{t.leaderName}</strong></span>
                      <span className="text-[#1A1915]">{t.members?.length || 1}/{t.maxMembers || 4} Members</span>
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
              <div className="border border-[#D9D5C7] bg-white p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-xl font-semibold text-[#1A1915]">{selectedTeam.name}</h2>
                      <span className="border border-[#1B3A5C]/30 bg-[#E9EFF5] px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#1B3A5C] uppercase tracking-wider">
                        {selectedTeam.hackathonName}
                      </span>
                    </div>
                    <p className="text-xs text-[#3D3A31] mt-1.5 leading-relaxed">{selectedTeam.description}</p>
                  </div>

                  <button
                    onClick={() => handleJoinRequest(selectedTeam.id)}
                    className="shrink-0 inline-flex items-center gap-1.5 bg-[#1B3A5C] px-3.5 py-2 font-mono text-xs font-medium text-white hover:bg-[#152e4a] transition-colors"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Request to join
                  </button>
                </div>

                {/* Members list */}
                <div className="mt-5 border-t border-[#D9D5C7] pt-3.5">
                  <span className="font-mono text-[11px] font-medium uppercase text-[#8A8571]">Current Squad Members</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedTeam.members?.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-2 border border-[#D9D5C7] bg-[#FBFAF7] px-2.5 py-1 text-xs"
                      >
                        <span className="font-display font-medium text-[#1A1915]">{m.candidateName}</span>
                        <span className="font-mono text-[10px] text-[#8A8571]">({m.role})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Team Skill Coverage & Gap Visualizer */}
              {teamDetails.coverage && <SkillCoverageBar coverage={teamDetails.coverage} />}

              {/* Team Verification Challenge Requests */}
              <div className="border border-[#D9D5C7] bg-white p-6">
                <div className="flex items-center justify-between mb-4 border-b border-[#D9D5C7] pb-3">
                  <div>
                    <h3 className="font-display font-semibold text-sm text-[#1A1915]">
                      Team Verification Tests & Decisions
                    </h3>
                    <p className="text-xs text-[#8A8571] mt-0.5">
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
                      <div key={vt.id} className="border border-[#D9D5C7] p-3.5 bg-[#FBFAF7] text-xs">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-display font-semibold text-[#1A1915]">{vt.candidateName}</span>
                            <span className="text-[#8A8571]"> · </span>
                            <span className="font-mono text-[#3D3A31]">{vt.skillName} ({vt.difficulty})</span>
                          </div>
                          <span
                            className={`border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${
                              vt.status === "completed" || vt.status === "accepted"
                                ? "bg-[#EBF2EC] text-[#2F6844] border-[#2F6844]/30"
                                : vt.status === "rejected"
                                ? "bg-[#FDF2F2] text-[#8C2F2F] border-[#8C2F2F]/30"
                                : "bg-[#FDF6EC] text-[#9A6B1F] border-[#9A6B1F]/30"
                            }`}
                          >
                            {vt.status}
                          </span>
                        </div>

                        {vt.candidateScore !== undefined && (
                          <div className="mt-2 flex items-center gap-4 font-mono text-[11px] text-[#8A8571]">
                            <span>
                              Required: <strong className="text-[#1A1915]">{vt.requiredScore}%</strong>
                            </span>
                            <span>
                              Candidate Result:{" "}
                              <strong className={vt.candidateScore >= vt.requiredScore ? "text-[#2F6844]" : "text-[#9A6B1F]"}>
                                {vt.candidateScore}%
                              </strong>
                            </span>
                            {vt.integrityScore && (
                              <span className="text-[#8A8571]">Focus Score: {vt.integrityScore}/100</span>
                            )}
                          </div>
                        )}

                        {/* Leader Accept / Reject Controls */}
                        {vt.status === "completed" && (
                          <div className="mt-3 flex items-center gap-2 border-t border-[#D9D5C7] pt-2.5">
                            <button
                              onClick={() => handleDecision(vt.id, "accepted")}
                              className="inline-flex items-center gap-1 bg-[#2F6844] px-3 py-1 font-mono text-xs font-medium text-white hover:bg-[#265337] transition-colors"
                            >
                              <Check className="h-3 w-3" /> Accept into squad
                            </button>
                            <button
                              onClick={() => handleDecision(vt.id, "rejected")}
                              className="inline-flex items-center gap-1 border border-[#D9D5C7] bg-white px-3 py-1 font-mono text-xs font-medium text-[#8C2F2F] hover:bg-[#FDF2F2] transition-colors"
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
                <div className="border-b border-[#D9D5C7] pb-2">
                  <h3 className="font-display font-semibold text-sm text-[#1A1915]">
                    Recommended Candidates for Missing Gaps
                  </h3>
                  <p className="text-xs text-[#8A8571]">Ranked by algorithmic compatibility score</p>
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
                        onInviteToVerify={(candidateId) => {
                          setVerifyModalCandidate(candidateId);
                          setVerifyError(null);
                        }}
                      />
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="border border-[#D9D5C7] bg-white p-12 text-center text-[#8A8571] text-xs">
              Select a team on the left to view requirements, capability coverage, and candidates.
            </div>
          )}
        </div>
      </div>

      {/* Issue Verification Challenge Modal */}
      {verifyModalCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md border border-[#D9D5C7] bg-white p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#D9D5C7] pb-3">
              <h2 className="font-display font-semibold text-base text-[#1A1915]">Issue Team Verification Challenge</h2>
              <button
                onClick={() => {
                  setVerifyModalCandidate(null);
                  setVerifyError(null);
                }}
                className="p-1 text-[#8A8571] hover:text-[#1A1915]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-[#8A8571] leading-relaxed">
              The candidate will receive an invitation to take this technical assessment. You can evaluate their result and integrity signals before accepting.
            </p>

            {/* Rate Limit Alert Banner */}
            {verifyError && (
              <div className="border border-[#8C2F2F]/30 bg-[#FDF2F2] p-3 text-xs text-[#8C2F2F] space-y-1.5">
                <div className="flex items-center gap-1.5 font-mono font-semibold">
                  <AlertCircle className="h-4 w-4 text-[#8C2F2F] shrink-0" />
                  <span>Rate Limit Cooldown Active (48h Limit)</span>
                </div>
                <p className="text-[11px] leading-relaxed">{verifyError.message}</p>
                {verifyError.retryAvailableAt && (
                  <div className="mt-1.5 pt-1.5 border-t border-[#8C2F2F]/20 flex items-center justify-between text-[11px] font-mono">
                    <span>Cooldown Remaining:</span>
                    <span className="font-bold">
                      ~{verifyError.hoursRemaining}h remaining
                    </span>
                  </div>
                )}
                {verifyError.retryAvailableAt && (
                  <p className="text-[10px] italic">
                    Re-test available at: {new Date(verifyError.retryAvailableAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block font-mono text-xs text-[#1A1915] mb-1">Select Skill</label>
              <select
                value={verifySkill}
                onChange={(e) => {
                  setVerifySkill(e.target.value);
                  setVerifyError(null);
                }}
                className="w-full border border-[#D9D5C7] p-2 font-mono text-xs text-[#1A1915] bg-[#FBFAF7]"
              >
                <option value="react">React</option>
                <option value="python">Python</option>
                <option value="typescript">TypeScript</option>
                <option value="sql">SQL</option>
                <option value="solidity">Solidity</option>
                <option value="pytorch">PyTorch</option>
                <option value="go">Go</option>
                <option value="docker">Docker</option>
                <option value="linux">Linux</option>
                <option value="rust">Rust</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs text-[#1A1915] mb-1">Difficulty</label>
              <select
                value={verifyDifficulty}
                onChange={(e) => setVerifyDifficulty(e.target.value)}
                className="w-full border border-[#D9D5C7] p-2 font-mono text-xs text-[#1A1915] bg-[#FBFAF7]"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-mono text-xs text-[#1A1915]">
                  Required Passing Score
                </label>
                <span className="font-mono text-xs font-semibold tabular-nums text-[#1B3A5C]">{verifyRequiredScore}%</span>
              </div>
              <input
                type="range"
                min={60}
                max={95}
                step={5}
                value={verifyRequiredScore}
                onChange={(e) => setVerifyRequiredScore(Number(e.target.value))}
                className="w-full accent-[#1B3A5C]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#D9D5C7]">
              <button
                type="button"
                onClick={() => {
                  setVerifyModalCandidate(null);
                  setVerifyError(null);
                }}
                className="border border-[#D9D5C7] bg-[#FBFAF7] px-3 py-1.5 font-mono text-xs font-medium text-[#8A8571] hover:bg-[#F3F1EA]"
              >
                Cancel
              </button>
              <button
                onClick={handleIssueVerificationTest}
                disabled={isSubmittingVerify}
                className="bg-[#1B3A5C] px-4 py-1.5 font-mono text-xs font-medium text-white hover:bg-[#152e4a] disabled:opacity-50"
              >
                {isSubmittingVerify ? "Sending..." : "Send challenge"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

