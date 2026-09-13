"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Layers,
  Bell,
  ChevronDown,
  UserCheck,
  ExternalLink,
  ClipboardList,
  Users2,
  Briefcase,
  FileCheck2,
} from "lucide-react";
import { InAppNotification } from "@/types";
import { useAuth, DEMO_PERSONAS } from "@/lib/auth/auth-context";
import { LogOut, LogIn } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, loginWithPersona, logout } = useAuth();
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
    { href: "/dashboard", label: "Ledger Dashboard", icon: Layers },
    { href: "/profile", label: "Profile & Evidence", icon: UserCheck },
    { href: "/assessments", label: "Assessments", icon: ClipboardList },
    { href: "/teams", label: "Hackathon Teams", icon: Users2 },
    { href: "/recruitment", label: "Recruitment Drives", icon: Briefcase },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#D9D5C7] bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center border border-[#1B3A5C] bg-[#1B3A5C] text-white">
              <FileCheck2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-semibold tracking-tight text-[#1A1915] text-base">VOUCH</span>
                <span className="border border-[#1B3A5C]/30 bg-[#E9EFF5] px-1.5 py-0.2 font-mono text-[9px] font-semibold uppercase tracking-wider text-[#1B3A5C]">
                  LEDGER v3.0
                </span>
              </div>
              <p className="font-mono text-[10px] text-[#8A8571] hidden sm:block">
                Technical Verification System
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
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors ${
                    isActive
                      ? "border-b-2 border-[#1B3A5C] bg-[#E9EFF5] text-[#1B3A5C] font-semibold"
                      : "text-[#8A8571] hover:text-[#1A1915] hover:bg-[#F3F1EA]"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? "text-[#1B3A5C]" : "text-[#8A8571]"}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 border border-[#D9D5C7] bg-[#FBFAF7] px-2.5 py-1.5 font-mono text-xs text-[#3D3A31] hover:border-[#B8B29D] transition-colors"
              title="Switch role view for demonstration"
            >
              <span className={`h-2 w-2 ${isAuthenticated ? "bg-[#2F6844]" : "bg-[#9A6B1F]"}`}></span>
              <span className="capitalize font-medium">
                {isAuthenticated && user ? user.fullName.split(" ")[0] : "Guest Specimen"}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-[#8A8571]" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-1 w-64 origin-top-right border border-[#D9D5C7] bg-white p-1.5 z-50">
                <div className="border-b border-[#D9D5C7] px-2 py-1 font-mono text-[10px] uppercase text-[#8A8571]">
                  Switch Demo Persona
                </div>
                {DEMO_PERSONAS.map((p) => {
                  const isActive = user?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        loginWithPersona(p.id);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 text-xs flex flex-col transition-colors ${
                        isActive
                          ? "bg-[#E9EFF5] text-[#1B3A5C] font-semibold border-l-2 border-[#1B3A5C]"
                          : "hover:bg-[#F3F1EA] text-[#3D3A31]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display font-medium">{p.name}</span>
                        <span className="font-mono text-[9px] uppercase text-[#8A8571]">{p.role.replace("_", " ")}</span>
                      </div>
                      <span className="text-[10px] text-[#8A8571] font-normal mt-0.5">{p.description}</span>
                    </button>
                  );
                })}

                {isAuthenticated && (
                  <div className="mt-1 border-t border-[#D9D5C7] pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setShowRoleMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 font-mono text-xs text-[#8C2F2F] hover:bg-[#FDF2F2] flex items-center gap-2"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign out (test logged-out state)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notifications Drawer */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative border border-[#D9D5C7] bg-[#FBFAF7] p-2 text-[#3D3A31] hover:border-[#B8B29D] transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-2 w-2 bg-[#8C2F2F]"></span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-1 w-80 sm:w-96 origin-top-right border border-[#D9D5C7] bg-white z-50">
                <div className="flex items-center justify-between border-b border-[#D9D5C7] px-4 py-3 bg-[#FBFAF7]">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-semibold text-xs text-[#1A1915]">Verification Notices</span>
                    {unreadCount > 0 && (
                      <span className="border border-[#8C2F2F]/30 bg-[#FDF2F2] px-1.5 py-0.2 font-mono text-[9px] font-bold text-[#8C2F2F]">
                        {unreadCount} UNREAD
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="font-mono text-[10px] text-[#1B3A5C] hover:underline"
                    >
                      mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-[#D9D5C7]">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-[#8A8571]">
                      No notices registered
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs transition-colors ${
                          n.read ? "bg-white text-[#3D3A31]" : "bg-[#E9EFF5]/50 text-[#1A1915]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-xs text-[#1A1915]">{n.title}</p>
                          <span className="font-mono text-[10px] text-[#8A8571] whitespace-nowrap">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-1 text-[#3D3A31] leading-relaxed text-[11px]">{n.message}</p>
                        {n.link && (
                          <Link
                            href={n.link}
                            onClick={() => setShowNotifs(false)}
                            className="mt-2 inline-flex items-center gap-1 font-mono text-[11px] text-[#1B3A5C] hover:underline"
                          >
                            Examine entry <ExternalLink className="h-3 w-3" />
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
          {!isAuthenticated ? (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 border border-[#1B3A5C] bg-[#1B3A5C] px-3 py-1.5 font-mono text-xs font-medium text-white hover:bg-[#152e4a] transition-colors"
            >
              <LogIn className="h-3.5 w-3.5 text-white" />
              Sign in
            </Link>
          ) : (
            <Link
              href="/assessments"
              className="hidden sm:inline-flex items-center gap-1.5 border border-[#1B3A5C] bg-[#1B3A5C] px-3 py-1.5 font-mono text-xs font-medium text-white hover:bg-[#152e4a] transition-colors"
            >
              <FileCheck2 className="h-3.5 w-3.5 text-white" />
              Take assessment
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

