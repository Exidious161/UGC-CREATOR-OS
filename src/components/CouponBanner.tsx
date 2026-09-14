"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "ugc-os-coupon-banner-dismissed";
const COUPON_CODE = "SAVE10";

/**
 * Site-wide announcement bar for the SAVE10 coupon. Shows by default (so
 * first-time visitors see it immediately, no flash-of-nothing) and hides
 * itself once we confirm the visitor already dismissed it. localStorage is
 * per-browser only, so this never needs to match server state.
 */
export default function CouponBanner() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      // Reading localStorage only works client-side, so this can only ever
      // run post-hydration — the one-render flash for returning dismissers
      // is the intended tradeoff (see component doc comment above).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (localStorage.getItem(DISMISS_KEY) === "1") setDismissed(true);
    } catch {
      // Private browsing / blocked storage — just keep showing the banner.
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Nothing to persist — banner will just show again next visit.
    }
  };

  if (dismissed) return null;

  return (
    <div className="relative flex items-center justify-center bg-accent px-10 py-2.5 text-center text-white">
      <p className="text-xs font-medium tracking-wide sm:text-sm">
        Use code <span className="font-bold">{COUPON_CODE}</span> at checkout for 10% off — limited time.
      </p>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 transition-colors hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}
