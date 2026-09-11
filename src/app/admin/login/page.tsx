"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Invalid email or password.");
        setLoading(false);
        return;
      }

      router.push("/admin/purchases");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-24">
      <div className="w-full max-w-sm">
        <p className="kicker mb-6 flex items-center justify-center gap-3">
          <span className="ornament" />
          Admin
        </p>
        <h1 className="text-center text-[clamp(1.75rem,4vw,2.25rem)] font-semibold tracking-[-0.02em] text-foreground">
          Sign in
        </h1>
        <p className="mt-2 text-center text-sm text-foreground/55">
          UGC Creator OS purchase dashboard
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.08em] text-foreground/50">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-accent"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.08em] text-foreground/50">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-accent"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex h-12 w-full items-center justify-center rounded-full bg-accent text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(201,84,50,0.6)] transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
