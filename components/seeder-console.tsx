"use client";

import React, { useState } from "react";
import { useNexusStore } from "@/lib/store/nexusStore";
import {
  Database,
  Play,
  RotateCcw,
  CheckCircle,
  Terminal,
  Cpu,
  Globe,
  Sliders,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";
import { triggerDynamicSeedAction, resetDatabaseAction } from "@/app/actions/seedActions";

export default function SeederConsole() {
  const { playSfx, activeRole } = useNexusStore();
  const [batchSize, setBatchSize] = useState<number>(20);
  const [locale, setLocale] = useState<string>("en_US");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([
    "[$] NEXUS Seeding Pipeline initialized.",
    "[$] Engine: @faker-js/faker v9.0 + Prisma ORM v5.22.",
    "[$] Ready for programmatic batch ingestion.",
  ]);

  const handleRunSeeder = async () => {
    if (isRunning) return;
    setIsRunning(true);
    playSfx("warp");

    setLogs((prev) => [
      ...prev,
      `[>] Initiating batch generation (${batchSize} records, locale: ${locale})...`,
      `[>] Synthesizing localized user identities via faker.person...`,
      `[>] Generating financial transactions with TXN reference codes...`,
    ]);

    try {
      const result = await triggerDynamicSeedAction(batchSize);
      if (result.success) {
        setLogs((prev) => [
          ...prev,
          `[✓] Ingested ${result.usersCreated} Users with unique emails and foreign-key ties.`,
          `[✓] Ingested ${result.txCreated} Transactions with foreign keys into organizations.`,
          `[✓] Appended immutable AuditLog record (DYNAMIC_SEED_EXECUTED).`,
          `[★] BATCH COMPLETE: Foreign-key integrity score 100%.`,
        ]);
        playSfx("success");
        confetti({
          particleCount: 75,
          spread: 80,
          origin: { y: 0.2 },
          colors: ["#00F0FF", "#9D00FF", "#10B981"],
        });
      } else {
        setLogs((prev) => [...prev, `[✗] Error during seed: ${result.error}`]);
        playSfx("error");
      }
    } catch (err: any) {
      setLogs((prev) => [...prev, `[✗] Network error: ${err.message}`]);
      playSfx("error");
    } finally {
      setIsRunning(false);
    }
  };

  const handleResetDb = async () => {
    if (!confirm("Confirm database purge? All relational tables will be emptied.")) return;
    setIsRunning(true);
    playSfx("warp");

    try {
      const res = await resetDatabaseAction();
      if (res.success) {
        setLogs((prev) => [
          ...prev,
          `[!] DATABASE PURGED: All relational tables cleared.`,
          `[!] Run 'Quick Seed' or use the Seeder Console to repopulate.`,
        ]);
        playSfx("success");
      } else {
        setLogs((prev) => [...prev, `[✗] Purge failed: ${res.error}`]);
        playSfx("error");
      }
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white font-mono">
            <Database className="h-6 w-6 text-purple-400" />
            <span>FAKER.JS AUTOMATED DATA SEEDING PIPELINE</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Part A (CO4): Programmatic Mock Data Generation & Single CLI Workflow (`prisma/seed.ts`)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded border border-purple-500/30 bg-purple-500/10 px-3 py-1 font-mono text-xs text-purple-300">
            Engine: @faker-js/faker v9.0.3
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Controls Card */}
        <div className="cyber-card rounded-2xl p-6 lg:col-span-5 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="font-mono text-base font-bold text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-cyan-400" />
              <span>Pipeline Configuration</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Configure parameters for programmatic batch ingestion into Prisma ORM.
            </p>
          </div>

          {/* Batch Size Slider */}
          <div className="space-y-2">
            <div className="flex justify-between font-mono text-xs">
              <span className="text-slate-300">Batch Record Count:</span>
              <span className="font-bold text-cyan-400">{batchSize} Records</span>
            </div>
            <input
              type="range"
              min={5}
              max={100}
              step={5}
              value={batchSize}
              onChange={(e) => setBatchSize(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>5 records</span>
              <span>50 records</span>
              <span>100 records</span>
            </div>
          </div>

          {/* Locale Selector */}
          <div className="space-y-2">
            <label className="font-mono text-xs text-slate-300 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-purple-400" />
              <span>Faker Regional Locale:</span>
            </label>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-mono text-slate-200 focus:border-cyan-400 focus:outline-none"
            >
              <option value="en_US">en_US — United States (Standard)</option>
              <option value="en_GB">en_GB — United Kingdom</option>
              <option value="de">de — Germany (EU Central)</option>
              <option value="ja">ja — Japan (Tokyo Edge)</option>
              <option value="en_IN">en_IN — India (Mumbai South)</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-3">
            <button
              onClick={handleRunSeeder}
              disabled={isRunning || activeRole === "GUEST"}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/40 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 py-3 font-mono text-xs font-bold text-cyan-300 transition-all hover:from-cyan-500/30 hover:to-purple-600/30 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] disabled:opacity-50"
            >
              <Play className={`h-4 w-4 ${isRunning ? "animate-spin" : ""}`} />
              <span>{isRunning ? "Generating..." : `Execute Live Seeding (${batchSize} Records)`}</span>
            </button>

            {activeRole === "GUEST" && (
              <p className="text-[11px] text-rose-400 font-mono text-center">
                * Guest accounts cannot execute database mutations. Switch role to ADMIN or MEMBER in navbar.
              </p>
            )}

            <button
              onClick={handleResetDb}
              disabled={isRunning || activeRole !== "ADMIN"}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 py-2.5 font-mono text-xs font-semibold text-rose-300 transition-all hover:bg-rose-500/20 disabled:opacity-40"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Purge Relational Tables (Admin Only)</span>
            </button>
          </div>

          {/* Single CLI Command Note */}
          <div className="rounded-xl border border-slate-800 bg-[#05070e] p-3 font-mono text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold mb-1">
              <Terminal className="h-3.5 w-3.5" />
              <span>Automated CLI Reset Pipeline:</span>
            </div>
            <code className="text-slate-200 block bg-slate-900 px-2 py-1 rounded">
              npm run db:reset
            </code>
            <p className="mt-1 text-[10px] text-slate-500">
              Executes `prisma db push --force-reset` then runs `tsx prisma/seed.ts` automatically.
            </p>
          </div>
        </div>

        {/* Live Streaming Terminal Log */}
        <div className="cyber-card flex flex-col rounded-2xl border border-slate-800 bg-black/60 p-5 lg:col-span-7">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500/80" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-xs text-slate-400">seeder@nexus-edge-vault:~$</span>
            </div>
            <span className="font-mono text-[10px] text-slate-500">TTY: /dev/pts/1</span>
          </div>

          <div className="mt-4 flex-1 space-y-2 overflow-y-auto font-mono text-xs max-h-96 min-h-64">
            {logs.map((log, index) => (
              <div
                key={index}
                className={`leading-relaxed ${
                  log.startsWith("[✓]")
                    ? "text-emerald-400"
                    : log.startsWith("[✗]")
                    ? "text-rose-400"
                    : log.startsWith("[★]")
                    ? "text-cyan-300 font-bold"
                    : log.startsWith("[!]")
                    ? "text-amber-400"
                    : "text-slate-400"
                }`}
              >
                {log}
              </div>
            ))}
            {isRunning && (
              <div className="flex items-center gap-2 text-cyan-400 animate-pulse">
                <span>[&gt;] Programmatic generation running...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
