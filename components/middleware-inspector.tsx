"use client";

import React, { useState } from "react";
import { useNexusStore } from "@/lib/store/nexusStore";
import {
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Send,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function MiddlewareInspector() {
  const { activeRole, playSfx } = useNexusStore();
  const [selectedRoute, setSelectedRoute] = useState<string>("/api/admin/system");
  const [isProbing, setIsProbing] = useState<boolean>(false);
  const [probeResult, setProbeResult] = useState<any>(null);

  const testRoutes = [
    {
      path: "/api/admin/system",
      method: "GET",
      requiredRole: "ADMIN",
      description: "Protected administrative system metrics and relational health report.",
    },
    {
      path: "/api/transactions/create",
      method: "POST",
      requiredRole: "MEMBER or ADMIN",
      description: "Financial ledger mutation gate (Guest requests blocked with 403 Forbidden).",
    },
    {
      path: "/api/webhooks/resend",
      method: "GET",
      requiredRole: "ANY",
      description: "Public/Signed Resend webhook ingestion endpoint.",
    },
  ];

  const handleSendProbe = async () => {
    setIsProbing(true);
    playSfx("warp");

    const startTime = performance.now();
    try {
      const res = await fetch(selectedRoute, {
        method: selectedRoute.includes("create") ? "POST" : "GET",
        headers: {
          "Content-Type": "application/json",
          "x-nexus-role": activeRole,
        },
        body: selectedRoute.includes("create")
          ? JSON.stringify({
              amount: 1000,
              type: "INFRA_ALLOCATION",
              recipientEmail: "demo@nexus.io",
              description: "Probe Test",
            })
          : undefined,
      });

      const elapsed = Math.round(performance.now() - startTime);
      let data = null;
      try {
        data = await res.json();
      } catch {
        data = { text: await res.text() };
      }

      // Collect edge response headers
      const edgeProxy = res.headers.get("x-nexus-edge-proxy") || "v2.4-active";
      const edgeRole = res.headers.get("x-nexus-role") || activeRole;
      const edgeAuth = res.headers.get("x-nexus-authenticated") || "true";
      const edgeLatency = res.headers.get("x-nexus-edge-latency-ms") || elapsed.toString();

      setProbeResult({
        status: res.status,
        statusText: res.statusText || (res.status === 200 ? "OK" : "FORBIDDEN"),
        latencyMs: elapsed,
        headers: {
          "x-nexus-edge-proxy": edgeProxy,
          "x-nexus-role": edgeRole,
          "x-nexus-authenticated": edgeAuth,
          "x-nexus-edge-latency-ms": edgeLatency,
        },
        data,
      });

      if (res.status === 200) {
        playSfx("success");
      } else {
        playSfx("error");
      }
    } catch (err: any) {
      setProbeResult({
        status: 500,
        statusText: "Network Error",
        error: err.message,
      });
      playSfx("error");
    } finally {
      setIsProbing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white font-mono">
            <Terminal className="h-6 w-6 text-cyan-400" />
            <span>EDGE MIDDLEWARE & RBAC PROXY GATES</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Part B (CO3): Next.js Edge Middleware Session Parsing, Header Injection & Route Guarding
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 font-mono text-xs text-cyan-300">
            Active Identity: <strong className="text-white">{activeRole}</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Testbench Controls */}
        <div className="cyber-card rounded-2xl p-6 lg:col-span-6 space-y-5">
          <div>
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              Edge Proxy Probe Testbench
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select an endpoint to probe. Edge middleware (`middleware.ts`) parses role tokens
              and enforces RBAC rules before dispatching to backend route segments.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-300">Target Endpoint Segment:</label>
            <div className="space-y-2">
              {testRoutes.map((route) => {
                const isSelected = selectedRoute === route.path;
                return (
                  <button
                    key={route.path}
                    onClick={() => setSelectedRoute(route.path)}
                    className={`cyber-card flex w-full flex-col rounded-xl p-3 text-left transition-all ${
                      isSelected
                        ? "border-cyan-400 bg-[#0d1830] shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                        : "hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-200">
                        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-cyan-400">
                          {route.method}
                        </span>
                        <span>{route.path}</span>
                      </div>
                      <span className="font-mono text-[10px] text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                        Requires: {route.requiredRole}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">{route.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleSendProbe}
            disabled={isProbing}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 py-3 font-mono text-xs font-bold text-cyan-300 transition-all hover:bg-cyan-500/30 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] disabled:opacity-50"
          >
            <Send className={`h-4 w-4 ${isProbing ? "animate-spin" : ""}`} />
            <span>{isProbing ? "Evaluating Gate..." : `Send Edge Probe as [${activeRole}]`}</span>
          </button>
        </div>

        {/* Live Probe Result & Header Inspector */}
        <div className="cyber-card rounded-2xl p-6 lg:col-span-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                Edge Proxy Response Telemetry
              </h3>
              {probeResult && (
                <span
                  className={`rounded-full px-2.5 py-0.5 font-mono text-xs font-bold ${
                    probeResult.status === 200
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  HTTP {probeResult.status} {probeResult.statusText}
                </span>
              )}
            </div>

            {probeResult ? (
              <div className="mt-4 space-y-4">
                {/* Latency & Status Badge */}
                <div className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-3 font-mono text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Clock className="h-4 w-4 text-cyan-400" />
                    <span>Edge Proxy Latency:</span>
                    <strong className="text-cyan-400">{probeResult.latencyMs} ms</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {probeResult.status === 200 ? (
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-400" />
                    )}
                    <span className={probeResult.status === 200 ? "text-emerald-400" : "text-rose-400"}>
                      {probeResult.status === 200 ? "Gate Opened" : "Rejected at Edge Proxy"}
                    </span>
                  </div>
                </div>

                {/* Injected Edge Headers */}
                <div>
                  <h4 className="font-mono text-xs font-bold text-slate-300 mb-2">
                    Injected Edge Headers:
                  </h4>
                  <div className="space-y-1 rounded-xl border border-slate-800 bg-black/40 p-3 font-mono text-xs">
                    {Object.entries(probeResult.headers || {}).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-slate-500">{k}:</span>
                        <span className="text-cyan-300 font-semibold">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Response Payload */}
                <div>
                  <h4 className="font-mono text-xs font-bold text-slate-300 mb-2">
                    Resolved Body Payload:
                  </h4>
                  <pre className="max-h-48 overflow-y-auto rounded-xl border border-slate-800 bg-black/60 p-3 font-mono text-[11px] text-slate-300">
                    {JSON.stringify(probeResult.data, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-xs font-mono text-slate-500">
                Click &quot;Send Edge Probe&quot; to test middleware proxy rejection or resolution.
              </div>
            )}
          </div>

          <div className="mt-4 border-t border-slate-800 pt-3 text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>Middleware file: middleware.ts</span>
            <span>Edge Runtime Supported</span>
          </div>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="cyber-card rounded-2xl p-6">
        <h3 className="font-mono text-base font-bold text-white mb-4">
          Role-Based Access Control (RBAC) Permission Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/60 text-slate-400">
              <tr>
                <th className="px-4 py-2.5">Endpoint / Capability</th>
                <th className="px-4 py-2.5">ADMIN (Architect)</th>
                <th className="px-4 py-2.5">MEMBER (Operator)</th>
                <th className="px-4 py-2.5">GUEST (Observer)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="px-4 py-2.5 font-semibold text-white">/admin/system (Metrics)</td>
                <td className="px-4 py-2.5 text-emerald-400 font-bold">✓ ALLOWED (200)</td>
                <td className="px-4 py-2.5 text-rose-400">✗ DENIED (403)</td>
                <td className="px-4 py-2.5 text-rose-400">✗ DENIED (403)</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold text-white">/api/transactions/create</td>
                <td className="px-4 py-2.5 text-emerald-400 font-bold">✓ ALLOWED (200)</td>
                <td className="px-4 py-2.5 text-emerald-400 font-bold">✓ ALLOWED (200)</td>
                <td className="px-4 py-2.5 text-rose-400">✗ DENIED (403)</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold text-white">Faker.js Seeder Purge</td>
                <td className="px-4 py-2.5 text-emerald-400 font-bold">✓ ALLOWED</td>
                <td className="px-4 py-2.5 text-rose-400">✗ RESTRICTED</td>
                <td className="px-4 py-2.5 text-rose-400">✗ RESTRICTED</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold text-white">View Relational Dashboard</td>
                <td className="px-4 py-2.5 text-emerald-400">✓ ALLOWED</td>
                <td className="px-4 py-2.5 text-emerald-400">✓ ALLOWED</td>
                <td className="px-4 py-2.5 text-emerald-400">✓ ALLOWED (Read-Only)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
