import { NextRequest, NextResponse } from "next/server";
import { DEMO_PROFILES, UserRole } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const roleCookie = request.cookies.get("nexus_session_role")?.value as UserRole | undefined;
  const role = roleCookie && DEMO_PROFILES[roleCookie] ? roleCookie : "ADMIN";
  const user = DEMO_PROFILES[role];

  return NextResponse.json({
    authenticated: true,
    user,
    availableProfiles: DEMO_PROFILES,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const targetRole = body.role as UserRole;

    if (!targetRole || !DEMO_PROFILES[targetRole]) {
      return NextResponse.json({ error: "Invalid role specified. Must be ADMIN, MEMBER, or GUEST." }, { status: 400 });
    }

    const response = NextResponse.json({
      success: true,
      message: `Active session role switched to ${targetRole}`,
      user: DEMO_PROFILES[targetRole],
    });

    // Set HTTP-Only session cookie
    response.cookies.set({
      name: "nexus_session_role",
      value: targetRole,
      path: "/",
      httpOnly: false, // readable for client-side visual inspection
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
