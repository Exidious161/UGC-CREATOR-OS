import type { Metadata } from "next";
import { Suspense } from "react";
import ThankYouTracker from "@/components/ThankYouTracker";

export const metadata: Metadata = {
  title: "You're In — UGC Creator OS",
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-background px-6 py-24">
      <div className="mx-auto max-w-lg text-center">
        <p className="kicker mb-6 flex items-center justify-center gap-3">
          <span className="ornament" />
          Order Confirmed
        </p>
        <h1 className="text-[clamp(2rem,4.5vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-foreground">
          You&rsquo;re in.
        </h1>
        <Suspense
          fallback={
            <p className="mt-6 text-sm uppercase tracking-[0.1em] text-foreground/40">
              Confirming your payment…
            </p>
          }
        >
          <ThankYouTracker />
        </Suspense>
      </div>
    </main>
  );
}
