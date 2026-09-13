"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Play,
  RotateCcw,
  ArrowRight,
  Clock,
  Check,
  X,
  FileCheck2,
  Info,
} from "lucide-react";
import { AssessmentRunner } from "@/components/AssessmentRunner";
import { ConsistencyScoreCard } from "@/components/ConsistencyScoreCard";
import { VerificationSeal } from "@/components/ui/VerificationSeal";
import { AssessmentAttempt, Skill, SkillLevel } from "@/types";

export default function AssessmentsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState("react");
  const [selectedDifficulty, setSelectedDifficulty] = useState<SkillLevel>("intermediate");
  const [questionCount] = useState(5);

  const [loading, setLoading] = useState(false);
  const [activeAttempt, setActiveAttempt] = useState<AssessmentAttempt | null>(null);
  const [completedResult, setCompletedResult] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/skills")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setSkills(json.data);
      })
      .catch(() => {});
  }, []);

  const handleStartTest = async () => {
    setLoading(true);
    setCompletedResult(null);

    try {
      const res = await fetch("/api/assessments/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: "usr-01",
          skillId: selectedSkill,
          difficulty: selectedDifficulty,
          questionCount,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setActiveAttempt(json.data);
      } else {
        alert(json.error?.message || "Failed to generate assessment.");
      }
    } catch {
      alert("Network error while generating assessment.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssessmentCompleted = (data: any) => {
    setActiveAttempt(null);
    setCompletedResult(data);
  };

  // If currently taking test, render the runner
  if (activeAttempt) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <AssessmentRunner
          attempt={activeAttempt}
          onCompleted={handleAssessmentCompleted}
        />
      </div>
    );
  }

  // If completed, render full result view
  if (completedResult) {
    const { attempt, scoreResult, consistency } = completedResult;
    const isPassed = scoreResult.passed;

    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Result Header Card */}
        <div className="border border-[#D9D5C7] bg-white p-6 sm:p-8 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center border border-[#1B3A5C] bg-[#1B3A5C] text-white">
            <FileCheck2 className="h-6 w-6 text-white" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase mb-2">
              {isPassed ? (
                <span className="border border-[#2F6844]/30 bg-[#EBF2EC] text-[#2F6844] px-3 py-1 font-semibold">
                  Skill Verification Achieved
                </span>
              ) : (
                <span className="border border-[#8C2F2F]/30 bg-[#FDF2F2] text-[#8C2F2F] px-3 py-1 font-semibold">
                  Verification Threshold Not Met
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl font-semibold text-[#1A1915]">
              {attempt.skillName} · <span className="font-mono tabular-nums">{scoreResult.score}%</span>
            </h1>
            <p className="font-mono text-xs text-[#8A8571] mt-1">
              Passing threshold: {scoreResult.passingScore}% · {scoreResult.correctCount} of {scoreResult.totalQuestions} questions correct
            </p>
          </div>

          {isPassed && (
            <div className="flex flex-col items-center gap-3 pt-2">
              <div className="inline-flex items-center gap-2 border border-[#2F6844]/30 bg-[#EBF2EC] px-4 py-2 text-xs font-mono text-[#2F6844]">
                <Check className="h-4 w-4 shrink-0" />
                <span>
                  Candidate ledger updated with verified stamp for <strong>{attempt.skillName} ({attempt.difficulty})</strong>.
                </span>
              </div>
              <div className="mt-1">
                <VerificationSeal
                  skillName={attempt.skillName}
                  verified={true}
                  score={scoreResult.score}
                  tier={attempt.difficulty === "advanced" ? "gold" : "silver"}
                  size="lg"
                />
              </div>
            </div>
          )}

          <div className="flex justify-center gap-3 pt-3">
            <button
              onClick={() => setCompletedResult(null)}
              className="inline-flex items-center gap-2 bg-[#1B3A5C] px-4 py-2 font-mono text-xs font-medium text-white hover:bg-[#152e4a] transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Take another test
            </button>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 border border-[#D9D5C7] bg-[#FBFAF7] px-4 py-2 font-mono text-xs font-medium text-[#3D3A31] hover:bg-[#F3F1EA] transition-colors"
            >
              Examine profile ledger <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Consistency & Integrity Breakdown Card */}
        {consistency && (
          <ConsistencyScoreCard
            breakdown={consistency}
            attemptId={attempt?.id}
            rawEvents={attempt?.rawEvents}
          />
        )}

        {/* Detailed Question Review */}
        <div className="border border-[#D9D5C7] bg-white p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#D9D5C7] pb-3.5">
            <div>
              <h2 className="font-display text-sm font-semibold text-[#1A1915]">Server-Side Scoring Breakdown</h2>
              <p className="text-xs text-[#8A8571]">Transparent explanation for every question evaluation</p>
            </div>
            <span className="font-mono text-xs font-semibold tabular-nums text-[#1A1915] bg-[#FBFAF7] border border-[#D9D5C7] px-2.5 py-1">
              {scoreResult.correctCount}/{scoreResult.totalQuestions} Correct
            </span>
          </div>

          <div className="space-y-4">
            {scoreResult.detailedAnswers?.map((ans: any, idx: number) => (
              <div
                key={ans.questionId}
                className={`p-4 border text-xs ${
                  ans.isCorrect ? "bg-[#EBF2EC]/40 border-[#2F6844]/30" : "bg-[#FDF2F2]/40 border-[#8C2F2F]/30"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono font-medium text-[#1A1915]">
                    Question {idx + 1} ({ans.topic})
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase ${
                      ans.isCorrect ? "bg-[#EBF2EC] text-[#2F6844] border-[#2F6844]/30" : "bg-[#FDF2F2] text-[#8C2F2F] border-[#8C2F2F]/30"
                    }`}
                  >
                    {ans.isCorrect ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    {ans.isCorrect ? "Correct" : "Incorrect"}
                  </span>
                </div>

                <p className="text-[#1A1915] whitespace-pre-wrap">{ans.questionText}</p>

                {ans.explanation && (
                  <div className="mt-3 bg-white p-3 border border-[#D9D5C7] text-[#3D3A31] text-[11px] leading-relaxed">
                    <span className="font-mono font-semibold text-[#1A1915]">Technical rationale: </span>
                    {ans.explanation}
                  </div>
                )}

                <div className="mt-2.5 flex items-center gap-4 font-mono text-[10px] text-[#8A8571]">
                  <span>Time spent: {(ans.timeSpentMs / 1000).toFixed(1)}s</span>
                  <span>Answer revisions: {ans.answerChangeCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="border border-[#1B3A5C]/30 bg-[#E9EFF5] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#1B3A5C] uppercase tracking-wider">
            Standardized Assessment Blueprint
          </span>
          <span className="text-xs text-[#D9D5C7]">|</span>
          <span className="font-mono text-xs text-[#8A8571]">Deterministic Verification Ledger</span>
        </div>
        <h1 className="font-display text-2xl font-semibold text-[#1A1915] mt-1">Skill Verification Hub</h1>
        <p className="text-xs text-[#3D3A31] mt-1 max-w-2xl leading-relaxed">
          Take credible, randomized assessments to prove technical capabilities. Each test is dynamically generated from blueprint topic pools with browser-local presence verification and consistency telemetry.
        </p>
      </div>

      {/* Assessment Configurator */}
      <div className="border border-[#D9D5C7] bg-white p-6 sm:p-8 space-y-6">
        <h2 className="font-display text-sm font-semibold text-[#1A1915] border-b border-[#D9D5C7] pb-3">
          Select Assessment Parameters
        </h2>

        {/* Skill Selector */}
        <div>
          <label className="block font-mono text-xs font-semibold text-[#1A1915] mb-2">1. Technical Domain</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {skills.map((s) => {
              const isSelected = selectedSkill === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSkill(s.id)}
                  className={`p-3.5 text-left border transition-all ${
                    isSelected
                      ? "border-[#1B3A5C] bg-[#E9EFF5] text-[#1B3A5C]"
                      : "border-[#D9D5C7] bg-[#FBFAF7] hover:border-[#B8B29D] text-[#3D3A31]"
                  }`}
                >
                  <p className="font-display font-semibold text-xs">{s.name}</p>
                  <p className="font-mono text-[10px] text-[#8A8571] capitalize mt-0.5">{s.category}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Difficulty Level */}
        <div>
          <label className="block font-mono text-xs font-semibold text-[#1A1915] mb-2">2. Difficulty Tier</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: "beginner", title: "Beginner", desc: "Core syntax, primitives, idiomatic patterns" },
              { id: "intermediate", title: "Intermediate", desc: "Concurrency, closures, state machines & hooks" },
              { id: "advanced", title: "Advanced", desc: "Memory layouts, compiler internals & performance profiling" },
            ].map((lvl) => {
              const isSelected = selectedDifficulty === lvl.id;
              return (
                <button
                  key={lvl.id}
                  onClick={() => setSelectedDifficulty(lvl.id as SkillLevel)}
                  className={`p-3.5 text-left border transition-all ${
                    isSelected
                      ? "border-[#1B3A5C] bg-[#1B3A5C] text-white"
                      : "border-[#D9D5C7] bg-[#FBFAF7] text-[#3D3A31] hover:border-[#B8B29D]"
                  }`}
                >
                  <p className="font-display font-semibold text-xs capitalize">{lvl.title}</p>
                  <p className={`text-[10px] mt-0.5 leading-relaxed ${isSelected ? "text-white/80" : "text-[#8A8571]"}`}>
                    {lvl.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Count / Blueprint Specs */}
        <div className="bg-[#F3F1EA] p-4 border border-[#D9D5C7] text-xs space-y-2">
          <div className="flex items-center justify-between font-mono text-[#1A1915]">
            <span className="flex items-center gap-1.5 font-semibold">
              <Clock className="h-3.5 w-3.5 text-[#1B3A5C]" />
              Assessment Blueprint Summary
            </span>
            <span className="text-[#1B3A5C] font-semibold tabular-nums">5 Questions · 5 Minutes (60s/q)</span>
          </div>
          <p className="font-mono text-[11px] text-[#8A8571] leading-relaxed">
            Topic pools are dynamically sampled across lexical scopes, execution contexts, asynchronous runtimes, and memory models. Minimum passing score is 70%. Evaluation is performed server-side with strict key-sanitization.
          </p>
        </div>

        {/* Integrity Assurance Card */}
        <div className="flex items-start gap-2.5 border border-[#D9D5C7] bg-[#FBFAF7] p-3 text-xs text-[#3D3A31]">
          <Info className="h-4 w-4 text-[#1B3A5C] shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong className="text-[#1A1915]">Transparent Anti-Cheat & Presence Verification:</strong> VOUCH tracks behavioral indicators (tab transitions, clipboard events, timing revisions) and local presence verification without recording or uploading video, maintaining absolute privacy while ensuring employer confidence.
          </p>
        </div>

        {/* Start Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleStartTest}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-[#1B3A5C] px-5 py-2.5 font-mono text-xs font-medium text-white hover:bg-[#152e4a] disabled:opacity-50 transition-colors"
          >
            <Play className="h-3.5 w-3.5 fill-white text-white" />
            {loading ? "Generating blueprint..." : "Begin assessment"}
          </button>
        </div>
      </div>
    </div>
  );
}

