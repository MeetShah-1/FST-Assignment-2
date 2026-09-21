"use client";

import React, { useState } from "react";
import { useNexusStore } from "@/lib/store/nexusStore";
import {
  Webhook,
  Send,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Eye,
  RefreshCw,
  Code,
} from "lucide-react";
import confetti from "canvas-confetti";

interface WebhookItem {
  id: string;
  provider: string;
  eventType: string;
  payload: string;
  status: string;
  createdAt: string | Date;
}

interface EmailLogItem {
  id: string;
  resendId: string | null;
  recipient: string;
  subject: string;
  status: string;
  bounceReason: string | null;
  createdAt: string | Date;
}

export default function WebhookFeed({
  initialWebhooks,
  initialEmailLogs,
}: {
  initialWebhooks: WebhookItem[];
  initialEmailLogs: EmailLogItem[];
}) {
  const { playSfx } = useNexusStore();
  const [webhooks, setWebhooks] = useState<WebhookItem[]>(initialWebhooks);
  const [emailLogs, setEmailLogs] = useState<EmailLogItem[]>(initialEmailLogs);
  const [selectedEmailId, setSelectedEmailId] = useState<string>(
    initialEmailLogs[0]?.resendId || "re_test_001"
  );
  const [eventType, setEventType] = useState<string>("email.delivered");
  const [bounceReason, setBounceReason] = useState<string>(
    "550 5.1.1 The email account does not exist"
  );
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [selectedPayload, setSelectedPayload] = useState<string | null>(null);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  const handleFireWebhook = async () => {
    setIsSimulating(true);
    setResultMsg(null);
    playSfx("warp");

    try {
      const res = await fetch("/api/webhooks/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailId: selectedEmailId,
          eventType,
          bounceReason: eventType === "email.bounced" ? bounceReason : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResultMsg(`Webhook ${eventType} processed & database updated!`);
        playSfx(eventType === "email.bounced" ? "error" : "success");

        // Update local email status
        setEmailLogs((prev) =>
          prev.map((e) =>
            e.resendId === selectedEmailId
              ? {
                  ...e,
                  status:
                    eventType === "email.delivered"
                      ? "DELIVERED"
                      : eventType === "email.bounced"
                      ? "BOUNCED"
                      : "OPENED",
                  bounceReason: eventType === "email.bounced" ? bounceReason : e.bounceReason,
                }
              : e
          )
        );

        if (eventType === "email.delivered") {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.3 },
            colors: ["#10B981", "#00F0FF"],
          });
        }
      } else {
        setResultMsg(`Error: ${data.error}`);
        playSfx("error");
      }
    } catch (err: any) {
      setResultMsg(`Network error: ${err.message}`);
      playSfx("error");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white font-mono">
            <Webhook className="h-6 w-6 text-amber-400" />
            <span>RESEND WEBHOOK INGESTION & LIFECYCLE DISPATCH</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Part C (CO3, CO4): Route Handler (/api/webhooks/resend) Ingesting Delivery & Bounce Events
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-xs text-amber-300">
            Endpoint: /api/webhooks/resend
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Webhook Simulation Lab */}
        <div className="cyber-card rounded-2xl p-6 lg:col-span-5 space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-mono text-base font-bold text-white flex items-center gap-2">
              <Send className="h-4 w-4 text-amber-400" />
              <span>Simulate Inbound Resend Webhook</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Dispatches a signed webhook payload to `/api/webhooks/resend` to trigger automated database state shifts.
            </p>
          </div>

          {resultMsg && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-mono text-amber-300">
              {resultMsg}
            </div>
          )}

          {/* Email ID Target */}
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-300">Select Target Email Record:</label>
            <select
              value={selectedEmailId}
              onChange={(e) => setSelectedEmailId(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-mono text-white focus:border-cyan-400 focus:outline-none"
            >
              {emailLogs.map((log) => (
                <option key={log.id} value={log.resendId || log.id}>
                  {log.resendId} — {log.recipient} ({log.status})
                </option>
              ))}
            </select>
          </div>

          {/* Event Type */}
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-300">Webhook Event Type:</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-mono text-white focus:border-cyan-400 focus:outline-none"
            >
              <option value="email.delivered">email.delivered (Delivery Succeeded)</option>
              <option value="email.bounced">email.bounced (Hard Bounce / Address Rejected)</option>
              <option value="email.opened">email.opened (Recipient Interaction)</option>
            </select>
          </div>

          {/* Bounce Reason if bounced */}
          {eventType === "email.bounced" && (
            <div className="space-y-1">
              <label className="text-xs font-mono text-rose-300">Bounce Error Reason:</label>
              <input
                type="text"
                value={bounceReason}
                onChange={(e) => setBounceReason(e.target.value)}
                className="w-full rounded-xl border border-rose-500/40 bg-slate-900/80 px-3 py-2 text-xs font-mono text-white focus:border-rose-400 focus:outline-none"
              />
            </div>
          )}

          {/* Fire Webhook Button */}
          <button
            onClick={handleFireWebhook}
            disabled={isSimulating}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/20 to-orange-500/20 py-3 font-mono text-xs font-bold text-amber-300 transition-all hover:bg-amber-500/30 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isSimulating ? "animate-spin" : ""}`} />
            <span>{isSimulating ? "Ingesting Webhook..." : `Fire ${eventType} Event`}</span>
          </button>

          <div className="rounded-xl border border-slate-800 bg-[#05070e] p-3 text-[11px] font-mono text-slate-400">
            <span>Svix Signature Verification: Enabled</span>
            <p className="mt-1 text-[10px] text-slate-500">
              Payloads are cryptographically hashed and verified before mutating `EmailDeliveryLog` in Prisma.
            </p>
          </div>
        </div>

        {/* Live Email Delivery Status Table */}
        <div className="cyber-card flex flex-col rounded-2xl p-6 lg:col-span-7">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              Email Delivery State Machine (Prisma ORM)
            </h3>
            <span className="font-mono text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
              Live Relational Status
            </span>
          </div>

          <div className="mt-4 flex-1 overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="border-b border-slate-800 bg-slate-900/60 text-slate-400">
                <tr>
                  <th className="px-3 py-2">Resend ID</th>
                  <th className="px-3 py-2">Recipient</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {emailLogs.slice(0, 10).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-3 py-2 text-cyan-300 font-semibold">{log.resendId}</td>
                    <td className="px-3 py-2 text-slate-300">{log.recipient}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          log.status === "DELIVERED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : log.status === "BOUNCED"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                            : log.status === "OPENED"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                            : "bg-slate-700/50 text-slate-300"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-400 text-[11px] truncate max-w-xs">
                      {log.bounceReason || log.subject}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
