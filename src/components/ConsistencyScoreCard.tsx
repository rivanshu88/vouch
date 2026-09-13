"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  Info,
  Maximize2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { AssessmentEvent, ConsistencyBreakdown, RawIntegrityEvent } from "@/types";

interface ConsistencyScoreCardProps {
  breakdown?: ConsistencyBreakdown;
  attemptId?: string;
  rawEvents?: (RawIntegrityEvent | AssessmentEvent)[];
  className?: string;
}

export function ConsistencyScoreCard({
  breakdown: initialBreakdown,
  attemptId,
  rawEvents: initialRawEvents,
  className = "",
}: ConsistencyScoreCardProps) {
  const [fetchedBreakdown, setFetchedBreakdown] = useState<ConsistencyBreakdown | null>(null);
  const [fetchedRawEvents, setFetchedRawEvents] = useState<(RawIntegrityEvent | AssessmentEvent)[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"signals" | "raw">("signals");

  const breakdown = initialBreakdown || fetchedBreakdown;
  const rawEvents = initialRawEvents || fetchedRawEvents;

  // If attemptId is provided without full breakdown, fetch real data
  useEffect(() => {
    if (!attemptId || initialBreakdown) return;

    let isMounted = true;
    setLoading(true);

    fetch(`/api/assessments/${attemptId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted || !data.success || !data.data) return;
        const att = data.data;
        if (att.consistencyBreakdown) {
          setFetchedBreakdown(att.consistencyBreakdown);
        }
        if (att.rawEvents) {
          setFetchedRawEvents(att.rawEvents);
        }
      })
      .catch((err) => {
        console.error("Failed to load assessment integrity breakdown:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [attemptId, initialBreakdown]);

  if (loading && !breakdown) {
    return (
      <div className={`rounded-xl border border-zinc-200/90 bg-white p-6 shadow-2xs ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-zinc-200 rounded"></div>
          <div className="h-10 w-24 bg-zinc-200 rounded"></div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-zinc-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!breakdown) {
    return null;
  }

  const score = breakdown.score;

  // Color coding: green >= 85, yellow 70-84, red < 70
  let badgeStyle = "bg-emerald-50 text-emerald-800 border-emerald-200";
  let scoreTextColor = "text-emerald-700";
  let statusText = "High Focus Integrity";
  let StatusIcon = ShieldCheck;

  if (score < 70) {
    badgeStyle = "bg-rose-50 text-rose-800 border-rose-200";
    scoreTextColor = "text-rose-700";
    statusText = "Significant Focus Variance";
    StatusIcon = ShieldAlert;
  } else if (score < 85) {
    badgeStyle = "bg-amber-50 text-amber-800 border-amber-200";
    scoreTextColor = "text-amber-700";
    statusText = "Moderate Focus Variance";
    StatusIcon = AlertTriangle;
  }

  const deductions = breakdown.breakdown || breakdown.deductions || {
    tabSwitches: 0,
    clipboard: 0,
    fullscreenExits: 0,
    timingAnomalies: 0,
    excessiveRevisions: 0,
    timingMismatch: 0,
  };

  const hasTimingMismatch = (deductions.timingMismatch || 0) > 0;

  return (
    <div className={`rounded-xl border border-zinc-200/90 bg-white p-6 shadow-2xs ${className}`}>
      {/* Header with Score and Badge */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Assessment Integrity Signals
            </span>
            <span className="rounded-full bg-zinc-100 border border-zinc-200/60 px-2 py-0.5 font-mono text-[9px] font-bold text-zinc-600 uppercase tracking-wider">
              Objective Telemetry
            </span>
          </div>

          <div className="mt-2.5 flex items-baseline gap-2">
            <span className={`text-4xl font-extrabold tracking-tight font-mono ${scoreTextColor}`}>
              {score}
            </span>
            <span className="text-xs font-semibold text-zinc-400">/ 100</span>
            <span
              className={`ml-2 inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${badgeStyle}`}
            >
              <StatusIcon className="h-3.5 w-3.5 shrink-0" />
              {statusText}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-800 shadow-2xs">
            <Activity className="h-5 w-5 text-zinc-600" />
          </div>
          <span className="mt-1 text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
            Signals
          </span>
        </div>
      </div>

      {/* Category Breakdown with Deductions (Includes 1-Occurrence Grace Threshold) */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Category Deductions Breakdown
          </h4>
          <span className="text-[10px] text-zinc-400 font-medium">
            Includes 1 free occurrence grace threshold per category
          </span>
        </div>

        <div
          className={`grid gap-2.5 ${
            hasTimingMismatch
              ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
              : "grid-cols-2 sm:grid-cols-5"
          }`}
        >
          {/* Tab Switches */}
          <div className="rounded-lg border border-zinc-200/70 bg-zinc-50/60 p-2.5">
            <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500">
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5 text-zinc-400" />
                Tab Focus
              </span>
              <span className="font-mono text-[10px] text-zinc-400">Max -20</span>
            </div>
            <p className="mt-1 font-mono text-base font-bold text-zinc-950">
              {breakdown.tabSwitches}{" "}
              <span className="text-xs font-normal text-zinc-500">
                ({deductions.tabSwitches > 0 ? `-${deductions.tabSwitches} pts` : "0 pts"})
              </span>
            </p>
          </div>

          {/* Clipboard Events */}
          <div className="rounded-lg border border-zinc-200/70 bg-zinc-50/60 p-2.5">
            <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500">
              <span className="flex items-center gap-1">
                <Copy className="h-3.5 w-3.5 text-zinc-400" />
                Clipboard
              </span>
              <span className="font-mono text-[10px] text-zinc-400">-8/ea</span>
            </div>
            <p className="mt-1 font-mono text-base font-bold text-zinc-950">
              {breakdown.clipboardAttempts}{" "}
              <span className="text-xs font-normal text-zinc-500">
                ({deductions.clipboard > 0 ? `-${deductions.clipboard} pts` : "0 pts"})
              </span>
            </p>
          </div>

          {/* Fullscreen Exits */}
          <div className="rounded-lg border border-zinc-200/70 bg-zinc-50/60 p-2.5">
            <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500">
              <span className="flex items-center gap-1">
                <Maximize2 className="h-3.5 w-3.5 text-zinc-400" />
                Fullscreen
              </span>
              <span className="font-mono text-[10px] text-zinc-400">-10/ea</span>
            </div>
            <p className="mt-1 font-mono text-base font-bold text-zinc-950">
              {breakdown.fullscreenExits || 0}{" "}
              <span className="text-xs font-normal text-zinc-500">
                ({deductions.fullscreenExits > 0 ? `-${deductions.fullscreenExits} pts` : "0 pts"})
              </span>
            </p>
          </div>

          {/* Timing Variance */}
          <div className="rounded-lg border border-zinc-200/70 bg-zinc-50/60 p-2.5">
            <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500">
              <span className="flex items-center gap-1">
                <Activity className="h-3.5 w-3.5 text-zinc-400" />
                Timing
              </span>
              <span className="font-mono text-[10px] text-zinc-400">-6/ea</span>
            </div>
            <p className="mt-1 font-mono text-base font-bold text-zinc-950">
              {breakdown.timingAnomalies}{" "}
              <span className="text-xs font-normal text-zinc-500">
                ({deductions.timingAnomalies > 0 ? `-${deductions.timingAnomalies} pts` : "0 pts"})
              </span>
            </p>
          </div>

          {/* Excessive Revisions */}
          <div className="rounded-lg border border-zinc-200/70 bg-zinc-50/60 p-2.5">
            <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500">
              <span className="flex items-center gap-1">
                <RefreshCw className="h-3.5 w-3.5 text-zinc-400" />
                Revisions
              </span>
              <span className="font-mono text-[10px] text-zinc-400">-4/ea</span>
            </div>
            <p className="mt-1 font-mono text-base font-bold text-zinc-950">
              {breakdown.excessiveRevisions || 0}{" "}
              <span className="text-xs font-normal text-zinc-500">
                ({deductions.excessiveRevisions > 0 ? `-${deductions.excessiveRevisions} pts` : "0 pts"})
              </span>
            </p>
          </div>

          {/* Server Timing Mismatch (Task 4) */}
          {hasTimingMismatch && (
            <div className="rounded-lg border border-rose-200 bg-rose-50/60 p-2.5">
              <div className="flex items-center justify-between text-[11px] font-medium text-rose-700">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-rose-500" />
                  Clock Check
                </span>
                <span className="font-mono text-[10px] text-rose-600">-10 pts</span>
              </div>
              <p className="mt-1 font-mono text-base font-bold text-rose-950">
                Mismatch{" "}
                <span className="text-xs font-normal text-rose-700">
                  (-{deductions.timingMismatch} pts)
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs: Behavioral Signals Timeline vs Raw Telemetry Log */}
      <div className="mt-5 border-t border-zinc-100 pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("signals")}
              className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${
                activeTab === "signals"
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Behavioral Signals ({breakdown.signals?.length || 0})
            </button>
            {rawEvents && rawEvents.length > 0 && (
              <button
                onClick={() => setActiveTab("raw")}
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${
                  activeTab === "raw"
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <Terminal className="h-3 w-3" />
                Raw Telemetry Log ({rawEvents.length})
              </button>
            )}
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">
            {activeTab === "signals" ? "Scored Analysis" : "Real Browser Events"}
          </span>
        </div>

        {/* 1. Scored Signals Timeline */}
        {activeTab === "signals" && (
          <div className="space-y-2">
            {breakdown.signals && breakdown.signals.length > 0 ? (
              breakdown.signals.map((sig, idx) => (
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
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-xs text-zinc-900">{sig.title}</p>
                      {sig.pointsDeducted !== undefined && sig.pointsDeducted > 0 ? (
                        <span className="font-mono text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                          -{sig.pointsDeducted} pts
                        </span>
                      ) : (
                        sig.pointsDeducted === 0 &&
                        sig.level === "warning" && (
                          <span className="font-mono text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                            Grace: 0 pts
                          </span>
                        )
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-600">
                      {sig.description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-400 italic">No behavioral events recorded.</p>
            )}
          </div>
        )}

        {/* 2. Raw Telemetry Event Log */}
        {activeTab === "raw" && rawEvents && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-950 p-3 font-mono text-[11px] text-zinc-300 max-h-72 overflow-y-auto space-y-1.5">
            {rawEvents.map((ev, i) => {
              const d = new Date(ev.timestamp);
              const timeStr = !isNaN(d.getTime())
                ? d.toLocaleTimeString([], { hour12: false, minute: "2-digit", second: "2-digit" })
                : String(ev.timestamp);
              return (
                <div key={i} className="flex items-start gap-2 border-b border-zinc-800/60 pb-1">
                  <span className="text-zinc-500 shrink-0">[{timeStr}]</span>
                  <span
                    className={`shrink-0 font-bold ${
                      ev.type === "tab_switch" || ev.type === "window_blur"
                        ? "text-amber-400"
                        : ev.type === "clipboard"
                        ? "text-rose-400"
                        : ev.type === "fullscreen_exit"
                        ? "text-purple-400"
                        : "text-sky-400"
                    }`}
                  >
                    {ev.type}
                  </span>
                  {"questionId" in ev && ev.questionId && (
                    <span className="text-zinc-400 shrink-0">({ev.questionId})</span>
                  )}
                  {((ev as RawIntegrityEvent).meta || (ev as AssessmentEvent).metadata) && (
                    <span className="text-zinc-500 truncate">
                      {JSON.stringify((ev as RawIntegrityEvent).meta || (ev as AssessmentEvent).metadata)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mandatory Non-Accusatory Disclaimer */}
      <div className="mt-4 flex items-start gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-[11px] text-zinc-600">
        <Info className="h-4 w-4 shrink-0 text-sky-600 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-semibold text-zinc-900">Integrity Note: </span>
          {breakdown.disclaimer}
        </p>
      </div>
    </div>
  );
}
