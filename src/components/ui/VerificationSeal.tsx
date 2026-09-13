"use client";

import React, { useState } from "react";
import { ShieldCheck, CheckCircle2, HelpCircle } from "lucide-react";
import { SkillLevel } from "@/types";

export type VerifiedTier = SkillLevel | "tier_1" | "tier_2" | "unverified";

export interface VerificationSealProps {
  skillName?: string;
  skillId?: string;
  candidateId?: string;
  level?: VerifiedTier;
  tier?: string;
  verified?: boolean;
  score?: number;
  showScore?: boolean;
  verifiedAt?: string;
  integrityScore?: number;
  serialNumber?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function generateVerificationSerial(
  skillId?: string,
  candidateId?: string,
  seed?: string | number
): string {
  const str = `${skillId || "SK"}-${candidateId || "CD"}-${seed || "2026"}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  const num = (hash % 90000) + 10000;
  return `VF-2026-${num}`;
}

export function VerificationSeal({
  skillName,
  skillId,
  candidateId,
  level: rawLevel = "intermediate",
  tier,
  verified = true,
  score,
  showScore = true,
  verifiedAt,
  integrityScore,
  serialNumber,
  size = "md",
  className = "",
}: VerificationSealProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const level = (tier as VerifiedTier) || rawLevel;
  const isUnverified = !verified || level === "unverified";
  const isTier1 = level === "tier_1" || level === "advanced";
  const effectiveSerial =
    serialNumber || generateVerificationSerial(skillId || skillName, candidateId, score);

  // Formatting date
  let formattedDate = "Verified";
  if (verifiedAt) {
    try {
      const d = new Date(verifiedAt);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
    } catch {}
  }

  // Unverified claim: no edge flag, dashed hairline, lowercase "self-declared"
  if (isUnverified) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 border border-dashed border-[#D9D5C7] bg-[#FBFAF7] px-2.5 py-1 text-xs text-[#8A8571] ${className}`}
        title="Unverified self-declared claim"
      >
        <HelpCircle className="h-3.5 w-3.5 text-[#8A8571] shrink-0" />
        <span className="font-medium text-[#3D3A31]">{skillName || "Declared Claim"}</span>
        <span className="text-[#D9D5C7]">·</span>
        <span className="text-[11px] text-[#8A8571] lowercase">self-declared</span>
      </div>
    );
  }

  // Verified Seal: Specimen tag with clipped corner & 4px left-edge ink flag
  const edgeColor = isTier1 ? "bg-[#2F6844]" : "bg-[#1B3A5C]";
  const iconColor = isTier1 ? "text-[#2F6844]" : "text-[#1B3A5C]";
  const IconComponent = isTier1 ? ShieldCheck : CheckCircle2;

  const sizeStyles = {
    sm: "py-1 pr-2 pl-3 text-[11px]",
    md: "py-1.5 pr-2.5 pl-3.5 text-xs",
    lg: "py-2 pr-3.5 pl-4 text-xs",
  }[size];

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={`specimen-tag relative flex items-center gap-2 border border-[#B8B29D] bg-white text-[#3D3A31] ${sizeStyles} ${className}`}
      >
        {/* 4px vertical left-edge flag */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${edgeColor}`} />

        {/* Ink Icon */}
        <IconComponent className={`h-3.5 w-3.5 shrink-0 ${iconColor}`} />

        {/* Skill Name & Serial Line */}
        <div className="flex flex-col text-left leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[#1B3A5C]">{skillName || "Skill Evidence"}</span>
            {showScore && score !== undefined && (
              <span className="font-mono text-[11px] font-medium text-[#1B3A5C] tabular-nums">
                {score}%
              </span>
            )}
          </div>
          {isTier1 && (
            <span className="font-mono text-[9px] text-[#8A8571] tracking-tight">
              {effectiveSerial}
            </span>
          )}
        </div>
      </div>

      {/* Case-file Specimen Tooltip */}
      {showTooltip && (
        <div className="absolute left-0 top-full z-50 mt-1.5 min-w-[200px] border border-[#B8B29D] bg-[#F3F1EA] p-2.5 text-[11px] text-[#3D3A31] shadow-none pointer-events-none">
          <div className="flex items-center justify-between border-b border-[#D9D5C7] pb-1 font-mono text-[10px] text-[#8A8571]">
            <span>SPECIMEN EVIDENCE</span>
            <span>{isTier1 ? "TIER-1" : "TIER-2"}</span>
          </div>
          <div className="mt-1.5 space-y-1 font-mono text-[10px]">
            <div className="flex justify-between">
              <span className="text-[#8A8571]">Serial:</span>
              <span className="text-[#1B3A5C] font-semibold">{effectiveSerial}</span>
            </div>
            {score !== undefined && (
              <div className="flex justify-between">
                <span className="text-[#8A8571]">Test Score:</span>
                <span className="text-[#1B3A5C] font-semibold">{score}%</span>
              </div>
            )}
            {integrityScore !== undefined && (
              <div className="flex justify-between">
                <span className="text-[#8A8571]">Integrity Telemetry:</span>
                <span className="text-[#2F6844] font-semibold">{integrityScore}/100</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#8A8571]">Logged:</span>
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Backward compatibility aliases
export const VerifiedBadge = VerificationSeal;
