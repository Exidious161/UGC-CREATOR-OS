declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

type GTagEventParams = Record<string, string | number | boolean | undefined>;

/** Fires a GA4 event. No-ops safely if GA4 hasn't loaded (e.g. NEXT_PUBLIC_GA_ID unset, or blocked by the visitor). */
export function trackEvent(name: string, params?: GTagEventParams) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, params);
}

/** Marks a Clarity session with a custom tag, e.g. trackClarityTag("cta", "hero"). */
export function trackClarityTag(key: string, value: string) {
  if (typeof window === "undefined" || !window.clarity) return;
  window.clarity("set", key, value);
}

/** Fire this on the checkout redirect so GA4 shows a checkout-intent funnel step per traffic source. */
export function trackBeginCheckout(source: string) {
  trackEvent("begin_checkout", {
    currency: "INR",
    value: 199,
    items: "ugc_creator_os",
    cta_source: source,
  });
}

/** Fire this on the post-purchase thank-you page so GA4 can be told to treat it as a conversion. */
export function trackPurchase(transactionId?: string) {
  trackEvent("purchase", {
    currency: "INR",
    value: 199,
    transaction_id: transactionId ?? `ugc-os-${Date.now()}`,
    items: "ugc_creator_os",
  });
}
