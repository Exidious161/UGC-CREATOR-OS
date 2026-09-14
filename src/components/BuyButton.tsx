"use client";

import { useState } from "react";
import { usePurchase } from "@/hooks/usePurchase";

interface BuyButtonProps {
  source: string;
  className: string;
  children: React.ReactNode;
}

interface AppliedCoupon {
  code: string;
  percentOff: number;
  discountedAmount: number;
}

function formatRupees(paise: number) {
  return `₹${Math.round(paise / 100)}`;
}

/**
 * Drop-in replacement for the old `<button onClick={() => location.href = razorpay.com/...}>`
 * CTAs. Keeps each call site's exact existing className (so nothing visually
 * moves), and only adds what the real payment flow needs: a loading state
 * while checkout opens/verifies, an inline message on failure/cancel, and an
 * optional coupon code field. Applying a coupon only previews the discount
 * (via /api/payment/validate-coupon) — the actual price is always decided
 * server-side again in /api/payment/create-order.
 */
export default function BuyButton({ source, className, children }: BuyButtonProps) {
  const { status, error, startPurchase } = usePurchase();
  const isLoading = status === "loading";

  const [showCoupon, setShowCoupon] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponState, setCouponState] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  const handleApplyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;

    setCouponState("checking");
    setCouponError(null);

    try {
      const res = await fetch("/api/payment/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setCouponState("invalid");
        setAppliedCoupon(null);
        setCouponError(data.error ?? "Invalid coupon code.");
        return;
      }

      setCouponState("valid");
      setAppliedCoupon({ code: data.code, percentOff: data.percentOff, discountedAmount: data.discountedAmount });
    } catch {
      setCouponState("invalid");
      setAppliedCoupon(null);
      setCouponError("Couldn't check that code. Please try again.");
    }
  };

  return (
    <div className="inline-flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={() => startPurchase(source, appliedCoupon?.code)}
        disabled={isLoading}
        aria-busy={isLoading}
        className={`${className} ${isLoading ? "cursor-wait opacity-80" : ""}`}
      >
        {isLoading ? "Opening secure checkout…" : children}
      </button>

      {!showCoupon && (
        <button
          type="button"
          onClick={() => setShowCoupon(true)}
          className="text-xs font-medium text-foreground/50 underline-offset-2 hover:text-foreground hover:underline"
        >
          Have a coupon code?
        </button>
      )}

      {showCoupon && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => {
                setCouponInput(e.target.value);
                setCouponState("idle");
                setCouponError(null);
                setAppliedCoupon(null);
              }}
              placeholder="Coupon code"
              className="w-32 rounded-full border border-border bg-white px-3 py-1.5 text-xs uppercase tracking-wide text-foreground outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={couponState === "checking" || !couponInput.trim()}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground/70 hover:text-foreground disabled:opacity-50"
            >
              {couponState === "checking" ? "Checking…" : "Apply"}
            </button>
          </div>

          {couponState === "valid" && appliedCoupon && (
            <p className="text-xs font-medium text-green-700">
              {appliedCoupon.percentOff}% off applied — new total {formatRupees(appliedCoupon.discountedAmount)}
            </p>
          )}
          {couponState === "invalid" && (
            <p role="alert" className="text-xs font-medium text-red-600">
              {couponError}
            </p>
          )}
        </div>
      )}

      {status === "error" && (
        <p role="alert" className="max-w-xs text-xs font-medium text-red-600">
          {error ?? "Payment failed. Please try again."}
        </p>
      )}

      {status === "cancelled" && (
        <p role="status" className="max-w-xs text-xs font-medium text-foreground/50">
          Checkout closed — no payment was made. You can try again anytime.
        </p>
      )}
    </div>
  );
}
