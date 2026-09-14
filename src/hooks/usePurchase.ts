"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { loadRazorpayScript, type RazorpayCheckoutInstance } from "@/lib/loadRazorpayScript";
import { trackBeginCheckout } from "@/lib/analytics";

export type PurchaseStatus = "idle" | "loading" | "success" | "error" | "cancelled";

interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  productName: string;
}

interface VerifyResponse {
  success: boolean;
  token?: string;
  error?: string;
}

/**
 * Module-scoped (not component-scoped) lock: the Hero, pricing section, and
 * final CTA each render their own buy button, but a click on any one of them
 * must block the others too — otherwise a fast double/triple click across
 * buttons could fire multiple create-order requests at once.
 */
let purchaseInFlight = false;

export function usePurchase() {
  const [status, setStatus] = useState<PurchaseStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const rzpRef = useRef<RazorpayCheckoutInstance | null>(null);
  const router = useRouter();

  const startPurchase = useCallback(
    async (source: string, couponCode?: string) => {
      if (purchaseInFlight) return;
      purchaseInFlight = true;
      setStatus("loading");
      setError(null);

      try {
        trackBeginCheckout(source);

        await loadRazorpayScript();

        const orderRes = await fetch("/api/payment/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ couponCode }),
        });
        if (!orderRes.ok) throw new Error("Could not start checkout. Please try again.");
        const order: CreateOrderResponse = await orderRes.json();

        const RazorpayCtor = window.Razorpay;
        if (!RazorpayCtor) throw new Error("Payment checkout failed to load. Please refresh and try again.");

        const rzp = new RazorpayCtor({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: "UGC Creator OS",
          description: order.productName,
          order_id: order.orderId,
          theme: { color: "#C95432" },
          handler: (response) => {
            void (async () => {
              try {
                const verifyRes = await fetch("/api/payment/verify", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  }),
                });
                const verify: VerifyResponse = await verifyRes.json();

                if (!verifyRes.ok || !verify.success || !verify.token) {
                  setStatus("error");
                  setError(verify.error ?? "We couldn't verify your payment. If money was deducted, contact support.");
                  purchaseInFlight = false;
                  return;
                }

                setStatus("success");
                purchaseInFlight = false;
                router.push(`/thank-you?token=${encodeURIComponent(verify.token)}`);
              } catch {
                setStatus("error");
                setError("We couldn't verify your payment. If money was deducted, contact support.");
                purchaseInFlight = false;
              }
            })();
          },
          modal: {
            ondismiss: () => {
              setStatus("cancelled");
              purchaseInFlight = false;
            },
          },
        });

        rzp.on("payment.failed", (response) => {
          setStatus("error");
          setError(response.error?.description ?? "Payment failed. Please try again.");
          purchaseInFlight = false;
        });

        rzpRef.current = rzp;
        rzp.open();
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        purchaseInFlight = false;
      }
    },
    [router]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  return { status, error, startPurchase, reset };
}
