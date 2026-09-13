"use client";

import React, { useState, useEffect, useRef } from "react";
import { AssessmentAttempt, AssessmentAnswer, SanitizedQuestion } from "@/types";
import { useIntegrityTracking } from "@/hooks/useIntegrityTracking";
import { CameraConsentGate } from "@/components/CameraConsentGate";
import { PresenceVerificationPanel, PresenceStatus } from "@/components/PresenceVerificationPanel";
import {
  ChevronRight,
  ChevronLeft,
  Send,
  ShieldCheck,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface AssessmentRunnerProps {
  attempt: AssessmentAttempt;
  onCompleted: (result: any) => void;
}

export function AssessmentRunner({ attempt, onCompleted }: AssessmentRunnerProps) {
  const [consentGranted, setConsentGranted] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<
    Record<string, { selectedOptionId: string; timeSpentMs: number; changeCount: number }>
  >({});
  const [remainingSeconds, setRemainingSeconds] = useState(attempt.durationSeconds || 300);
  const [submitting, setSubmitting] = useState(false);

  const questionStartTimeRef = useRef<number>(Date.now());
  const questions: SanitizedQuestion[] = attempt.questions || [];
  const currentQuestion = questions[currentIdx];

  // Wire up the live assessment integrity capture hook
  const {
    containerRef,
    eventsCount,
    isFullscreen,
    requestFullscreen,
    recordQuestionNavigation,
    recordAnswerRevision,
    recordPresenceSignal,
    getRawEvents,
  } = useIntegrityTracking({
    attemptId: attempt.id,
    currentQuestionId: currentQuestion?.id,
    currentQuestionIndex: currentIdx,
    enabled: consentGranted && !submitting,
  });

  const handleSelectOption = (optionId: string) => {
    if (!currentQuestion) return;

    const qId = currentQuestion.id;
    const now = Date.now();
    const timeSpent = now - questionStartTimeRef.current;

    const existing = answers[qId];
    const newChangeCount = existing ? existing.changeCount + 1 : 0;

    if (existing && existing.selectedOptionId !== optionId) {
      recordAnswerRevision(qId, existing.selectedOptionId, optionId);
    }

    setAnswers((prev) => ({
      ...prev,
      [qId]: {
        selectedOptionId: optionId,
        timeSpentMs: (existing?.timeSpentMs || 0) + timeSpent,
        changeCount: newChangeCount,
      },
    }));

    questionStartTimeRef.current = Date.now();
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      const nextIdx = currentIdx + 1;
      recordQuestionNavigation(currentIdx, nextIdx, "forward", currentQuestion?.id);
      setCurrentIdx(nextIdx);
      questionStartTimeRef.current = Date.now();
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      const prevIdx = currentIdx - 1;
      recordQuestionNavigation(currentIdx, prevIdx, "back", currentQuestion?.id);
      setCurrentIdx(prevIdx);
      questionStartTimeRef.current = Date.now();
    }
  };

  const handleJump = (targetIdx: number) => {
    if (targetIdx !== currentIdx && targetIdx >= 0 && targetIdx < questions.length) {
      const dir = targetIdx > currentIdx ? "forward" : "back";
      recordQuestionNavigation(currentIdx, targetIdx, dir, currentQuestion?.id);
      setCurrentIdx(targetIdx);
      questionStartTimeRef.current = Date.now();
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    const now = Date.now();
    const lastQuestionElapsed = now - questionStartTimeRef.current;

    const updatedAnswers = { ...answers };
    if (currentQuestion) {
      const currentAns = updatedAnswers[currentQuestion.id];
      updatedAnswers[currentQuestion.id] = {
        selectedOptionId: currentAns?.selectedOptionId || "",
        timeSpentMs: (currentAns?.timeSpentMs || 0) + lastQuestionElapsed,
        changeCount: currentAns?.changeCount || 0,
      };
    }

    const formattedAnswers: AssessmentAnswer[] = questions.map((q) => {
      const recorded = updatedAnswers[q.id];
      return {
        id: `ans-${q.id}`,
        attemptId: attempt.id,
        questionId: q.id,
        selectedOptionId: recorded?.selectedOptionId,
        timeSpentMs: recorded?.timeSpentMs || 5000,
        answerChangeCount: recorded?.changeCount || 0,
      };
    });

    const rawEvents = getRawEvents();

    try {
      const res = await fetch(`/api/assessments/${attempt.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: formattedAnswers,
          events: rawEvents,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Stop camera stream tracks on completion
        if (cameraStream) {
          cameraStream.getTracks().forEach((t) => t.stop());
        }
        onCompleted(data.data);
      } else {
        alert(data.error?.message || "Failed to submit assessment.");
      }
    } catch {
      alert("Network interruption. Please verify your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  // Keyboard navigation listener
  useEffect(() => {
    if (!consentGranted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentQuestion) return;
      const key = e.key.toUpperCase();

      let targetOptIdx = -1;
      if (key === "A" || key === "1") targetOptIdx = 0;
      if (key === "B" || key === "2") targetOptIdx = 1;
      if (key === "C" || key === "3") targetOptIdx = 2;
      if (key === "D" || key === "4") targetOptIdx = 3;

      if (targetOptIdx >= 0 && targetOptIdx < currentQuestion.options.length) {
        handleSelectOption(currentQuestion.options[targetOptIdx].id);
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [consentGranted, currentQuestion, currentIdx, answers]);

  // Countdown timer
  useEffect(() => {
    if (!consentGranted) return;

    if (remainingSeconds <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [consentGranted, remainingSeconds]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!currentQuestion) {
    return (
      <div className="p-12 text-center font-mono text-xs text-[#8A8571]">
        Preparing assessment blueprint...
      </div>
    );
  }

  // Pre-test Consent Gate (§4.8)
  if (!consentGranted) {
    return (
      <CameraConsentGate
        skillName={attempt.skillName}
        difficulty={attempt.difficulty}
        onConsentGranted={(stream) => {
          setCameraStream(stream);
          setConsentGranted(true);
          questionStartTimeRef.current = Date.now();
        }}
      />
    );
  }

  const selectedForCurrent = answers[currentQuestion.id]?.selectedOptionId;

  return (
    <div
      ref={containerRef}
      className="blueprint-grid min-h-screen -mx-4 -my-6 px-4 py-8 sm:px-6 lg:px-8 space-y-6"
    >
      <div className="mx-auto max-w-3xl space-y-5">
        {/* Assessment Control Bar (The Calibration Header) */}
        <div className="border border-[#D9D5C7] bg-white p-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-semibold text-[#1B3A5C] text-sm tracking-tight">
                {attempt.skillName} Blueprint Assessment
              </span>
              <span className="border border-[#B8B29D] bg-[#F3F1EA] px-2 py-0.5 font-mono text-[9px] font-medium text-[#1B3A5C] uppercase">
                {attempt.difficulty}
              </span>
            </div>
            <p className="font-mono text-[11px] text-[#8A8571] mt-0.5">
              Question {currentIdx + 1} of {questions.length} · Topic:{" "}
              <span className="text-[#3D3A31] font-medium">{currentQuestion.topic}</span>
            </p>
          </div>

          {/* Mechanical Counter Timer & Fullscreen Button */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={requestFullscreen}
              title={isFullscreen ? "Fullscreen active" : "Enter fullscreen mode"}
              className="inline-flex items-center gap-1 border border-[#D9D5C7] bg-[#FBFAF7] hover:bg-[#F3F1EA] px-2.5 py-1.5 font-mono text-[11px] text-[#3D3A31] transition-colors"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="h-3 w-3 text-[#2F6844]" />
                  <span>FULLSCREEN</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-3 w-3 text-[#8A8571]" />
                  <span>FULLSCREEN</span>
                </>
              )}
            </button>

            {/* Mechanical Counter Timer (§4.6) */}
            <div
              className={`border border-[#B8B29D] bg-[#F3F1EA] px-3 py-1.5 font-mono text-xs font-semibold tabular-nums ${
                remainingSeconds < 60 ? "text-[#8C2F2F] border-[#8C2F2F]" : "text-[#1B3A5C]"
              }`}
              aria-live="polite"
              aria-label={`Time remaining: ${formatTimer(remainingSeconds)}`}
            >
              <span>{formatTimer(remainingSeconds)}</span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 border border-[#1B3A5C] bg-[#1B3A5C] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1B3A5C]/90 disabled:opacity-50 transition-colors"
            >
              <Send className="h-3 w-3" />
              {submitting ? "Evaluating..." : "Submit Test"}
            </button>
          </div>
        </div>

        {/* Main Question Surface */}
        <div className="border border-[#D9D5C7] bg-white p-6 sm:p-8">
          {/* Sub-header with Integrity Status */}
          <div className="flex items-center justify-between border-b border-[#D9D5C7] pb-3 mb-5 font-mono text-[11px] text-[#8A8571]">
            <span>
              SPECIMEN QUESTION {currentIdx + 1} OF {questions.length}
            </span>
            <div className="flex items-center gap-2">
              {eventsCount > 0 && (
                <span>
                  [{eventsCount} {eventsCount === 1 ? "telemetry event" : "telemetry events"}]
                </span>
              )}
              <span className="flex items-center gap-1.5 border border-[#B8B29D] bg-[#EBF2EC] px-2 py-0.5 text-[#2F6844] font-medium">
                <ShieldCheck className="h-3.5 w-3.5 text-[#2F6844]" />
                TELEMETRY ACTIVE
              </span>
            </div>
          </div>

          {/* Question Prompt */}
          <div className="text-[#1B3A5C] text-sm font-medium leading-relaxed whitespace-pre-wrap font-body">
            {currentQuestion.questionText}
          </div>

          {/* Options List with Keycap Glyphs (§4.6) */}
          <div className="mt-6 space-y-2.5">
            {currentQuestion.options.map((opt, optIdx) => {
              const isSelected = selectedForCurrent === opt.id;
              const letter = String.fromCharCode(65 + optIdx);

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`w-full flex items-start gap-3 border p-3.5 text-left text-xs transition-colors ${
                    isSelected
                      ? "border-[#1B3A5C] bg-[#E9EFF5] text-[#1B3A5C] font-medium"
                      : "border-[#D9D5C7] bg-white hover:bg-[#F3F1EA] text-[#3D3A31]"
                  }`}
                >
                  {/* Keycap Glyph */}
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center border font-mono text-[10px] font-semibold ${
                      isSelected
                        ? "border-[#1B3A5C] bg-[#1B3A5C] text-white"
                        : "border-[#D9D5C7] bg-[#F3F1EA] text-[#1B3A5C]"
                    }`}
                  >
                    {letter}
                  </div>
                  <div className="leading-relaxed mt-0.5 font-body">{opt.text}</div>
                </button>
              );
            })}
          </div>

          {/* Question Jump Track: Numbered Ledger Dots (§4.6) */}
          <div className="mt-8 flex items-center justify-between border-t border-[#D9D5C7] pt-4">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="inline-flex items-center gap-1 font-mono text-xs font-medium text-[#1B3A5C] hover:text-[#1B3A5C]/80 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> PREVIOUS
            </button>

            {/* Numbered Ledger Dots */}
            <div className="flex items-center gap-1.5 font-mono">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = idx === currentIdx;
                return (
                  <button
                    key={q.id}
                    onClick={() => handleJump(idx)}
                    className={`h-6 w-6 border text-[11px] font-semibold transition-colors ${
                      isCurrent
                        ? "border-[#1B3A5C] bg-[#1B3A5C] text-white"
                        : isAnswered
                        ? "border-[#B8B29D] bg-[#E9EFF5] text-[#1B3A5C]"
                        : "border-[#D9D5C7] bg-[#FBFAF7] text-[#8A8571] hover:text-[#3D3A31]"
                    }`}
                    aria-label={`Jump to question ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {currentIdx < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-[#1B3A5C] hover:text-[#1B3A5C]/80 transition-colors"
              >
                NEXT <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-[#2F6844] hover:text-[#2F6844]/80 transition-colors"
              >
                REVIEW & SUBMIT
              </button>
            )}
          </div>

          <p className="mt-3 text-center font-mono text-[10px] text-[#8A8571]">
            Keys [A], [B], [C], [D] or arrow keys navigation supported.
          </p>
        </div>
      </div>

      {/* §4.8 Mandatory Presence Verification Corner Panel */}
      <PresenceVerificationPanel
        stream={cameraStream}
        onPresenceSignal={(status: PresenceStatus) => {
          recordPresenceSignal(status);
        }}
      />
    </div>
  );
}
