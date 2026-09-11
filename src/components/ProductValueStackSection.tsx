"use client";

import { useState } from "react";
import Reveal from "./Reveal";

const STACK = [
  { n: "01", title: "Complete UGC Creator OS PDF", desc: "The full operating system, in one document." },
  { n: "02", title: "Hook Library", desc: "50 proven hooks for different products and emotions." },
  { n: "03", title: "Script Frameworks", desc: "Fill-in-the-blank structures for every UGC format." },
  { n: "04", title: "Shot Lists", desc: "Detailed lists for product demos, routines, and more." },
  { n: "05", title: "30-Day Content Planner", desc: "A done-for-you plan with a repurposing strategy." },
  { n: "06", title: "AI Prompt Library", desc: "Curated prompts for ideation and scripting." },
  { n: "07", title: "Portfolio Guide", desc: "Present your work professionally to brands." },
  { n: "08", title: "Pitch Templates", desc: "Email scripts, media kits, and rate cards." },
];

const CENTER = (STACK.length - 1) / 2;
const ANGLE_STEP = 5; // degrees of tilt per card, for the fan/circle feel
const SPACING_X = 92; // px between each card's center when open — guarantees every card is exposed, not just the extremes
const ARC_FACTOR = 3.4; // px of vertical droop per card, squared with distance from center

export default function ProductValueStackSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="bg-background-alt py-24 md:py-32">
      <div className="section-shell">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="kicker mb-6 flex items-center justify-center gap-3">
            <span className="ornament" />
            Everything Included
          </p>
          <h2 className="text-[clamp(2.25rem,4.8vw,3.75rem)] font-bold leading-[1.05] tracking-[-0.02em] text-foreground">
            One purchase. The whole stack.
          </h2>
          <p className="mt-4 hidden text-sm text-foreground/45 lg:block">
            Hover the deck to fan it open
          </p>
        </Reveal>

        {/* Desktop: hand-of-cards fan, opens on hover, closes on mouse-leave.
            Every card gets its own horizontal slot (SPACING_X) so all 8 stay
            readable when fanned — rotation alone only separates the outer
            two cards, the middle ones would just overlap in place. */}
        <div
          className="relative mx-auto mt-16 hidden h-[340px] max-w-4xl cursor-pointer lg:flex lg:items-center lg:justify-center"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          onClick={() => setIsOpen((v) => !v)}
        >
          {STACK.map((item, i) => {
            const dist = i - CENTER;
            const angle = isOpen ? dist * ANGLE_STEP : 0;
            const x = isOpen ? dist * SPACING_X : 0;
            const y = isOpen ? Math.abs(dist) * Math.abs(dist) * ARC_FACTOR : 0;
            return (
              <div
                key={item.n}
                className="absolute left-1/2 top-1/2 w-[210px] rounded-2xl border border-border/50 bg-white p-4 shadow-lg transition-transform ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${angle}deg)`,
                  transformOrigin: "50% 50%",
                  zIndex: isOpen ? i : STACK.length - i,
                  transitionDuration: "550ms",
                  transitionDelay: `${Math.abs(dist) * 40}ms`,
                }}
              >
                <div className="flex items-start gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
                    {item.n}
                  </span>
                  <div>
                    <h3 className="text-[0.8rem] font-semibold leading-snug text-foreground">{item.title}</h3>
                    <p className="mt-1 text-[0.7rem] leading-relaxed text-foreground/55">{item.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile / tablet: clean vertical list (the fan needs real desktop width) */}
        <div className="mx-auto mt-14 max-w-md space-y-3 lg:hidden">
          {STACK.map((item, i) => (
            <Reveal
              key={item.n}
              delay={i * 40}
              className="flex items-start gap-4 rounded-xl border border-border/50 bg-white p-5"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
                {item.n}
              </span>
              <div>
                <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm text-foreground/55">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
