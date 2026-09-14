import { randomUUID } from "crypto";
import { getDb } from "./db";

export interface Purchase {
  id: string;
  customerName: string | null;
  customerEmail: string | null;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  status: string;
  couponCode: string | null;
  originalAmount: number | null;
  purchasedAt: string;
  downloadCount: number;
  lastDownloadedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecordPurchaseInput {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  customerName: string | null;
  customerEmail: string | null;
  couponCode: string | null;
  originalAmount: number | null;
}

/**
 * Idempotent by razorpay_payment_id: if this exact payment was already
 * recorded (e.g. the client retried /api/payment/verify after a network
 * blip), the ON CONFLICT branch just returns the existing row instead of
 * inserting a second one. The unique index on razorpay_payment_id is what
 * makes this safe under concurrent requests, not the application logic.
 */
export async function recordPurchase(input: RecordPurchaseInput): Promise<Purchase> {
  const sql = getDb();

  const inserted = await sql<Purchase[]>`
    INSERT INTO purchases (
      id, customer_name, customer_email, razorpay_payment_id, razorpay_order_id, amount, currency, status,
      coupon_code, original_amount
    ) VALUES (
      ${randomUUID()}, ${input.customerName}, ${input.customerEmail}, ${input.paymentId},
      ${input.orderId}, ${input.amount}, ${input.currency}, ${input.status},
      ${input.couponCode}, ${input.originalAmount}
    )
    ON CONFLICT (razorpay_payment_id) DO NOTHING
    RETURNING *
  `;

  if (inserted.length > 0) {
    return inserted[0];
  }

  const existing = await sql<Purchase[]>`
    SELECT * FROM purchases WHERE razorpay_payment_id = ${input.paymentId} LIMIT 1
  `;

  if (existing.length === 0) {
    throw new Error("recordPurchase: insert skipped by ON CONFLICT but no existing row found.");
  }

  return existing[0];
}

/**
 * Called after a download token has already been verified — this only
 * records that a verified, authorized download happened. Failing to update
 * this counter never blocks the actual file stream (see download route).
 */
export async function incrementDownload(paymentId: string): Promise<void> {
  const sql = getDb();
  await sql`
    UPDATE purchases
    SET download_count = download_count + 1,
        last_downloaded_at = now(),
        updated_at = now()
    WHERE razorpay_payment_id = ${paymentId}
  `;
}

export interface PurchaseStats {
  totalPurchases: number;
  successfulPurchases: number;
  totalRevenuePaise: number;
  totalDownloads: number;
}

export async function getPurchaseStats(): Promise<PurchaseStats> {
  const sql = getDb();
  const [row] = await sql<
    { totalPurchases: string; successfulPurchases: string; totalRevenuePaise: string | null; totalDownloads: string | null }[]
  >`
    SELECT
      COUNT(*) AS total_purchases,
      COUNT(*) FILTER (WHERE status = 'captured') AS successful_purchases,
      COALESCE(SUM(amount) FILTER (WHERE status = 'captured'), 0) AS total_revenue_paise,
      COALESCE(SUM(download_count), 0) AS total_downloads
    FROM purchases
  `;

  return {
    totalPurchases: Number(row.totalPurchases),
    successfulPurchases: Number(row.successfulPurchases),
    totalRevenuePaise: Number(row.totalRevenuePaise ?? 0),
    totalDownloads: Number(row.totalDownloads ?? 0),
  };
}

export type PurchaseSort = "newest" | "oldest";
export type PurchaseStatusFilter = "all" | "captured" | "failed" | "created" | "authorized";

export interface QueryPurchasesInput {
  search?: string;
  status?: PurchaseStatusFilter;
  sort?: PurchaseSort;
  page?: number;
  pageSize?: number;
}

export interface QueryPurchasesResult {
  rows: Purchase[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Every filter/sort value is validated against a fixed allowlist before it
 * ever reaches SQL — none of it is string-concatenated.
 *
 * Deliberately avoids postgres.js's conditional-fragment composition
 * (`sql\`AND ...\` : sql\`\`` nested inside another sql\`\`\`) — combining
 * multiple such fragments in one query triggered an internal RangeError in
 * the driver's parameter encoding ("offset is out of range"), which surfaced
 * as the whole dashboard hanging for minutes before failing. Instead, the
 * search/status filters are always present in the query text as fixed
 * `$n = '' OR ...` no-ops, and sort direction is a plain JS branch between
 * two literal query strings — every value still goes through normal bound
 * parameters, just with zero dynamic SQL-fragment assembly.
 */
export async function queryPurchases(input: QueryPurchasesInput): Promise<QueryPurchasesResult> {
  const sql = getDb();

  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, input.pageSize ?? 20));
  const offset = (page - 1) * pageSize;
  const search = input.search?.trim() ?? "";
  const searchPattern = `%${search}%`;
  const status = input.status && input.status !== "all" ? input.status : "";

  const rowsQuery =
    input.sort === "oldest"
      ? sql<Purchase[]>`
          SELECT * FROM purchases
          WHERE (${search} = '' OR customer_name ILIKE ${searchPattern} OR customer_email ILIKE ${searchPattern}
                 OR razorpay_payment_id ILIKE ${searchPattern} OR razorpay_order_id ILIKE ${searchPattern})
            AND (${status} = '' OR status = ${status})
          ORDER BY purchased_at ASC
          LIMIT ${pageSize} OFFSET ${offset}
        `
      : sql<Purchase[]>`
          SELECT * FROM purchases
          WHERE (${search} = '' OR customer_name ILIKE ${searchPattern} OR customer_email ILIKE ${searchPattern}
                 OR razorpay_payment_id ILIKE ${searchPattern} OR razorpay_order_id ILIKE ${searchPattern})
            AND (${status} = '' OR status = ${status})
          ORDER BY purchased_at DESC
          LIMIT ${pageSize} OFFSET ${offset}
        `;

  const rows = await rowsQuery;

  const [countRow] = await sql<{ count: string }[]>`
    SELECT COUNT(*) AS count FROM purchases
    WHERE (${search} = '' OR customer_name ILIKE ${searchPattern} OR customer_email ILIKE ${searchPattern}
           OR razorpay_payment_id ILIKE ${searchPattern} OR razorpay_order_id ILIKE ${searchPattern})
      AND (${status} = '' OR status = ${status})
  `;

  const total = Number(countRow.count);

  return {
    rows,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
