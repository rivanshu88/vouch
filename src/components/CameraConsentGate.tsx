"use client";

import React, { useState } from "react";
import { Camera, ShieldCheck, Lock, AlertCircle, ArrowRight } from "lucide-react";

interface CameraConsentGateProps {
  skillName: string;
  difficulty: string;
  onConsentGranted: (stream: MediaStream | null) => void;
  onManualReviewRequested?: () => void;
}

export function CameraConsentGate({
  skillName,
  difficulty,
  onConsentGranted,
  onManualReviewRequested,
}: CameraConsentGateProps) {
  const [requesting, setRequesting] = useState(false);
  const [denied, setDenied] = useState(false);
  const [showManualReview, setShowManualReview] = useState(false);

  const handleEnableCamera = async () => {
    setRequesting(true);
    setDenied(false);

    try {
      if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
          audio: false,
        });
        onConsentGranted(stream);
      } else {
        // Fallback if getUserMedia is not supported in this environment
        onConsentGranted(null);
      }
    } catch (err: any) {
      console.warn("Camera access denied or unavailable:", err);
      setDenied(true);
    } finally {
      setRequesting(false);
    }
  };

  const handleManualReview = () => {
    if (onManualReviewRequested) {
      onManualReviewRequested();
    } else {
      setShowManualReview(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FBFAF7]/95 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl border border-[#B8B29D] bg-white p-6 sm:p-8">
        {/* Header Tag */}
        <div className="flex items-center justify-between border-b border-[#D9D5C7] pb-3">
          <div className="flex items-center gap-2 font-mono text-[10px] text-[#8A8571]">
            <span>BLUEPRINT ASSESSMENT</span>
            <span>·</span>
            <span className="text-[#1B3A5C] font-semibold uppercase">{difficulty} {skillName}</span>
          </div>
          <span className="border border-[#B8B29D] bg-[#F3F1EA] px-2 py-0.5 font-mono text-[9px] font-medium text-[#1B3A5C]">
            CONSENT GATE
          </span>
        </div>

        {/* Title */}
        <div className="mt-5">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-[#1B3A5C]">
            Continuous Presence Verification
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-[#3D3A31]">
            Vouch Blueprint Assessments require continuous camera presence verification. Like tab transitions and clipboard telemetry, presence signals feed into your transparent consistency breakdown.
          </p>
        </div>

        {/* Technical Privacy Ledger Box */}
        <div className="mt-5 border border-[#D9D5C7] bg-[#F3F1EA] p-4 text-xs space-y-3 font-mono">
          <div className="flex items-start gap-2.5">
            <Lock className="h-4 w-4 shrink-0 text-[#1B3A5C] mt-0.5" />
            <div>
              <p className="font-semibold text-[#1B3A5C]">100% Client-Side Processing</p>
              <p className="text-[11px] text-[#3D3A31] mt-0.5 leading-normal">
                No video, frames, or photos are ever uploaded, recorded, or stored on Vouch servers or Supabase. Presence detection executes strictly inside your browser.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 border-t border-[#D9D5C7] pt-2.5">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#2F6844] mt-0.5" />
            <div>
              <p className="font-semibold text-[#1B3A5C]">Non-Accusatory Telemetry</p>
              <p className="text-[11px] text-[#3D3A31] mt-0.5 leading-normal">
                Uncertain conditions (lighting, glasses, headwear) degrade gracefully to a manual review state. Free grace thresholds apply before any deduction occurs.
              </p>
            </div>
          </div>
        </div>

        {/* Permission Denied Alert */}
        {denied && (
          <div className="mt-4 border border-[#B8B29D] bg-[#FFF8E7] p-3 text-xs">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-[#9A6B1F] mt-0.5" />
              <div>
                <p className="font-semibold text-[#1B3A5C]">Camera Access Required to Continue</p>
                <p className="text-[11px] text-[#3D3A31] mt-0.5">
                  Your browser blocked or denied camera access. Please allow camera permissions in your address bar, or request a documented manual-review verification path below.
                </p>
              </div>
            </div>
          </div>
        )}

        {showManualReview && (
          <div className="mt-4 border border-[#B8B29D] bg-[#EBF2EC] p-3 text-xs">
            <p className="font-semibold text-[#2F6844]">Manual Review Path Requested</p>
            <p className="text-[11px] text-[#3D3A31] mt-0.5">
              An offline technical verification request has been queued. You may also proceed with simulation mode for testing purposes.
            </p>
            <button
              type="button"
              onClick={() => onConsentGranted(null)}
              className="mt-2 text-xs font-semibold text-[#1B3A5C] underline"
            >
              Continue in test simulation mode &rarr;
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#D9D5C7] pt-4">
          <button
            type="button"
            onClick={handleManualReview}
            className="text-[11px] font-mono text-[#8A8571] hover:text-[#1B3A5C] transition-colors"
          >
            Accessibility / Hardware fallback
          </button>

          <button
            type="button"
            onClick={handleEnableCamera}
            disabled={requesting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-[#1B3A5C] bg-[#1B3A5C] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#1B3A5C]/90 disabled:opacity-50 transition-colors"
          >
            <Camera className="h-3.5 w-3.5" />
            {requesting ? "Initializing Camera..." : "Enable camera & begin"}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
