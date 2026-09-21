import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailId, eventType = "email.delivered", bounceReason } = body;

    if (!emailId) {
      return NextResponse.json({ error: "emailId is required" }, { status: 400 });
    }

    const emailLog = await prisma.emailDeliveryLog.findFirst({
      where: { resendId: emailId },
    });

    if (!emailLog) {
      return NextResponse.json({ error: "No matching email delivery log found for resendId: " + emailId }, { status: 404 });
    }

    // Construct standard Resend webhook payload
    const simulatedPayload = {
      type: eventType,
      created_at: new Date().toISOString(),
      data: {
        email_id: emailId,
        to: [emailLog.recipient],
        from: "onboarding@resend.dev",
        subject: emailLog.subject,
        bounce: eventType === "email.bounced" ? {
          message: bounceReason || "550 5.1.1 The email account that you tried to reach does not exist",
          code: 550,
        } : undefined,
      },
    };

    // Forward to internal webhook ingestion endpoint
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${appUrl}/api/webhooks/resend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "svix-signature": `v1,mock_signature_${Date.now()}`,
      },
      body: JSON.stringify(simulatedPayload),
    });

    const result = await res.json();
    return NextResponse.json({
      success: true,
      simulatedPayload,
      webhookResult: result,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
