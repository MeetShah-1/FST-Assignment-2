"use client";

import React, { useEffect } from "react";
import { useNexusStore } from "@/lib/store/nexusStore";
import HeroTelemetry from "@/components/hero-telemetry";
import SchemaExplorer from "@/components/schema-explorer";
import SeederConsole from "@/components/seeder-console";
import MiddlewareInspector from "@/components/middleware-inspector";
import TransactionEngine from "@/components/transaction-engine";
import EmailStudio from "@/components/email-studio";
import WebhookFeed from "@/components/webhook-feed";
import AuditTimeline from "@/components/audit-timeline";
import MongooseTelemetry from "@/components/mongoose-telemetry";
import {
  Layers,
  Database,
  Terminal,
  Send,
  Sparkles,
  Webhook,
  History,
  Activity,
  Cpu,
} from "lucide-react";

interface DashboardClientProps {
  initialStats: any;
  entityStats: any;
  initialTransactions: any[];
  initialAudits: any[];
  initialEmailLogs: any[];
  initialWebhooks: any[];
}

export default function DashboardClient({
  initialStats,
  entityStats,
  initialTransactions,
  initialAudits,
  initialEmailLogs,
  initialWebhooks,
}: DashboardClientProps) {
  const { activeTab, setActiveTab, playSfx } = useNexusStore();

  const tabs = [
    { id: "overview", label: "Dashboard Overview", icon: Activity },
    { id: "schema", label: "Prisma ER Schema", icon: Layers },
    { id: "seeder", label: "Faker.js Seeder", icon: Database },
    { id: "middleware", label: "Edge RBAC Gates", icon: Terminal },
    { id: "transactions", label: "Ledger Mutations", icon: Send },
    { id: "email", label: "React Email Studio", icon: Sparkles },
    { id: "webhooks", label: "Resend Webhooks", icon: Webhook },
    { id: "audit", label: "Audit Timeline", icon: History },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Telemetry Section (Always Visible) */}
      <HeroTelemetry initialStats={initialStats} />

      {/* Tab Navigation Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-slate-800 bg-[#0A0F1D]/80 p-1.5 backdrop-blur-md">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                playSfx("click");
              }}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-mono font-semibold transition-all ${
                isActive
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.25)]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Tab Body */}
      <div className="transition-all duration-300">
        {activeTab === "overview" && (
          <div className="space-y-10">
            <SchemaExplorer entityStats={entityStats} />
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <MiddlewareInspector />
              <TransactionEngine initialTransactions={initialTransactions} />
            </div>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <EmailStudio />
              <WebhookFeed
                initialWebhooks={initialWebhooks}
                initialEmailLogs={initialEmailLogs}
              />
            </div>
            <MongooseTelemetry />
            <AuditTimeline initialAudits={initialAudits} />
          </div>
        )}

        {activeTab === "schema" && <SchemaExplorer entityStats={entityStats} />}
        {activeTab === "seeder" && <SeederConsole />}
        {activeTab === "middleware" && <MiddlewareInspector />}
        {activeTab === "transactions" && (
          <TransactionEngine initialTransactions={initialTransactions} />
        )}
        {activeTab === "email" && <EmailStudio />}
        {activeTab === "webhooks" && (
          <WebhookFeed
            initialWebhooks={initialWebhooks}
            initialEmailLogs={initialEmailLogs}
          />
        )}
        {activeTab === "audit" && <AuditTimeline initialAudits={initialAudits} />}
      </div>
    </div>
  );
}
