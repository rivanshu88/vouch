import React from "react";
import { ShieldCheck, Clock } from "lucide-react";
import { SkillLevel } from "@/types";

interface SkillBadgeProps {
  name: string;
  level: SkillLevel;
  verified?: boolean;
  score?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function SkillBadge({
  name,
  level,
  verified = false,
  score,
  size = "md",
  className = "",
}: SkillBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3.5 py-1.5 text-xs",
  }[size];

  if (verified) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-md font-medium border border-emerald-200/90 bg-emerald-50/60 text-emerald-950 transition-all hover:bg-emerald-50 shadow-2xs ${sizeClasses} ${className}`}
      >
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
        <span className="font-bold text-zinc-950">{name}</span>
        <span className="text-zinc-300">|</span>
        <span className="capitalize text-[11px] text-zinc-600 font-medium">{level}</span>
        {score !== undefined && (
          <span className="rounded bg-emerald-200/80 px-1 py-0.2 font-mono text-[10px] font-extrabold text-emerald-900">
            {score}%
          </span>
        )}
        <span className="rounded bg-emerald-600 px-1 py-0.2 text-[8px] font-extrabold uppercase tracking-wider text-white">
          Verified
        </span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border border-zinc-200/80 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-700 transition-colors ${sizeClasses} ${className}`}
      title="Self-declared claim — Complete standardized assessment to verify"
    >
      <Clock className="h-3 w-3 text-zinc-400 shrink-0" />
      <span className="font-medium text-zinc-800">{name}</span>
      <span className="text-zinc-300">·</span>
      <span className="capitalize text-[11px] text-zinc-500">{level}</span>
      <span className="rounded bg-zinc-200/70 px-1 py-0.2 text-[9px] font-semibold text-zinc-600 uppercase tracking-wide">
        Claim
      </span>
    </span>
  );
}
