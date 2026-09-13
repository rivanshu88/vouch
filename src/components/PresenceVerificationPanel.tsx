"use client";

import React, { useState, useCallback } from "react";
import { Camera, Move, Minimize2, Maximize2 } from "lucide-react";
import {
  usePresenceVerification,
  PresenceEventType,
} from "@/hooks/usePresenceVerification";

export type PresenceStatus = PresenceEventType;

interface PresenceVerificationPanelProps {
  stream: MediaStream | null;
  onPresenceSignal?: (status: PresenceStatus) => void;
  className?: string;
}

export function PresenceVerificationPanel({
  stream,
  onPresenceSignal,
  className = "",
}: PresenceVerificationPanelProps) {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [position, setPosition] = useState<"bottom-right" | "bottom-left">("bottom-right");

  const handlePresenceEvent = useCallback(
    (event: { type: PresenceEventType }) => {
      onPresenceSignal?.(event.type);
    },
    [onPresenceSignal]
  );

  const { status, statusMessage, videoRef, canvasRef } = usePresenceVerification({
    initialStream: stream,
    onPresenceEvent: handlePresenceEvent,
    detectionIntervalMs: 2500,
    graceThresholdSeconds: 3,
  });

  const togglePosition = useCallback(() => {
    setPosition((prev) => (prev === "bottom-right" ? "bottom-left" : "bottom-right"));
  }, []);

  const positionClass =
    position === "bottom-right" ? "right-4 sm:right-6 bottom-4 sm:bottom-6" : "left-4 sm:left-6 bottom-4 sm:bottom-6";

  return (
    <div
      className={`fixed z-40 ${positionClass} transition-all duration-200 ${className}`}
      aria-live="polite"
    >
      <div className="specimen-tag relative border border-[#B8B29D] bg-white p-2 text-[#3D3A31] w-56 sm:w-64">
        {/* Top edge indicator flag */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 ${
            status === "presence_confirmed"
              ? "bg-[#2F6844]"
              : status === "low_confidence"
              ? "bg-[#8A8571]"
              : "bg-[#9A6B1F]"
          }`}
        />

        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-[#D9D5C7] pb-1 pl-2 pr-1 font-mono text-[10px]">
          <div className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                status === "presence_confirmed"
                  ? "bg-[#2F6844]"
                  : status === "low_confidence"
                  ? "bg-[#8A8571]"
                  : "bg-[#9A6B1F] animate-pulse"
              }`}
            />
            <span className="font-semibold text-[#1B3A5C]">PRESENCE · LIVE</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={togglePosition}
              title="Reposition panel"
              className="text-[#8A8571] hover:text-[#1B3A5C] p-0.5"
            >
              <Move className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              title={isMinimized ? "Expand view" : "Minimize view"}
              className="text-[#8A8571] hover:text-[#1B3A5C] p-0.5"
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </button>
          </div>
        </div>

        {/* Video Surface with Technical Reticle */}
        {!isMinimized && (
          <div className="relative mt-2 aspect-4/3 w-full bg-[#F3F1EA] border border-[#D9D5C7] overflow-hidden">
            {stream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center text-[10px] font-mono text-[#8A8571] p-2 text-center">
                <Camera className="h-5 w-5 text-[#8A8571] mb-1" />
                <span>Simulated Presence Active</span>
              </div>
            )}

            {/* Hidden analysis canvas */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Technical Viewfinder Reticle (faint navy brackets, no red alert boxes) */}
            <div className="pointer-events-none absolute inset-2 border border-[#1B3A5C]/20">
              {/* Corner crosshairs */}
              <div className="absolute top-0 left-0 h-2 w-2 border-t-2 border-l-2 border-[#1B3A5C]/50" />
              <div className="absolute top-0 right-0 h-2 w-2 border-t-2 border-r-2 border-[#1B3A5C]/50" />
              <div className="absolute bottom-0 left-0 h-2 w-2 border-b-2 border-l-2 border-[#1B3A5C]/50" />
              <div className="absolute bottom-0 right-0 h-2 w-2 border-b-2 border-r-2 border-[#1B3A5C]/50" />
            </div>

            {/* Micro-label at bottom of viewport */}
            <div className="absolute bottom-1 right-1.5 font-mono text-[8px] text-[#1B3A5C]/60 bg-white/70 px-1">
              LOCAL ANALYSIS ONLY
            </div>
          </div>
        )}

        {/* Non-Accusatory Status Notification (§4.8) */}
        {statusMessage ? (
          <div className="mt-1.5 border-t border-[#D9D5C7] pt-1 pl-2 text-[10px] leading-tight text-[#9A6B1F] font-mono">
            {statusMessage}
          </div>
        ) : (
          <div className="mt-1.5 border-t border-[#D9D5C7] pt-1 pl-2 font-mono text-[9px] text-[#2F6844]">
            Presence confirmed
          </div>
        )}
      </div>
    </div>
  );
}
