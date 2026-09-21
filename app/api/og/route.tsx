import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "NEXUS QUANTUM CLOUD";
  const subtitle = searchParams.get("subtitle") || "Automated Relational Ledger & Resend Lifecycle Engine";
  const role = searchParams.get("role") || "ADMIN";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#05070E",
          backgroundImage: "radial-gradient(circle at 25px 25px, #141f36 2%, transparent 0%), radial-gradient(circle at 75px 75px, #141f36 2%, transparent 0%)",
          backgroundSize: "100px 100px",
          padding: "60px 80px",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
          border: "4px solid #1E293B",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              backgroundColor: "#00F0FF",
              boxShadow: "0 0 20px #00F0FF",
            }}
          />
          <span style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "3px", color: "#00F0FF" }}>
            NEXUS CORE OS // CO3 + CO4 SPEC
          </span>
          <div
            style={{
              marginLeft: "24px",
              backgroundColor: "rgba(0, 240, 255, 0.12)",
              color: "#00F0FF",
              padding: "6px 16px",
              borderRadius: "999px",
              fontSize: "14px",
              fontWeight: 700,
              border: "1px solid rgba(0, 240, 255, 0.4)",
            }}
          >
            CLEARANCE: {role}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div
            style={{
              fontSize: "56px",
              fontWeight: 900,
              letterSpacing: "-1.5px",
              background: "linear-gradient(to right, #FFFFFF, #94A3B8)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: "24px", color: "#94A3B8", maxWidth: "900px" }}>
            {subtitle}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid #1E293B",
            paddingTop: "24px",
          }}
        >
          <div style={{ display: "flex", gap: "32px", fontSize: "16px", color: "#64748B" }}>
            <span>• Prisma ORM Relational Seeder</span>
            <span>• Edge Middleware RBAC</span>
            <span>• React Email & Resend Webhooks</span>
          </div>
          <div style={{ fontSize: "16px", color: "#00F0FF", fontWeight: 700 }}>
            v2.4.0 PROD
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
