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

export interface SecurityAlertEmailProps {
  recipientEmail?: string;
  anomalyType?: string;
  ipAddress?: string;
  userAgent?: string;
  severity?: string;
  timestamp?: string;
}

export const SecurityAlertEmail = ({
  recipientEmail = "security@nexus.io",
  anomalyType = "HIGH_FREQUENCY_PRIVILEGE_ESCALATION",
  ipAddress = "192.168.1.104",
  userAgent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
  severity = "CRITICAL",
  timestamp = new Date().toUTCString(),
}: SecurityAlertEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>[SECURITY ALERT] {severity} Anomaly Detected on Nexus Cloud Node</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={alertHeader}>
            <Text style={alertTag}>⚠️ NEXUS AUTOMATED AUDIT DISPATCH</Text>
            <Heading style={heading}>Critical Security Anomaly</Heading>
            <Text style={subheading}>
              An automated audit threshold was triggered on your multi-tenant account.
            </Text>
          </Section>

          <Section style={threatCard}>
            <Text style={threatLabel}>INCIDENT CLASSIFICATION</Text>
            <Text style={threatValue}>{anomalyType.replace(/_/g, " ")}</Text>
            <span style={criticalBadge}>SEVERITY: {severity}</span>
          </Section>

          <Section style={detailsSection}>
            <Text style={sectionTitle}>FORENSIC TRACE LOG</Text>
            <Hr style={divider} />

            <div style={detailRow}>
              <span style={detailLabel}>Origin IP:</span>
              <span style={detailCode}>{ipAddress}</span>
            </div>

            <div style={detailRow}>
              <span style={detailLabel}>User Agent:</span>
              <span style={detailValue}>{userAgent}</span>
            </div>

            <div style={detailRow}>
              <span style={detailLabel}>Target Account:</span>
              <span style={detailValue}>{recipientEmail}</span>
            </div>

            <div style={detailRow}>
              <span style={detailLabel}>Timestamp:</span>
              <span style={detailValue}>{timestamp}</span>
            </div>
          </Section>

          <Hr style={divider} />

          <Section style={footerSection}>
            <Text style={footerText}>
              Audit logs are cryptographically immutable in Nexus Core relational database.
              If this activity was not initiated by you, rotate your session credentials immediately.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default SecurityAlertEmail;

const main = {
  backgroundColor: "#05070e",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  color: "#e2e8f0",
  padding: "24px 0",
};

const container = {
  backgroundColor: "#0a0f1d",
  border: "1px solid #dc2626",
  borderRadius: "12px",
  margin: "0 auto",
  maxWidth: "580px",
  padding: "32px 28px",
  boxShadow: "0 10px 30px -10px rgba(220, 38, 38, 0.25)",
};

const alertHeader = {
  marginBottom: "20px",
};

const alertTag = {
  color: "#f87171",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "1.5px",
  margin: "0 0 8px 0",
};

const heading = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: 800,
  margin: "0 0 6px 0",
};

const subheading = {
  color: "#94a3b8",
  fontSize: "14px",
  margin: "0",
};

const threatCard = {
  backgroundColor: "rgba(220, 38, 38, 0.08)",
  border: "1px solid rgba(220, 38, 38, 0.3)",
  borderRadius: "8px",
  padding: "20px",
  textAlign: "center" as const,
  marginBottom: "24px",
};

const threatLabel = {
  color: "#fca5a5",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "1px",
  margin: "0 0 6px 0",
};

const threatValue = {
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: 800,
  margin: "0 0 10px 0",
};

const criticalBadge = {
  color: "#ffffff",
  backgroundColor: "#dc2626",
  fontSize: "11px",
  fontWeight: 800,
  padding: "4px 12px",
  borderRadius: "9999px",
  display: "inline-block",
  letterSpacing: "1px",
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
  width: "35%",
};

const detailValue = {
  color: "#e2e8f0",
  fontSize: "13px",
  fontWeight: 500,
  display: "inline-block",
  width: "65%",
  textAlign: "right" as const,
};

const detailCode = {
  color: "#f87171",
  fontFamily: "monospace",
  fontSize: "13px",
  fontWeight: 700,
  display: "inline-block",
  width: "65%",
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
  margin: "0",
};
