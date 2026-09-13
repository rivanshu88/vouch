import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  FileCheck2,
  Users,
  Briefcase,
  Terminal,
  Cpu,
  Layers,
} from "lucide-react";
import { VerificationSeal } from "@/components/ui/VerificationSeal";

export default function HomePage() {
  return (
    <div className="space-y-16 py-10 sm:py-16">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 border border-[#1B3A5C]/20 bg-[#E9EFF5] px-3.5 py-1 font-mono text-xs font-semibold text-[#1B3A5C]">
            <span className="h-1.5 w-1.5 bg-[#1B3A5C]" />
            <span>ARCHIVAL VERIFICATION PROTOCOL v3.0 · LEDGER</span>
          </div>

          <h1 className="font-display text-4xl font-semibold tracking-tight text-[#1A1915] sm:text-5xl lg:text-6xl text-balance">
            Verified Skill Identity for Hackathons &amp; Placement.
          </h1>

          <p className="font-sans text-base sm:text-lg text-[#3D3A31] leading-relaxed max-w-2xl mx-auto">
            Vouch replaces unverified resume claims with standardized assessment integrity, GitHub evidence normalization, and explainable compatibility matching for engineering teams.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-[#1B3A5C] px-5 py-2.5 font-mono text-xs font-medium text-white hover:bg-[#152e4a] transition-colors"
            >
              Open Live Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/assessments"
              className="inline-flex items-center gap-2 border border-[#D9D5C7] bg-white px-5 py-2.5 font-mono text-xs font-medium text-[#1A1915] hover:bg-[#F3F1EA] transition-colors"
            >
              <Terminal className="h-3.5 w-3.5 text-[#1B3A5C]" />
              Take Verification Test
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 font-mono text-xs font-medium text-[#8A8571] hover:text-[#1A1915] transition-colors"
            >
              Sign In →
            </Link>
          </div>
        </div>

        {/* Live Identity Proof Mockup — Specimen Card */}
        <div className="mt-12 max-w-3xl mx-auto">
          <div className="border border-[#D9D5C7] bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D9D5C7] pb-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border border-[#1B3A5C] bg-[#1B3A5C] font-mono text-xs font-semibold text-white">
                  AV
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-semibold text-sm text-[#1A1915]">
                      Arjun Verma
                    </span>
                    <VerificationSeal
                      level="tier_1"
                      score={94}
                      serialNumber="VF-2026-08142"
                      showScore
                    />
                  </div>
                  <p className="font-mono text-[11px] text-[#8A8571] mt-0.5">
                    IIT Bombay • B.Tech CS 2025 • CID: 0x7f2a...c91e
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="border border-[#2F6844]/30 bg-[#EBF2EC] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#2F6844]">
                  CONSISTENCY: 98%
                </span>
                <span className="border border-[#1B3A5C]/30 bg-[#E9EFF5] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#1B3A5C]">
                  EVIDENCE: 92/100
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] font-medium text-[#8A8571]">
                Verified Technical Signals:
              </span>
              <VerificationSeal level="tier_1" skillName="React" score={95} serialNumber="VF-2026-RCT95" />
              <VerificationSeal level="tier_1" skillName="TypeScript" score={91} serialNumber="VF-2026-TS91" />
              <VerificationSeal level="tier_2" skillName="Node.js" score={84} serialNumber="VF-2026-NOD84" />
              <VerificationSeal level="tier_2" skillName="PostgreSQL" score={80} serialNumber="VF-2026-PST80" />
            </div>
          </div>
        </div>

        {/* Trust Metric Bar */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
          <div className="border border-[#D9D5C7] bg-white p-4 text-center">
            <p className="font-mono text-2xl font-semibold tracking-tight text-[#1A1915]">
              12,800+
            </p>
            <p className="font-mono text-[11px] text-[#8A8571] mt-0.5 uppercase tracking-wider">
              Claims Verified
            </p>
          </div>
          <div className="border border-[#D9D5C7] bg-white p-4 text-center">
            <p className="font-mono text-2xl font-semibold tracking-tight text-[#2F6844]">
              99.4%
            </p>
            <p className="font-mono text-[11px] text-[#8A8571] mt-0.5 uppercase tracking-wider">
              Integrity Index
            </p>
          </div>
          <div className="border border-[#D9D5C7] bg-white p-4 text-center">
            <p className="font-mono text-2xl font-semibold tracking-tight text-[#1B3A5C]">
              420+
            </p>
            <p className="font-mono text-[11px] text-[#8A8571] mt-0.5 uppercase tracking-wider">
              Teams Formed
            </p>
          </div>
          <div className="border border-[#D9D5C7] bg-white p-4 text-center">
            <p className="font-mono text-2xl font-semibold tracking-tight text-[#1A1915]">
              45+
            </p>
            <p className="font-mono text-[11px] text-[#8A8571] mt-0.5 uppercase tracking-wider">
              Campus Partners
            </p>
          </div>
        </div>

        {/* Core Loop Graphic (PRD Section 1) */}
        <div className="mt-14 border border-[#D9D5C7] bg-white p-6 sm:p-8">
          <div className="text-center mb-6">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#8A8571]">
              Verification Protocol Lifecycle
            </span>
            <h2 className="font-display text-lg font-semibold text-[#1A1915] mt-1">
              One Shared Infrastructure · Two Scalable Workflows
            </h2>
            <p className="font-sans text-xs text-[#8A8571] max-w-md mx-auto mt-1">
              From claim to placement, every step is backed by measurable evidence and anti-cheat confidence.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center">
            <div className="border border-[#D9D5C7] bg-[#FBFAF7] p-3.5 transition hover:border-[#1B3A5C]">
              <div className="mx-auto flex h-7 w-7 items-center justify-center border border-[#D9D5C7] bg-white font-mono text-xs font-semibold text-[#1A1915]">
                01
              </div>
              <h3 className="font-display font-semibold text-xs text-[#1A1915] mt-2">Claim</h3>
              <p className="font-sans text-[11px] text-[#8A8571] mt-0.5">Declare skill level</p>
            </div>

            <div className="border border-[#D9D5C7] bg-[#FBFAF7] p-3.5 transition hover:border-[#1B3A5C]">
              <div className="mx-auto flex h-7 w-7 items-center justify-center border border-[#D9D5C7] bg-white font-mono text-xs font-semibold text-[#1A1915]">
                02
              </div>
              <h3 className="font-display font-semibold text-xs text-[#1A1915] mt-2">Prove</h3>
              <p className="font-sans text-[11px] text-[#8A8571] mt-0.5">GitHub repos &amp; code</p>
            </div>

            <div className="border border-[#1B3A5C] bg-[#E9EFF5] p-3.5 transition">
              <div className="mx-auto flex h-7 w-7 items-center justify-center border border-[#1B3A5C] bg-[#1B3A5C] font-mono text-xs font-semibold text-white">
                03
              </div>
              <h3 className="font-display font-semibold text-xs text-[#1B3A5C] mt-2">Verify</h3>
              <p className="font-sans text-[11px] text-[#1B3A5C] mt-0.5">Proctored test</p>
            </div>

            <div className="border border-[#D9D5C7] bg-[#FBFAF7] p-3.5 transition hover:border-[#1B3A5C]">
              <div className="mx-auto flex h-7 w-7 items-center justify-center border border-[#D9D5C7] bg-white font-mono text-xs font-semibold text-[#1A1915]">
                04
              </div>
              <h3 className="font-display font-semibold text-xs text-[#1A1915] mt-2">Match</h3>
              <p className="font-sans text-[11px] text-[#8A8571] mt-0.5">Coverage gap filling</p>
            </div>

            <div className="border border-[#D9D5C7] bg-[#FBFAF7] p-3.5 transition hover:border-[#1B3A5C]">
              <div className="mx-auto flex h-7 w-7 items-center justify-center border border-[#D9D5C7] bg-white font-mono text-xs font-semibold text-[#1A1915]">
                05
              </div>
              <h3 className="font-display font-semibold text-xs text-[#1A1915] mt-2">Evaluate</h3>
              <p className="font-sans text-[11px] text-[#8A8571] mt-0.5">Team challenge test</p>
            </div>

            <div className="border border-[#2F6844] bg-[#EBF2EC] p-3.5 transition">
              <div className="mx-auto flex h-7 w-7 items-center justify-center border border-[#2F6844] bg-[#2F6844] font-mono text-xs font-semibold text-white">
                06
              </div>
              <h3 className="font-display font-semibold text-xs text-[#2F6844] mt-2">Select</h3>
              <p className="font-sans text-[11px] text-[#2F6844] mt-0.5">Confident placement</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Pillar 1 */}
          <div className="border border-[#D9D5C7] bg-white p-6 flex flex-col justify-between hover:border-[#1B3A5C] transition-colors">
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center border border-[#1B3A5C] bg-[#E9EFF5] text-[#1B3A5C]">
                <Terminal className="h-5 w-5" />
              </div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#8A8571]">
                SPECIMEN EVALUATION · MODULE 01
              </div>
              <h3 className="font-display text-base font-semibold text-[#1A1915]">
                Credible Blueprint Assessments
              </h3>
              <p className="font-sans text-xs text-[#3D3A31] leading-relaxed">
                Adaptive topic pools across JavaScript, React, TypeScript, Python, and SQL. Sanitized questions without client-side answers, paired with transparent behavioral integrity metrics and presence verification.
              </p>
            </div>
            <Link
              href="/assessments"
              className="mt-6 inline-flex items-center gap-1.5 font-mono text-xs font-medium text-[#1B3A5C] hover:underline"
            >
              Explore Question Engine <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Pillar 2 */}
          <div className="border border-[#D9D5C7] bg-white p-6 flex flex-col justify-between hover:border-[#1B3A5C] transition-colors">
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center border border-[#1B3A5C] bg-[#E9EFF5] text-[#1B3A5C]">
                <Users className="h-5 w-5" />
              </div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#8A8571]">
                SQUAD FORMATION · MODULE 02
              </div>
              <h3 className="font-display text-base font-semibold text-[#1A1915]">
                Hackathon Team Verification
              </h3>
              <p className="font-sans text-xs text-[#3D3A31] leading-relaxed">
                Analyze team capability coverage, identify missing technical gaps, and challenge potential members with a team verification test before accepting join requests.
              </p>
            </div>
            <Link
              href="/teams"
              className="mt-6 inline-flex items-center gap-1.5 font-mono text-xs font-medium text-[#1B3A5C] hover:underline"
            >
              Discover Hackathon Teams <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Pillar 3 */}
          <div className="border border-[#D9D5C7] bg-white p-6 flex flex-col justify-between hover:border-[#1B3A5C] transition-colors">
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center border border-[#1B3A5C] bg-[#E9EFF5] text-[#1B3A5C]">
                <Briefcase className="h-5 w-5" />
              </div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#8A8571]">
                TALENT PIPELINE · MODULE 03
              </div>
              <h3 className="font-display text-base font-semibold text-[#1A1915]">
                Campus Recruitment Drives
              </h3>
              <p className="font-sans text-xs text-[#3D3A31] leading-relaxed">
                Companies recruit based on verified code strength rather than resume bullet points. Transparent matching explanations show why each candidate qualified across drives and criteria.
              </p>
            </div>
            <Link
              href="/recruitment"
              className="mt-6 inline-flex items-center gap-1.5 font-mono text-xs font-medium text-[#1B3A5C] hover:underline"
            >
              View Active Drives <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Verbatim Disclaimer Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border border-[#D9D5C7] bg-[#FBFAF7] p-4 text-center">
          <p className="font-mono text-[11px] text-[#8A8571]">
            <span className="font-semibold text-[#1A1915]">LEGAL &amp; ETHICAL DISCLOSURE:</span> These are assessment-behavior signals and should be considered alongside the candidate&apos;s result. They do not establish cheating.
          </p>
        </div>
      </section>
    </div>
  );
}
