import { NextResponse } from "next/server";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils";
import { getRazorpayClient, PRODUCT_AMOUNT_PAISE, PRODUCT_CURRENCY } from "@/lib/razorpay";
import { applyDiscount, findCoupon } from "@/lib/coupons";
import { createPurchaseToken } from "@/lib/purchaseToken";
import { recordPurchase } from "@/lib/purchases";

export const runtime = "nodejs";

interface VerifyBody {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}

/**
 * The ONLY place a purchase is ever considered real. The client's Razorpay
 * Checkout "success" callback is not trusted on its own — it just triggers
 * this call. Access (the download token) is minted here, and only here,
 * after the signature is verified AND the payment is re-fetched from
 * Razorpay's API to confirm it actually belongs to this order and was
 * actually captured for the expected amount/currency.
 */
export async function POST(req: Request) {
  let body: VerifyBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body." }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json(
      { success: false, error: "Missing payment information." },
      { status: 400 }
    );
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    console.error("verify called without RAZORPAY_KEY_SECRET configured");
    return NextResponse.json({ success: false, error: "Payments are not configured." }, { status: 500 });
  }

  const signatureValid = validatePaymentVerification(
    { order_id: razorpay_order_id, payment_id: razorpay_payment_id },
    razorpay_signature,
    keySecret
  );

  if (!signatureValid) {
    return NextResponse.json({ success: false, error: "Payment signature verification failed." }, { status: 400 });
  }

  // Defense in depth: the signature alone proves order_id+payment_id were
  // signed by Razorpay together, but we also re-fetch the payment to confirm
  // it was actually captured, for the exact product amount/currency — never
  // trust anything about price from the client. The payment object is also
  // the ONLY source used for customer email/name below — never the browser.
  let customerEmail: string | null;
  let customerName: string | null;
  let paymentAmount: number;
  let paymentStatus: string;
  let couponCode: string | null;

  try {
    const payment = await getRazorpayClient().payments.fetch(razorpay_payment_id);

    if (payment.order_id !== razorpay_order_id) {
      return NextResponse.json({ success: false, error: "Order/payment mismatch." }, { status: 400 });
    }
    if (payment.status !== "captured") {
      return NextResponse.json({ success: false, error: `Payment not captured (status: ${payment.status}).` }, { status: 400 });
    }

    // A coupon can only ever lower the order's amount below the fixed product
    // price, and only to one of the fixed percentOff values in @/lib/coupons
    // — the order's notes just say *which* coupon was used at creation time,
    // they don't set the amount themselves, so this can't be used to smuggle
    // an arbitrary discount into a real order.
    const order = await getRazorpayClient().orders.fetch(razorpay_order_id);
    const coupon = findCoupon(typeof order.notes?.couponCode === "string" ? order.notes.couponCode : null);
    const expectedAmount = coupon ? applyDiscount(PRODUCT_AMOUNT_PAISE, coupon.percentOff) : PRODUCT_AMOUNT_PAISE;

    if (Number(order.amount) !== expectedAmount || order.currency !== PRODUCT_CURRENCY) {
      return NextResponse.json({ success: false, error: "Order amount mismatch." }, { status: 400 });
    }
    if (Number(payment.amount) !== Number(order.amount) || payment.currency !== PRODUCT_CURRENCY) {
      return NextResponse.json({ success: false, error: "Amount/currency mismatch." }, { status: 400 });
    }

    customerEmail = payment.email || null;
    customerName = payment.card?.name || null;
    paymentAmount = Number(payment.amount);
    paymentStatus = payment.status;
    couponCode = coupon?.code ?? null;
  } catch (err) {
    console.error("verify: payment fetch failed:", err);
    return NextResponse.json({ success: false, error: "Could not confirm payment with Razorpay." }, { status: 502 });
  }

  // The purchase record is the source of truth for the admin dashboard, so
  // the download token is only ever minted once it's confirmed written —
  // recordPurchase is idempotent (unique index on razorpay_payment_id), so
  // re-verifying the same payment (e.g. a client retry) never double-records it.
  try {
    await recordPurchase({
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount: paymentAmount,
      currency: PRODUCT_CURRENCY,
      status: paymentStatus,
      customerName,
      customerEmail,
      couponCode,
      originalAmount: PRODUCT_AMOUNT_PAISE,
    });
  } catch (err) {
    console.error("verify: recordPurchase failed:", err);
    return NextResponse.json({ success: false, error: "Could not finalize your purchase. Please contact support." }, { status: 500 });
  }

  const token = createPurchaseToken(razorpay_payment_id, razorpay_order_id);

  return NextResponse.json({ success: true, token, paymentId: razorpay_payment_id });
}
