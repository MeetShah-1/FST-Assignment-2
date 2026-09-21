"use client";

import React, { useState, useEffect } from "react";
import { useNexusStore } from "@/lib/store/nexusStore";
import {
  Database,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Send,
  Layers,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { triggerSecurityAnomalyAction } from "@/app/actions/alertActions";
import confetti from "canvas-confetti";

interface HeroStats {
  orgsCount: number;
  usersCount: number;
  txCount: number;
  auditCount: number;
  emailCount: number;
  webhookCount: number;
  totalVolume: number;
  deliveryRate: number;
}

export default function HeroTelemetry({ initialStats }: { initialStats: HeroStats }) {
  const { activeRole, setActiveTab, playSfx } = useNexusStore();
  const [stats, setStats] = useState(initialStats);
  const [alertTriggering, setAlertTriggering] = useState(false);

  useEffect(() => {
    setStats(initialStats);
  }, [initialStats]);

  const handleTriggerAnomaly = async () => {
    if (alertTriggering) return;
    setAlertTriggering(true);
    playSfx("warp");

    try {
      const res = await triggerSecurityAnomalyAction("UNAUTHORIZED_PRIVILEGE_PROBE");
      if (res.success) {
        playSfx("error");
        alert(res.message);
      }
    } finally {
      setAlertTriggering(false);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-b from-[#0A0F1D]/90 via-[#05070E] to-[#0A0F1D] p-6 lg:p-8 shadow-[0_0_50px_rgba(0,240,255,0.08)]">
      {/* Background Cyber Grid Accent */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />

      {/* Top Header Row */}
      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-mono text-xs font-bold tracking-widest text-cyan-400 uppercase">
              CO3 + CO4 Production Cluster Telemetry
            </span>
            <span className="rounded border border-slate-700 bg-slate-800/80 px-2 py-0.5 font-mono text-[10px] text-slate-300">
              Clearance: <strong className="text-white">{activeRole}</strong>
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Autonomous Cloud Ledger &{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400 bg-clip-text text-transparent">
              Resend Lifecycle Engine
            </span>
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base leading-relaxed">
            Enterprise full-stack pipeline orchestrating automated Faker.js relational data seeding via
            Prisma ORM, edge middleware RBAC proxy gates, and transactional React Email dispatch with
            webhook event ingestion.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab("transactions")}
            className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2.5 text-xs font-bold text-cyan-300 transition-all hover:bg-cyan-500/20 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]"
          >
            <Send className="h-4 w-4" />
            <span>New Transaction</span>
          </button>

          <button
            onClick={handleTriggerAnomaly}
            disabled={alertTriggering}
            className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-xs font-bold text-rose-300 transition-all hover:bg-rose-500/20 disabled:opacity-50"
          >
            <AlertTriangle className="h-4 w-4 text-rose-400" />
            <span>{alertTriggering ? "Triggering..." : "Simulate Security Anomaly"}</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="relative z-10 mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {/* Card 1: Relational Users */}
        <div className="cyber-card rounded-2xl p-4 transition-all hover:border-cyan-500/40 group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-mono text-[11px] uppercase tracking-wider">Users (Prisma)</span>
            <Layers className="h-4 w-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">{stats.usersCount}</div>
          <div className="mt-1 flex items-center text-[10px] text-cyan-400">
            <span>Foreign-Key Bound</span>
          </div>
        </div>

        {/* Card 2: Ledger Transactions */}
        <div className="cyber-card rounded-2xl p-4 transition-all hover:border-cyan-500/40 group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-mono text-[11px] uppercase tracking-wider">Transactions</span>
            <Database className="h-4 w-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">{stats.txCount}</div>
          <div className="mt-1 flex items-center text-[10px] text-purple-400">
            <span>${(stats.totalVolume / 1000).toFixed(1)}k Total Vol</span>
          </div>
        </div>

        {/* Card 3: Organizations */}
        <div className="cyber-card rounded-2xl p-4 transition-all hover:border-cyan-500/40 group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-mono text-[11px] uppercase tracking-wider">Tenants</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">{stats.orgsCount}</div>
          <div className="mt-1 flex items-center text-[10px] text-emerald-400">
            <span>Multi-Tenant Mesh</span>
          </div>
        </div>

        {/* Card 4: React Email Logs */}
        <div className="cyber-card rounded-2xl p-4 transition-all hover:border-cyan-500/40 group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-mono text-[11px] uppercase tracking-wider">Resend Logs</span>
            <Sparkles className="h-4 w-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">{stats.emailCount}</div>
          <div className="mt-1 flex items-center text-[10px] text-cyan-400">
            <span>{stats.deliveryRate}% Delivered</span>
          </div>
        </div>

        {/* Card 5: Ingested Webhooks */}
        <div className="cyber-card rounded-2xl p-4 transition-all hover:border-cyan-500/40 group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-mono text-[11px] uppercase tracking-wider">Webhooks</span>
            <Zap className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">{stats.webhookCount}</div>
          <div className="mt-1 flex items-center text-[10px] text-amber-400">
            <span>Svix Verified</span>
          </div>
        </div>

        {/* Card 6: Audit Records */}
        <div className="cyber-card rounded-2xl p-4 transition-all hover:border-cyan-500/40 group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-mono text-[11px] uppercase tracking-wider">Audit Trail</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">{stats.auditCount}</div>
          <div className="mt-1 flex items-center text-[10px] text-emerald-400">
            <span>100% Immutable</span>
          </div>
        </div>
      </div>
    </section>
  );
}
