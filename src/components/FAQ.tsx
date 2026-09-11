"use client";

import { useState } from "react";
import Reveal from "./Reveal";

const ITEMS = [
  {
    q: "Is this for beginners?",
    a: "Absolutely! The UGC Creator OS is designed for creators at all levels. Beginners will find step-by-step guidance to start strong, while experienced creators will appreciate the systems and templates to scale their work.",
  },
  {
    q: "Do I need expensive camera equipment?",
    a: "Not at all. The system is built around creating with just your smartphone. We focus on what matters most — your message, creativity, and consistency — not gear.",
  },
  {
    q: "Is this a course?",
    a: "It's a comprehensive system, not just a course. It includes editable templates, swipe files, planners, and workflows — everything you need to implement immediately.",
  },
  {
    q: "What platforms does it work with?",
    a: "The frameworks work for any short-form video platform: TikTok, Instagram Reels, YouTube Shorts, and more. The core system is platform-agnostic.",
  },
  {
    q: "Can I use it for different niches?",
    a: "Yes. While examples span beauty, fashion, tech, and lifestyle, the hooks, scripts, and angles are categorized by emotion and product type — adaptable to any niche.",
  },
  {
    q: "What's included in the system?",
    a: "The full PDF, hook library, script library, shot list library, pitch templates, portfolio system, 30-day planner, and AI prompt library — everything you need, no AI generation required.",
  },
  {
    q: "How do I access the product?",
    a: "After purchase, you'll get immediate access to download all resources. Works on any device.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-background py-24 md:py-32">
      <div className="section-shell">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="kicker mb-6 flex items-center justify-center gap-3">
            <span className="ornament" />
            FAQ
          </p>
          <h2 className="text-[clamp(2.25rem,4.8vw,3.75rem)] font-bold leading-[1.05] tracking-[-0.02em] text-foreground">
            Frequently asked questions.
          </h2>
        </Reveal>

        <div className="mx-auto mt-14 max-w-2xl divide-y divide-border">
          {ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 py-5 text-left"
                >
                  <span className="font-medium text-foreground">{item.q}</span>
                  <span
                    className={`shrink-0 text-lg text-accent transition-transform duration-300 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                <div
                  className="grid overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="pb-5 text-sm leading-relaxed text-foreground/60">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
