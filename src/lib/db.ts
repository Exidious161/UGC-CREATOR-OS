import postgres from "postgres";

let client: ReturnType<typeof postgres> | null = null;

/**
 * Lazily creates the Postgres client so importing this module never throws
 * when DATABASE_URL isn't set yet (e.g. at build time, or in routes that
 * don't touch the DB) — mirrors the lazy pattern already used for the
 * Razorpay client. `max: 1` keeps each serverless function instance to a
 * single pooled connection, which is the standard-recommended setting for
 * the `postgres` driver on Vercel's per-invocation Node.js functions.
 */
export function getDb() {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set.");
    }
    client = postgres(url, { max: 1, transform: postgres.camel });
  }
  return client;
}
