import { NextResponse } from "next/server";
import { verifyPurchaseToken } from "@/lib/purchaseToken";

export const runtime = "nodejs";

/**
 * Lets the thank-you page confirm a purchase token server-side before it
 * fires the GA4 `purchase` event or shows the download button — so GA4 only
 * ever records a conversion that this server has actually verified, never a
 * blind "the browser landed on /thank-you" assumption.
 */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const payload = verifyPurchaseToken(token);
  if (!payload) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  return NextResponse.json({ valid: true, paymentId: payload.paymentId });
}
