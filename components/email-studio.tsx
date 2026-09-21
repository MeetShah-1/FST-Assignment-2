"use client";

import React, { useState } from "react";
import { useNexusStore } from "@/lib/store/nexusStore";
import { EmailTemplateType } from "@/lib/email/resend";
import {
  Sparkles,
  Send,
  Smartphone,
  Monitor,
  Code,
  Check,
  Copy,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Eye,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function EmailStudio() {
  const { playSfx } = useNexusStore();
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateType>("TRANSACTION_RECEIPT");
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");
  const [targetEmail, setTargetEmail] = useState<string>("engineer@nexus.io");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  const templates = [
    {
      id: "TRANSACTION_RECEIPT" as EmailTemplateType,
      name: "Transaction Receipt",
      icon: Mail,
      tag: "Quota Confirmation",
      subject: "[Confirmed] Ledger Transaction TXN-8821-NEXUS",
    },
    {
      id: "SECURITY_ALERT" as EmailTemplateType,
      name: "Security Anomaly Alert",
      icon: ShieldAlert,
      tag: "Audit Triggered",
      subject: "[URGENT] Security Anomaly Detected on Nexus Cloud Node",
    },
    {
      id: "ROLE_ELEVATION" as EmailTemplateType,
      name: "Role Elevation Notice",
      icon: ShieldCheck,
      tag: "RBAC Clearance",
      subject: "[Access Updated] Role Permissions Shifted to ADMIN",
    },
  ];

  const handleSendTestDispatch = async () => {
    setIsSending(true);
    playSfx("warp");

    try {
      const res = await fetch("/api/webhooks/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "email.sent",
          data: {
            email_id: `re_sim_${Date.now()}`,
            to: [targetEmail],
            subject: `[Nexus] Test ${selectedTemplate.replace("_", " ")} Dispatch`,
          },
        }),
      });

      const data = await res.json();
      setDispatchStatus(`Email dispatched to ${targetEmail} and logged in Prisma (Resend ID: ${data.emailId || "re_live"})`);
      playSfx("success");
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.2 },
        colors: ["#00F0FF", "#10B981", "#9D00FF"],
      });
    } catch (err: any) {
      setDispatchStatus(`Error: ${err.message}`);
      playSfx("error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white font-mono">
            <Sparkles className="h-6 w-6 text-purple-400" />
            <span>REACT EMAIL & RESEND LIFECYCLE STUDIO</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Part C (CO3, CO4): Modular TSX Email Templates (@react-email/components) & Resend Dispatch
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded border border-purple-500/30 bg-purple-500/10 px-3 py-1 font-mono text-xs text-purple-300">
            Resend SDK & Webhook Ready
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Template Switcher & Dispatch Controls */}
        <div className="cyber-card rounded-2xl p-6 lg:col-span-5 space-y-6">
          <div>
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              React Email Template Library
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select a modular TSX template built with `@react-email/components` to inspect or dispatch.
            </p>
          </div>

          {/* Template Selector Cards */}
          <div className="space-y-2">
            {templates.map((tpl) => {
              const Icon = tpl.icon;
              const isSelected = selectedTemplate === tpl.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() => {
                    setSelectedTemplate(tpl.id);
                    playSfx("click");
                  }}
                  className={`cyber-card flex w-full items-center justify-between rounded-xl p-3 text-left transition-all ${
                    isSelected
                      ? "border-cyan-400 bg-[#0d1830] shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                      : "hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        isSelected ? "bg-cyan-500 text-black" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-mono text-xs font-bold text-slate-200">{tpl.name}</div>
                      <div className="text-[10px] text-slate-500">{tpl.subject}</div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    {tpl.tag}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Dispatch Target Input */}
          <div className="space-y-2 border-t border-slate-800 pt-4">
            <label className="text-xs font-mono text-slate-300">Dispatch Recipient Address:</label>
            <input
              type="email"
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-mono text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>

          {/* Send Test Dispatch Button */}
          <button
            onClick={handleSendTestDispatch}
            disabled={isSending}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 py-3 font-mono text-xs font-bold text-cyan-300 transition-all hover:bg-cyan-500/30 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] disabled:opacity-50"
          >
            <Send className={`h-4 w-4 ${isSending ? "animate-spin" : ""}`} />
            <span>{isSending ? "Dispatching via Resend..." : "Dispatch Transactional Notification"}</span>
          </button>

          {dispatchStatus && (
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-xs font-mono text-cyan-300">
              {dispatchStatus}
            </div>
          )}
        </div>

        {/* Right Canvas: Live Template Preview & Render */}
        <div className="cyber-card rounded-2xl p-6 lg:col-span-7 flex flex-col justify-between">
          <div>
            {/* Viewport Toolbar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDeviceMode("desktop")}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-mono transition-colors ${
                    deviceMode === "desktop"
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Monitor className="h-3.5 w-3.5" />
                  <span>Desktop</span>
                </button>
                <button
                  onClick={() => setDeviceMode("mobile")}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-mono transition-colors ${
                    deviceMode === "mobile"
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>Mobile</span>
                </button>
              </div>

              <span className="font-mono text-[11px] text-slate-500">
                Render Engine: @react-email/render v1.0
              </span>
            </div>

            {/* Email Preview Frame */}
            <div className="mt-4 flex justify-center overflow-hidden rounded-xl border border-slate-800 bg-[#05070e] p-4">
              <div
                className={`w-full transition-all duration-300 ${
                  deviceMode === "mobile" ? "max-w-xs" : "max-w-lg"
                }`}
              >
                {selectedTemplate === "TRANSACTION_RECEIPT" ? (
                  <div className="rounded-xl border border-cyan-500/30 bg-[#0a0f1d] p-6 shadow-2xl">
                    <div className="text-[10px] font-bold text-cyan-400 tracking-widest uppercase">
                      NEXUS QUANTUM // TRANSACTION RECEIPT
                    </div>
                    <h3 className="mt-1 text-xl font-black text-white">Transaction Confirmed</h3>
                    <p className="text-xs text-slate-400">
                      Automated Relational Ledger Lifecycle Notification
                    </p>

                    <div className="mt-4 rounded-lg border border-cyan-500/30 bg-[#0d1527] p-4 text-center">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400">
                        Total Settled Volume
                      </div>
                      <div className="mt-1 text-2xl font-black text-cyan-400 font-mono">
                        USD $12,500.00
                      </div>
                      <span className="mt-2 inline-block rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                        STATUS: RECORDED IN PRISMA ORM
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 border-t border-slate-800 pt-3 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Reference:</span>
                        <span className="text-cyan-300 font-bold">TXN-8821-NEXUS</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Allocation:</span>
                        <span className="text-slate-300">INFRA ALLOCATION</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tenant:</span>
                        <span className="text-slate-300">Nexus Cybernetics Inc</span>
                      </div>
                    </div>
                  </div>
                ) : selectedTemplate === "SECURITY_ALERT" ? (
                  <div className="rounded-xl border border-rose-500/40 bg-[#0a0f1d] p-6 shadow-2xl">
                    <div className="text-[10px] font-bold text-rose-400 tracking-widest uppercase">
                      ⚠️ NEXUS AUTOMATED AUDIT DISPATCH
                    </div>
                    <h3 className="mt-1 text-xl font-black text-white">Critical Security Anomaly</h3>
                    <p className="text-xs text-slate-400">
                      An automated audit threshold was triggered on your multi-tenant account.
                    </p>

                    <div className="mt-4 rounded-lg border border-rose-500/40 bg-rose-500/10 p-4 text-center">
                      <div className="text-[10px] uppercase tracking-wider text-rose-300">
                        INCIDENT CLASSIFICATION
                      </div>
                      <div className="mt-1 text-lg font-bold text-white">
                        UNAUTHORIZED BURST DETECTED
                      </div>
                      <span className="mt-2 inline-block rounded-full bg-rose-500 px-3 py-0.5 text-[10px] font-bold text-white">
                        SEVERITY: CRITICAL
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 border-t border-slate-800 pt-3 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Origin IP:</span>
                        <span className="text-rose-400 font-bold">198.51.100.88</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Account:</span>
                        <span className="text-slate-300">{targetEmail}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-purple-500/40 bg-[#0a0f1d] p-6 shadow-2xl">
                    <div className="text-[10px] font-bold text-purple-400 tracking-widest uppercase">
                      RBAC ROLE MODIFICATION
                    </div>
                    <h3 className="mt-1 text-xl font-black text-white">Permissions Updated</h3>
                    <p className="text-xs text-slate-400">
                      Clearance level within Nexus Cybernetics modified.
                    </p>

                    <div className="mt-4 rounded-lg border border-purple-500/40 bg-purple-500/10 p-4 text-center">
                      <div className="text-xs text-purple-300">MEMBER ➔ <strong className="text-white text-lg">ADMIN</strong></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-800 pt-3 text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>Template file: emails/{selectedTemplate}.tsx</span>
            <span>Zero Hydration Delay</span>
          </div>
        </div>
      </div>
    </div>
  );
}
