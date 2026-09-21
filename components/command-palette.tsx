"use client";

import React, { useState, useEffect } from "react";
import { useNexusStore, DashboardTab } from "@/lib/store/nexusStore";
import { UserRole } from "@/lib/auth/session";
import {
  Search,
  Shield,
  Database,
  Terminal,
  Send,
  Sparkles,
  Webhook,
  History,
  AlertTriangle,
  RotateCcw,
  X,
} from "lucide-react";
import { triggerDynamicSeedAction, resetDatabaseAction } from "@/app/actions/seedActions";
import { triggerSecurityAnomalyAction } from "@/app/actions/alertActions";

export default function CommandPalette() {
  const {
    isCommandPaletteOpen,
    setCommandPalette,
    setActiveTab,
    setRole,
    playSfx,
  } = useNexusStore();

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!isCommandPaletteOpen) {
      setQuery("");
      setFeedback(null);
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const actions = [
    {
      id: "role-admin",
      label: "Switch Role: ADMIN (Full Clearance)",
      category: "Authentication & RBAC",
      icon: Shield,
      action: async () => {
        setRole("ADMIN");
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "ADMIN" }),
        });
        setFeedback("Role switched to ADMIN");
        playSfx("warp");
      },
    },
    {
      id: "role-member",
      label: "Switch Role: MEMBER (Standard Ledger)",
      category: "Authentication & RBAC",
      icon: Shield,
      action: async () => {
        setRole("MEMBER");
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "MEMBER" }),
        });
        setFeedback("Role switched to MEMBER");
        playSfx("warp");
      },
    },
    {
      id: "role-guest",
      label: "Switch Role: GUEST (Read-Only Gate)",
      category: "Authentication & RBAC",
      icon: Shield,
      action: async () => {
        setRole("GUEST");
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "GUEST" }),
        });
        setFeedback("Role switched to GUEST");
        playSfx("warp");
      },
    },
    {
      id: "tab-schema",
      label: "Navigate: ER Schema Explorer",
      category: "Navigation",
      icon: Database,
      action: () => {
        setActiveTab("schema");
        setCommandPalette(false);
      },
    },
    {
      id: "tab-seeder",
      label: "Navigate: Faker.js Automated Seeder",
      category: "Navigation",
      icon: Database,
      action: () => {
        setActiveTab("seeder");
        setCommandPalette(false);
      },
    },
    {
      id: "tab-middleware",
      label: "Navigate: Edge Middleware Inspector",
      category: "Navigation",
      icon: Terminal,
      action: () => {
        setActiveTab("middleware");
        setCommandPalette(false);
      },
    },
    {
      id: "tab-email",
      label: "Navigate: React Email & Resend Studio",
      category: "Navigation",
      icon: Sparkles,
      action: () => {
        setActiveTab("email");
        setCommandPalette(false);
      },
    },
    {
      id: "tab-webhooks",
      label: "Navigate: Webhook Ingestion Feed",
      category: "Navigation",
      icon: Webhook,
      action: () => {
        setActiveTab("webhooks");
        setCommandPalette(false);
      },
    },
    {
      id: "tab-audit",
      label: "Navigate: Immutable Audit Ledger",
      category: "Navigation",
      icon: History,
      action: () => {
        setActiveTab("audit");
        setCommandPalette(false);
      },
    },
    {
      id: "seed-now",
      label: "Execute: Seed 20 Relational Records with Faker.js",
      category: "Database Pipeline",
      icon: Database,
      action: async () => {
        setLoading(true);
        const res = await triggerDynamicSeedAction(20);
        setLoading(false);
        setFeedback(res.success ? res.message : res.error);
        playSfx(res.success ? "success" : "error");
      },
    },
    {
      id: "security-anomaly",
      label: "Trigger: Security Anomaly & Alert Email Dispatch",
      category: "Lifecycle Events",
      icon: AlertTriangle,
      action: async () => {
        setLoading(true);
        const res = await triggerSecurityAnomalyAction("SUSPICIOUS_TOKEN_REPLAY");
        setLoading(false);
        setFeedback(res.success ? res.message : res.error);
        playSfx(res.success ? "success" : "error");
      },
    },
    {
      id: "db-reset",
      label: "Reset: Purge & Reset Relational Database",
      category: "Administrative",
      icon: RotateCcw,
      action: async () => {
        if (!confirm("Are you sure you want to purge the database?")) return;
        setLoading(true);
        const res = await resetDatabaseAction();
        setLoading(false);
        setFeedback(res.success ? res.message : res.error);
        playSfx(res.success ? "success" : "error");
      },
    },
  ];

  const filtered = actions.filter(
    (a) =>
      a.label.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-md pt-20 p-4">
      <div
        className="w-full max-w-xl rounded-2xl border border-cyan-500/30 bg-[#0A0F1D] shadow-[0_0_40px_rgba(0,240,255,0.2)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-slate-800 px-4 py-3">
          <Search className="h-5 w-5 text-cyan-400 mr-3" />
          <input
            type="text"
            placeholder="Type a command, navigate, or test edge gates..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={() => setCommandPalette(false)}
            className="rounded p-1 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="bg-cyan-500/10 border-b border-cyan-500/20 px-4 py-2 text-xs font-mono text-cyan-300">
            {feedback}
          </div>
        )}

        {/* Action List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching commands found
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  disabled={loading}
                  onClick={item.action}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors hover:bg-slate-800/80 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-cyan-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-300">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200 group-hover:text-cyan-300">
                        {item.label}
                      </div>
                      <div className="text-[10px] text-slate-500">{item.category}</div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-slate-600 group-hover:text-slate-400">
                    ↵
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-[#05070E] px-4 py-2 text-[11px] text-slate-500 font-mono">
          <span>Navigation: ↑ ↓ • Select: ↵</span>
          <span>Close: ESC</span>
        </div>
      </div>
    </div>
  );
}
