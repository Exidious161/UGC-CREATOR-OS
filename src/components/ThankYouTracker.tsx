"use client";

import { useEffect } from "react";
import { trackPurchase } from "@/lib/analytics";

/**
 * Fires the GA4 'purchase' conversion event once, on load of the thank-you page.
 * Set this URL as the redirect/thank-you URL in your Razorpay payment page settings,
 * then mark 'purchase' as a Conversion event inside GA4 (Admin -> Events).
 */
export default function ThankYouTracker() {
  useEffect(() => {
    trackPurchase();
  }, []);

  return null;
}
