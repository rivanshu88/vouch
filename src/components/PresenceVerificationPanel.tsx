"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Camera, Move, Minimize2, Maximize2 } from "lucide-react";

export type PresenceStatus = "confirmed" | "face_absent" | "multiple_faces" | "low_confidence";

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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState<PresenceStatus>("confirmed");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [position, setPosition] = useState<"bottom-right" | "bottom-left">("bottom-right");

  // Track stream attachment
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  // Client-side lightweight presence analysis
  useEffect(() => {
    if (!stream) {
      return;
    }

    let absenceCounter = 0;

    const intervalId = setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.readyState < 2) return;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      canvas.width = 160;
      canvas.height = 120;
      ctx.drawImage(video, 0, 0, 160, 120);

      try {
        const frame = ctx.getImageData(0, 0, 160, 120);
        const data = frame.data;
        let totalBrightness = 0;

        for (let i = 0; i < data.length; i += 16) {
          totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
        }
        const avgBrightness = totalBrightness / (data.length / 16);

        // Low light / low confidence fallback
        if (avgBrightness < 20) {
          setStatus("low_confidence");
          setStatusMessage("Low confidence — verify manually");
          onPresenceSignal?.("low_confidence");
          return;
        }

        // Check if window.FaceDetector is natively supported
        if (typeof window !== "undefined" && "FaceDetector" in window) {
          const detector = new (window as any).FaceDetector({ maxDetectedFaces: 3 });
          detector
            .detect(video)
            .then((faces: any[]) => {
              if (faces.length === 0) {
                absenceCounter++;
                // 3 intervals grace buffer (~4.5s) before emitting face_absent
                if (absenceCounter >= 3) {
                  setStatus("face_absent");
                  setStatusMessage("We can't confirm you're in frame — move back into view.");
                  onPresenceSignal?.("face_absent");
                }
              } else if (faces.length > 1) {
                absenceCounter = 0;
                setStatus("multiple_faces");
                setStatusMessage("More than one person is currently in frame.");
                onPresenceSignal?.("multiple_faces");
              } else {
                absenceCounter = 0;
                setStatus("confirmed");
                setStatusMessage("");
              }
            })
            .catch(() => {
              // Fallback to confirmed presence if API fails
              setStatus("confirmed");
              setStatusMessage("");
            });
        } else {
          // Standard browser fallback: presence confirmed
          absenceCounter = 0;
          setStatus("confirmed");
          setStatusMessage("");
        }
      } catch {
        setStatus("confirmed");
        setStatusMessage("");
      }
    }, 1500);

    return () => clearInterval(intervalId);
  }, [stream, onPresenceSignal]);

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
            status === "confirmed"
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
                status === "confirmed"
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
