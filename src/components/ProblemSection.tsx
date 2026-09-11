"use client";

import { useEffect, useRef, useState } from "react";

const CHAOS_ITEMS = [
  { label: "content ideas", top: "6%", left: "4%", rotate: -9, w: 168 },
  { label: "hook: ???", top: "2%", left: "58%", rotate: 6, w: 140 },
  { label: "script draft", top: "34%", left: "20%", rotate: 4, w: 150 },
  { label: "shot list", top: "18%", left: "74%", rotate: -5, w: 132 },
  { label: "30-day plan", top: "58%", left: "2%", rotate: 7, w: 158 },
  { label: "brand pitch", top: "62%", left: "62%", rotate: -6, w: 150 },
  { label: "post this??", top: "42%", left: "46%", rotate: 10, w: 128 },
];

const SYSTEM_ITEMS = [
  "Content Strategy",
  "Idea Vault",
  "Hook Library",
  "Script Frameworks",
  "Shot Lists",
  "30-Day Planner",
  "Portfolio Guide",
  "Brand Pitch Templates",
];

export default function ProblemSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [isSystem, setIsSystem] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsSystem(entry.isIntersecting),
      { threshold: 0, rootMargin: "-45% 0px -45% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: px * 10, y: py * 10 });
  };

  return (
    <section
      ref={sectionRef}
      id="chaos-to-system"
      className="relative bg-background py-24 md:py-0"
    >
      <div className="section-shell md:h-[170vh]">
        <div className="md:sticky md:top-0 md:flex md:h-screen md:items-center">
          <div className="grid w-full items-center gap-14 md:grid-cols-2">
            {/* Text panel */}
            <div>
              <p className="kicker mb-6 flex items-center gap-3">
                <span className="ornament" />
                The Problem With Content Creation
              </p>

              <h2
                className="text-[clamp(2.25rem,4.6vw,3.75rem)] font-bold leading-[1.02] tracking-[-0.02em] text-foreground transition-opacity duration-500"
                key={isSystem ? "system" : "chaos"}
              >
                {isSystem ? (
                  <>
                    One organized
                    <br />
                    <span className="italic text-accent">UGC Creator OS.</span>
                  </>
                ) : (
                  <>
                    Too many ideas.
                    <br />
                    <span className="italic text-accent">No system.</span>
                  </>
                )}
              </h2>

              <p className="mt-6 max-w-md text-lg leading-relaxed text-foreground/65">
                {isSystem
                  ? "Every idea, hook, script, and pitch — filed exactly where it belongs. Nothing to remember, nothing to dig for."
                  : "Ideas in your notes app. Hooks in your head. Scripts nowhere. You don't need more inspiration — you need one place for all of it."}
              </p>

              <div className="mt-8 hidden md:block text-xs uppercase tracking-[0.15em] text-foreground/35">
                Keep scrolling
              </div>
            </div>

            {/* Visual stage */}
            <div
              ref={stageRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setTilt({ x: 0, y: 0 })}
              className="relative h-[420px] md:h-[480px] w-full"
            >
              {/* Chaos layer */}
              <div
                className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isSystem
                    ? "pointer-events-none translate-y-6 scale-95 opacity-0"
                    : "opacity-100"
                }`}
              >
                {CHAOS_ITEMS.map((item, i) => (
                  <div
                    key={item.label}
                    className="absolute rounded-lg border border-border/40 bg-white p-4 shadow-md transition-transform duration-300"
                    style={{
                      top: item.top,
                      left: item.left,
                      width: item.w,
                      transform: `rotate(${item.rotate}deg) translate(${
                        tilt.x * (i % 2 === 0 ? 1 : -1) * 0.1
                      }px, ${tilt.y * 0.1}px)`,
                    }}
                  >
                    <p className="text-xs font-medium italic text-foreground/55">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* System layer */}
              <div
                className={`absolute inset-0 flex items-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isSystem
                    ? "opacity-100"
                    : "pointer-events-none translate-y-6 scale-95 opacity-0"
                }`}
              >
                <div className="w-full rounded-2xl border border-border/50 bg-white p-2 shadow-xl">
                  {SYSTEM_ITEMS.map((item, i) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors duration-200 hover:bg-accent/5"
                      style={{
                        transitionDelay: isSystem ? `${i * 40}ms` : "0ms",
                      }}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[0.65rem] font-semibold text-accent">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll trigger sentinel — flips chaos -> system near section midpoint */}
        <div ref={triggerRef} className="hidden md:block md:h-px" />
      </div>
    </section>
  );
}
