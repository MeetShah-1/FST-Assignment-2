"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth/session";
import { dispatchTransactionalEmail } from "@/lib/email/resend";

export async function triggerSecurityAnomalyAction(anomalyType = "BRUTE_FORCE_CREDENTIAL_STUFFING") {
  try {
    const session = await getServerSession();

    // 1. Record critical security audit log
    const audit = await prisma.auditLog.create({
      data: {
        action: "SECURITY_ANOMALY_TRIGGERED",
        entityType: "SECURITY",
        entityId: `ANOM-${Date.now()}`,
        ipAddress: "198.51.100.88",
        userAgent: "UnknownBot/3.1 (ScraperAgent)",
        severity: "CRITICAL",
        details: JSON.stringify({
          anomalyType,
          actor: session.email,
          defenseResponse: "EDGE_IP_TEMP_QUARANTINE",
        }),
        userId: session.id,
      },
    });

    // 2. Dispatch transactional security alert email via React Email & Resend
    const emailResult = await dispatchTransactionalEmail({
      template: "SECURITY_ALERT",
      recipient: session.email,
      props: {
        recipientEmail: session.email,
        anomalyType,
        ipAddress: "198.51.100.88",
        userAgent: "UnknownBot/3.1 (ScraperAgent)",
        severity: "CRITICAL",
      },
    });

    revalidatePath("/");

    return {
      success: true,
      auditId: audit.id,
      emailResult,
      message: `Critical security alert dispatched to ${session.email} and recorded in relational audit log.`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to trigger security anomaly",
    };
  }
}
