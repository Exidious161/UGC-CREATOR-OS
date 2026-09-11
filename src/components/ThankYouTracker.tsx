"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { trackPurchase } from "@/lib/analytics";

type SessionState = "checking" | "valid" | "invalid";

/**
 * Renders the thank-you page body AND gates it: nothing here is shown, and
 * the GA4 `purchase` event never fires, until /api/payment/session has
 * confirmed the `token` in the URL server-side. A visitor who lands here
 * without a token (or with a stale/tampered one) sees an honest "invalid
 * link" state instead of a fake success screen.
 */
export default function ThankYouTracker() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<SessionState>(() => (token ? "checking" : "invalid"));
  const firedRef = useRef(false);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    fetch(`/api/payment/session?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data: { valid: boolean; paymentId?: string }) => {
        if (cancelled) return;
        if (data.valid) {
          setState("valid");
          if (!firedRef.current) {
            firedRef.current = true;
            trackPurchase(data.paymentId);
          }
        } else {
          setState("invalid");
        }
      })
      .catch(() => {
        if (!cancelled) setState("invalid");
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (state === "checking") {
    return (
      <p className="mt-6 text-sm uppercase tracking-[0.1em] text-foreground/40">
        Confirming your payment…
      </p>
    );
  }

  if (state === "invalid") {
    return (
      <>
        <p className="mt-6 text-lg leading-relaxed text-foreground/65">
          We couldn&rsquo;t confirm a payment for this link — it may have
          expired or already been used on another device. If you were just
          charged, please contact support with your payment ID and we&rsquo;ll
          sort it out right away.
        </p>
        <Link
          href="/#pricing"
          className="mt-10 inline-flex h-12 items-center justify-center rounded-full bg-accent px-8 text-sm font-semibold text-white transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
        >
          Back to pricing
        </Link>
      </>
    );
  }

  return (
    <>
      <p className="mt-6 text-lg leading-relaxed text-foreground/65">
        Check your email for a copy of your receipt. Your complete UGC
        Creator OS — hooks, scripts, shot lists, planner, and pitch
        templates, all in one place — is ready below.
      </p>
      <a
        href={`/api/payment/download?token=${encodeURIComponent(token as string)}`}
        className="mt-10 inline-flex h-13 items-center justify-center rounded-full bg-accent px-10 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(201,84,50,0.6)] transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
      >
        Download the PDF →
      </a>
      <p className="mt-3 text-xs text-foreground/40">
        This download link stays valid for 48 hours.
      </p>
      <div>
        <Link
          href="/"
          className="mt-8 inline-flex h-10 items-center justify-center text-sm font-semibold text-foreground/50 transition-colors duration-300 hover:text-foreground"
        >
          ← Back to the site
        </Link>
      </div>
    </>
  );
}
