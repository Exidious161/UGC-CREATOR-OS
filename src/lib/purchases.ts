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
      id, customer_name, customer_email, razorpay_payment_id, razorpay_order_id, amount, currency, status
    ) VALUES (
      ${randomUUID()}, ${input.customerName}, ${input.customerEmail}, ${input.paymentId},
      ${input.orderId}, ${input.amount}, ${input.currency}, ${input.status}
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

/** Every filter/sort value is validated against a fixed allowlist before it ever reaches SQL — none of it is string-concatenated. */
export async function queryPurchases(input: QueryPurchasesInput): Promise<QueryPurchasesResult> {
  const sql = getDb();

  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, input.pageSize ?? 20));
  const offset = (page - 1) * pageSize;
  const search = input.search?.trim();
  const status = input.status && input.status !== "all" ? input.status : null;
  const orderClause = input.sort === "oldest" ? sql`purchased_at ASC` : sql`purchased_at DESC`;

  const searchClause = search
    ? sql`AND (
        customer_name ILIKE ${"%" + search + "%"}
        OR customer_email ILIKE ${"%" + search + "%"}
        OR razorpay_payment_id ILIKE ${"%" + search + "%"}
        OR razorpay_order_id ILIKE ${"%" + search + "%"}
      )`
    : sql``;

  const statusClause = status ? sql`AND status = ${status}` : sql``;

  const rows = await sql<Purchase[]>`
    SELECT * FROM purchases
    WHERE 1 = 1 ${searchClause} ${statusClause}
    ORDER BY ${orderClause}
    LIMIT ${pageSize} OFFSET ${offset}
  `;

  const [countRow] = await sql<{ count: string }[]>`
    SELECT COUNT(*) AS count FROM purchases
    WHERE 1 = 1 ${searchClause} ${statusClause}
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
