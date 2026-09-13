"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  UserCheck,
  Users,
  Briefcase,
  AlertCircle,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuth, DEMO_PERSONAS } from "@/lib/auth/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithPersona } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSupabaseConfigured() && !password.includes("•")) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) {
          setError(authError.message);
          setLoading(false);
          return;
        }
        if (data.user) {
          await loginWithPersona(data.user.id);
        }
      } else {
        // Find matching persona or default to Arjun
        const matchedPersona = DEMO_PERSONAS.find((p) => p.email === email) || DEMO_PERSONAS[0];
        await loginWithPersona(matchedPersona.id);
      }
      router.push("/dashboard");
    } catch {
      await loginWithPersona("usr-01");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPersona = async (personaEmail: string, role: string) => {
    setEmail(personaEmail);
    setPassword("••••••••••••");
    setError(null);
    setLoading(true);
    try {
      const persona = DEMO_PERSONAS.find((p) => p.email === personaEmail) || DEMO_PERSONAS[0];
      await loginWithPersona(persona.id);
      router.push("/dashboard");
    } catch {
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-zinc-50/50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-md shadow-zinc-900/10">
            <ShieldCheck className="h-7 w-7 text-sky-400" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-zinc-950">
          Sign in to your Verified Identity
        </h2>
        <p className="mt-1.5 text-center text-xs text-zinc-600">
          Access your evidence-backed skills, team invites, and recruitment drives.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs">
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-zinc-800"
              >
                Email address
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-zinc-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@institution.edu"
                  className="block w-full rounded-lg border border-zinc-200 bg-zinc-50/50 py-2.5 pl-9 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-zinc-800"
                >
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Demo mode: Any password or quick-persona login works.");
                  }}
                  className="text-[11px] font-medium text-sky-600 hover:text-sky-800"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-zinc-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full rounded-lg border border-zinc-200 bg-zinc-50/50 py-2.5 pl-9 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-3.5 w-3.5 rounded border-zinc-300 text-sky-600 focus:ring-sky-500"
                />
                <span className="text-xs text-zinc-600">Remember this device</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-950 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-60"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Persona Demo Quick Sign-in */}
          <div className="mt-6 border-t border-zinc-100 pt-5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                1-Click Demo Evaluation
              </span>
              <span className="inline-flex items-center gap-1 rounded bg-sky-50 px-1.5 py-0.5 text-[10px] font-medium text-sky-700">
                <Sparkles className="h-2.5 w-2.5" /> Quick Fill
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() =>
                  handleQuickPersona("arjun.verma@demo.vouch.io", "Candidate")
                }
                className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50/60 px-3 py-2 text-left text-xs transition hover:border-sky-300 hover:bg-sky-50/50"
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-sky-600" />
                  <div>
                    <p className="font-semibold text-zinc-900">Arjun Verma</p>
                    <p className="text-[10px] text-zinc-500">
                      Candidate • Tier-1 Verified (React, TS)
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-sky-600">Select →</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickPersona("rohan.k@demo.vouch.io", "Team Leader")
                }
                className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50/60 px-3 py-2 text-left text-xs transition hover:border-sky-300 hover:bg-sky-50/50"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-600" />
                  <div>
                    <p className="font-semibold text-zinc-900">Rohan Kulkarni</p>
                    <p className="text-[10px] text-zinc-500">
                      Team Leader • NeuroHacks Finalist
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-indigo-600">Select →</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickPersona("sneha.patel@acme-corp.com", "Recruiter")
                }
                className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50/60 px-3 py-2 text-left text-xs transition hover:border-sky-300 hover:bg-sky-50/50"
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-zinc-900">Sneha Patel</p>
                    <p className="text-[10px] text-zinc-500">
                      Campus Recruiter • Acme Cloud Drives
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-emerald-600">Select →</span>
              </button>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center text-xs text-zinc-600">
            Don&apos;t have an identity yet?{" "}
            <Link
              href="/register"
              className="font-semibold text-sky-600 hover:text-sky-800 hover:underline"
            >
              Create verified account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
