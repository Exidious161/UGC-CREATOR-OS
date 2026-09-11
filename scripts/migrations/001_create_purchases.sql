CREATE TABLE IF NOT EXISTS purchases (
  id TEXT PRIMARY KEY,
  customer_name TEXT,
  customer_email TEXT,
  razorpay_payment_id TEXT NOT NULL,
  razorpay_order_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  download_count INTEGER NOT NULL DEFAULT 0,
  last_downloaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The same Razorpay payment must never create two purchase rows. The
-- verify route relies on this exact constraint name/shape for its
-- ON CONFLICT (razorpay_payment_id) idempotent insert.
CREATE UNIQUE INDEX IF NOT EXISTS purchases_razorpay_payment_id_key
  ON purchases (razorpay_payment_id);

CREATE INDEX IF NOT EXISTS purchases_purchased_at_idx
  ON purchases (purchased_at DESC);
