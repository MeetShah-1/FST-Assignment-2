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

export interface RoleElevatedEmailProps {
  userName?: string;
  previousRole?: string;
  newRole?: string;
  organizationName?: string;
  grantedBy?: string;
  timestamp?: string;
}

export const RoleElevatedEmail = ({
  userName = "Engineer",
  previousRole = "MEMBER",
  newRole = "ADMIN",
  organizationName = "Nexus Cybernetics Inc",
  grantedBy = "System Policy Engine",
  timestamp = new Date().toUTCString(),
}: RoleElevatedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Access Permissions Updated: Role Elevated to {newRole}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Text style={badge}>RBAC ROLE MODIFICATION</Text>
            <Heading style={heading}>Permissions Updated</Heading>
            <Text style={subheading}>
              Your account clearance level within {organizationName} has been modified.
            </Text>
          </Section>

          <Section style={roleCard}>
            <div style={transitionRow}>
              <div style={roleBox}>
                <span style={roleLabel}>PREVIOUS</span>
                <span style={roleValDim}>{previousRole}</span>
              </div>
              <div style={arrow}>➔</div>
              <div style={roleBoxActive}>
                <span style={roleLabelActive}>NEW ROLE</span>
                <span style={roleValGlow}>{newRole}</span>
              </div>
            </div>
          </Section>

          <Section style={detailsSection}>
            <Text style={sectionTitle}>MODIFICATION AUDIT</Text>
            <Hr style={divider} />

            <div style={detailRow}>
              <span style={detailLabel}>Account Name:</span>
              <span style={detailValue}>{userName}</span>
            </div>

            <div style={detailRow}>
              <span style={detailLabel}>Authorizing Entity:</span>
              <span style={detailValue}>{grantedBy}</span>
            </div>

            <div style={detailRow}>
              <span style={detailLabel}>Effective Timestamp:</span>
              <span style={detailValue}>{timestamp}</span>
            </div>
          </Section>

          <Hr style={divider} />

          <Section style={footerSection}>
            <Text style={footerText}>
              Security policy: Changes take effect across all edge middleware proxies immediately.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default RoleElevatedEmail;

const main = {
  backgroundColor: "#05070e",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  color: "#e2e8f0",
  padding: "24px 0",
};

const container = {
  backgroundColor: "#0a0f1d",
  border: "1px solid #7c3aed",
  borderRadius: "12px",
  margin: "0 auto",
  maxWidth: "580px",
  padding: "32px 28px",
  boxShadow: "0 10px 30px -10px rgba(124, 58, 237, 0.2)",
};

const headerSection = {
  marginBottom: "20px",
};

const badge = {
  color: "#a78bfa",
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

const roleCard = {
  backgroundColor: "#130f28",
  border: "1px solid rgba(167, 139, 250, 0.3)",
  borderRadius: "8px",
  padding: "18px",
  marginBottom: "24px",
};

const transitionRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-around",
};

const roleBox = {
  textAlign: "center" as const,
};

const roleBoxActive = {
  textAlign: "center" as const,
};

const roleLabel = {
  color: "#64748b",
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "1px",
  display: "block",
  marginBottom: "4px",
};

const roleLabelActive = {
  color: "#a78bfa",
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "1px",
  display: "block",
  marginBottom: "4px",
};

const roleValDim = {
  color: "#94a3b8",
  fontSize: "18px",
  fontWeight: 700,
};

const roleValGlow = {
  color: "#c084fc",
  fontSize: "22px",
  fontWeight: 900,
};

const arrow = {
  color: "#7c3aed",
  fontSize: "20px",
  fontWeight: 700,
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
  width: "40%",
};

const detailValue = {
  color: "#e2e8f0",
  fontSize: "13px",
  fontWeight: 600,
  display: "inline-block",
  width: "60%",
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
