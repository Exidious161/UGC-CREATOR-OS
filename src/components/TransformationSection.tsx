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

const N = WORKFLOW.length;
const ROW_UNIT = 100; // viewBox units "owned" by each step, vertically
const TOTAL_H = N * ROW_UNIT;
const NODE_X = (i: number) => (i % 2 === 0 ? 20 : 80); // zigzag: alternates left/right
const NODE_Y = (i: number) => i * ROW_UNIT + ROW_UNIT / 2;

/** One continuous smooth path winding through every node's (x, y) — the "road". */
function buildRoadPath() {
  let d = `M ${NODE_X(0)} ${NODE_Y(0)}`;
  for (let i = 1; i < N; i++) {
    const [px, py] = [NODE_X(i - 1), NODE_Y(i - 1)];
    const [x, y] = [NODE_X(i), NODE_Y(i)];
    const midY = (py + y) / 2;
    d += ` C ${px} ${midY}, ${x} ${midY}, ${x} ${y}`;
  }
  return d;
}

function buildStraightPath() {
  let d = `M 50 ${NODE_Y(0)}`;
  for (let i = 1; i < N; i++) d += ` L 50 ${NODE_Y(i)}`;
  return d;
}

const ROAD_D = buildRoadPath();
const STRAIGHT_D = buildStraightPath();

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

/** The road: a faint base track, an accent track that fills in with scroll progress
 * (via the pathLength=1 trick, so no manual arc-length math), and a glowing marker
 * that travels to the exact point on the curve matching current progress. */
function Road({
  pathD,
  progress,
  pathRef,
  markerRef,
  className,
}: {
  pathD: string;
  progress: number;
  pathRef: React.RefObject<SVGPathElement | null>;
  markerRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
}) {
  return (
    <>
      <svg
        viewBox={`0 0 100 ${TOTAL_H}`}
        preserveAspectRatio="none"
        className={`pointer-events-none absolute inset-0 h-full w-full ${className ?? ""}`}
      >
        <path
          d={pathD}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="1.4"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          ref={pathRef}
          d={pathD}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="1.4"
          strokeLinecap="round"
          pathLength="1"
          vectorEffect="non-scaling-stroke"
          style={{ strokeDasharray: 1, strokeDashoffset: 1 - progress }}
        />
      </svg>
      <div
        ref={markerRef}
        className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_0_5px_rgba(201,84,50,0.18),0_0_18px_4px_rgba(201,84,50,0.55)] transition-opacity duration-300"
        style={{ opacity: progress > 0.005 && progress < 0.999 ? 1 : 0 }}
      />
    </>
  );
}

export default function TransformationSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const desktopPathRef = useRef<SVGPathElement>(null);
  const desktopMarkerRef = useRef<HTMLDivElement>(null);
  const mobilePathRef = useRef<SVGPathElement>(null);
  const mobileMarkerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    // getTotalLength() re-walks the path geometry — the path never changes,
    // so compute each length once and reuse it instead of calling this on
    // every single scroll frame for the component's entire lifetime.
    const lengths = new WeakMap<SVGPathElement, number>();
    const getLength = (path: SVGPathElement) => {
      let len = lengths.get(path);
      if (len === undefined) {
        len = path.getTotalLength();
        lengths.set(path, len);
      }
      return len;
    };

    const mq = window.matchMedia("(min-width: 768px)");

    const placeMarker = (path: SVGPathElement | null, marker: HTMLDivElement | null, p: number) => {
      if (!path || !marker) return;
      const pt = path.getPointAtLength(getLength(path) * p);
      marker.style.left = `${pt.x}%`;
      marker.style.top = `${(pt.y / TOTAL_H) * 100}%`;
    };

    const update = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();

      // Section is well outside the viewport in either direction — scrolling
      // through the rest of the page shouldn't pay for SVG geometry work here.
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;

      const p = clamp((window.innerHeight * 0.7 - rect.top) / rect.height, 0, 1);
      setProgress(p);
      if (mq.matches) {
        placeMarker(desktopPathRef.current, desktopMarkerRef.current, p);
      } else {
        placeMarker(mobilePathRef.current, mobileMarkerRef.current, p);
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
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

        <div ref={containerRef} className="relative mx-auto mt-16 max-w-md md:mt-8 md:max-w-4xl">
          {/* Mobile: straight center road, steps stacked below each node */}
          <div className="relative md:hidden">
            <Road pathD={STRAIGHT_D} progress={progress} pathRef={mobilePathRef} markerRef={mobileMarkerRef} />
            {WORKFLOW.map((step, i) => {
              const isReached = progress >= NODE_Y(i) / TOTAL_H - 0.01;
              return (
                <div key={step.n} className="relative flex flex-col items-center px-4 pt-12 pb-4 text-center first:pt-2">
                  <StepNode n={step.n} reached={isReached} />
                  <Reveal className="mt-4 max-w-[280px]">
                    <h3 className="text-lg font-bold tracking-tight text-foreground">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-foreground/60">{step.desc}</p>
                  </Reveal>
                </div>
              );
            })}
          </div>

          {/* Desktop: zigzag road, nodes alternate sides, text sits on the opposite side */}
          <div className="relative hidden md:block">
            <Road pathD={ROAD_D} progress={progress} pathRef={desktopPathRef} markerRef={desktopMarkerRef} />
            {WORKFLOW.map((step, i) => {
              const nodeLeft = i % 2 === 0;
              const isReached = progress >= NODE_Y(i) / TOTAL_H - 0.01;
              return (
                <div key={step.n} className="relative h-[190px]">
                  <div
                    className="absolute top-1/2 -translate-y-1/2"
                    style={{ [nodeLeft ? "left" : "right"]: "20%", transform: `translate(${nodeLeft ? "-50%" : "50%"}, -50%)` }}
                  >
                    <StepNode n={step.n} reached={isReached} />
                  </div>
                  <div
                    className="absolute top-1/2 max-w-[38%] -translate-y-1/2"
                    style={{ [nodeLeft ? "left" : "right"]: "32%", textAlign: nodeLeft ? "left" : "right" }}
                  >
                    <Reveal delay={i * 60}>
                      <h3 className="text-2xl font-bold tracking-tight text-foreground">{step.title}</h3>
                      <p className="mt-2 text-base leading-relaxed text-foreground/60">{step.desc}</p>
                    </Reveal>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepNode({ n, reached }: { n: string; reached: boolean }) {
  return (
    <div className="group/node relative shrink-0">
      <span
        className={`pointer-events-none absolute inset-0 rounded-full bg-accent/30 opacity-0 transition-all duration-500 group-hover/node:scale-150 group-hover/node:opacity-100 ${
          reached ? "" : "hidden"
        }`}
      />
      <div
        className={`relative flex h-14 w-14 items-center justify-center rounded-full border-2 text-base font-bold shadow-sm transition-all duration-500 group-hover/node:scale-125 md:h-16 md:w-16 md:text-lg ${
          reached
            ? "scale-110 border-accent bg-accent text-white shadow-[0_10px_25px_-8px_rgba(201,84,50,0.6)]"
            : "border-accent/25 bg-white text-accent/70"
        }`}
      >
        {n}
      </div>
    </div>
  );
}
