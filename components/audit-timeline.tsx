"use client";

import React, { useState } from "react";
import { useNexusStore } from "@/lib/store/nexusStore";
import {
  History,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  Clock,
  Terminal,
  Filter,
} from "lucide-react";

interface AuditLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress: string;
  userAgent: string;
  severity: string;
  details: string | null;
  createdAt: string | Date;
  user?: { email: string; name: string } | null;
}

export default function AuditTimeline({ initialAudits }: { initialAudits: AuditLogItem[] }) {
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [audits] = useState<AuditLogItem[]>(initialAudits);

  const filtered = audits.filter(
    (a) => filterSeverity === "ALL" || a.severity === filterSeverity
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white font-mono">
            <History className="h-6 w-6 text-emerald-400" />
            <span>IMMUTABLE COMPLIANCE AUDIT TIMELINE</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Part A (CO4): Multi-Entity Normalized Audit Logs with Actor Tracking & Forensic Traceability
          </p>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/60 p-1 font-mono text-xs">
          {["ALL", "CRITICAL", "WARNING", "INFO"].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`rounded-lg px-2.5 py-1 transition-all ${
                filterSeverity === sev
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Stream */}
      <div className="space-y-3">
        {filtered.map((log) => (
          <div
            key={log.id}
            className={`cyber-card rounded-xl p-4 transition-all hover:border-slate-700 ${
              log.severity === "CRITICAL"
                ? "border-rose-500/30 bg-rose-500/[0.03]"
                : log.severity === "WARNING"
                ? "border-amber-500/30 bg-amber-500/[0.03]"
                : ""
            }`}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    log.severity === "CRITICAL"
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                      : log.severity === "WARNING"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  }`}
                >
                  {log.severity === "CRITICAL" ? (
                    <ShieldAlert className="h-4 w-4" />
                  ) : log.severity === "WARNING" ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <Info className="h-4 w-4" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">
                      {log.action}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.2 font-mono text-[9px] font-bold ${
                        log.severity === "CRITICAL"
                          ? "bg-rose-500/20 text-rose-300"
                          : log.severity === "WARNING"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {log.severity}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-400">
                    Entity: <span className="text-cyan-400">{log.entityType}</span> / {log.entityId}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-slate-400">
                <div className="flex items-center gap-1 text-slate-500">
                  <Terminal className="h-3 w-3" />
                  <span>IP: {log.ipAddress}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(log.createdAt).toISOString().slice(11, 19)} UTC</span>
                </div>
              </div>
            </div>

            {log.details && (
              <div className="mt-2 rounded-lg bg-black/40 p-2 font-mono text-[11px] text-slate-400">
                {log.details}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
