"use client";

import { useRef, useState } from "react";
import { trackBeginCheckout } from "@/lib/analytics";
import BookCover from "./BookCover";

export default function Hero() {
  const visualRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = visualRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: px * 4, y: py * -4 });
  };

  const resetTilt = () => setTilt({ x: 0, y: 0 });

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="section-shell relative py-10 md:py-14">
        <div className="grid gap-16 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          {/* Left — editorial headline */}
          <div>
            <p className="kicker mb-6">From First Idea to Brand Pitch</p>

            <h1 className="text-[clamp(3rem,6.5vw,5.25rem)] font-bold leading-[1.0] tracking-[-0.02em] text-accent">
              Create UGC,
              <br />
              without the
              <br />
              overwhelm.
            </h1>

            <p className="mt-8 max-w-md text-lg leading-relaxed text-foreground/80">
              A practical, step-by-step system for creating consistent,
              brand-ready UGC content — from your first idea to your next
              brand pitch.{" "}
              <span className="font-semibold text-foreground">
                Everything you need to plan, film, publish and pitch with
                confidence.
              </span>
            </p>

            <div className="mt-10 flex flex-wrap items-end gap-10">
              <div>
                <p className="kicker mb-1">Price</p>
                <p className="mb-1 text-xs font-medium uppercase tracking-[0.1em] text-foreground/40">
                  INR
                </p>
                <p className="text-5xl font-semibold leading-none text-accent">
                  ₹199
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  trackBeginCheckout("hero");
                  window.location.href = "https://razorpay.com/@ugccreatoros";
                }}
                className="group relative inline-flex h-13 items-center justify-center overflow-hidden rounded-full bg-accent px-8 py-4 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(201,84,50,0.6)] transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
              >
                Get the UGC Creator OS
                <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs uppercase tracking-[0.08em] text-foreground/45">
              <span>Instant PDF access</span>
              <span className="h-3 w-px bg-foreground/15" />
              <span>One-time payment</span>
            </div>
          </div>

          {/* Right — tilted product visual with accent blob peeking behind it */}
          <div className="relative mx-auto flex h-[420px] w-full max-w-[320px] items-center justify-center md:h-[520px] md:max-w-[360px]">
            <div className="absolute right-[-8%] top-1/2 h-[70%] w-[70%] -translate-y-1/2 rounded-full bg-accent-muted" />

            <div
              ref={visualRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={resetTilt}
              className="relative h-full w-full [perspective:1200px]"
            >
              <div
                className="h-full w-full transition-transform duration-300 ease-out"
                style={{
                  transform: `rotate(-4deg) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
                }}
              >
                <BookCover />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hidden md:flex justify-center pb-10">
        <div className="flex flex-col items-center gap-2 text-foreground/35">
          <span className="text-[0.65rem] uppercase tracking-[0.2em]">Scroll</span>
          <span className="relative h-8 w-px overflow-hidden bg-foreground/15">
            <span className="absolute inset-x-0 top-0 h-1/2 w-px animate-[scrollline_1.8s_ease-in-out_infinite] bg-accent" />
          </span>
        </div>
      </div>

      <style>{`
        @keyframes scrollline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
      `}</style>
    </section>
  );
}
