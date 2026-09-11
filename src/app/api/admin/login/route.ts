import { NextResponse } from "next/server";
import { checkAdminCredentials, createAdminSessionToken, adminSessionCookieOptions, ADMIN_SESSION_COOKIE } from "@/lib/adminAuth";

export const runtime = "nodejs";

interface LoginBody {
  email?: string;
  password?: string;
}

export async function POST(req: Request) {
  let body: LoginBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  let valid: boolean;
  try {
    valid = checkAdminCredentials(email, password);
  } catch (err) {
    console.error("admin login: credentials not configured:", err);
    return NextResponse.json({ error: "Admin login is not configured." }, { status: 500 });
  }

  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const token = createAdminSessionToken(email);
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, token, adminSessionCookieOptions);
  return res;
}
