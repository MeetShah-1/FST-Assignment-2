"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth/session";
import { dispatchTransactionalEmail } from "@/lib/email/resend";

export const transactionSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Amount must be a numeric value" })
    .positive("Amount must be greater than zero")
    .max(500000, "Maximum single transaction limit is $500,000"),
  type: z.enum(["INFRA_ALLOCATION", "WALLET_FUND", "API_CREDIT", "TRANSFER"], {
    errorMap: () => ({ message: "Select a valid allocation type" }),
  }),
  currency: z.enum(["USD", "EUR", "GBP", "JPY"]).default("USD"),
  recipientEmail: z.string().email("A valid recipient email is required for transactional lifecycle dispatch"),
  description: z.string().min(5, "Description must be at least 5 characters").max(150),
  dispatchNotification: z.boolean().default(true),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

export async function createTransactionAction(rawInput: unknown) {
  try {
    // 1. Verify User Session & Role-Based Access Control (CO3)
    const session = await getServerSession();
    if (session.role === "GUEST") {
      return {
        success: false,
        error: "ACCESS DENIED: Guest accounts operate in read-only mode and cannot execute financial mutations.",
        code: "RBAC_GUEST_MUTATION_RESTRICTION",
      };
    }

    // 2. Server-side Zod Validation & Sanitization
    const parsed = transactionSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        validationErrors: parsed.error.flatten().fieldErrors,
        error: "Validation failed on payload sanitization",
      };
    }

    const { amount, type, currency, recipientEmail, description, dispatchNotification } = parsed.data;

    // 3. Find or create user relation in Prisma
    let targetUser = await prisma.user.findFirst({
      where: { email: recipientEmail.toLowerCase() },
    });

    let organization = await prisma.organization.findFirst();
    if (!organization) {
      organization = await prisma.organization.create({
        data: {
          name: "Nexus Default Cloud",
          slug: "nexus-default",
          tier: "ENTERPRISE",
          creditBalance: 100000.0,
        },
      });
    }

    if (!targetUser) {
      targetUser = await prisma.user.create({
        data: {
          email: recipientEmail.toLowerCase(),
          name: recipientEmail.split("@")[0].replace(".", " "),
          role: "MEMBER",
          organizationId: organization.id,
        },
      });
    }

    // 4. Generate unique reference code
    const refCode = `TXN-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 5. Execute Relational Transaction Mutation in Prisma
    const newTransaction = await prisma.transaction.create({
      data: {
        referenceCode: refCode,
        amount,
        currency,
        status: "COMPLETED",
        type,
        description,
        userId: targetUser.id,
        organizationId: organization.id,
        metadata: JSON.stringify({
          initiatedBy: session.email,
          initiatorRole: session.role,
          clientTimestamp: new Date().toISOString(),
          edgeNode: "edge-us-east-proxy-01",
        }),
      },
      include: {
        user: true,
        organization: true,
      },
    });

    // 6. Append Immutable AuditLog Entry
    await prisma.auditLog.create({
      data: {
        action: "TRANSACTION_CREATED",
        entityType: "TRANSACTION",
        entityId: newTransaction.id,
        ipAddress: "127.0.0.1",
        userAgent: "NexusApp/2.4 (NextJS-AppRouter)",
        severity: amount > 50000 ? "WARNING" : "INFO",
        details: JSON.stringify({
          referenceCode: refCode,
          amount,
          currency,
          type,
          actor: session.email,
        }),
        userId: session.id === targetUser.id ? targetUser.id : undefined,
      },
    });

    // 7. Dispatch Transactional Email via React Email & Resend (CO4)
    let emailResult = null;
    if (dispatchNotification) {
      emailResult = await dispatchTransactionalEmail({
        template: "TRANSACTION_RECEIPT",
        recipient: recipientEmail,
        props: {
          recipientName: targetUser.name,
          referenceCode: refCode,
          amount,
          currency,
          type,
          organizationName: organization.name,
          clusterNode: "nexus-edge-vault-01",
        },
      });
    }

    revalidatePath("/");

    return {
      success: true,
      transaction: newTransaction,
      emailResult,
      message: `Transaction ${refCode} successfully executed and recorded in relational database!`,
    };
  } catch (error: any) {
    console.error("Failed to create transaction:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred during database mutation",
    };
  }
}
