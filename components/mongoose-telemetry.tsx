"use client";

import React, { useState } from "react";
import { Cpu, Server, Database, Activity, RefreshCw } from "lucide-react";

export default function MongooseTelemetry() {
  const [telemetryEvents] = useState([
    {
      id: "doc_obj_66f018a1b942e01",
      nodeId: "cluster-node-nv-01",
      clusterRegion: "us-east-virginia",
      cpuUsagePct: 42.8,
      memoryUsagePct: 68.4,
      activeRequests: 1840,
      payloadMetadata: {
        hypervisor: "KVM-Nexus-v4",
        thermalState: "OPTIMAL",
        gpuVramAllocatedGb: 74.2,
      },
      timestamp: new Date().toISOString(),
    },
    {
      id: "doc_obj_66f018a1b942e02",
      nodeId: "cluster-node-fra-03",
      clusterRegion: "eu-central-frankfurt",
      cpuUsagePct: 81.3,
      memoryUsagePct: 89.1,
      activeRequests: 4210,
      payloadMetadata: {
        hypervisor: "KVM-Nexus-v4",
        thermalState: "ELEVATED",
        gpuVramAllocatedGb: 156.8,
      },
      timestamp: new Date(Date.now() - 60000).toISOString(),
    },
    {
      id: "doc_obj_66f018a1b942e03",
      nodeId: "cluster-node-tyo-02",
      clusterRegion: "ap-northeast-tokyo",
      cpuUsagePct: 29.5,
      memoryUsagePct: 45.0,
      activeRequests: 920,
      payloadMetadata: {
        hypervisor: "KVM-Nexus-v4",
        thermalState: "OPTIMAL",
        gpuVramAllocatedGb: 32.0,
      },
      timestamp: new Date(Date.now() - 120000).toISOString(),
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white font-mono">
            <Cpu className="h-6 w-6 text-emerald-400" />
            <span>OBJECT DATABASE TELEMETRY (MONGOOSE / MONGODB)</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            CO4 Extension: Dual Database Architecture Connecting Relational (Prisma) & Object Store (Mongoose)
          </p>
        </div>

        <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-xs text-emerald-300">
          ODM: Mongoose v8.7 & BSON Schema
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {telemetryEvents.map((doc) => (
          <div key={doc.id} className="cyber-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                <Server className="h-3.5 w-3.5 text-emerald-400" />
                <span>{doc.nodeId}</span>
              </span>
              <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {doc.clusterRegion}
              </span>
            </div>

            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-slate-400">
                <span>CPU Usage:</span>
                <span className="font-bold text-cyan-300">{doc.cpuUsagePct}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400"
                  style={{ width: `${doc.cpuUsagePct}%` }}
                />
              </div>

              <div className="flex justify-between text-slate-400 pt-1">
                <span>Memory Footprint:</span>
                <span className="font-bold text-purple-300">{doc.memoryUsagePct}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-400"
                  style={{ width: `${doc.memoryUsagePct}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-black/40 p-3 font-mono text-[11px] text-slate-400">
              <span className="text-slate-500 block mb-1">Unstructured Document BSON:</span>
              <pre className="text-slate-300 overflow-x-auto text-[10px]">
                {JSON.stringify(doc.payloadMetadata, null, 2)}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
