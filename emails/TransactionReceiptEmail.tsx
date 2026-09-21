import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export interface TransactionReceiptEmailProps {
  recipientName?: string;
  referenceCode?: string;
  amount?: number;
  currency?: string;
  type?: string;
  organizationName?: string;
  timestamp?: string;
  clusterNode?: string;
}

export const TransactionReceiptEmail = ({
  recipientName = "Valued Engineer",
  referenceCode = "TXN-8821-NEXUS",
  amount = 12500.0,
  currency = "USD",
  type = "INFRA_ALLOCATION",
  organizationName = "Nexus Cybernetics Inc",
  timestamp = new Date().toUTCString(),
  clusterNode = "edge-us-east-cluster-04",
}: TransactionReceiptEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Transaction Confirmation: {referenceCode} ({currency} {amount.toLocaleString()})</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <Text style={brandLabel}>NEXUS QUANTUM // TRANSACTION NOTIFICATION</Text>
            <Heading style={heading}>Transaction Confirmed</Heading>
            <Text style={subheading}>
              Automated Relational Ledger Lifecycle Notification
            </Text>
          </Section>

          {/* Amount Badge */}
          <Section style={amountCard}>
            <Text style={amountLabel}>Total Settled Volume</Text>
            <Text style={amountValue}>
              {currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
            <Text style={badgeText}>STATUS: COMPLETED & RECORDED IN PRISMA ORM</Text>
          </Section>

          {/* Details Table */}
          <Section style={detailsSection}>
            <Text style={sectionTitle}>TRANSACTION TELEMETRY</Text>
            <Hr style={divider} />
            
            <div style={detailRow}>
              <span style={detailLabel}>Reference Code:</span>
              <span style={detailValueCode}>{referenceCode}</span>
            </div>
            
            <div style={detailRow}>
              <span style={detailLabel}>Allocation Type:</span>
              <span style={detailValue}>{type.replace("_", " ")}</span>
            </div>

            <div style={detailRow}>
              <span style={detailLabel}>Tenant / Organization:</span>
              <span style={detailValue}>{organizationName}</span>
            </div>

            <div style={detailRow}>
              <span style={detailLabel}>Account Holder:</span>
              <span style={detailValue}>{recipientName}</span>
            </div>

            <div style={detailRow}>
              <span style={detailLabel}>Edge Cluster Node:</span>
              <span style={detailValue}>{clusterNode}</span>
            </div>

            <div style={detailRow}>
              <span style={detailLabel}>Timestamp:</span>
              <span style={detailValue}>{timestamp}</span>
            </div>
          </Section>

          <Hr style={divider} />

          {/* Footer Note */}
          <Section style={footerSection}>
            <Text style={footerText}>
              This transactional message was dispatched autonomously via Resend API and React Email
              following a verified Prisma database mutation with foreign key consistency.
            </Text>
            <Text style={footerCopyright}>
              Nexus Core Ledger Infrastructure • Automated Verification Engine
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default TransactionReceiptEmail;

// Styles
const main = {
  backgroundColor: "#05070e",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  color: "#e2e8f0",
  padding: "24px 0",
};

const container = {
  backgroundColor: "#0a0f1d",
  border: "1px solid #1e293b",
  borderRadius: "12px",
  margin: "0 auto",
  maxWidth: "580px",
  padding: "32px 28px",
  boxShadow: "0 10px 30px -10px rgba(0, 240, 255, 0.15)",
};

const headerSection = {
  marginBottom: "24px",
};

const brandLabel = {
  color: "#00f0ff",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "1.5px",
  textTransform: "uppercase" as const,
  margin: "0 0 8px 0",
};

const heading = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: 800,
  letterSpacing: "-0.5px",
  margin: "0 0 6px 0",
};

const subheading = {
  color: "#94a3b8",
  fontSize: "14px",
  margin: "0",
};

const amountCard = {
  backgroundColor: "#0d1527",
  border: "1px solid #00f0ff33",
  borderRadius: "8px",
  padding: "20px",
  textAlign: "center" as const,
  marginBottom: "24px",
};

const amountLabel = {
  color: "#94a3b8",
  fontSize: "12px",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0 0 6px 0",
};

const amountValue = {
  color: "#00f0ff",
  fontSize: "32px",
  fontWeight: 900,
  letterSpacing: "-1px",
  margin: "0 0 10px 0",
};

const badgeText = {
  color: "#10b981",
  fontSize: "11px",
  fontWeight: 700,
  backgroundColor: "rgba(16, 185, 129, 0.12)",
  padding: "4px 10px",
  borderRadius: "9999px",
  display: "inline-block",
  letterSpacing: "0.5px",
  margin: "0",
};

const detailsSection = {
  marginBottom: "24px",
};

const sectionTitle = {
  color: "#cbd5e1",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "1px",
  margin: "0 0 10px 0",
};

const detailRow = {
  display: "flex",
  justifyContent: "space-between",
  padding: "8px 0",
  borderBottom: "1px solid #141f36",
};

const detailLabel = {
  color: "#64748b",
  fontSize: "13px",
  display: "inline-block",
  width: "45%",
};

const detailValue = {
  color: "#e2e8f0",
  fontSize: "13px",
  fontWeight: 600,
  display: "inline-block",
  width: "55%",
  textAlign: "right" as const,
};

const detailValueCode = {
  color: "#38bdf8",
  fontFamily: "monospace",
  fontSize: "13px",
  fontWeight: 700,
  display: "inline-block",
  width: "55%",
  textAlign: "right" as const,
};

const divider = {
  borderColor: "#1e293b",
  margin: "20px 0",
};

const footerSection = {
  textAlign: "center" as const,
};

const footerText = {
  color: "#64748b",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0 0 10px 0",
};

const footerCopyright = {
  color: "#475569",
  fontSize: "11px",
  margin: "0",
};
