"use client";

import React from "react";
import { TeamSkillCoverageItem } from "@/lib/matching/team";
import { CheckCircle2, CircleDashed } from "lucide-react";

interface SkillCoverageBarProps {
  coverage: TeamSkillCoverageItem[];
  className?: string;
}

export function SkillCoverageBar({ coverage, className = "" }: SkillCoverageBarProps) {
  const satisfiedCount = coverage.filter((c) => c.status === "covered").length;
  const gapCount = coverage.filter((c) => c.status === "gap").length;

  return (
    <div className={`border border-[#D9D5C7] bg-white p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display font-semibold text-sm text-[#1B3A5C]">
              Team Capability Ledger
            </h3>
            <span className="border border-[#B8B29D] bg-[#F3F1EA] px-2 py-0.5 font-mono text-[10px] font-medium text-[#1B3A5C]">
              {satisfiedCount}/{coverage.length} ROLES FILLED
            </span>
          </div>
          <p className="text-[11px] text-[#8A8571] mt-0.5">
            Calculated from verified technical evidence and declared skill benchmarks
          </p>
        </div>

        {gapCount > 0 && (
          <div className="inline-flex items-center gap-1.5 border border-[#B8B29D] bg-[#FFF8E7] px-2.5 py-1 font-mono text-[11px] text-[#9A6B1F]">
            <span className="h-2 w-2 rounded-full bg-[#9A6B1F]" />
            <span>{gapCount} Missing Capability Gap{gapCount > 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {coverage.map((item) => {
          const isCovered = item.status === "covered";
          const isPartial = item.status === "partial";

          return (
            <div
              key={item.skillId}
              className="space-y-1.5 border border-[#D9D5C7] bg-[#FBFAF7] p-3"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {isCovered ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#2F6844] shrink-0" />
                  ) : (
                    <CircleDashed className="h-3.5 w-3.5 text-[#9A6B1F] shrink-0" />
                  )}
                  <span className="font-medium text-[#1B3A5C]">{item.skillName}</span>
                  {item.coveredBy.length > 0 && (
                    <span className="font-mono text-[10px] text-[#8A8571] hidden sm:inline">
                      ({item.coveredBy.join(", ")})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Gaps use seal-pending ochre (#9A6B1F), never red (§4.4) */}
                  {item.status === "gap" ? (
                    <span className="border border-[#B8B29D] bg-[#FFF8E7] px-1.5 py-0.5 font-mono text-[9px] font-medium text-[#9A6B1F]">
                      GAP TO FILL
                    </span>
                  ) : isPartial ? (
                    <span className="border border-[#B8B29D] bg-[#FFF8E7] px-1.5 py-0.5 font-mono text-[9px] font-medium text-[#9A6B1F]">
                      PARTIAL
                    </span>
                  ) : (
                    <span className="border border-[#B8B29D] bg-[#EBF2EC] px-1.5 py-0.5 font-mono text-[9px] font-medium text-[#2F6844]">
                      COVERED
                    </span>
                  )}
                  <span className="font-mono font-medium text-[#1B3A5C] text-xs tabular-nums">
                    {item.coveragePercentage}%
                  </span>
                </div>
              </div>

              {/* Stacked hairline track */}
              <div className="h-1.5 w-full border border-[#D9D5C7] bg-[#F3F1EA] overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isCovered ? "bg-[#2F6844]" : "bg-[#9A6B1F]"
                  }`}
                  style={{ width: `${Math.max(item.coveragePercentage, 3)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
