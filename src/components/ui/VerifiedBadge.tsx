import React from "react";
import { ShieldCheck, Clock, CheckCircle2, GitBranch, Calendar, HelpCircle } from "lucide-react";
import { SkillLevel } from "@/types";

export type VerifiedTier = SkillLevel | "tier_1" | "tier_2" | "unverified";

interface VerifiedBadgeProps {
  skillName?: string;
  level?: VerifiedTier;
  verified?: boolean;
  score?: number;
  showScore?: boolean;
  verifiedAt?: string;
  githubReposCount?: number;
  variant?: "pill" | "block" | "detailed";
  className?: string;
}

export function VerifiedBadge({
  skillName,
  level = "intermediate",
  verified = true,
  score,
  showScore = false,
  verifiedAt,
  githubReposCount,
  variant = "pill",
  className = "",
}: VerifiedBadgeProps) {
  const isUnverified = !verified || level === "unverified";
  const isTier1 = level === "tier_1" || level === "advanced";

  const levelLabel =
    level === "tier_1"
      ? "Tier-1 Verified"
      : level === "tier_2"
      ? "Tier-2 Verified"
      : level;

  if (isUnverified) {
    if (variant === "detailed" || variant === "block") {
      return (
        <div
          className={`rounded-lg border border-amber-200/80 bg-amber-50/50 p-3 text-left transition-all ${className}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-zinc-900">{skillName || "Declared Claim"}</span>
              <span className="rounded bg-amber-100/90 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 uppercase tracking-wide">
                Declared Claim
              </span>
            </div>
            <span className="capitalize text-[11px] font-medium text-zinc-500">{levelLabel}</span>
          </div>
          <p className="mt-1.5 text-[11px] text-zinc-500">
            Awaiting standardized assessment proof or commit verification.
          </p>
        </div>
      );
    }

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-md border border-amber-200/70 bg-amber-50/60 px-2.5 py-1 text-xs text-amber-900 font-medium ${className}`}
        title="Self-declared claim — unverified"
      >
        <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
        {skillName && <span className="font-semibold text-zinc-900">{skillName}</span>}
        {skillName && <span className="text-zinc-400">·</span>}
        <span className="capitalize text-[11px] text-zinc-600">{levelLabel}</span>
        <span className="rounded bg-amber-100 px-1 py-0.2 text-[9px] font-bold uppercase tracking-wider text-amber-800">
          Claim
        </span>
      </span>
    );
  }

  // VERIFIED VARIANT - DETAILED
  if (variant === "detailed") {
    return (
      <div
        className={`rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 transition-all hover:border-emerald-300 hover:bg-emerald-50/60 shadow-xs ${className}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600 text-white shadow-xs">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-zinc-950">{skillName || "Verified Technical Identity"}</span>
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                  VERIFIED
                </span>
              </div>
              <p className="text-[11px] capitalize text-zinc-500 font-medium">{levelLabel}</p>
            </div>
          </div>

          {score !== undefined && (
            <div className="text-right font-mono">
              <span className="text-lg font-extrabold text-emerald-800">{score}%</span>
              <p className="text-[10px] font-semibold text-zinc-400 uppercase">Assessment</p>
            </div>
          )}
        </div>

        {/* Proof Evidence Metadata */}
        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-emerald-200/50 pt-2.5 text-[11px] text-zinc-600">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Standardized Blueprint Pass
          </span>
          {githubReposCount !== undefined && githubReposCount > 0 && (
            <span className="flex items-center gap-1">
              <GitBranch className="h-3.5 w-3.5 text-zinc-500" />
              {githubReposCount} code repositories
            </span>
          )}
          {verifiedAt && (
            <span className="flex items-center gap-1 text-zinc-400">
              <Calendar className="h-3 w-3" />
              {new Date(verifiedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Pill variant
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${
        isTier1
          ? "border-emerald-200 bg-emerald-50/80 text-emerald-950"
          : "border-sky-200 bg-sky-50/80 text-sky-950"
      } px-2.5 py-1 text-xs font-medium shadow-2xs ${className}`}
    >
      <ShieldCheck
        className={`h-3.5 w-3.5 shrink-0 ${isTier1 ? "text-emerald-600" : "text-sky-600"}`}
      />
      {skillName && <span className="font-bold text-zinc-950">{skillName}</span>}
      {skillName && <span className="text-zinc-400">·</span>}
      <span className="capitalize text-[11px] font-semibold">{levelLabel}</span>
      {(score !== undefined || showScore) && (
        <span
          className={`rounded px-1.5 py-0.2 font-mono text-[10px] font-extrabold ${
            isTier1
              ? "bg-emerald-200/70 text-emerald-900"
              : "bg-sky-200/70 text-sky-900"
          }`}
        >
          {score || 90}%
        </span>
      )}
      <span
        className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider text-white ${
          isTier1 ? "bg-emerald-600" : "bg-sky-600"
        }`}
      >
        Verified
      </span>
    </span>
  );
}
