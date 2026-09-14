import { requireAdminSession } from "@/lib/adminAuth";
import { getPurchaseStats, queryPurchases, type PurchaseStatusFilter, type PurchaseSort } from "@/lib/purchases";
import LogoutButton from "@/components/admin/LogoutButton";

export const dynamic = "force-dynamic";

const STATUS_OPTIONS: { value: PurchaseStatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "captured", label: "Captured" },
  { value: "authorized", label: "Authorized" },
  { value: "failed", label: "Failed" },
  { value: "created", label: "Created" },
];

function formatCurrency(paise: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(paise / 100);
  } catch {
    return `${(paise / 100).toFixed(2)} ${currency}`;
  }
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusBadgeClass(status: string) {
  if (status === "captured") return "bg-green-100 text-green-700";
  if (status === "failed") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function buildQuery(params: Record<string, string | undefined>) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) qs.set(key, value);
  }
  const str = qs.toString();
  return str ? `/admin/purchases?${str}` : "/admin/purchases";
}

interface AdminPurchasesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminPurchasesPage({ searchParams }: AdminPurchasesPageProps) {
  await requireAdminSession();

  if (!process.env.DATABASE_URL) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background-alt px-6 text-center">
        <div className="max-w-sm">
          <p className="kicker mb-4 flex items-center justify-center gap-3">
            <span className="ornament" />
            Admin
          </p>
          <h1 className="text-xl font-bold text-foreground">Database not configured</h1>
          <p className="mt-3 text-sm text-foreground/60">
            Set <code className="rounded bg-white px-1.5 py-0.5">DATABASE_URL</code> and run the
            migration before purchase records can be shown here.
          </p>
        </div>
      </main>
    );
  }

  const params = await searchParams;
  const search = first(params.q) ?? "";
  const statusParam = (first(params.status) as PurchaseStatusFilter | undefined) ?? "all";
  const sort = (first(params.sort) as PurchaseSort | undefined) ?? "newest";
  const page = Number(first(params.page) ?? "1") || 1;

  let stats, result;
  try {
    [stats, result] = await Promise.all([
      getPurchaseStats(),
      queryPurchases({ search, status: statusParam, sort, page, pageSize: 20 }),
    ]);
  } catch (err) {
    console.error("admin/purchases: query failed:", err);
    return (
      <main className="flex min-h-screen items-center justify-center bg-background-alt px-6 text-center">
        <div className="max-w-sm">
          <p className="kicker mb-4 flex items-center justify-center gap-3">
            <span className="ornament" />
            Admin
          </p>
          <h1 className="text-xl font-bold text-foreground">Couldn&rsquo;t load purchases</h1>
          <p className="mt-3 text-sm text-foreground/60">
            The database didn&rsquo;t respond in time. This is usually a transient network hiccup — reload to try again.
          </p>
        </div>
      </main>
    );
  }

  const currentFilters = { q: search || undefined, status: statusParam === "all" ? undefined : statusParam, sort };

  return (
    <main className="min-h-screen bg-background-alt px-6 py-10 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="kicker mb-2 flex items-center gap-3">
              <span className="ornament" />
              Admin
            </p>
            <h1 className="text-2xl font-bold tracking-[-0.02em] text-foreground">Purchases</h1>
          </div>
          <LogoutButton />
        </div>

        {/* Summary cards */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total purchases" value={stats.totalPurchases.toLocaleString("en-IN")} />
          <StatCard label="Successful purchases" value={stats.successfulPurchases.toLocaleString("en-IN")} />
          <StatCard label="Total revenue" value={formatCurrency(stats.totalRevenuePaise, "INR")} />
          <StatCard label="Total downloads" value={stats.totalDownloads.toLocaleString("en-IN")} />
        </div>

        {/* Filters */}
        <form method="GET" className="mt-10 flex flex-wrap items-end gap-3 rounded-xl border border-border/60 bg-white p-4">
          <div className="min-w-[220px] flex-1">
            <label htmlFor="q" className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-foreground/50">
              Search
            </label>
            <input
              id="q"
              name="q"
              defaultValue={search}
              placeholder="Name, email, or payment ID"
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
            />
          </div>
          <div>
            <label htmlFor="status" className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-foreground/50">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={statusParam}
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sort" className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-foreground/50">
              Sort
            </label>
            <select
              id="sort"
              name="sort"
              defaultValue={sort}
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
          <button
            type="submit"
            className="h-[38px] rounded-full bg-accent px-6 text-sm font-semibold text-white transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
          >
            Apply
          </button>
          {(search || statusParam !== "all" || sort !== "newest") && (
            <a
              href="/admin/purchases"
              className="h-[38px] rounded-full border border-border px-6 text-sm font-semibold leading-[38px] text-foreground/60 hover:text-foreground"
            >
              Reset
            </a>
          )}
        </form>

        {/* Table */}
        <div className="mt-6 overflow-x-auto rounded-xl border border-border/60 bg-white">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 text-xs uppercase tracking-[0.06em] text-foreground/45">
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Payment ID</th>
                <th className="px-4 py-3 font-medium">Order ID</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Coupon</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Purchased At</th>
                <th className="px-4 py-3 font-medium">Downloads</th>
                <th className="px-4 py-3 font-medium">Last Download</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-foreground/45">
                    No purchases found.
                  </td>
                </tr>
              )}
              {result.rows.map((p) => (
                <tr key={p.id} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-3 text-foreground/85">{p.customerName ?? "—"}</td>
                  <td className="px-4 py-3 text-foreground/70">{p.customerEmail ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground/60">{p.razorpayPaymentId}</td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground/60">{p.razorpayOrderId}</td>
                  <td className="px-4 py-3 text-foreground/85">
                    {formatCurrency(p.amount, p.currency)}
                    {p.originalAmount && p.originalAmount !== p.amount && (
                      <span className="ml-1.5 text-xs text-foreground/40 line-through">
                        {formatCurrency(p.originalAmount, p.currency)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {p.couponCode ? (
                      <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
                        {p.couponCode}
                      </span>
                    ) : (
                      <span className="text-foreground/40">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-foreground/70">{formatDateTime(p.purchasedAt)}</td>
                  <td className="px-4 py-3 text-foreground/70">{p.downloadCount}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-foreground/70">{formatDateTime(p.lastDownloadedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between text-sm text-foreground/60">
          <p>
            Page {result.page} of {result.totalPages} — {result.total.toLocaleString("en-IN")} total
          </p>
          <div className="flex gap-2">
            <a
              href={buildQuery({ ...currentFilters, page: String(Math.max(1, result.page - 1)) })}
              aria-disabled={result.page <= 1}
              className={`rounded-full border border-border px-4 py-2 ${
                result.page <= 1 ? "pointer-events-none opacity-40" : "hover:text-foreground"
              }`}
            >
              ← Prev
            </a>
            <a
              href={buildQuery({ ...currentFilters, page: String(Math.min(result.totalPages, result.page + 1)) })}
              aria-disabled={result.page >= result.totalPages}
              className={`rounded-full border border-border px-4 py-2 ${
                result.page >= result.totalPages ? "pointer-events-none opacity-40" : "hover:text-foreground"
              }`}
            >
              Next →
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-foreground/45">{label}</p>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}
