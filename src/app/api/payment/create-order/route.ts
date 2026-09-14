import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import {
  getRazorpayClient,
  getRazorpayKeyId,
  PRODUCT_AMOUNT_PAISE,
  PRODUCT_CURRENCY,
  PRODUCT_NAME,
} from "@/lib/razorpay";
import { applyDiscount, findCoupon } from "@/lib/coupons";

export const runtime = "nodejs";

interface CreateOrderBody {
  couponCode?: string;
}

/**
 * Creates a fresh Razorpay order for the one fixed product, minus an optional
 * coupon discount. No client input is trusted for price directly — a coupon
 * code only ever selects a percentOff from the fixed allowlist in
 * @/lib/coupons, which is what actually computes the amount. The order's
 * amount is fixed at creation time and can't be changed by the client
 * afterwards, so this is also the only place a discount can be applied.
 */
export async function POST(req: Request) {
  let body: CreateOrderBody = {};
  try {
    body = await req.json();
  } catch {
    // No/invalid body is fine — coupon is optional.
  }

  const coupon = findCoupon(body.couponCode);
  const amount = coupon ? applyDiscount(PRODUCT_AMOUNT_PAISE, coupon.percentOff) : PRODUCT_AMOUNT_PAISE;

  try {
    const receipt = `ugc-os-${Date.now()}-${randomBytes(4).toString("hex")}`;

    const order = await getRazorpayClient().orders.create({
      amount,
      currency: PRODUCT_CURRENCY,
      receipt,
      notes: {
        product: PRODUCT_NAME,
        couponCode: coupon?.code ?? "",
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: getRazorpayKeyId(),
      productName: PRODUCT_NAME,
      originalAmount: PRODUCT_AMOUNT_PAISE,
      couponCode: coupon?.code ?? null,
      discountPercent: coupon?.percentOff ?? 0,
    });
  } catch (err) {
    console.error("create-order failed:", err);
    return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 500 });
  }
}
