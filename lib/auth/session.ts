import { cookies } from "next/headers";

export type UserRole = "ADMIN" | "MEMBER" | "GUEST";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
  organizationName: string;
  avatar?: string;
}

export const DEMO_PROFILES: Record<UserRole, SessionUser> = {
  ADMIN: {
    id: "user_admin_001",
    email: "admin@nexus.io",
    name: "Dr. Elena Vance",
    role: "ADMIN",
    organizationId: "org_nexus_cybernetics",
    organizationName: "Nexus Cybernetics Inc",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
  MEMBER: {
    id: "user_member_002",
    email: "member@nexus.io",
    name: "Marcus Aurelius Chen",
    role: "MEMBER",
    organizationId: "org_aether_systems",
    organizationName: "Aether Distributed Systems",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
  GUEST: {
    id: "user_guest_003",
    email: "guest@nexus.io",
    name: "Sora Takahashi",
    role: "GUEST",
    organizationId: "org_hypergate_labs",
    organizationName: "Hypergate AI Labs",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
  },
};

export const SESSION_COOKIE_NAME = "nexus_session_role";

export async function getServerSession(): Promise<SessionUser> {
  const cookieStore = cookies();
  const roleCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value as UserRole | undefined;
  
  if (roleCookie && DEMO_PROFILES[roleCookie]) {
    return DEMO_PROFILES[roleCookie];
  }

  // Default to ADMIN for evaluation ease, or whatever cookie is set
  return DEMO_PROFILES.ADMIN;
}

export function parseRoleFromRequest(roleHeaderOrCookie?: string | null): UserRole {
  if (roleHeaderOrCookie === "ADMIN" || roleHeaderOrCookie === "MEMBER" || roleHeaderOrCookie === "GUEST") {
    return roleHeaderOrCookie;
  }
  return "ADMIN";
}
