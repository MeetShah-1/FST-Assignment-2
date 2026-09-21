"use client";

import React, { useState, useEffect } from "react";
import { useNexusStore, DashboardTab } from "@/lib/store/nexusStore";
import { UserRole, DEMO_PROFILES } from "@/lib/auth/session";
import {
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Volume2,
  VolumeX,
  Command,
  Database,
  Terminal,
  Layers,
  Send,
  Webhook,
  History,
  Activity,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";
import { triggerDynamicSeedAction } from "@/app/actions/seedActions";

export default function Navbar() {
  const {
    activeRole,
    setRole,
    activeTab,
    setActiveTab,
    soundEnabled,
    toggleSound,
    setCommandPalette,
    playSfx,
  } = useNexusStore();

  const [isSeeding, setIsSeeding] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Sync initial cookie role with server
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.role) {
          setRole(data.user.role as UserRole);
        }
      })
      .catch(() => {});
  }, [setRole]);

  // Handle switching role
  const handleRoleChange = async (newRole: UserRole) => {
    setRole(newRole);
    try {
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      // Trigger toast/status update
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Quick Seeding trigger
  const handleQuickSeed = async () => {
    if (isSeeding) return;
    setIsSeeding(true);
    playSfx("warp");

    try {
      const res = await triggerDynamicSeedAction(10);
      if (res.success) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.1 },
          colors: ["#00F0FF", "#9D00FF", "#10B981"],
        });
        playSfx("success");
      } else {
        playSfx("error");
      }
    } catch {
      playSfx("error");
    } finally {
      setIsSeeding(false);
    }
  };

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPalette(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setCommandPalette]);

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-[#05070e]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Edge Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 shadow-[0_0_15px_rgba(0,240,255,0.4)]">
              <span className="font-mono text-sm font-black text-black">NX</span>
              <span className="absolute -inset-0.5 animate-pulse rounded-lg bg-cyan-400 opacity-20 blur"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-black tracking-wider text-white">
                  NEXUS<span className="text-cyan-400">CORE</span>
                </span>
                <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-cyan-400 border border-cyan-500/30">
                  v2.4 PROD
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                Relational Seeder & Resend Lifecycle
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 md:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-[11px] font-medium text-emerald-400">
              Edge Proxy Active
            </span>
          </div>
        </div>

        {/* Center Nav Tabs */}
        <nav className="hidden lg:flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/60 p-1">
          {[
            { id: "overview", label: "Dashboard", icon: Activity },
            { id: "schema", label: "ER Schema", icon: Layers },
            { id: "seeder", label: "Faker Seeder", icon: Database },
            { id: "middleware", label: "Edge RBAC", icon: Terminal },
            { id: "transactions", label: "Ledger", icon: Send },
            { id: "email", label: "React Email", icon: Sparkles },
            { id: "webhooks", label: "Webhooks", icon: Webhook },
            { id: "audit", label: "Audit Log", icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as DashboardTab)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Tools: Role Switcher & Audio & Quick Seed */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Seed Button */}
          <button
            onClick={handleQuickSeed}
            disabled={isSeeding}
            title="Seed 10 Relational Records via Faker.js"
            className="flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1.5 text-xs font-semibold text-purple-300 transition-all hover:bg-purple-500/20 hover:border-purple-400 disabled:opacity-50"
          >
            <Database className={`h-3.5 w-3.5 ${isSeeding ? "animate-spin text-purple-400" : ""}`} />
            <span className="hidden sm:inline">{isSeeding ? "Seeding..." : "Quick Seed"}</span>
          </button>

          {/* Interactive Role Switcher */}
          <div className="flex items-center rounded-lg border border-slate-700 bg-slate-900/90 p-0.5">
            {(["ADMIN", "MEMBER", "GUEST"] as UserRole[]).map((role) => {
              const isSelected = activeRole === role;
              return (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold tracking-wider transition-all ${
                    isSelected
                      ? role === "ADMIN"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.3)]"
                        : role === "MEMBER"
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(0,240,255,0.3)]"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {role === "ADMIN" ? (
                    <ShieldAlert className="h-3 w-3" />
                  ) : role === "MEMBER" ? (
                    <ShieldCheck className="h-3 w-3" />
                  ) : (
                    <UserCheck className="h-3 w-3" />
                  )}
                  <span>{role}</span>
                </button>
              );
            })}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              toggleSound();
              playSfx("click");
            }}
            title={soundEnabled ? "Mute Cyber SFX" : "Enable Cyber SFX"}
            className="rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-slate-400 transition-colors hover:border-slate-700 hover:text-cyan-400"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-slate-500" />}
          </button>

          {/* Command Palette Trigger */}
          <button
            onClick={() => setCommandPalette(true)}
            title="Open Command Palette (Ctrl+K)"
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1.5 font-mono text-xs text-slate-400 hover:border-slate-700 hover:text-slate-200"
          >
            <Command className="h-3.5 w-3.5" />
            <span>K</span>
          </button>
        </div>
      </div>
    </header>
  );
}
