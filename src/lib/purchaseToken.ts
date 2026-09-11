import { createHmac, timingSafeEqual } from "crypto";

/**
 * Stateless bearer token proving a verified Razorpay payment. There is no
 * database in this project, so this token — not a session row — is the
 * purchase record: it is minted only inside the /api/payment/verify route,
 * only after the Razorpay signature (and a live payment-status check) pass.
 *
 * Limitation: it's a bearer credential with no single-use enforcement or
 * device binding — anyone holding the exact string can use it until it
 * expires. Acceptable for a ₹199 PDF; if that changes, swap this for a
 * DB-backed session (e.g. Vercel Postgres/KV row keyed by payment_id, marked
 * consumed on first download) without touching the routes that call these
 * two functions.
 */
const TOKEN_TTL_MS = 48 * 60 * 60 * 1000; // 48 hours

interface TokenPayload {
  paymentId: string;
  orderId: string;
  exp: number;
}

function getSecret(): string {
  const secret = process.env.PDF_ACCESS_SECRET;
  if (!secret) {
    throw new Error("PDF_ACCESS_SECRET is not set.");
  }
  return secret;
}

function sign(data: string): string {
  return createHmac("sha256", getSecret()).update(data).digest("base64url");
}

export function createPurchaseToken(paymentId: string, orderId: string): string {
  const payload: TokenPayload = { paymentId, orderId, exp: Date.now() + TOKEN_TTL_MS };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

/** Returns the payload if the token is well-formed, correctly signed, and unexpired — otherwise null. */
export function verifyPurchaseToken(token: string): TokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, signature] = parts;
  if (!body || !signature) return null;

  const expected = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  let payload: TokenPayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (typeof payload.exp !== "number" || Date.now() > payload.exp) return null;
  if (typeof payload.paymentId !== "string" || typeof payload.orderId !== "string") return null;

  return payload;
}
