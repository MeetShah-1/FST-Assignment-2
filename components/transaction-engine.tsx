"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema, TransactionInput, createTransactionAction } from "@/app/actions/transactionActions";
import { useNexusStore } from "@/lib/store/nexusStore";
import {
  Send,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Lock,
  DollarSign,
  Mail,
  FileText,
  Clock,
  Layers,
} from "lucide-react";
import confetti from "canvas-confetti";

interface TransactionItem {
  id: string;
  referenceCode: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  description: string;
  createdAt: string | Date;
  user?: { email: string; name: string } | null;
}

export default function TransactionEngine({ initialTransactions }: { initialTransactions: TransactionItem[] }) {
  const { activeRole, playSfx } = useNexusStore();
  const [transactions, setTransactions] = useState<TransactionItem[]>(initialTransactions);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: 2500,
      type: "INFRA_ALLOCATION",
      currency: "USD",
      recipientEmail: "elena.vance@nexus-mesh.net",
      description: "Q3 GPU Cluster Quota Expansion (H100 Node Array)",
      dispatchNotification: true,
    },
  });

  const onSubmit = async (data: TransactionInput) => {
    setServerError(null);
    setSuccessMessage(null);
    playSfx("warp");

    const result = await createTransactionAction(data);

    if (!result.success) {
      setServerError(result.error || "Transaction mutation failed");
      playSfx("error");
      return;
    }

    setSuccessMessage(result.message || "Transaction successfully committed!");
    playSfx("success");
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.3 },
      colors: ["#00F0FF", "#10B981", "#9D00FF"],
    });

    if (result.transaction) {
      setTransactions((prev) => [result.transaction as any, ...prev]);
    }

    reset({
      amount: 1500,
      type: "INFRA_ALLOCATION",
      currency: "USD",
      recipientEmail: "marcus.chen@nexus-mesh.net",
      description: "High-throughput API token provision",
      dispatchNotification: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white font-mono">
            <Send className="h-6 w-6 text-cyan-400" />
            <span>TRANSACTION LEDGER & LIFECYCLE MUTATIONS</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Part C (CO2, CO4): End-to-End Type-Safe Server Action Form Mutation with Resend Dispatch
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 font-mono text-xs text-cyan-300">
            Zod Schema Validated
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Form Card */}
        <div className="cyber-card rounded-2xl p-6 lg:col-span-5 space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-mono text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>Initiate Cloud Quota Mutation</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Mutates Prisma relational database and triggers automated React Email dispatch via Resend.
            </p>
          </div>

          {serverError && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs font-mono text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-start gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs font-mono text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Amount & Currency */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-mono text-slate-300">Amount:</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="number"
                    step="any"
                    {...register("amount", { valueAsNumber: true })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/80 pl-9 pr-3 py-2 text-xs font-mono text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                {errors.amount && (
                  <p className="text-[10px] text-rose-400 font-mono">{errors.amount.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">Currency:</label>
                <select
                  {...register("currency")}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-mono text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>
            </div>

            {/* Type */}
            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-300">Allocation Type:</label>
              <select
                {...register("type")}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-mono text-white focus:border-cyan-400 focus:outline-none"
              >
                <option value="INFRA_ALLOCATION">INFRA ALLOCATION (Compute Quota)</option>
                <option value="WALLET_FUND">WALLET FUND (Treasury Top-Up)</option>
                <option value="API_CREDIT">API CREDIT (Inference Credits)</option>
                <option value="TRANSFER">TRANSFER (Inter-Tenant Shift)</option>
              </select>
              {errors.type && (
                <p className="text-[10px] text-rose-400 font-mono">{errors.type.message}</p>
              )}
            </div>

            {/* Recipient Email */}
            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-300">Recipient Email (Resend Target):</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  {...register("recipientEmail")}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/80 pl-9 pr-3 py-2 text-xs font-mono text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
              {errors.recipientEmail && (
                <p className="text-[10px] text-rose-400 font-mono">{errors.recipientEmail.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-300">Description / Memo:</label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  {...register("description")}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/80 pl-9 pr-3 py-2 text-xs font-mono text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
              {errors.description && (
                <p className="text-[10px] text-rose-400 font-mono">{errors.description.message}</p>
              )}
            </div>

            {/* Send Notification Checkbox */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-3">
              <input
                type="checkbox"
                id="dispatchNotification"
                {...register("dispatchNotification")}
                className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-cyan-400 accent-cyan-400"
              />
              <label htmlFor="dispatchNotification" className="text-xs font-mono text-slate-300 cursor-pointer">
                Autonomously dispatch TransactionReceiptEmail via Resend
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || activeRole === "GUEST"}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 py-3 font-mono text-xs font-bold text-cyan-300 transition-all hover:bg-cyan-500/30 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] disabled:opacity-50"
            >
              {activeRole === "GUEST" ? (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Mutations Prohibited (Guest Role)</span>
                </>
              ) : isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                  <span>Committing to Prisma & Dispatching Email...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Execute Mutation via Server Action</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Recent Transactions Table */}
        <div className="cyber-card flex flex-col rounded-2xl p-6 lg:col-span-7">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                Relational Transactions Ledger
              </h3>
              <p className="text-[11px] text-slate-400">
                Live records with foreign keys linked to Users and Organizations
              </p>
            </div>
            <span className="font-mono text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
              {transactions.length} Total Records
            </span>
          </div>

          <div className="mt-4 flex-1 overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="border-b border-slate-800 bg-slate-900/60 text-slate-400">
                <tr>
                  <th className="px-3 py-2">Reference</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Account</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {transactions.slice(0, 10).map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-3 py-2 font-bold text-cyan-400">{tx.referenceCode}</td>
                    <td className="px-3 py-2 font-semibold text-white">
                      {tx.currency} ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-2 text-slate-400 text-[11px]">
                      {tx.type.replace("_", " ")}
                    </td>
                    <td className="px-3 py-2 text-slate-300 text-[11px]">
                      {tx.user?.email || "system@nexus.io"}
                    </td>
                    <td className="px-3 py-2">
                      <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                        {tx.status}
                      </span>
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
