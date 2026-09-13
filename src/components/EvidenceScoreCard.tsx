"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { EvidenceStrengthBreakdown } from "@/types";

interface EvidenceScoreCardProps {
  data: EvidenceStrengthBreakdown;
  className?: string;
}

export function EvidenceScoreCard({ data, className = "" }: EvidenceScoreCardProps) {
  const [showCaseFile, setShowCaseFile] = useState(false);

  // Weights: 45% Assessment, 25% GitHub, 20% Projects, 10% Certifications
  const weightedAssessment = (data.assessmentScore * 0.45).toFixed(1);
  const weightedGithub = (data.githubScore * 0.25).toFixed(1);
  const weightedProjects = (data.projectsScore * 0.20).toFixed(1);
  const weightedCerts = (data.certificatesScore * 0.10).toFixed(1);

  // Relative width percentages for the stacked ledger bar based on actual points contributed
  const totalPoints = data.compositeScore || 1;
  const pAssessment = Math.max(0, (Number(weightedAssessment) / totalPoints) * 100);
  const pGithub = Math.max(0, (Number(weightedGithub) / totalPoints) * 100);
  const pProjects = Math.max(0, (Number(weightedProjects) / totalPoints) * 100);
  const pCerts = Math.max(0, (Number(weightedCerts) / totalPoints) * 100);

  return (
    <div className={`border border-[#D9D5C7] bg-white p-6 ${className}`}>
      {/* Header with Ledger Title and Composite Score */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-[#8A8571]">
              Evidence strength ledger
            </span>
            <span className="border border-[#B8B29D] bg-[#F3F1EA] px-1.5 py-0.5 font-mono text-[9px] font-medium text-[#1B3A5C]">
              CALIBRATED 4-SOURCE
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-4xl font-semibold text-[#1B3A5C] tabular-nums">
              {data.compositeScore}
            </span>
            <span className="font-mono text-xs text-[#8A8571]">/ 100</span>
            <span className="ml-2 inline-flex items-center border border-[#B8B29D] bg-[#EBF2EC] px-2 py-0.5 font-mono text-[10px] font-medium text-[#2F6844]">
              VERIFIED COMPOSITE
            </span>
          </div>
        </div>

        {/* Technical Ledger Annotation */}
        <div className="flex flex-col items-end text-right">
          <div className="border border-[#B8B29D] bg-[#F3F1EA] px-2 py-1 font-mono text-xs font-semibold text-[#1B3A5C]">
            EV-SCORE
          </div>
          <span className="mt-1 font-mono text-[9px] text-[#8A8571]">WEIGHTED</span>
        </div>
      </div>

      {/* §4.2 Horizontal Stacked Ledger Bar (4 opacity steps in ink-primary) */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-[11px] mb-1.5 font-mono text-[#8A8571]">
          <span>EVIDENCE SOURCE LEDGER</span>
          <span>100% WEIGHT DERIVATION</span>
        </div>

        {/* Stacked Ledger Bar */}
        <div className="flex h-3 w-full border border-[#D9D5C7] bg-[#F3F1EA] overflow-hidden">
          {/* Assessment: 45% weight (100% opacity of #1B3A5C) */}
          <div
            className="h-full bg-[#1B3A5C] transition-all duration-300"
            style={{ width: `${pAssessment}%` }}
            title={`Assessments: ${data.assessmentScore}/100 (45% weight = +${weightedAssessment} pts)`}
          />
          {/* GitHub: 25% weight (70% opacity of #1B3A5C) */}
          <div
            className="h-full bg-[#1B3A5C]/70 transition-all duration-300"
            style={{ width: `${pGithub}%` }}
            title={`GitHub: ${data.githubScore}/100 (25% weight = +${weightedGithub} pts)`}
          />
          {/* Projects: 20% weight (45% opacity of #1B3A5C) */}
          <div
            className="h-full bg-[#1B3A5C]/45 transition-all duration-300"
            style={{ width: `${pProjects}%` }}
            title={`Projects: ${data.projectsScore}/100 (20% weight = +${weightedProjects} pts)`}
          />
          {/* Certs: 10% weight (25% opacity of #1B3A5C) */}
          <div
            className="h-full bg-[#1B3A5C]/25 transition-all duration-300"
            style={{ width: `${pCerts}%` }}
            title={`Certifications: ${data.certificatesScore}/100 (10% weight = +${weightedCerts} pts)`}
          />
        </div>

        {/* 4-Step Ledger Legend */}
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
          <div className="border border-[#D9D5C7] bg-[#FBFAF7] p-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 bg-[#1B3A5C]" />
              <span className="text-[#3D3A31] font-medium">Tests (45%)</span>
            </div>
            <p className="mt-1 text-[#1B3A5C] font-semibold tabular-nums">
              {data.assessmentScore}/100 <span className="text-[#8A8571] font-normal">(+{weightedAssessment})</span>
            </p>
          </div>

          <div className="border border-[#D9D5C7] bg-[#FBFAF7] p-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 bg-[#1B3A5C]/70" />
              <span className="text-[#3D3A31] font-medium">GitHub (25%)</span>
            </div>
            <p className="mt-1 text-[#1B3A5C] font-semibold tabular-nums">
              {data.githubScore}/100 <span className="text-[#8A8571] font-normal">(+{weightedGithub})</span>
            </p>
          </div>

          <div className="border border-[#D9D5C7] bg-[#FBFAF7] p-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 bg-[#1B3A5C]/45" />
              <span className="text-[#3D3A31] font-medium">Projects (20%)</span>
            </div>
            <p className="mt-1 text-[#1B3A5C] font-semibold tabular-nums">
              {data.projectsScore}/100 <span className="text-[#8A8571] font-normal">(+{weightedProjects})</span>
            </p>
          </div>

          <div className="border border-[#D9D5C7] bg-[#FBFAF7] p-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 bg-[#1B3A5C]/25" />
              <span className="text-[#3D3A31] font-medium">Certs (10%)</span>
            </div>
            <p className="mt-1 text-[#1B3A5C] font-semibold tabular-nums">
              {data.certificatesScore}/100 <span className="text-[#8A8571] font-normal">(+{weightedCerts})</span>
            </p>
          </div>
        </div>
      </div>

      {/* §4.2 Unfolding Case-File Rationale Accordion (Hairline divider, no shadow) */}
      <div className="mt-5 border-t border-[#D9D5C7] pt-3">
        <button
          onClick={() => setShowCaseFile(!showCaseFile)}
          className="flex w-full items-center justify-between text-left text-xs font-medium text-[#1B3A5C] hover:text-[#1B3A5C]/80 transition-colors"
        >
          <span className="font-mono text-[11px]">
            EXPLAINABLE RATIONALE · CASE-FILE NOTE ({data.explanation.length} contributing facts)
          </span>
          {showCaseFile ? (
            <ChevronUp className="h-3.5 w-3.5 text-[#8A8571]" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-[#8A8571]" />
          )}
        </button>

        {showCaseFile && (
          <div className="mt-3 border-t border-[#B8B29D] bg-[#F3F1EA] p-3 text-xs">
            <ul className="space-y-2 text-[#3D3A31] text-[11px] leading-relaxed">
              {data.explanation.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 bg-[#1B3A5C]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 border-t border-[#D9D5C7] pt-2 font-mono text-[10px] text-[#8A8571]">
              Rule: Evidence strength is weighted across 4 sources (45% Assessment, 25% GitHub, 20% Projects, 10% Certifications). Self-declared claims do not confer points until verified.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
