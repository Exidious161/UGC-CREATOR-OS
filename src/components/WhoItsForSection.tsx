"use client";

import { useState } from "react";
import Reveal from "./Reveal";

const PROFILES = [
  {
    label: "Beginner",
    title: "I don't know where to start.",
    points: [
      "Overwhelmed by content options",
      "Unsure what films well on camera",
      "Needs step-by-step guidance",
      "Wants to build on-camera confidence",
    ],
  },
  {
    label: "Growing",
    title: "I need a system to stay consistent.",
    points: [
      "Struggling with content burnout",
      "Wants to post regularly but lacks ideas",
      "Needs to organize existing content",
      "Looking to scale output",
    ],
  },
  {
    label: "Serious",
    title: "I want to work with more brands.",
    points: [
      "Ready to professionalize their craft",
      "Needs portfolio and pitch materials",
      "Wants to understand brand briefs",
      "Aiming to increase deal frequency",
    ],
  },
];

export default function WhoItsForSection() {
  const [active, setActive] = useState(0);
  const profile = PROFILES[active];

  return (
    <section id="for-creators" className="bg-background py-24 md:py-32">
      <div className="section-shell">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="kicker mb-6 flex items-center justify-center gap-3">
            <span className="ornament" />
            Who It&rsquo;s For
          </p>
          <h2 className="text-[clamp(2.25rem,4.8vw,3.75rem)] font-bold leading-[1.05] tracking-[-0.02em] text-foreground">
            Built for creators at every stage.
          </h2>
        </Reveal>

        <div className="mx-auto mt-14 max-w-2xl">
          <div className="flex justify-center gap-2 rounded-full border border-border/50 bg-white p-1.5">
            {PROFILES.map((p, i) => (
              <button
                key={p.label}
                onClick={() => setActive(i)}
                className={`flex-1 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                  active === i
                    ? "bg-accent text-white shadow-sm"
                    : "text-foreground/55 hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div
            key={active}
            className="reveal reveal-visible mt-8 rounded-2xl border border-border/50 bg-white p-8"
          >
            <p className="mb-6 text-xl font-medium italic text-foreground">
              &ldquo;{profile.title}&rdquo;
            </p>
            <ul className="grid gap-3.5 sm:grid-cols-2">
              {profile.points.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm text-foreground/70">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
