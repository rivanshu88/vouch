"use client";

import React from "react";
import { VerificationSeal } from "@/components/ui/VerificationSeal";
import { SkillLevel } from "@/types";

export interface SkillBadgeProps {
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
  return (
    <VerificationSeal
      skillName={name}
      level={level}
      verified={verified}
      score={score}
      size={size}
      className={className}
    />
  );
}
