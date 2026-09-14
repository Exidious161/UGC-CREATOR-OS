export interface Coupon {
  code: string;
  percentOff: number;
}

/**
 * Fixed allowlist of valid coupon codes. This is the only source of truth
 * for what a code is worth — the client only ever sends a code string, never
 * a discount amount, so nothing here can be forged from the browser.
 */
const COUPONS: Coupon[] = [{ code: "SAVE10", percentOff: 10 }];

/** Case/whitespace-insensitive lookup. Returns null for unknown or empty codes. */
export function findCoupon(rawCode: string | null | undefined): Coupon | null {
  const code = rawCode?.trim().toUpperCase();
  if (!code) return null;
  return COUPONS.find((c) => c.code === code) ?? null;
}

export function applyDiscount(amountPaise: number, percentOff: number): number {
  return Math.round((amountPaise * (100 - percentOff)) / 100);
}
