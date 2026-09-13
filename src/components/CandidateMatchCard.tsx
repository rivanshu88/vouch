"use client";

import React, { useState } from "react";
import { CandidateMatch } from "@/types";
import { ChevronDown, ChevronUp, Send, Check } from "lucide-react";
import { VerificationSeal } from "@/components/ui/VerificationSeal";

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

  const verifiedCount = match.matchedSkills.filter((s) => s.verified).length;
  const totalCount = match.matchedSkills.length;
  
  // 2-color threshold meter per v3.0 spec: #2F6844 (>= 85%), #1B3A5C (>= 70%)
  const isHighMatch = match.matchScore >= 85;
  const matchColor = isHighMatch ? "text-[#2F6844]" : "text-[#1B3A5C]";
  const matchBg = isHighMatch ? "bg-[#EBF2EC] border-[#2F6844]/30" : "bg-[#E9EFF5] border-[#1B3A5C]/30";
  const barColor = isHighMatch ? "bg-[#2F6844]" : "bg-[#1B3A5C]";

  return (
    <div
      className={`border border-[#D9D5C7] bg-white p-5 transition-colors hover:border-[#B8B29D] ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {match.avatarUrl ? (
            <img
              src={match.avatarUrl}
              alt={match.candidateName}
              className="h-10 w-10 border border-[#D9D5C7] object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center border border-[#D9D5C7] bg-[#F3F1EA] font-mono text-xs font-semibold text-[#1A1915]">
              {match.candidateName[0]}
            </div>
          )}
          <div>
            <h4 className="font-display text-sm font-semibold text-[#1A1915]">{match.candidateName}</h4>
            <p className="text-xs text-[#8A8571]">{match.college}</p>
          </div>
        </div>

        {/* Compatibility Match Meter */}
        <div className="text-right">
          <span className={`inline-flex items-center gap-1.5 border px-2.5 py-0.5 font-mono text-xs font-semibold tabular-nums ${matchBg} ${matchColor}`}>
            {match.matchScore}% match
          </span>
          {match.fillsTeamGaps.length > 0 && (
            <p className="mt-1 text-[11px] font-medium text-[#2F6844]">
              Fills {match.fillsTeamGaps.join(", ")} gap
            </p>
          )}
        </div>
      </div>

      {/* Progress meter bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] text-[#8A8571] mb-1">
          <span className="font-mono tabular-nums">
            {verifiedCount} of {totalCount} required skills verified
          </span>
          <span className="font-mono tabular-nums">{match.matchScore}%</span>
        </div>
        <div className="h-1.5 w-full bg-[#F3F1EA] overflow-hidden">
          <div
            className={`h-full ${barColor} transition-all duration-300`}
            style={{ width: `${Math.min(100, Math.max(0, match.matchScore))}%` }}
          />
        </div>
      </div>

      {/* Matched skills seals */}
      <div className="mt-3.5 flex flex-wrap gap-2">
        {match.matchedSkills.map((s) => (
          <VerificationSeal
            key={s.skillId}
            skillName={s.skillName}
            verified={s.verified}
            score={s.score}
            tier={s.score && s.score >= 85 ? "gold" : s.score && s.score >= 70 ? "silver" : "bronze"}
            size="sm"
          />
        ))}
      </div>

      {/* Explainable Matching Factors Drawer */}
      <div className="mt-4 border-t border-[#D9D5C7] pt-2.5">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between text-xs font-medium text-[#8A8571] hover:text-[#1A1915] transition-colors"
        >
          <span>Match compatibility rationale ({match.explanation.length} signals)</span>
          {expanded ? <ChevronUp className="h-3.5 w-3.5 text-[#8A8571]" /> : <ChevronDown className="h-3.5 w-3.5 text-[#8A8571]" />}
        </button>

        {expanded && (
          <div className="mt-2.5 space-y-1.5 border border-[#D9D5C7] bg-[#F3F1EA]/50 p-3 text-xs text-[#3D3A31]">
            {match.explanation.map((exp, idx) => (
              <div key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed">
                <Check className="h-3.5 w-3.5 shrink-0 text-[#2F6844] mt-0.5" />
                <span>{exp}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer */}
      {onInviteToVerify && (
        <div className="mt-3.5 flex items-center justify-end border-t border-[#D9D5C7] pt-3">
          <button
            onClick={() => onInviteToVerify(match.candidateId)}
            className="inline-flex items-center gap-1.5 bg-[#1B3A5C] px-3.5 py-1.5 font-mono text-xs font-medium text-white hover:bg-[#152e4a] transition-colors"
          >
            <Send className="h-3 w-3" />
            Issue verification challenge
          </button>
        </div>
      )}
    </div>
  );
}

