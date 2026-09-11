import type { Metadata } from "next";
import Link from "next/link";
import ThankYouTracker from "@/components/ThankYouTracker";

export const metadata: Metadata = {
  title: "You're In — UGC Creator OS",
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-background px-6 py-24">
      <ThankYouTracker />
      <div className="mx-auto max-w-lg text-center">
        <p className="kicker mb-6 flex items-center justify-center gap-3">
          <span className="ornament" />
          Order Confirmed
        </p>
        <h1 className="text-[clamp(2rem,4.5vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-foreground">
          You&rsquo;re in.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-foreground/65">
          Check your email for access to the complete UGC Creator OS — hooks,
          scripts, shot lists, planner, and pitch templates, all in one place.
        </p>
        <Link
          href="/"
          className="mt-10 inline-flex h-12 items-center justify-center rounded-full border border-border bg-white px-8 text-sm font-semibold text-foreground/70 transition-colors duration-300 hover:text-foreground"
        >
          ← Back to the site
        </Link>
      </div>
    </main>
  );
}
