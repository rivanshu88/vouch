"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CandidateProfile, UserRole } from "@/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export interface DemoPersona {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  description: string;
  avatarUrl: string;
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: "usr-01",
    name: "Arjun Verma",
    email: "arjun.verma@demo.vouch.io",
    role: "candidate",
    description: "Candidate • Tier-1 Verified (React, TS)",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "usr-02",
    name: "Rohan Kulkarni",
    email: "rohan.k@demo.vouch.io",
    role: "team_leader",
    description: "Team Leader • NeuralMesh Squad",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "usr-03",
    name: "Sneha Patel",
    email: "sneha.patel@acme-corp.com",
    role: "recruiter",
    description: "Campus Recruiter • Stripe Talent Partner",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "usr-04",
    name: "Priya Sundaram",
    email: "priya@pes.edu",
    role: "candidate",
    description: "Candidate • Python & Data Science",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  },
];

interface AuthContextType {
  user: CandidateProfile | null;
  role: UserRole;
  loading: boolean;
  isAuthenticated: boolean;
  loginWithPersona: (personaId: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "vouch_active_user_id";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string): Promise<CandidateProfile | null> => {
    try {
      const res = await fetch(`/api/profile?id=${userId}`);
      if (!res.ok) return null;
      const json = await res.json();
      if (json.success && json.data?.profile) {
        return json.data.profile;
      }
      return null;
    } catch {
      return null;
    }
  };

  const initAuth = async () => {
    setLoading(true);
    try {
      // 1. Check local storage for persistent persona session
      if (typeof window !== "undefined") {
        const storedUserId = localStorage.getItem(STORAGE_KEY);
        if (storedUserId) {
          const profile = await fetchProfile(storedUserId);
          if (profile) {
            setUser(profile);
            setLoading(false);
            return;
          }
        }
      }

      // 2. Check Supabase auth session if configured
      if (isSupabaseConfigured()) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            const profile = await fetchProfile(data.session.user.id);
            if (profile) {
              setUser(profile);
              setLoading(false);
              return;
            }
          }
        } catch {}
      }

      // No active session found — user is logged out
      setUser(null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const loginWithPersona = async (personaId: string) => {
    setLoading(true);
    try {
      const profile = await fetchProfile(personaId);
      if (profile) {
        setUser(profile);
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, personaId);
        }
      } else {
        // Fallback to static persona metadata if API is bootstrapping
        const persona = DEMO_PERSONAS.find((p) => p.id === personaId);
        if (persona) {
          const fallbackProfile: CandidateProfile = {
            id: persona.id,
            fullName: persona.name,
            email: persona.email,
            role: persona.role,
            avatarUrl: persona.avatarUrl,
            college: "Verified Institution",
            bio: persona.description,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setUser(fallbackProfile);
          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, personaId);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
      }
      if (isSupabaseConfigured()) {
        try {
          await supabase.auth.signOut();
        } catch {}
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    if (user?.id) {
      const fresh = await fetchProfile(user.id);
      if (fresh) setUser(fresh);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || "candidate",
        loading,
        isAuthenticated: !!user,
        loginWithPersona,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
