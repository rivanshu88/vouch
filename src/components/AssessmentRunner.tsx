"use client";

import React, { useState, useEffect, useRef } from "react";
import { AssessmentAttempt, AssessmentAnswer, SanitizedQuestion } from "@/types";
import { useIntegrityTracking } from "@/hooks/useIntegrityTracking";
import {
  Clock,
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
    getRawEvents,
  } = useIntegrityTracking({
    attemptId: attempt.id,
    currentQuestionId: currentQuestion?.id,
    currentQuestionIndex: currentIdx,
    enabled: !submitting,
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
  }, [currentQuestion, currentIdx, answers]);

  // Countdown timer
  useEffect(() => {
    if (remainingSeconds <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSeconds]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!currentQuestion) {
    return <div className="p-12 text-center text-xs text-zinc-500">Preparing assessment blueprint...</div>;
  }

  const selectedForCurrent = answers[currentQuestion.id]?.selectedOptionId;

  return (
    <div ref={containerRef} className="mx-auto max-w-3xl space-y-5">
      {/* Assessment Header Control Bar */}
      <div className="rounded-xl border border-zinc-200/90 bg-white p-4 shadow-2xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-zinc-950 text-sm tracking-tight">
              {attempt.skillName} Blueprint Assessment
            </span>
            <span className="rounded bg-zinc-100 border border-zinc-200/60 px-2 py-0.5 font-mono text-[9px] font-bold text-zinc-700 uppercase">
              {attempt.difficulty}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Question {currentIdx + 1} of {questions.length} · Topic:{" "}
            <span className="font-medium text-zinc-700">{currentQuestion.topic}</span>
          </p>
        </div>

        {/* Timer, Fullscreen toggle & Submit button */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={requestFullscreen}
            title={isFullscreen ? "Fullscreen active" : "Enter fullscreen mode"}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 hover:text-zinc-900 border border-zinc-200/80 bg-zinc-50 hover:bg-zinc-100 px-2.5 py-1.5 rounded-md transition-colors"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-3 w-3 text-emerald-600" />
                <span>Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-3 w-3 text-zinc-500" />
                <span>Fullscreen</span>
              </>
            )}
          </button>

          <div
            className={`flex items-center gap-1.5 font-mono text-xs font-bold px-3 py-1.5 rounded-md border ${
              remainingSeconds < 60
                ? "bg-red-50 text-red-700 border-red-200 animate-pulse"
                : "bg-zinc-50 text-zinc-800 border-zinc-200/80"
            }`}
            aria-live="polite"
            aria-label={`Time remaining: ${formatTimer(remainingSeconds)}`}
          >
            <Clock className="h-3.5 w-3.5 text-zinc-500" />
            <span>{formatTimer(remainingSeconds)}</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-2xs"
          >
            <Send className="h-3 w-3" />
            {submitting ? "Evaluating..." : "Submit Test"}
          </button>
        </div>
      </div>

      {/* Main Question Surface */}
      <div className="rounded-xl border border-zinc-200/90 bg-white p-6 sm:p-8 shadow-2xs">
        {/* Sub-header with Integrity Status */}
        <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-5 pb-3 border-b border-zinc-100">
          <span className="font-mono">
            Question {currentIdx + 1} / {questions.length}
          </span>
          <div className="flex items-center gap-2">
            {eventsCount > 0 && (
              <span className="font-mono text-[10px] text-zinc-400">
                {eventsCount} {eventsCount === 1 ? "event" : "events"} recorded
              </span>
            )}
            <span className="flex items-center gap-1.5 font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Assessment Integrity Active
            </span>
          </div>
        </div>

        {/* Question Prompt */}
        <div className="text-zinc-950 text-sm font-semibold leading-relaxed whitespace-pre-wrap font-sans">
          {currentQuestion.questionText}
        </div>

        {/* Options List with Keyboard Hints */}
        <div className="mt-6 space-y-2.5">
          {currentQuestion.options.map((opt, optIdx) => {
            const isSelected = selectedForCurrent === opt.id;
            const letter = String.fromCharCode(65 + optIdx);

            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                className={`w-full flex items-start gap-3 rounded-lg p-3.5 text-left text-xs transition-all border ${
                  isSelected
                    ? "border-sky-600 bg-sky-50/70 text-sky-950 font-semibold ring-1 ring-sky-600/30 shadow-2xs"
                    : "border-zinc-200/80 bg-zinc-50/40 hover:bg-zinc-100/70 text-zinc-800"
                }`}
              >
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border font-mono text-[10px] font-bold ${
                    isSelected
                      ? "border-sky-600 bg-sky-600 text-white"
                      : "border-zinc-300 bg-white text-zinc-600"
                  }`}
                >
                  {letter}
                </div>
                <div className="leading-relaxed mt-0.5">{opt.text}</div>
              </button>
            );
          })}
        </div>

        {/* Navigation & Question Jump Track */}
        <div className="mt-8 flex items-center justify-between border-t border-zinc-100 pt-4">
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-600 hover:text-zinc-950 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>

          {/* Quick jump pills */}
          <div className="flex items-center gap-1.5">
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id];
              const isCurrent = idx === currentIdx;
              return (
                <button
                  key={q.id}
                  onClick={() => handleJump(idx)}
                  className={`h-2.5 w-6 rounded-full transition-all ${
                    isCurrent
                      ? "bg-sky-600 ring-2 ring-sky-200"
                      : isAnswered
                      ? "bg-zinc-800"
                      : "bg-zinc-200"
                  }`}
                  aria-label={`Jump to question ${idx + 1}`}
                  title={`Question ${idx + 1} (${isAnswered ? "Answered" : "Unanswered"})`}
                />
              );
            })}
          </div>

          {currentIdx < questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-900 hover:text-sky-700 transition-colors"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 hover:text-sky-900 transition-colors"
            >
              Review & Submit
            </button>
          )}
        </div>

        <p className="mt-3 text-center text-[10px] text-zinc-400">
          Tip: You can use keyboard keys{" "}
          <kbd className="rounded bg-zinc-100 border px-1 py-0.2 font-mono text-[9px]">A</kbd>,{" "}
          <kbd className="rounded bg-zinc-100 border px-1 py-0.2 font-mono text-[9px]">B</kbd>,{" "}
          <kbd className="rounded bg-zinc-100 border px-1 py-0.2 font-mono text-[9px]">C</kbd>,{" "}
          <kbd className="rounded bg-zinc-100 border px-1 py-0.2 font-mono text-[9px]">D</kbd> or arrow keys to navigate.
        </p>
      </div>
    </div>
  );
}
