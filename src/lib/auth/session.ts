import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { env } from "../env";

export const SESSION_COOKIE_NAME = "devlens_session";

export type UserRole = "ADMIN" | "RECRUITER" | "VIEWER";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
}

export function createSessionToken(user: SessionUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    env.AUTH_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifySessionToken(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, env.AUTH_SECRET) as any;
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name || null,
      role: (decoded.role as UserRole) || "RECRUITER",
    };
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN_ADMIN_REQUIRED");
  }
  return user;
}

export function isAdminUser(user: SessionUser | null): boolean {
  return user?.role === "ADMIN";
}
