import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const startTime = Date.now();
  const { pathname } = request.nextUrl;

  // 1. Extract Role from Cookie or Custom Header (for API testing)
  const roleCookie = request.cookies.get("nexus_session_role")?.value;
  const roleHeader = request.headers.get("x-nexus-role");
  const currentRole = roleHeader || roleCookie || "ADMIN";

  // 2. Define Gate Rules
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const isProtectedMutation = pathname.startsWith("/api/transactions/create");

  // 3. Admin Route Enforcement
  if (isAdminRoute && currentRole !== "ADMIN") {
    const latency = Date.now() - startTime;
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        {
          error: "FORBIDDEN: Administrative clearance required",
          code: "EDGE_PROXY_RBAC_REJECTION",
          requiredRole: "ADMIN",
          currentRole,
          attemptedEndpoint: pathname,
          edgeNode: "edge-us-east-proxy-01",
          timestamp: new Date().toISOString(),
        },
        {
          status: 403,
          headers: {
            "x-nexus-edge-proxy": "v2.4-active",
            "x-nexus-role": currentRole,
            "x-nexus-authenticated": "false",
            "x-nexus-latency-ms": latency.toString(),
          },
        }
      );
    }

    // Redirect UI pages back to home with alert query parameter
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("edge_denied", "admin_clearance_required");
    url.searchParams.set("role", currentRole);
    return NextResponse.redirect(url);
  }

  // 4. Guest Mutation Protection
  if (isProtectedMutation && currentRole === "GUEST") {
    const latency = Date.now() - startTime;
    return NextResponse.json(
      {
        error: "FORBIDDEN: Guest accounts operate in strict read-only mode",
        code: "GUEST_RESTRICTION_POLICY",
        requiredRole: "MEMBER_OR_ADMIN",
        currentRole: "GUEST",
        timestamp: new Date().toISOString(),
      },
      {
        status: 403,
        headers: {
          "x-nexus-edge-proxy": "v2.4-active",
          "x-nexus-role": "GUEST",
          "x-nexus-authenticated": "true",
          "x-nexus-latency-ms": latency.toString(),
        },
      }
    );
  }

  // 5. Allowed - Forward with Injected Edge Proxy Headers
  const latency = Date.now() - startTime;
  const response = NextResponse.next();
  response.headers.set("x-nexus-edge-proxy", "v2.4-active");
  response.headers.set("x-nexus-role", currentRole);
  response.headers.set("x-nexus-authenticated", "true");
  response.headers.set("x-nexus-edge-latency-ms", latency.toString());

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/protected/:path*",
    "/api/transactions/create",
    "/api/webhooks/resend",
  ],
};
