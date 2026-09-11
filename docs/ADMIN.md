# Purchases database & admin dashboard

Covers the purchase-record database and the `/admin` dashboard that reads it.
For the payment flow itself (Razorpay order/verify/download), see the code
comments in `src/app/api/payment/*` — this doc is about what was added on
top: persisting who bought the PDF, and a login-gated page to view it.

## 1. Configure the database

Any standard Postgres provider works — this project talks to it over a
plain `DATABASE_URL` connection string via the `postgres` npm package, not
a Vercel-specific SDK. Easiest options that work well with Vercel:

- **Neon** (neon.tech) — free tier, serverless Postgres, can also be added
  from the Vercel dashboard under Storage → Create Database → Postgres
  (Vercel's own "Postgres" offering is Neon under the hood).
- **Supabase** (supabase.com) — free tier also works fine.

Either way, get a connection string that looks like:

```
postgresql://user:password@host/dbname?sslmode=require
```

Put it in `DATABASE_URL`.

## 2. Configure environment variables

New variables added by this feature (see `.env.example` for the full list
including the pre-existing Razorpay/Blob ones):

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | Postgres connection string, see above |
| `ADMIN_EMAIL` | Yes | The email you'll log into `/admin/login` with |
| `ADMIN_PASSWORD` | Yes | Checked server-side only, constant-time compare, never sent to the browser |
| `ADMIN_SESSION_SECRET` | Yes | Signs the admin session cookie. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Use a **different** value than `PDF_ACCESS_SECRET`. |

## 3. Create the admin credentials

There's no sign-up flow — `ADMIN_EMAIL` / `ADMIN_PASSWORD` you set in the
environment *are* the one admin account. Pick any email/password you want;
nothing is validated against a real mailbox. To change the password later,
just change the env var and redeploy — no database update needed.

## 4. Run database migrations

There's no migration framework (Prisma/Drizzle) — just a plain `.sql` file
per change, applied idempotently (`CREATE TABLE IF NOT EXISTS`, etc.), run
by a small script:

```bash
node --env-file=.env.local scripts/migrate.mjs
```

Run this once against any new database (local, staging, production) before
the app can record purchases. It's safe to re-run — every statement is a
no-op if already applied. Future schema changes should be added as a new
`scripts/migrations/00N_description.sql` file and this same command re-run.

## 5. Access `/admin/login`

Visit `https://yoursite.com/admin/login` (or `http://localhost:3000/admin/login`
locally), sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`. You're redirected to
`/admin/purchases`. The session is an HTTP-only cookie (not readable by any
client-side JS), `Secure` in production, expires after 12 hours. Sign out
with the button in the dashboard header.

`/admin/purchases` is not linked from anywhere on the public site and is
excluded from search indexing (`robots: noindex`) — it's reachable only if
you know the URL, and useless without the login.

## 6. Deploy to Vercel

1. Push this repo to your connected GitHub repo (already done for the base
   site).
2. In Vercel → Project → Settings → Environment Variables, add every
   variable from `.env.example` with real values (Production, and Preview
   if you want preview deployments to work too) — most importantly for this
   feature: `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`.
3. Run the migration against your **production** database once (from your
   machine, pointed at the production `DATABASE_URL` via a temporary
   `.env.local` or inline env var) before the first real purchase happens.
4. Deploy. Vercel's Node.js serverless functions support outbound Postgres
   connections natively — no extra configuration needed for the `postgres`
   driver.

## 7. How purchase records are created

`POST /api/payment/verify` (unchanged flow otherwise — signature check, then
re-fetching the payment from Razorpay to confirm status/amount/currency) now
does one more thing after that confirmation succeeds and before it mints the
download token: it calls `recordPurchase()` in `src/lib/purchases.ts`, which
`INSERT ... ON CONFLICT (razorpay_payment_id) DO NOTHING RETURNING *`s a row.
Customer email/name come only from the Razorpay payment object
(`payment.email`, `payment.card?.name`), never from anything the browser
sends — the browser is never asked for this information in the first place.
`customerName` is frequently `null`: Razorpay's checkout only reliably
captures a name for card payments, not UPI/netbanking.

If the same payment is verified twice (e.g. the client retries the request
after a flaky connection), the unique index on `razorpay_payment_id` means
the second call hits the `ON CONFLICT` branch and reads back the row that
already exists — no duplicate, no error.

If the database write fails for any reason, `/api/payment/verify` returns an
error and **does not** issue a download token — by design (see the task
requirements this was built against). This means a database outage blocks
legitimate customers from getting their PDF, which is a real operational
tradeoff: purchase records are now load-bearing, not just an analytics
side-effect. Keep the database provider's uptime in mind.

## 8. How download tracking works

`GET /api/payment/download` is otherwise unchanged (same token verification,
same private-Blob streaming, same 401 on anything invalid/expired). Once the
token is verified — meaning the request is authorized — it fires
`incrementDownload(paymentId)` from `src/lib/purchases.ts`
(`download_count = download_count + 1`, `last_downloaded_at = now()`)
without awaiting it inline: the PDF stream returned to the browser doesn't
wait on it, and if the DB update fails, it's logged server-side but the
download still succeeds. A failed/unauthorized attempt (missing or invalid
token) never reaches this code at all, so it's never counted.

## Known limitations (honest, not marketing)

- No DB-backed session store for the admin login — it's a signed, expiring
  bearer cookie. Fine for a single trusted admin; if you ever add more admin
  users, move to real sessions.
- The download counter can under-count in a true multi-region race (two
  simultaneous downloads with the same token) since the increment isn't
  wrapped in the same transaction as the stream — acceptable for a
  bookkeeping metric, not something billing depends on.
- The purchases table has no `updated_at` trigger — `updated_at` is only
  ever set explicitly inside `incrementDownload`, not on every possible
  future write path. Fine today since that's the only update path; worth
  revisiting if more write paths are added later.
