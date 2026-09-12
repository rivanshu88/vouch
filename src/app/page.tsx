import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Users,
  Briefcase,
  Sparkles,
  ArrowRight,
  GitBranch,
  Terminal,
  Cpu,
  Lock,
  Search,
  Award,
} from "lucide-react";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";

export default function HomePage() {
  return (
    <div className="space-y-20 py-10 sm:py-16">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50/80 px-3.5 py-1 text-xs font-semibold text-sky-800 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-sky-600" />
            <span>Turn self-declared resume claims into verifiable technical signals</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl text-balance">
            Verified Skill Identity for Hackathons & Placement.
          </h1>

          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-2xl mx-auto">
            Vouch replaces inflated resume bullet points with standardized assessment integrity, GitHub evidence normalization, and explainable compatibility matching for ambitious engineering teams.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 shadow-sm transition-colors"
            >
              Open Live Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/assessments"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 transition-colors shadow-2xs"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Take Verification Test
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-transparent px-4 py-2.5 text-sm font-medium text-zinc-600 hover:text-zinc-950 transition-colors"
            >
              Sign In →
            </Link>
          </div>
        </div>

        {/* Live Identity Proof Mockup */}
        <div className="mt-12 max-w-3xl mx-auto">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
                  AV
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-zinc-900">Arjun Verma</span>
                    <VerifiedBadge level="tier_1" showScore score={94} />
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    B.Tech CS & Engineering • IIT Bombay • 2025
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-100">
                  Consistency: 98%
                </span>
                <span className="rounded bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 border border-sky-100">
                  Evidence: 92/100
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-zinc-500">Verified Technical Signals:</span>
              <VerifiedBadge level="tier_1" skillName="React" score={95} />
              <VerifiedBadge level="tier_1" skillName="TypeScript" score={91} />
              <VerifiedBadge level="tier_2" skillName="Node.js" score={84} />
              <VerifiedBadge level="tier_2" skillName="PostgreSQL" score={80} />
            </div>
          </div>
        </div>

        {/* Trust Metric Bar */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center shadow-2xs">
            <p className="text-2xl font-bold tracking-tight text-zinc-900">12,800+</p>
            <p className="text-[11px] font-medium text-zinc-500 mt-0.5">Skill Claims Verified</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center shadow-2xs">
            <p className="text-2xl font-bold tracking-tight text-emerald-600">99.4%</p>
            <p className="text-[11px] font-medium text-zinc-500 mt-0.5">Assessment Integrity</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center shadow-2xs">
            <p className="text-2xl font-bold tracking-tight text-sky-600">420+</p>
            <p className="text-[11px] font-medium text-zinc-500 mt-0.5">Hackathon Teams Built</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center shadow-2xs">
            <p className="text-2xl font-bold tracking-tight text-zinc-900">45+</p>
            <p className="text-[11px] font-medium text-zinc-500 mt-0.5">Campus Hiring Partners</p>
          </div>
        </div>

        {/* Core Loop Graphic (PRD Section 1) */}
        <div className="mt-16 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="text-center mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              The Vouch Verification Loop
            </span>
            <h2 className="text-lg font-bold text-zinc-900 mt-1">
              One Shared Infrastructure · Two Scalable Workflows
            </h2>
            <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1">
              From claim to placement, every step is backed by measurable evidence and anti-cheat confidence.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 transition hover:bg-white hover:shadow-xs">
              <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-zinc-200 text-zinc-900 font-mono text-xs font-bold shadow-2xs">
                1
              </div>
              <h3 className="font-bold text-xs text-zinc-900 mt-2">Claim</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">Declare skill & target level</p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 transition hover:bg-white hover:shadow-xs">
              <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-zinc-200 text-zinc-900 font-mono text-xs font-bold shadow-2xs">
                2
              </div>
              <h3 className="font-bold text-xs text-zinc-900 mt-2">Prove</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">GitHub repos & projects</p>
            </div>

            <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-4 transition hover:bg-sky-50 hover:shadow-xs">
              <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white font-mono text-xs font-bold shadow-2xs">
                3
              </div>
              <h3 className="font-bold text-xs text-sky-950 mt-2">Verify</h3>
              <p className="text-[11px] text-sky-700 mt-0.5">Randomized blueprint test</p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 transition hover:bg-white hover:shadow-xs">
              <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-zinc-200 text-zinc-900 font-mono text-xs font-bold shadow-2xs">
                4
              </div>
              <h3 className="font-bold text-xs text-zinc-900 mt-2">Match</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">Explainable gap filling</p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 transition hover:bg-white hover:shadow-xs">
              <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-zinc-200 text-zinc-900 font-mono text-xs font-bold shadow-2xs">
                5
              </div>
              <h3 className="font-bold text-xs text-zinc-900 mt-2">Evaluate</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">Team verification challenge</p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 transition hover:bg-emerald-50 hover:shadow-xs">
              <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-mono text-xs font-bold shadow-2xs">
                6
              </div>
              <h3 className="font-bold text-xs text-emerald-950 mt-2">Select</h3>
              <p className="text-[11px] text-emerald-700 mt-0.5">Confident team join / hire</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition-colors">
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-700 border border-sky-100">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-950">
                Credible Blueprint Assessments
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Adaptive topic pools across JavaScript, React, TypeScript, Python, and SQL. Sanitized questions without client-side answers, paired with transparent behavioral integrity metrics.
              </p>
            </div>
            <Link
              href="/assessments"
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-800"
            >
              Explore Question Engine <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Pillar 2 */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition-colors">
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-950">
                Hackathon Team Verification
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Analyze team capability coverage, identify missing technical gaps, and challenge potential members with a team verification test before accepting join requests.
              </p>
            </div>
            <Link
              href="/teams"
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Discover Hackathon Teams <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Pillar 3 */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition-colors">
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                <Briefcase className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-950">
                Campus Recruitment Drives
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Top companies recruit based on verified code strength rather than resume bullet points. Transparent matching explanations show why each student qualified.
              </p>
            </div>
            <Link
              href="/recruitment"
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-800"
            >
              View Active Drives <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
