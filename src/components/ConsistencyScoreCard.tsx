"use client";

import React from "react";
import { Activity, AlertCircle, CheckCircle2, Info, RefreshCw, Copy, Eye, ShieldCheck } from "lucide-react";
import { ConsistencyBreakdown } from "@/types";

interface ConsistencyScoreCardProps {
  breakdown: ConsistencyBreakdown;
  className?: string;
}

export function ConsistencyScoreCard({ breakdown, className = "" }: ConsistencyScoreCardProps) {
  const isHighFocus = breakdown.score >= 85;

  return (
    <div className={`rounded-xl border border-zinc-200/90 bg-white p-6 shadow-2xs ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Assessment Integrity Signals
            </span>
            <span className="rounded-full bg-zinc-100 border border-zinc-200/60 px-2 py-0.5 font-mono text-[9px] font-bold text-zinc-600 uppercase tracking-wider">
              Focus Signal
            </span>
          </div>

          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tracking-tight text-zinc-950 font-mono">
              {breakdown.score}
            </span>
            <span className="text-xs font-semibold text-zinc-400">/ 100</span>
            <span
              className={`ml-2 inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${
                isHighFocus
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200/80"
                  : "bg-amber-50 text-amber-800 border-amber-200/80"
              }`}
            >
              {isHighFocus ? (
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
              )}
              {isHighFocus ? "High Focus Confidence" : "Focus Variance Detected"}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-800 shadow-2xs">
            <Activity className="h-5 w-5 text-zinc-600" />
          </div>
          <span className="mt-1 text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Signals</span>
        </div>
      </div>

      {/* Grid of 4 Monitored Signals */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="rounded-lg border border-zinc-200/70 bg-zinc-50/60 p-2.5 transition-colors">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
            <Eye className="h-3.5 w-3.5 text-zinc-400" />
            Tab Switches
          </div>
          <p className="mt-1.5 font-mono text-lg font-bold text-zinc-950">{breakdown.tabSwitches}</p>
        </div>

        <div className="rounded-lg border border-zinc-200/70 bg-zinc-50/60 p-2.5 transition-colors">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
            <Copy className="h-3.5 w-3.5 text-zinc-400" />
            Clipboard Events
          </div>
          <p className="mt-1.5 font-mono text-lg font-bold text-zinc-950">{breakdown.clipboardAttempts}</p>
        </div>

        <div className="rounded-lg border border-zinc-200/70 bg-zinc-50/60 p-2.5 transition-colors">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
            <Activity className="h-3.5 w-3.5 text-zinc-400" />
            Timing Variance
          </div>
          <p className="mt-1.5 font-mono text-lg font-bold text-zinc-950">{breakdown.timingAnomalies}</p>
        </div>

        <div className="rounded-lg border border-zinc-200/70 bg-zinc-50/60 p-2.5 transition-colors">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
            <RefreshCw className="h-3.5 w-3.5 text-zinc-400" />
            Answer Revisions
          </div>
          <p className="mt-1.5 font-mono text-lg font-bold text-zinc-950">{breakdown.answerChanges}</p>
        </div>
      </div>

      {/* Behavioral Signals Log */}
      <div className="mt-4 space-y-2 border-t border-zinc-100 pt-3">
        {breakdown.signals.map((sig, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-xs transition-colors ${
              sig.level === "positive"
                ? "border-emerald-100 bg-emerald-50/40 text-emerald-950"
                : sig.level === "warning"
                ? "border-amber-200/70 bg-amber-50/50 text-amber-950"
                : "border-zinc-200/80 bg-zinc-50/60 text-zinc-800"
            }`}
          >
            {sig.level === "positive" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            ) : sig.level === "warning" ? (
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            ) : (
              <Info className="h-4 w-4 shrink-0 text-zinc-500 mt-0.5" />
            )}
            <div>
              <p className="font-semibold text-xs">{sig.title}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-600">{sig.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mandatory Non-Accusatory Disclaimer (PRD Section 5.3 & 17) */}
      <div className="mt-4 flex items-start gap-2 rounded-lg border border-zinc-200/80 bg-zinc-50/80 p-3 text-[11px] text-zinc-600">
        <Info className="h-3.5 w-3.5 shrink-0 text-zinc-500 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-bold text-zinc-800">Assessment Note: </span>
          {breakdown.disclaimer}
        </p>
      </div>
    </div>
  );
}
