"use client";

import React, { useState } from "react";
import { CandidateMatch } from "@/types";
import { CheckCircle2, ChevronDown, ChevronUp, Sparkles, Send, ShieldCheck } from "lucide-react";

interface CandidateMatchCardProps {
  match: CandidateMatch;
  teamId: string;
  onInviteToVerify?: (candidateId: string) => void;
  className?: string;
}

export function CandidateMatchCard({
  match,
  teamId,
  onInviteToVerify,
  className = "",
}: CandidateMatchCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`rounded-xl border border-zinc-200/90 bg-white p-5 shadow-2xs transition-all hover:border-zinc-300 hover:shadow-xs ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {match.avatarUrl ? (
            <img
              src={match.avatarUrl}
              alt={match.candidateName}
              className="h-11 w-11 rounded-full object-cover border border-zinc-200 shadow-2xs"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 font-bold text-xs text-zinc-700 font-mono">
              {match.candidateName[0]}
            </div>
          )}
          <div>
            <h4 className="font-bold text-sm text-zinc-950">{match.candidateName}</h4>
            <p className="text-xs text-zinc-500">{match.college}</p>
          </div>
        </div>

        {/* Compatibility Match Badge */}
        <div className="text-right">
          <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 border border-sky-200/80 px-2.5 py-1 text-xs font-bold text-sky-850">
            <Sparkles className="h-3 w-3 text-sky-600" />
            {match.matchScore}% Match
          </span>
          {match.fillsTeamGaps.length > 0 && (
            <p className="mt-1 text-[10px] font-bold text-emerald-700">
              ★ Fills {match.fillsTeamGaps.join(", ")} gap
            </p>
          )}
        </div>
      </div>

      {/* Matched skills badges */}
      <div className="mt-3.5 flex flex-wrap gap-1.5">
        {match.matchedSkills.map((s) => (
          <span
            key={s.skillId}
            className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium border ${
              s.verified
                ? "border-emerald-200 bg-emerald-50/70 text-emerald-950"
                : "border-zinc-200 bg-zinc-50 text-zinc-700"
            }`}
          >
            {s.verified ? (
              <ShieldCheck className="h-3 w-3 text-emerald-600 shrink-0" />
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-400"></span>
            )}
            <span className="font-semibold">{s.skillName}</span>
            <span className="text-zinc-400">·</span>
            <span className="capitalize text-[10px] text-zinc-500">{s.level}</span>
            {s.score && (
              <span className="rounded bg-emerald-200/60 px-1 py-0.2 font-mono text-[9px] font-bold text-emerald-900">
                {s.score}%
              </span>
            )}
          </span>
        ))}
      </div>

      {/* Explainable Matching Factors Drawer */}
      <div className="mt-3.5 border-t border-zinc-100 pt-2.5">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between text-xs font-semibold text-zinc-600 hover:text-zinc-950 transition-colors"
        >
          <span>Match Compatibility Rationale ({match.explanation.length} signals)</span>
          {expanded ? <ChevronUp className="h-3.5 w-3.5 text-zinc-400" /> : <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />}
        </button>

        {expanded && (
          <div className="mt-2 space-y-1.5 rounded-lg border border-zinc-200/70 bg-zinc-50/60 p-3 text-xs text-zinc-700 animate-in fade-in duration-150">
            {match.explanation.map((exp, idx) => (
              <div key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-sky-600 mt-0.5" />
                <span>{exp}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer */}
      {onInviteToVerify && (
        <div className="mt-4 flex items-center justify-end border-t border-zinc-100 pt-3">
          <button
            onClick={() => onInviteToVerify(match.candidateId)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors shadow-2xs"
          >
            <Send className="h-3 w-3" />
            Issue Verification Challenge
          </button>
        </div>
      )}
    </div>
  );
}
