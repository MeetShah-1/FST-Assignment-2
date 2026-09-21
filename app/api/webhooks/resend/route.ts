import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("svix-signature") || request.headers.get("x-resend-signature");

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Malformed JSON payload" }, { status: 400 });
    }

    const eventType = payload.type || payload.event || "email.delivered";
    const emailId = payload.data?.email_id || payload.email_id || payload.data?.id;
    const recipient = payload.data?.to?.[0] || payload.to || "recipient@nexus.io";
    const bounceReason = payload.data?.bounce?.message || payload.reason || null;

    // 1. Ingest raw Webhook Event into Prisma
    const webhookRecord = await prisma.webhookEvent.create({
      data: {
        provider: "RESEND",
        eventType,
        payload: rawBody,
        signature: signature || "simulated_signature",
        status: "PROCESSED",
        processedAt: new Date(),
      },
    });

    // 2. Map Resend Event to EmailDeliveryLog status
    let mappedStatus: "DELIVERED" | "BOUNCED" | "OPENED" | "SENT" = "SENT";
    if (eventType === "email.delivered") mappedStatus = "DELIVERED";
    else if (eventType === "email.bounced") mappedStatus = "BOUNCED";
    else if (eventType === "email.opened" || eventType === "email.clicked") mappedStatus = "OPENED";

    // 3. Update existing EmailDeliveryLog if exists
    let updatedLog = null;
    if (emailId) {
      const existing = await prisma.emailDeliveryLog.findFirst({
        where: { resendId: emailId },
      });

      if (existing) {
        updatedLog = await prisma.emailDeliveryLog.update({
          where: { id: existing.id },
          data: {
            status: mappedStatus,
            bounceReason: mappedStatus === "BOUNCED" ? (bounceReason || "554 Delivery rejected by MTA") : existing.bounceReason,
            eventsCount: { increment: 1 },
          },
        });
      } else {
        // If not pre-recorded, create delivery log directly from webhook
        updatedLog = await prisma.emailDeliveryLog.create({
          data: {
            resendId: emailId,
            recipient,
            subject: payload.data?.subject || "Transactional Dispatch",
            templateType: "TRANSACTION_RECEIPT",
            status: mappedStatus,
            bounceReason: mappedStatus === "BOUNCED" ? (bounceReason || "554 Delivery rejected") : null,
            eventsCount: 1,
            metadata: JSON.stringify({ ingestedViaWebhook: true, eventType }),
          },
        });
      }
    }

    // 4. Log immutable AuditLog record
    await prisma.auditLog.create({
      data: {
        action: `WEBHOOK_${eventType.toUpperCase().replace(".", "_")}`,
        entityType: "EMAIL",
        entityId: emailId || webhookRecord.id,
        ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
        userAgent: request.headers.get("user-agent") || "ResendWebhookAgent/1.0",
        severity: mappedStatus === "BOUNCED" ? "WARNING" : "INFO",
        details: JSON.stringify({
          eventType,
          emailId,
          recipient,
          mappedStatus,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Webhook event ingested and persisted into Prisma",
      eventType,
      emailId,
      status: mappedStatus,
      webhookId: webhookRecord.id,
      updatedLogId: updatedLog?.id,
    });
  } catch (error: any) {
    console.error("Resend webhook error:", error);
    return NextResponse.json(
      { error: "Internal webhook ingestion error", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Query webhook status
  const totalEvents = await prisma.webhookEvent.count();
  const recentEvents = await prisma.webhookEvent.findMany({
    take: 15,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    active: true,
    totalEvents,
    recentEvents,
  });
}
