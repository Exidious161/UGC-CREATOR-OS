import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import {
  getRazorpayClient,
  getRazorpayKeyId,
  PRODUCT_AMOUNT_PAISE,
  PRODUCT_CURRENCY,
  PRODUCT_NAME,
} from "@/lib/razorpay";

export const runtime = "nodejs";

/** Creates a fresh Razorpay order for the one fixed product. No client input is trusted for price. */
export async function POST() {
  try {
    const receipt = `ugc-os-${Date.now()}-${randomBytes(4).toString("hex")}`;

    const order = await getRazorpayClient().orders.create({
      amount: PRODUCT_AMOUNT_PAISE,
      currency: PRODUCT_CURRENCY,
      receipt,
      notes: { product: PRODUCT_NAME },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: getRazorpayKeyId(),
      productName: PRODUCT_NAME,
    });
  } catch (err) {
    console.error("create-order failed:", err);
    return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 500 });
  }
}
