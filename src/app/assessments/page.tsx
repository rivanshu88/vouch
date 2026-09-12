"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Clock,
  Activity,
  Check,
  X,
  Code2,
  Database,
  Layers,
  Cpu,
  Eye,
  Info,
} from "lucide-react";
import { AssessmentRunner } from "@/components/AssessmentRunner";
import { ConsistencyScoreCard } from "@/components/ConsistencyScoreCard";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { AssessmentAttempt, Skill, SkillLevel } from "@/types";

export default function AssessmentsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState("react");
  const [selectedDifficulty, setSelectedDifficulty] = useState<SkillLevel>("intermediate");
  const [questionCount, setQuestionCount] = useState(5);

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
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-md shadow-zinc-900/10">
            {isPassed ? (
              <ShieldCheck className="h-9 w-9 text-emerald-400" />
            ) : (
              <AlertCircle className="h-9 w-9 text-amber-400" />
            )}
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider mb-2">
              {isPassed ? (
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 border border-emerald-200">
                  Skill Verification Achieved
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 text-amber-800 px-3 py-1 border border-amber-200">
                  Verification Threshold Not Met
                </span>
              )}
            </div>

            <h1 className="text-3xl font-extrabold text-zinc-950">
              {attempt.skillName} · {scoreResult.score}% Score
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Passing threshold: {scoreResult.passingScore}% · {scoreResult.correctCount} of {scoreResult.totalQuestions} questions correct
            </p>
          </div>

          {isPassed && (
            <div className="flex flex-col items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50/80 border border-emerald-200 px-4 py-2.5 text-xs font-medium text-emerald-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  Your candidate profile has been upgraded to <strong>Verified {attempt.difficulty}</strong>.
                </span>
              </div>
              <div className="mt-1">
                <VerifiedBadge
                  level={attempt.difficulty === "advanced" ? "tier_1" : "tier_2"}
                  skillName={attempt.skillName}
                  score={scoreResult.score}
                />
              </div>
            </div>
          )}

          <div className="flex justify-center gap-3 pt-3">
            <button
              onClick={() => setCompletedResult(null)}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 shadow-2xs transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Take Another Test
            </button>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition shadow-2xs"
            >
              View Updated Profile <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Consistency & Integrity Breakdown Card */}
        {consistency && <ConsistencyScoreCard breakdown={consistency} />}

        {/* Detailed Question Review */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3.5">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Server-Side Scoring Breakdown</h2>
              <p className="text-xs text-zinc-500">Transparent explanation for every question evaluation</p>
            </div>
            <span className="text-xs font-mono font-bold text-zinc-700 bg-zinc-100 px-2.5 py-1 rounded">
              {scoreResult.correctCount}/{scoreResult.totalQuestions} Correct
            </span>
          </div>

          <div className="space-y-4">
            {scoreResult.detailedAnswers?.map((ans: any, idx: number) => (
              <div
                key={ans.questionId}
                className={`rounded-lg p-4 border text-xs ${
                  ans.isCorrect ? "bg-emerald-50/30 border-emerald-100" : "bg-rose-50/30 border-rose-100"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-semibold text-zinc-900">
                    Question {idx + 1} ({ans.topic})
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold ${
                      ans.isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {ans.isCorrect ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    {ans.isCorrect ? "Correct" : "Incorrect"}
                  </span>
                </div>

                <p className="text-zinc-800 font-medium whitespace-pre-wrap">{ans.questionText}</p>

                {ans.explanation && (
                  <div className="mt-3 rounded bg-white p-3 border border-zinc-200/60 text-zinc-600 text-[11px] leading-relaxed">
                    <span className="font-semibold text-zinc-900">Technical Rationale: </span>
                    {ans.explanation}
                  </div>
                )}

                <div className="mt-2.5 flex items-center gap-4 text-[10px] text-zinc-400">
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
          <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800 uppercase tracking-wider">
            Adaptive Assessment Engine
          </span>
          <span className="text-xs text-zinc-400">·</span>
          <span className="text-xs text-zinc-500 font-medium">Blueprint-based Randomization</span>
        </div>
        <h1 className="text-2xl font-bold text-zinc-950 mt-1">Skill Verification Hub</h1>
        <p className="text-xs text-zinc-600 mt-1 max-w-2xl leading-relaxed">
          Take credible, randomized assessments to prove your technical capabilities. Each test is dynamically generated from blueprint topic pools with client-side behavioral integrity monitoring.
        </p>
      </div>

      {/* Assessment Configurator */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="text-sm font-bold text-zinc-900">Select Assessment Parameters</h2>

        {/* Skill Selector */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-2">1. Technical Domain</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {skills.map((s) => {
              const isSelected = selectedSkill === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSkill(s.id)}
                  className={`rounded-lg p-3.5 text-left border transition-all ${
                    isSelected
                      ? "border-sky-600 bg-sky-50/80 text-sky-950 ring-2 ring-sky-600/20 shadow-2xs"
                      : "border-zinc-200 bg-zinc-50/40 hover:bg-zinc-100/60 text-zinc-700"
                  }`}
                >
                  <p className="font-bold text-xs">{s.name}</p>
                  <p className="text-[10px] text-zinc-500 capitalize mt-0.5">{s.category}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Difficulty Level */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-2">2. Difficulty Tier</label>
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
                  className={`rounded-lg p-3.5 text-left border transition-all ${
                    isSelected
                      ? "border-zinc-950 bg-zinc-950 text-white shadow-xs"
                      : "border-zinc-200 bg-zinc-50/40 text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  <p className="font-bold text-xs capitalize">{lvl.title}</p>
                  <p className={`text-[10px] mt-0.5 leading-relaxed ${isSelected ? "text-zinc-300" : "text-zinc-500"}`}>
                    {lvl.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Count / Blueprint Specs */}
        <div className="rounded-lg bg-zinc-50 p-4 border border-zinc-200/80 text-xs space-y-2">
          <div className="flex items-center justify-between font-semibold text-zinc-800">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-sky-600" />
              Assessment Blueprint Summary
            </span>
            <span className="font-mono text-sky-700 font-bold">5 Questions · 5 Minutes (60s/q)</span>
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Topic pools are dynamically sampled across lexical scopes, execution contexts, asynchronous runtimes, and memory models. Minimum passing score is 70%. Answers are sanitized server-side.
          </p>
        </div>

        {/* Integrity Assurance Card */}
        <div className="flex items-start gap-2.5 rounded-lg border border-zinc-200 bg-white p-3 text-xs text-zinc-600">
          <Info className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong className="text-zinc-800">Transparent Anti-Cheat:</strong> Vouch tracks behavioral indicators (tab transitions, clipboard events, answer revision timing) without intrusive software to ensure credible, employer-trusted verification seals.
          </p>
        </div>

        {/* Start Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleStartTest}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-5 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-2xs"
          >
            <Play className="h-3.5 w-3.5 fill-white text-white" />
            {loading ? "Generating Blueprint..." : "Begin Assessment"}
          </button>
        </div>
      </div>
    </div>
  );
}
