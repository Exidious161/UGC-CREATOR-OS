"use client";

import { usePurchase } from "@/hooks/usePurchase";

interface BuyButtonProps {
  source: string;
  className: string;
  children: React.ReactNode;
}

/**
 * Drop-in replacement for the old `<button onClick={() => location.href = razorpay.com/...}>`
 * CTAs. Keeps each call site's exact existing className (so nothing visually
 * moves), and only adds what the real payment flow needs: a loading state
 * while checkout opens/verifies, and an inline message on failure/cancel.
 */
export default function BuyButton({ source, className, children }: BuyButtonProps) {
  const { status, error, startPurchase } = usePurchase();
  const isLoading = status === "loading";

  return (
    <div className="inline-flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={() => startPurchase(source)}
        disabled={isLoading}
        aria-busy={isLoading}
        className={`${className} ${isLoading ? "cursor-wait opacity-80" : ""}`}
      >
        {isLoading ? "Opening secure checkout…" : children}
      </button>

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
