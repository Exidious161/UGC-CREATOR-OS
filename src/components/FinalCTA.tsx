"use client";

import Link from "next/link";
import Reveal from "./Reveal";
import { trackBeginCheckout } from "@/lib/analytics";

const INCLUDED = [
  "Complete UGC Creator OS PDF",
  "Content Strategy",
  "Idea Vault",
  "Hook Library",
  "Script Frameworks",
  "Shot Lists",
  "30-Day Content Planner",
  "Portfolio Guide",
  "Pitch Templates",
  "AI Prompt Library",
];

export default function FinalCTA() {
  return (
    <>
      <section id="pricing" className="bg-background py-24 md:py-32">
        <div className="section-shell">
          <div className="mx-auto max-w-lg text-center">
            <Reveal>
              <p className="kicker mb-6 flex items-center justify-center gap-3">
                <span className="ornament" />
                Get the Complete Playbook
              </p>
              <h2 className="text-[clamp(2.25rem,4.8vw,3.75rem)] font-bold leading-[1.05] tracking-[-0.02em] text-foreground">
                Your entire UGC system.
                <br />
                For <span className="text-accent">₹199</span>.
              </h2>
              <p className="mt-4 text-foreground/55">One-time payment. Lifetime access.</p>
            </Reveal>

            <Reveal
              delay={100}
              className="mt-10 grid grid-cols-1 gap-x-8 gap-y-3 rounded-2xl border border-border/50 bg-white p-8 text-left sm:grid-cols-2"
            >
              {INCLUDED.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[0.6rem] text-white">
                    ✓
                  </span>
                  <span className="text-sm text-foreground/75">{item}</span>
                </div>
              ))}
            </Reveal>

            <Reveal delay={160}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  trackBeginCheckout("pricing_section");
                  window.location.href = "https://razorpay.com/@ugccreatoros";
                }}
                className="mt-10 inline-flex h-13 items-center justify-center rounded-full bg-accent px-10 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(201,84,50,0.6)] transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
              >
                Get the UGC Creator OS →
              </button>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="get-started" className="bg-accent/5 py-24 md:py-32">
        <div className="section-shell text-center">
          <Reveal>
            <p className="kicker mb-6 flex items-center justify-center gap-3">
              <span className="ornament" />
              Ready to Transform Your Content?
            </p>
            <h2 className="mx-auto max-w-2xl text-[clamp(2rem,4.5vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-foreground">
              Your next great UGC idea shouldn&rsquo;t take an hour to find.
            </h2>
            <p className="mx-auto mt-6 max-w-md text-foreground/60">
              Build your creator system once. Use it every time you create.
            </p>
          </Reveal>

          <Reveal delay={100} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={(e) => {
                e.preventDefault();
                trackBeginCheckout("final_cta");
                window.location.href = "https://razorpay.com/@ugccreatoros";
              }}
              className="inline-flex h-13 w-full items-center justify-center rounded-full bg-accent px-8 text-sm font-semibold text-white shadow-md transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98] sm:w-auto"
            >
              Get the UGC Creator OS →
            </button>
            <Link
              href="/#what-inside"
              className="inline-flex h-13 w-full items-center justify-center rounded-full border border-border bg-white px-8 text-sm font-semibold text-foreground/70 transition-colors duration-300 hover:text-foreground sm:w-auto"
            >
              See what&rsquo;s inside
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
