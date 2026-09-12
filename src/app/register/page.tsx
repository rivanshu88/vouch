"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ArrowRight,
  UserCheck,
  Users,
  Briefcase,
  Sparkles,
  CheckCircle2,
  AlertCircle,
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
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-zinc-50/50">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-md shadow-zinc-900/10">
            <ShieldCheck className="h-7 w-7 text-sky-400" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-zinc-950">
          Create your Verified Identity
        </h2>
        <p className="mt-1.5 text-center text-xs text-zinc-600 max-w-md mx-auto">
          Replace unverified resume claims with benchmarked code proof, dynamic anti-cheat scores, and vetted team matching.
        </p>

        {/* Role Selector Tabs */}
        <div className="mt-6 flex justify-center">
          <div className="inline-flex rounded-lg border border-zinc-200 bg-white p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setRole("candidate")}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold transition ${
                role === "candidate"
                  ? "bg-zinc-900 text-white shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              Candidate / Student
            </button>
            <button
              type="button"
              onClick={() => setRole("recruiter")}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold transition ${
                role === "recruiter"
                  ? "bg-zinc-900 text-white shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" />
              Recruiter / Company
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs">
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-800">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Arjun Verma"
                  className="mt-1.5 block w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800">
                  {role === "candidate" ? "Institutional / Student Email" : "Work Email"}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === "candidate" ? "arjun@iitb.ac.in" : "recruiter@acme.com"}
                  className="mt-1.5 block w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-800">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="mt-1.5 block w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100"
              />
            </div>

            {role === "candidate" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-800">
                    College / University
                  </label>
                  <input
                    type="text"
                    required
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="IIT Bombay / BITS Pilani"
                    className="mt-1.5 block w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-800">
                    Graduation Year
                  </label>
                  <select
                    value={gradYear}
                    onChange={(e) => setGradYear(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2.5 text-xs text-zinc-900 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100"
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
                <label className="block text-xs font-semibold text-zinc-800">
                  Company / Organization Name
                </label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Systems / Stripe / Vercel"
                  className="mt-1.5 block w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
              </div>
            )}

            {/* Verification Value Prop Callout */}
            <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-3.5 text-xs text-emerald-900">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>The Vouch Guarantee</span>
              </div>
              <p className="mt-1 text-[11px] text-emerald-800 leading-relaxed">
                {role === "candidate"
                  ? "Your skills won't just sit on a PDF. Complete 15-minute proctored assessments to unlock verified badges, automated team matchmaking, and priority campus drives."
                  : "Direct access to top 5% verified student talent with anti-cheat consistency metrics, GitHub repo analysis, and pre-screened assessment scores."}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-950 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-60"
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

          <div className="mt-6 text-center text-xs text-zinc-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-sky-600 hover:text-sky-800 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
