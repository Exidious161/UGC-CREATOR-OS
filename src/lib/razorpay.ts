import Razorpay from "razorpay";

export const PRODUCT_NAME = "UGC Creator OS PDF";
export const PRODUCT_AMOUNT_PAISE = 19900; // ₹199.00
export const PRODUCT_CURRENCY = "INR";

/** Lazily builds the server-side Razorpay client. Never import key_secret anywhere client-side. */
export function getRazorpayClient(): Razorpay {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error(
      "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment."
    );
  }

  return new Razorpay({ key_id, key_secret });
}

export function getRazorpayKeyId(): string {
  const key_id = process.env.RAZORPAY_KEY_ID;
  if (!key_id) {
    throw new Error("RAZORPAY_KEY_ID is not set.");
  }
  return key_id;
}
