"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";

const WORKFLOW = [
  {
    n: "01",
    title: "Content Strategy",
    desc: "Define your niche and the angles that fit it, once.",
  },
  {
    n: "02",
    title: "Idea Vault",
    desc: "Every idea captured and organized — never lost in a notes app.",
  },
  {
    n: "03",
    title: "Hook Library",
    desc: "50 proven openers so the first 2 seconds never stall you.",
  },
  {
    n: "04",
    title: "Script Frameworks",
    desc: "Fill-in-the-blank structures for authentic, converting videos.",
  },
  {
    n: "05",
    title: "Shot Lists",
    desc: "Exactly what to film, so nothing gets missed on set.",
  },
  {
    n: "06",
    title: "30-Day Planner",
    desc: "A done-for-you calendar that turns ideas into a schedule.",
  },
  {
    n: "07",
    title: "Portfolio Guide",
    desc: "Package finished work into something brands take seriously.",
  },
  {
    n: "08",
    title: "Brand Pitch Templates",
    desc: "Outreach, rate cards, and negotiation — ready to send.",
  },
];

export default function TransformationSection() {
  const [reached, setReached] = useState<boolean[]>(() => WORKFLOW.map(() => false));
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = Number((entry.target as HTMLElement).dataset.index);
          setReached((prev) => {
            if (prev[idx]) return prev;
            const next = [...prev];
            next[idx] = true;
            return next;
          });
        });
      },
      { threshold: 0.6, rootMargin: "0px 0px -15% 0px" }
    );

    nodeRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="system" className="relative bg-background-alt py-24 md:py-32">
      <div className="section-shell">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="kicker mb-6 flex items-center justify-center gap-3">
            <span className="ornament" />
            One Product, One Workflow
          </p>
          <h2 className="text-[clamp(2.25rem,4.8vw,3.75rem)] font-bold leading-[1.05] tracking-[-0.02em] text-foreground">
            Every piece <span className="text-accent">connects to the next.</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-foreground/65">
            Not eight separate tools — one operating system. Each part hands
            off to the next, so you always know what comes after.
          </p>
        </Reveal>

        <div className="mx-auto mt-20 max-w-3xl md:mt-24">
          {WORKFLOW.map((step, i) => {
            const isLeft = i % 2 === 0;
            const isReached = reached[i];
            const arrowActive = reached[i + 1] ?? false;

            return (
              <div key={step.n}>
                <div className="flex items-center gap-5 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-8">
                  <div
                    ref={(el) => {
                      nodeRefs.current[i] = el;
                    }}
                    data-index={i}
                    className={`order-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 text-base font-bold shadow-sm transition-all duration-500 md:order-none md:col-start-2 md:h-16 md:w-16 md:text-lg ${
                      isReached
                        ? "scale-110 border-accent bg-accent text-white shadow-[0_10px_25px_-8px_rgba(201,84,50,0.6)]"
                        : "border-accent/25 bg-white text-accent/70"
                    }`}
                  >
                    {step.n}
                  </div>

                  <Reveal
                    delay={i * 60}
                    className={`order-2 min-w-0 flex-1 text-left md:order-none md:flex-none ${
                      isLeft ? "md:col-start-1 md:text-right" : "md:col-start-3 md:text-left"
                    }`}
                  >
                    <div className="group inline-block rounded-2xl px-4 py-3 transition-all duration-300 hover:bg-white hover:shadow-[0_20px_45px_-25px_rgba(43,37,33,0.35)]">
                      <h3 className="text-xl font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-accent md:text-2xl">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-foreground/60 md:text-base">
                        {step.desc}
                      </p>
                    </div>
                  </Reveal>
                </div>

                {i < WORKFLOW.length - 1 && (
                  <div className="flex justify-start pl-[27px] md:grid md:grid-cols-[1fr_auto_1fr] md:justify-normal md:pl-0">
                    <div className="flex flex-col items-center gap-0.5 py-1 md:col-start-2">
                      <span
                        className={`h-8 w-[3px] rounded-full transition-colors duration-700 md:h-10 ${
                          arrowActive ? "bg-accent" : "bg-border"
                        }`}
                      />
                      <span
                        className={`text-lg leading-none transition-all duration-500 ${
                          arrowActive ? "text-accent animate-bounce" : "text-border"
                        }`}
                      >
                        ↓
                      </span>
                      <span
                        className={`h-8 w-[3px] rounded-full transition-colors duration-700 md:h-10 ${
                          arrowActive ? "bg-accent" : "bg-border"
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
