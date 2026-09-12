"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  Users,
  Briefcase,
  Layers,
  Bell,
  Sparkles,
  ChevronDown,
  UserCheck,
  ExternalLink,
} from "lucide-react";
import { InAppNotification } from "@/types";

export function Navbar() {
  const pathname = usePathname();
  const [activeRole, setActiveRole] = useState<"candidate" | "team_leader" | "recruiter">("candidate");
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setNotifications(json.data);
      })
      .catch(() => {});
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "all" }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Layers },
    { href: "/profile", label: "Profile & Evidence", icon: UserCheck },
    { href: "/assessments", label: "Assessments", icon: CheckCircle2 },
    { href: "/teams", label: "Hackathon Teams", icon: Users },
    { href: "/recruitment", label: "Campus Recruitment", icon: Briefcase },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-sm">
              <ShieldCheck className="h-5 w-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-zinc-950 text-base">VOUCH</span>
                <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky-800">
                  Verified
                </span>
              </div>
              <p className="text-[10px] font-medium text-zinc-500 hidden sm:block">
                Skill Identity & Matching
              </p>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-zinc-100 text-zinc-900 font-semibold"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-sky-600" : "text-zinc-400"}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Persona Switcher for Quick Demo */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
              title="Switch role view for demo"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span className="capitalize">{activeRole.replace("_", " ")}</span>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg border border-zinc-200 bg-white p-1.5 shadow-lg ring-1 ring-black/5 z-50">
                <div className="px-2 py-1 text-[10px] font-semibold uppercase text-zinc-400">
                  Switch Active Persona
                </div>
                <button
                  onClick={() => {
                    setActiveRole("candidate");
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 text-xs rounded-md flex flex-col ${
                    activeRole === "candidate" ? "bg-sky-50 text-sky-900 font-medium" : "hover:bg-zinc-50 text-zinc-700"
                  }`}
                >
                  <span>Candidate (Arjun Verma)</span>
                  <span className="text-[10px] text-zinc-500 font-normal">Takes tests, proves skills, joins teams</span>
                </button>
                <button
                  onClick={() => {
                    setActiveRole("team_leader");
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 text-xs rounded-md flex flex-col ${
                    activeRole === "team_leader" ? "bg-sky-50 text-sky-900 font-medium" : "hover:bg-zinc-50 text-zinc-700"
                  }`}
                >
                  <span>Team Leader (Rohan Kulkarni)</span>
                  <span className="text-[10px] text-zinc-500 font-normal">Inspects coverage, tests candidates</span>
                </button>
                <button
                  onClick={() => {
                    setActiveRole("recruiter");
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 text-xs rounded-md flex flex-col ${
                    activeRole === "recruiter" ? "bg-sky-50 text-sky-900 font-medium" : "hover:bg-zinc-50 text-zinc-700"
                  }`}
                >
                  <span>Campus Recruiter (Sneha Patel)</span>
                  <span className="text-[10px] text-zinc-500 font-normal">Manages drives, filters verified talent</span>
                </button>
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative rounded-md p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-600"></span>
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 origin-top-right rounded-lg border border-zinc-200 bg-white shadow-xl ring-1 ring-black/5 z-50">
                <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-zinc-900">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-sky-100 px-1.5 py-0.2 text-[10px] font-bold text-sky-700">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] font-medium text-sky-600 hover:text-sky-800"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-zinc-100">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-zinc-500">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs transition-colors ${
                          n.read ? "bg-white text-zinc-600" : "bg-sky-50/40 text-zinc-900 font-medium"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-xs text-zinc-900">{n.title}</p>
                          <span className="text-[10px] text-zinc-400 whitespace-nowrap">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-1 text-zinc-600 leading-relaxed text-[11px]">{n.message}</p>
                        {n.link && (
                          <Link
                            href={n.link}
                            onClick={() => setShowNotifs(false)}
                            className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:underline"
                          >
                            View details <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick CTA */}
          <Link
            href="/assessments"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 shadow-sm transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-sky-400" />
            Verify Skills
          </Link>
        </div>
      </div>
    </header>
  );
}
