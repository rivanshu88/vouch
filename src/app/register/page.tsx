"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  UserCheck,
  Briefcase,
  AlertCircle,
  FileCheck2,
  ShieldCheck,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"candidate" | "recruiter">("candidate");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [college, setCollege] = useState("");
  const [gradYear, setGradYear] = useState("2025");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSupabaseConfigured()) {
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              role,
              college: role === "candidate" ? college : company,
              graduation_year: role === "candidate" ? gradYear : undefined,
            },
          },
        });
        if (authError) {
          setError(authError.message);
          setLoading(false);
          return;
        }
      }
      router.push("/dashboard");
    } catch {
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#FBFAF7]">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center border border-[#1B3A5C] bg-[#1B3A5C] text-white">
            <FileCheck2 className="h-6 w-6 text-white" />
          </div>
        </div>
        <h2 className="mt-4 text-center font-display text-2xl font-semibold tracking-tight text-[#1A1915]">
          Register Verified Identity
        </h2>
        <p className="mt-1.5 text-center font-sans text-xs text-[#8A8571] max-w-md mx-auto">
          Replace unverified resume claims with benchmarked code proof, dynamic anti-cheat scores, and vetted team matching.
        </p>

        {/* Role Selector Tabs */}
        <div className="mt-6 flex justify-center">
          <div className="inline-flex border border-[#D9D5C7] bg-[#F3F1EA] p-1">
            <button
              type="button"
              onClick={() => setRole("candidate")}
              className={`flex items-center gap-2 px-4 py-2 font-mono text-xs font-semibold transition ${
                role === "candidate"
                  ? "bg-[#1B3A5C] text-white"
                  : "text-[#8A8571] hover:text-[#1A1915]"
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              Candidate / Student
            </button>
            <button
              type="button"
              onClick={() => setRole("recruiter")}
              className={`flex items-center gap-2 px-4 py-2 font-mono text-xs font-semibold transition ${
                role === "recruiter"
                  ? "bg-[#1B3A5C] text-white"
                  : "text-[#8A8571] hover:text-[#1A1915]"
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" />
              Recruiter / Company
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="border border-[#D9D5C7] bg-white p-6 sm:p-8">
          {error && (
            <div className="mb-5 flex items-center gap-2 border border-[#8C2F2F]/30 bg-[#FDF2F2] p-3 font-mono text-xs text-[#8C2F2F]">
              <AlertCircle className="h-4 w-4 shrink-0 text-[#8C2F2F]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs font-semibold text-[#1A1915]">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Arjun Verma"
                  className="mt-1.5 block w-full border border-[#D9D5C7] bg-[#FBFAF7] px-3 py-2.5 font-mono text-xs text-[#1A1915] placeholder:text-[#8A8571] focus:border-[#1B3A5C] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-semibold text-[#1A1915]">
                  {role === "candidate" ? "Institutional / Student Email" : "Work Email"}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === "candidate" ? "arjun@iitb.ac.in" : "recruiter@acme.com"}
                  className="mt-1.5 block w-full border border-[#D9D5C7] bg-[#FBFAF7] px-3 py-2.5 font-mono text-xs text-[#1A1915] placeholder:text-[#8A8571] focus:border-[#1B3A5C] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs font-semibold text-[#1A1915]">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="mt-1.5 block w-full border border-[#D9D5C7] bg-[#FBFAF7] px-3 py-2.5 font-mono text-xs text-[#1A1915] placeholder:text-[#8A8571] focus:border-[#1B3A5C] focus:bg-white focus:outline-none"
              />
            </div>

            {role === "candidate" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs font-semibold text-[#1A1915]">
                    College / University
                  </label>
                  <input
                    type="text"
                    required
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="IIT Bombay / BITS Pilani"
                    className="mt-1.5 block w-full border border-[#D9D5C7] bg-[#FBFAF7] px-3 py-2.5 font-mono text-xs text-[#1A1915] placeholder:text-[#8A8571] focus:border-[#1B3A5C] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs font-semibold text-[#1A1915]">
                    Graduation Year
                  </label>
                  <select
                    value={gradYear}
                    onChange={(e) => setGradYear(e.target.value)}
                    className="mt-1.5 block w-full border border-[#D9D5C7] bg-[#FBFAF7] px-3 py-2.5 font-mono text-xs text-[#1A1915] focus:border-[#1B3A5C] focus:bg-white focus:outline-none"
                  >
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label className="block font-mono text-xs font-semibold text-[#1A1915]">
                  Company / Organization Name
                </label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Systems / Stripe / Vercel"
                  className="mt-1.5 block w-full border border-[#D9D5C7] bg-[#FBFAF7] px-3 py-2.5 font-mono text-xs text-[#1A1915] placeholder:text-[#8A8571] focus:border-[#1B3A5C] focus:bg-white focus:outline-none"
                />
              </div>
            )}

            {/* Verification Value Prop Callout */}
            <div className="border border-[#1B3A5C]/20 bg-[#E9EFF5]/60 p-3.5 text-xs text-[#1B3A5C]">
              <div className="flex items-center gap-2 font-display font-semibold text-[#1B3A5C]">
                <ShieldCheck className="h-4 w-4 text-[#1B3A5C] shrink-0" />
                <span>The Verification Guarantee</span>
              </div>
              <p className="mt-1 font-sans text-[11px] text-[#3D3A31] leading-relaxed">
                {role === "candidate"
                  ? "Your skills won't just sit on a PDF. Complete 15-minute proctored assessments to unlock verified seals, automated team matchmaking, and priority campus drives."
                  : "Direct access to verified student talent with anti-cheat consistency metrics, GitHub repo analysis, and pre-screened assessment scores."}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center gap-2 bg-[#1B3A5C] py-2.5 font-mono text-xs font-medium text-white transition hover:bg-[#152e4a] focus:outline-none disabled:opacity-60"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Create Account & Continue</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#8A8571]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-mono font-medium text-[#1B3A5C] hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
