"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Lock,
  Mail,
  UserCheck,
  Users,
  Briefcase,
  AlertCircle,
  FileCheck2,
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

  const handleQuickPersona = async (personaEmail: string) => {
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
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#FBFAF7]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center border border-[#1B3A5C] bg-[#1B3A5C] text-white">
            <FileCheck2 className="h-6 w-6 text-white" />
          </div>
        </div>
        <h2 className="mt-4 text-center font-display text-2xl font-semibold tracking-tight text-[#1A1915]">
          Sign in to your Verification Ledger
        </h2>
        <p className="mt-1.5 text-center text-xs text-[#8A8571]">
          Access your evidence-backed skills, team invites, and recruitment drives.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="border border-[#D9D5C7] bg-white p-6 sm:p-8">
          {error && (
            <div className="mb-5 flex items-center gap-2 border border-[#8C2F2F]/30 bg-[#FDF2F2] p-3 text-xs text-[#8C2F2F]">
              <AlertCircle className="h-4 w-4 shrink-0 text-[#8C2F2F]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block font-mono text-xs font-semibold text-[#1A1915]"
              >
                Email address
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-[#8A8571]" />
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
                  className="block w-full border border-[#D9D5C7] bg-[#FBFAF7] py-2 pl-9 pr-3 font-mono text-xs text-[#1A1915] placeholder:text-[#8A8571] focus:border-[#1B3A5C] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block font-mono text-xs font-semibold text-[#1A1915]"
                >
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Demo mode: Any password or quick-persona login works.");
                  }}
                  className="font-mono text-[11px] text-[#1B3A5C] hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-[#8A8571]" />
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
                  className="block w-full border border-[#D9D5C7] bg-[#FBFAF7] py-2 pl-9 pr-3 font-mono text-xs text-[#1A1915] placeholder:text-[#8A8571] focus:border-[#1B3A5C] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-3.5 w-3.5 rounded-none border-[#D9D5C7] accent-[#1B3A5C]"
                />
                <span className="text-xs text-[#3D3A31]">Remember this session</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 bg-[#1B3A5C] py-2.5 font-mono text-xs font-medium text-white hover:bg-[#152e4a] transition-colors disabled:opacity-60"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Persona Demo Quick Sign-in */}
          <div className="mt-6 border-t border-[#D9D5C7] pt-5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="font-mono text-[11px] font-medium uppercase text-[#8A8571]">
                1-Click Demo Evaluation
              </span>
              <span className="inline-flex items-center gap-1 border border-[#1B3A5C]/30 bg-[#E9EFF5] px-1.5 py-0.5 font-mono text-[10px] font-medium text-[#1B3A5C]">
                Quick fill
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() =>
                  handleQuickPersona("arjun.verma@demo.vouch.io")
                }
                className="flex items-center justify-between border border-[#D9D5C7] bg-[#FBFAF7] px-3 py-2 text-left text-xs transition hover:border-[#1B3A5C]"
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-[#1B3A5C]" />
                  <div>
                    <p className="font-display font-medium text-[#1A1915]">Arjun Verma</p>
                    <p className="font-mono text-[10px] text-[#8A8571]">
                      Candidate • Tier-1 Verified (React, TS)
                    </p>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-[#1B3A5C]">Select →</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickPersona("rohan.k@demo.vouch.io")
                }
                className="flex items-center justify-between border border-[#D9D5C7] bg-[#FBFAF7] px-3 py-2 text-left text-xs transition hover:border-[#1B3A5C]"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#1B3A5C]" />
                  <div>
                    <p className="font-display font-medium text-[#1A1915]">Rohan Kulkarni</p>
                    <p className="font-mono text-[10px] text-[#8A8571]">
                      Team Leader • NeuroHacks Finalist
                    </p>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-[#1B3A5C]">Select →</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickPersona("sneha.patel@acme-corp.com")
                }
                className="flex items-center justify-between border border-[#D9D5C7] bg-[#FBFAF7] px-3 py-2 text-left text-xs transition hover:border-[#1B3A5C]"
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-[#1B3A5C]" />
                  <div>
                    <p className="font-display font-medium text-[#1A1915]">Sneha Patel</p>
                    <p className="font-mono text-[10px] text-[#8A8571]">
                      Campus Recruiter • Acme Cloud Drives
                    </p>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-[#1B3A5C]">Select →</span>
              </button>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center text-xs text-[#8A8571]">
            Don&apos;t have an identity registered?{" "}
            <Link
              href="/register"
              className="font-mono font-medium text-[#1B3A5C] hover:underline"
            >
              create verified account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

