"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  Info,
  Maximize2,
  RefreshCw,
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
      <div className={`border border-[#D9D5C7] bg-white p-6 ${className}`}>
        <div className="space-y-4 animate-pulse">
          <div className="h-5 w-40 bg-[#F3F1EA]" />
          <div className="h-10 w-24 bg-[#F3F1EA]" />
        </div>
      </div>
    );
  }

  if (!breakdown) {
    return null;
  }

  const score = breakdown.score;

  // Ledger badge styles: Seal Verified (>=85), Seal Pending (70-84), Seal Flagged (<70)
  let badgeStyle = "border-[#B8B29D] bg-[#EBF2EC] text-[#2F6844]";
  let scoreTextColor = "text-[#2F6844]";
  let statusText = "HIGH FOCUS INTEGRITY";

  if (score < 70) {
    badgeStyle = "border-[#B8B29D] bg-[#FDF0F0] text-[#8C2F2F]";
    scoreTextColor = "text-[#8C2F2F]";
    statusText = "SIGNIFICANT FOCUS VARIANCE";
  } else if (score < 85) {
    badgeStyle = "border-[#B8B29D] bg-[#FFF8E7] text-[#9A6B1F]";
    scoreTextColor = "text-[#9A6B1F]";
    statusText = "MODERATE FOCUS VARIANCE";
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

  // Grace indicators: filled dot (●) means the 1 free grace occurrence has been consumed
  const tabGraceUsed = (breakdown.tabSwitches || 0) > 0;
  const clipboardGraceUsed = (breakdown.clipboardAttempts || 0) > 0;
  const fullscreenGraceUsed = (breakdown.fullscreenExits || 0) > 0;
  const timingGraceUsed = (breakdown.timingAnomalies || 0) > 0;
  const revisionsGraceUsed = (breakdown.excessiveRevisions || 0) > 0;

  return (
    <div className={`border border-[#D9D5C7] bg-white p-6 ${className}`}>
      {/* Header with Score and Badge */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-[#8A8571]">
              Assessment integrity telemetry
            </span>
            <span className="border border-[#B8B29D] bg-[#F3F1EA] px-1.5 py-0.5 font-mono text-[9px] font-medium text-[#1B3A5C]">
              OBJECTIVE TELEMETRY
            </span>
          </div>

          <div className="mt-2.5 flex items-baseline gap-2">
            <span className={`font-mono text-4xl font-semibold tracking-tight tabular-nums ${scoreTextColor}`}>
              {score}
            </span>
            <span className="font-mono text-xs text-[#8A8571]">/ 100</span>
            <span className={`ml-2 inline-flex items-center border px-2 py-0.5 font-mono text-[10px] font-medium ${badgeStyle}`}>
              {statusText}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end text-right">
          <div className="border border-[#B8B29D] bg-[#F3F1EA] px-2 py-1 font-mono text-xs font-semibold text-[#1B3A5C]">
            TELEMETRY
          </div>
          <span className="mt-1 font-mono text-[9px] text-[#8A8571]">BEHAVIORAL</span>
        </div>
      </div>

      {/* §4.3 Category Deductions Grid with Grace Threshold Indicators */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-medium text-[#8A8571]">
            Category deductions breakdown
          </span>
          <span className="font-mono text-[9px] text-[#8A8571]">
            ● Grace used · ○ Grace available (1 free / category)
          </span>
        </div>

        <div
          className={`grid gap-2 text-xs font-mono ${
            hasTimingMismatch
              ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
              : "grid-cols-2 sm:grid-cols-5"
          }`}
        >
          {/* Tab Focus */}
          <div className="border border-[#D9D5C7] bg-[#FBFAF7] p-2.5">
            <div className="flex items-center justify-between text-[11px] text-[#8A8571]">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                Tab Focus
              </span>
              <span title={tabGraceUsed ? "1 free grace used" : "1 free grace available"}>
                {tabGraceUsed ? "●" : "○"}
              </span>
            </div>
            <p className="mt-1.5 text-sm font-semibold text-[#1B3A5C] tabular-nums">
              {breakdown.tabSwitches}{" "}
              <span className="text-[11px] font-normal text-[#8A8571]">
                ({deductions.tabSwitches > 0 ? `-${deductions.tabSwitches} pts` : "0 pts"})
              </span>
            </p>
          </div>

          {/* Clipboard */}
          <div className="border border-[#D9D5C7] bg-[#FBFAF7] p-2.5">
            <div className="flex items-center justify-between text-[11px] text-[#8A8571]">
              <span className="flex items-center gap-1">
                <Copy className="h-3 w-3" />
                Clipboard
              </span>
              <span title={clipboardGraceUsed ? "1 free grace used" : "1 free grace available"}>
                {clipboardGraceUsed ? "●" : "○"}
              </span>
            </div>
            <p className="mt-1.5 text-sm font-semibold text-[#1B3A5C] tabular-nums">
              {breakdown.clipboardAttempts}{" "}
              <span className="text-[11px] font-normal text-[#8A8571]">
                ({deductions.clipboard > 0 ? `-${deductions.clipboard} pts` : "0 pts"})
              </span>
            </p>
          </div>

          {/* Fullscreen */}
          <div className="border border-[#D9D5C7] bg-[#FBFAF7] p-2.5">
            <div className="flex items-center justify-between text-[11px] text-[#8A8571]">
              <span className="flex items-center gap-1">
                <Maximize2 className="h-3 w-3" />
                Fullscreen
              </span>
              <span title={fullscreenGraceUsed ? "1 free grace used" : "1 free grace available"}>
                {fullscreenGraceUsed ? "●" : "○"}
              </span>
            </div>
            <p className="mt-1.5 text-sm font-semibold text-[#1B3A5C] tabular-nums">
              {breakdown.fullscreenExits || 0}{" "}
              <span className="text-[11px] font-normal text-[#8A8571]">
                ({deductions.fullscreenExits > 0 ? `-${deductions.fullscreenExits} pts` : "0 pts"})
              </span>
            </p>
          </div>

          {/* Timing Variance */}
          <div className="border border-[#D9D5C7] bg-[#FBFAF7] p-2.5">
            <div className="flex items-center justify-between text-[11px] text-[#8A8571]">
              <span className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                Pacing
              </span>
              <span title={timingGraceUsed ? "1 free grace used" : "1 free grace available"}>
                {timingGraceUsed ? "●" : "○"}
              </span>
            </div>
            <p className="mt-1.5 text-sm font-semibold text-[#1B3A5C] tabular-nums">
              {breakdown.timingAnomalies}{" "}
              <span className="text-[11px] font-normal text-[#8A8571]">
                ({deductions.timingAnomalies > 0 ? `-${deductions.timingAnomalies} pts` : "0 pts"})
              </span>
            </p>
          </div>

          {/* Excessive Revisions */}
          <div className="border border-[#D9D5C7] bg-[#FBFAF7] p-2.5">
            <div className="flex items-center justify-between text-[11px] text-[#8A8571]">
              <span className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                Revisions
              </span>
              <span title={revisionsGraceUsed ? "1 free grace used" : "1 free grace available"}>
                {revisionsGraceUsed ? "●" : "○"}
              </span>
            </div>
            <p className="mt-1.5 text-sm font-semibold text-[#1B3A5C] tabular-nums">
              {breakdown.excessiveRevisions || 0}{" "}
              <span className="text-[11px] font-normal text-[#8A8571]">
                ({deductions.excessiveRevisions > 0 ? `-${deductions.excessiveRevisions} pts` : "0 pts"})
              </span>
            </p>
          </div>

          {/* Server Timing Mismatch */}
          {hasTimingMismatch && (
            <div className="border border-[#B8B29D] bg-[#FDF0F0] p-2.5 text-[#8C2F2F]">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Clock Check
                </span>
                <span>-10 pts</span>
              </div>
              <p className="mt-1.5 text-sm font-semibold tabular-nums">
                Mismatch <span className="text-[11px] font-normal">(-{deductions.timingMismatch} pts)</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* §4.3 Behavioral Signals Log / Raw Telemetry */}
      <div className="mt-5 border-t border-[#D9D5C7] pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("signals")}
              className={`border px-2.5 py-1 font-mono text-[11px] transition-colors ${
                activeTab === "signals"
                  ? "border-[#1B3A5C] bg-[#1B3A5C] text-white"
                  : "border-[#D9D5C7] bg-[#FBFAF7] text-[#8A8571] hover:text-[#3D3A31]"
              }`}
            >
              BEHAVIORAL SIGNALS ({breakdown.signals?.length || 0})
            </button>
            {rawEvents && rawEvents.length > 0 && (
              <button
                onClick={() => setActiveTab("raw")}
                className={`inline-flex items-center gap-1 border px-2.5 py-1 font-mono text-[11px] transition-colors ${
                  activeTab === "raw"
                    ? "border-[#1B3A5C] bg-[#1B3A5C] text-white"
                    : "border-[#D9D5C7] bg-[#FBFAF7] text-[#8A8571] hover:text-[#3D3A31]"
                }`}
              >
                <Terminal className="h-3 w-3" />
                RAW TELEMETRY ({rawEvents.length})
              </button>
            )}
          </div>
          <span className="font-mono text-[10px] text-[#8A8571]">
            {activeTab === "signals" ? "ANALYZED SIGNALS" : "CLIENT LOG"}
          </span>
        </div>

        {/* 1. Signals Timeline Styled as Specimen Tags */}
        {activeTab === "signals" && (
          <div className="space-y-2">
            {breakdown.signals && breakdown.signals.length > 0 ? (
              breakdown.signals.map((sig, idx) => (
                <div
                  key={idx}
                  className={`specimen-tag relative flex items-start gap-2.5 border p-2.5 text-xs ${
                    sig.level === "positive"
                      ? "border-[#B8B29D] bg-[#EBF2EC]/40 text-[#3D3A31]"
                      : sig.level === "warning"
                      ? "border-[#B8B29D] bg-[#FFF8E7]/60 text-[#3D3A31]"
                      : "border-[#D9D5C7] bg-[#FBFAF7] text-[#3D3A31]"
                  }`}
                >
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 ${
                      sig.level === "positive"
                        ? "bg-[#2F6844]"
                        : sig.level === "warning"
                        ? "bg-[#9A6B1F]"
                        : "bg-[#1B3A5C]"
                    }`}
                  />
                  {sig.level === "positive" ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#2F6844] mt-0.5 ml-1" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 text-[#9A6B1F] mt-0.5 ml-1" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-xs text-[#1B3A5C]">{sig.title}</p>
                      {sig.pointsDeducted !== undefined && sig.pointsDeducted > 0 ? (
                        <span className="border border-[#8C2F2F] bg-[#FDF0F0] px-1.5 py-0.2 font-mono text-[10px] font-medium text-[#8C2F2F]">
                          -{sig.pointsDeducted} pts
                        </span>
                      ) : sig.pointsDeducted === 0 && sig.level === "warning" ? (
                        <span className="border border-[#B8B29D] bg-[#F3F1EA] px-1.5 py-0.2 font-mono text-[10px] font-medium text-[#2F6844]">
                          Grace: 0 pts
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-[#3D3A31]">
                      {sig.description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="font-mono text-xs text-[#8A8571] italic">No behavioral events recorded.</p>
            )}
          </div>
        )}

        {/* 2. Raw Telemetry Event Log */}
        {activeTab === "raw" && rawEvents && (
          <div className="border border-[#B8B29D] bg-[#F3F1EA] p-3 font-mono text-[11px] text-[#3D3A31] max-h-72 overflow-y-auto space-y-1.5">
            {rawEvents.map((ev, i) => {
              const d = new Date(ev.timestamp);
              const timeStr = !isNaN(d.getTime())
                ? d.toLocaleTimeString([], { hour12: false, minute: "2-digit", second: "2-digit" })
                : String(ev.timestamp);
              return (
                <div key={i} className="flex items-start gap-2 border-b border-[#D9D5C7] pb-1">
                  <span className="text-[#8A8571] shrink-0">[{timeStr}]</span>
                  <span
                    className={`shrink-0 font-semibold ${
                      ev.type === "tab_switch" || ev.type === "window_blur"
                        ? "text-[#9A6B1F]"
                        : ev.type === "clipboard"
                        ? "text-[#8C2F2F]"
                        : ev.type === "fullscreen_exit"
                        ? "text-[#8C2F2F]"
                        : "text-[#1B3A5C]"
                    }`}
                  >
                    {ev.type}
                  </span>
                  {"questionId" in ev && ev.questionId && (
                    <span className="text-[#8A8571] shrink-0">({ev.questionId})</span>
                  )}
                  {((ev as RawIntegrityEvent).meta || (ev as AssessmentEvent).metadata) && (
                    <span className="text-[#8A8571] truncate">
                      {JSON.stringify((ev as RawIntegrityEvent).meta || (ev as AssessmentEvent).metadata)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mandatory Non-Accusatory Disclaimer (§4.3 Verbatim) */}
      <div className="mt-5 flex items-start gap-2 border border-[#D9D5C7] bg-[#F3F1EA] p-3 text-[11px] text-[#3D3A31]">
        <Info className="h-4 w-4 shrink-0 text-[#1B3A5C] mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-semibold text-[#1B3A5C]">Integrity Note: </span>
          {breakdown.disclaimer}
        </p>
      </div>
    </div>
  );
}
