import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_TTL_SECONDS = 12 * 60 * 60; // 12 hours

interface AdminSessionPayload {
  email: string;
  exp: number;
}

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set.");
  }
  return secret;
}

function sign(data: string): string {
  return createHmac("sha256", getSessionSecret()).update(data).digest("base64url");
}

/** Constant-time string compare — used for both the session signature and the login password. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export function createAdminSessionToken(email: string): string {
  const payload: AdminSessionPayload = { email, exp: Date.now() + SESSION_TTL_SECONDS * 1000 };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function verifyAdminSessionToken(token: string): AdminSessionPayload | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  if (!safeEqual(signature, sign(body))) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as AdminSessionPayload;
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) return null;
    if (typeof payload.email !== "string") return null;
    return payload;
  } catch {
    return null;
  }
}

/** Validates ADMIN_EMAIL/ADMIN_PASSWORD in constant time. Never logs the password. */
export function checkAdminCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL / ADMIN_PASSWORD are not set.");
  }
  return safeEqual(email, adminEmail) && safeEqual(password, adminPassword);
}

export const adminSessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};

/** For Route Handlers (e.g. an admin API) — never redirects, just tells you if the caller is authenticated. */
export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminSessionToken(token);
}

/** For Server Components/Pages under /admin — redirects to the login page if there's no valid session. */
export async function requireAdminSession(): Promise<AdminSessionPayload> {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}
