import { NextResponse } from "next/server";
import { PRODUCT_AMOUNT_PAISE } from "@/lib/razorpay";
import { applyDiscount, findCoupon } from "@/lib/coupons";

export const runtime = "nodejs";

interface ValidateCouponBody {
  code?: string;
}

/**
 * Lets the UI preview a coupon's discount before checkout opens. Purely
 * informational — create-order re-validates the code itself against the same
 * allowlist, so nothing from this response is trusted to actually set price.
 */
export async function POST(req: Request) {
  let body: ValidateCouponBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ valid: false, error: "Invalid request." }, { status: 400 });
  }

  const coupon = findCoupon(body.code);
  if (!coupon) {
    return NextResponse.json({ valid: false, error: "Invalid or expired coupon code." }, { status: 400 });
  }

  return NextResponse.json({
    valid: true,
    code: coupon.code,
    percentOff: coupon.percentOff,
    originalAmount: PRODUCT_AMOUNT_PAISE,
    discountedAmount: applyDiscount(PRODUCT_AMOUNT_PAISE, coupon.percentOff),
  });
}
