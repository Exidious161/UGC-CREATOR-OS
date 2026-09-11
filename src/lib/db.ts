import postgres from "postgres";

let client: ReturnType<typeof postgres> | null = null;

/**
 * Lazily creates the Postgres client so importing this module never throws
 * when DATABASE_URL isn't set yet (e.g. at build time, or in routes that
 * don't touch the DB) — mirrors the lazy pattern already used for the
 * Razorpay client. `max: 1` keeps each serverless function instance to a
 * single pooled connection, which is the standard-recommended setting for
 * the `postgres` driver on Vercel's per-invocation Node.js functions.
 *
 * `prepare: false` is required when DATABASE_URL points at Supabase's
 * transaction-mode pooler (port 6543, PgBouncer) — prepared statements are
 * per-backend-connection, but PgBouncer can route each query to a different
 * backend, so a query using an already-prepared statement can hang/stall
 * unpredictably for several seconds instead of erroring cleanly. Safe to
 * leave off for a direct/session-mode connection too, just a bit less
 * efficient there.
 *
 * `idle_timeout` / `connect_timeout` guard against a specific failure mode
 * seen in dev: with `max: 1`, this one connection is held open for the
 * entire life of the server process. If it sits idle long enough that a
 * NAT/firewall silently drops it (no RST, just a black hole), the driver
 * doesn't know it's dead and the next query stalls for minutes waiting on
 * OS-level TCP timeouts instead of erroring — a standalone script never
 * hits this because it always opens a fresh connection. Discarding idle
 * connections proactively (and bounding new-connection time) means a dead
 * connection gets replaced instead of silently reused.
 *
 * `connection.statement_timeout` bounds how long Postgres itself will run
 * any single query before cancelling it. Queries against this DB (Supabase,
 * ap-northeast-2) have been observed to intermittently stall for minutes —
 * network jitter to that region, not a query-shape bug — so instead of a
 * hung page for up to Supabase's own 2-minute default, a slow query now
 * fails after 8s with a clear Postgres error the route can surface.
 */
export function getDb() {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set.");
    }
    client = postgres(url, {
      max: 1,
      prepare: false,
      idle_timeout: 20,
      connect_timeout: 10,
      connection: { statement_timeout: 8000 },
      transform: postgres.camel,
    });
  }
  return client;
}
