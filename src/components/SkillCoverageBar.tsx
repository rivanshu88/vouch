import React from "react";
import { TeamSkillCoverageItem } from "@/lib/matching/team";
import { AlertCircle, CheckCircle2, CircleDashed, Users2 } from "lucide-react";

interface SkillCoverageBarProps {
  coverage: TeamSkillCoverageItem[];
  className?: string;
}

export function SkillCoverageBar({ coverage, className = "" }: SkillCoverageBarProps) {
  const satisfiedCount = coverage.filter((c) => c.status === "covered").length;
  const gapCount = coverage.filter((c) => c.status === "gap").length;

  return (
    <div className={`rounded-xl border border-zinc-200/90 bg-white p-6 shadow-2xs ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-zinc-950">Team Capability Matrix</h3>
            <span className="rounded bg-zinc-100 border border-zinc-200/70 px-2 py-0.5 font-mono text-[10px] font-semibold text-zinc-600">
              {satisfiedCount}/{coverage.length} Roles Filled
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Calculated from verified technical abilities and declared candidate profiles
          </p>
        </div>

        {gapCount > 0 && (
          <div className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 border border-amber-200/80 px-2.5 py-1 text-[11px] font-bold text-amber-900">
            <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <span>{gapCount} Missing Capability Gap{gapCount > 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {coverage.map((item) => {
          const isCovered = item.status === "covered";
          const isPartial = item.status === "partial";

          return (
            <div key={item.skillId} className="space-y-1.5 rounded-lg border border-zinc-100 bg-zinc-50/50 p-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {isCovered ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : isPartial ? (
                    <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                  ) : (
                    <CircleDashed className="h-4 w-4 text-zinc-400 shrink-0" />
                  )}
                  <span className="font-bold text-zinc-900">{item.skillName}</span>
                  {item.coveredBy.length > 0 && (
                    <span className="text-[11px] text-zinc-500 hidden sm:inline">
                      ({item.coveredBy.join(", ")})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {item.status === "gap" ? (
                    <span className="rounded bg-red-50 border border-red-200/70 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-red-700">
                      Gap to Fill
                    </span>
                  ) : isPartial ? (
                    <span className="rounded bg-amber-50 border border-amber-200/70 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-amber-800">
                      Partial
                    </span>
                  ) : (
                    <span className="rounded bg-emerald-50 border border-emerald-200/70 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-emerald-800">
                      Covered
                    </span>
                  )}
                  <span className="font-mono font-bold text-zinc-800 text-xs">
                    {item.coveragePercentage}%
                  </span>
                </div>
              </div>

              {/* Calibrated progress track */}
              <div className="h-1.5 w-full rounded-full bg-zinc-200/70 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${
                    isCovered
                      ? "bg-emerald-600"
                      : isPartial
                      ? "bg-amber-500"
                      : "bg-red-400"
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
