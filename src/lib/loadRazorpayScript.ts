declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance;
  }
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: { email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: { ondismiss?: () => void };
}

export interface RazorpayCheckoutInstance {
  open: () => void;
  on: (event: "payment.failed", handler: (response: { error: { description?: string } }) => void) => void;
}

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
let loadPromise: Promise<void> | null = null;

/** Loads Razorpay's Checkout.js exactly once, even if called from multiple buttons concurrently. */
export function loadRazorpayScript(): Promise<void> {
  if (typeof window !== "undefined" && window.Razorpay) {
    return Promise.resolve();
  }
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Razorpay Checkout.")));
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay Checkout."));
    document.body.appendChild(script);
  });

  return loadPromise;
}
