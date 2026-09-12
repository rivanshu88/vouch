"use client";

import React, { useState } from "react";
import { ShieldCheck, HelpCircle, GitCommit, FileCode2, Award, ChevronDown, ChevronUp } from "lucide-react";
import { EvidenceStrengthBreakdown } from "@/types";

interface EvidenceScoreCardProps {
  data: EvidenceStrengthBreakdown;
  className?: string;
}

export function EvidenceScoreCard({ data, className = "" }: EvidenceScoreCardProps) {
  const [showWhy, setShowWhy] = useState(false);

  return (
    <div className={`rounded-xl border border-zinc-200/90 bg-white p-6 shadow-2xs ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Evidence Strength Score
            </span>
            <button
              onClick={() => setShowWhy(!showWhy)}
              className="rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 p-0.5 transition-colors"
              title="Why did I receive this score?"
              aria-label="Explain score calculation"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tracking-tight text-zinc-950 font-mono">
              {data.compositeScore}
            </span>
            <span className="text-xs font-semibold text-zinc-400">/ 100</span>
            <span className="ml-2 inline-flex items-center gap-1 rounded bg-sky-50 border border-sky-200/60 px-2 py-0.5 text-[10px] font-bold text-sky-800 uppercase tracking-wide">
              <ShieldCheck className="h-3 w-3 text-sky-600" />
              Verified Signal
            </span>
          </div>
        </div>

        {/* Minimal Score Badge */}
        <div className="flex flex-col items-end">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-900 bg-zinc-950 text-white font-mono text-sm font-extrabold shadow-2xs">
            {data.compositeScore}
          </div>
          <span className="mt-1 text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Composite</span>
        </div>
      </div>

      {/* Breakdown progress meters */}
      <div className="mt-6 space-y-3.5 border-t border-zinc-100 pt-4">
        {/* Assessment Score */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1.5 font-medium text-zinc-800">
              <ShieldCheck className="h-3.5 w-3.5 text-sky-600 shrink-0" />
              Standardized Blueprint Tests (45%)
            </span>
            <span className="font-mono font-semibold text-zinc-900">{data.assessmentScore}/100</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-sky-600 transition-all duration-500 ease-out"
              style={{ width: `${Math.max(data.assessmentScore, 2)}%` }}
            />
          </div>
        </div>

        {/* GitHub Evidence */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1.5 font-medium text-zinc-800">
              <GitCommit className="h-3.5 w-3.5 text-zinc-700 shrink-0" />
              Public Code Repositories (25%)
            </span>
            <span className="font-mono font-semibold text-zinc-900">{data.githubScore}/100</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-zinc-800 transition-all duration-500 ease-out"
              style={{ width: `${Math.max(data.githubScore, 2)}%` }}
            />
          </div>
        </div>

        {/* Projects Evidence */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1.5 font-medium text-zinc-800">
              <FileCode2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              Verified Artifacts & Projects (20%)
            </span>
            <span className="font-mono font-semibold text-zinc-900">{data.projectsScore}/100</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-500 ease-out"
              style={{ width: `${Math.max(data.projectsScore, 2)}%` }}
            />
          </div>
        </div>

        {/* Certificates Evidence */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1.5 font-medium text-zinc-800">
              <Award className="h-3.5 w-3.5 text-purple-600 shrink-0" />
              External Credentials (10%)
            </span>
            <span className="font-mono font-semibold text-zinc-900">{data.certificatesScore}/100</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-purple-600 transition-all duration-500 ease-out"
              style={{ width: `${Math.max(data.certificatesScore, 2)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Explainable Factor Accordion */}
      <div className="mt-4 border-t border-zinc-100 pt-3">
        <button
          onClick={() => setShowWhy(!showWhy)}
          className="flex w-full items-center justify-between text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <span>Score Composition Rationale ({data.explanation.length} contributing signals)</span>
          {showWhy ? <ChevronUp className="h-3.5 w-3.5 text-zinc-400" /> : <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />}
        </button>

        {showWhy && (
          <div className="mt-3 rounded-lg border border-zinc-200/80 bg-zinc-50/70 p-3 text-xs animate-in fade-in duration-150">
            <ul className="space-y-2 text-zinc-600 text-[11px] leading-relaxed">
              {data.explanation.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-600"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 border-t border-zinc-200/60 pt-2 text-[10px] text-zinc-400 italic">
              Self-declared skills do not confer points until verified by assessment performance or verified public codebase activity.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
