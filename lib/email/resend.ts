import { Resend } from "resend";
import { render } from "@react-email/render";
import { prisma } from "@/lib/prisma";
import { TransactionReceiptEmail, TransactionReceiptEmailProps } from "@/emails/TransactionReceiptEmail";
import { SecurityAlertEmail, SecurityAlertEmailProps } from "@/emails/SecurityAlertEmail";
import { RoleElevatedEmail, RoleElevatedEmailProps } from "@/emails/RoleElevatedEmail";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export type EmailTemplateType = "TRANSACTION_RECEIPT" | "SECURITY_ALERT" | "ROLE_ELEVATION";

export interface SendEmailOptions {
  template: EmailTemplateType;
  recipient: string;
  subject?: string;
  props?: any;
}

export async function dispatchTransactionalEmail(options: SendEmailOptions) {
  const { template, recipient, props = {} } = options;
  let subject = options.subject;
  let emailComponent: React.ReactElement;

  switch (template) {
    case "TRANSACTION_RECEIPT":
      subject = subject || `[Confirmed] Ledger Transaction ${props.referenceCode || "TXN-AUTO"}`;
      emailComponent = TransactionReceiptEmail({
        recipientName: props.recipientName || recipient,
        referenceCode: props.referenceCode || `TXN-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        amount: props.amount || 1500,
        currency: props.currency || "USD",
        type: props.type || "INFRA_ALLOCATION",
        organizationName: props.organizationName || "Nexus Cybernetics",
        timestamp: new Date().toUTCString(),
      });
      break;

    case "SECURITY_ALERT":
      subject = subject || `[URGENT] Security Anomaly Detected: ${props.anomalyType || "UNAUTHORIZED_BURST"}`;
      emailComponent = SecurityAlertEmail({
        recipientEmail: recipient,
        anomalyType: props.anomalyType || "UNAUTHORIZED_PRIVILEGE_PROBE",
        ipAddress: props.ipAddress || "198.51.100.42",
        userAgent: props.userAgent || "NexusEdgeProxy/2.4",
        severity: props.severity || "CRITICAL",
        timestamp: new Date().toUTCString(),
      });
      break;

    case "ROLE_ELEVATION":
      subject = subject || `[Access Updated] Role Permissions Shifted to ${props.newRole || "ADMIN"}`;
      emailComponent = RoleElevatedEmail({
        userName: props.userName || recipient.split("@")[0],
        previousRole: props.previousRole || "MEMBER",
        newRole: props.newRole || "ADMIN",
        organizationName: props.organizationName || "Nexus Cloud Grid",
        grantedBy: "Nexus Policy Engine",
        timestamp: new Date().toUTCString(),
      });
      break;

    default:
      throw new Error(`Unsupported template type: ${template}`);
  }

  // 1. Render React Email component to clean standard HTML
  const html = await render(emailComponent);

  let resendId: string;
  let isSimulated = true;

  // 2. Dispatch via Resend API if API key exists
  if (resend && resendApiKey && resendApiKey.startsWith("re_")) {
    try {
      const response = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to: recipient,
        subject,
        html,
      });

      if (response.error) {
        console.warn("Resend API rejected dispatch, falling back to sandbox mode:", response.error);
        resendId = `re_sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      } else {
        resendId = response.data?.id || `re_live_${Date.now()}`;
        isSimulated = false;
      }
    } catch (error) {
      console.warn("Resend dispatch error, falling back to sandbox mode:", error);
      resendId = `re_sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    }
  } else {
    // High-Fidelity Simulation Sandbox Mode
    resendId = `re_sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  // 3. Persist in Prisma Relational Database (EmailDeliveryLog)
  const deliveryRecord = await prisma.emailDeliveryLog.create({
    data: {
      resendId,
      recipient,
      subject,
      templateType: template,
      status: "SENT",
      eventsCount: 1,
      metadata: JSON.stringify({
        isSimulated,
        provider: "Resend",
        clientVersion: "@react-email/components v0.0.25",
        timestamp: new Date().toISOString(),
      }),
    },
  });

  return {
    success: true,
    resendId,
    deliveryRecordId: deliveryRecord.id,
    isSimulated,
    subject,
    recipient,
    html,
  };
}
