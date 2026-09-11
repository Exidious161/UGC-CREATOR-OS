"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";

type ChapterIcon = "target" | "hook" | "clapper";

type Page =
  | { type: "cover" }
  | { type: "toc" }
  | {
      type: "divider";
      num: string;
      chapter: string;
      title: string;
      subtitle: string;
      topics: string[];
      icon: ChapterIcon;
      page: number;
    }
  | { type: "content"; kicker: string; title: string; intro?: string; items: string[]; page: number }
  | { type: "table"; kicker: string; title: string; rows: { day: string; format: string; focus: string }[]; page: number }
  | { type: "closing" };

const PAGES: Page[] = [
  { type: "cover" },
  { type: "toc" },
  {
    type: "divider",
    num: "01",
    chapter: "Chapter One",
    title: "Foundations — what UGC actually is",
    subtitle:
      "Before hooks, scripts, or shot lists, every profitable UGC creator understands one thing clearly: what they're actually being paid to make, and why.",
    topics: ["UGC vs. influencer content", "Why brands pay for it", "The 5 pillars", "Content-to-product fit"],
    icon: "target",
    page: 6,
  },
  {
    type: "content",
    kicker: "02 — THE IDEA VAULT",
    title: "The idea engine: one product, ten angles",
    intro: "You will never run out of ideas once you stop asking “what should I film?” and start running every product through the same ten questions.",
    items: [
      "What problem does this solve, stated as plainly as possible?",
      "What did I assume before I tried it, and what actually happened?",
      "How would I explain this to a friend who's never heard of it?",
      "What's the single most satisfying moment of using it?",
      "What would I compare it to, and how does it win or lose?",
    ],
    page: 13,
  },
  {
    type: "divider",
    num: "03",
    chapter: "Chapter Three",
    title: "The Hook Library",
    subtitle:
      "Fifty scroll-stopping opening lines, organized by the emotion they trigger, plus the formula for writing new ones for any product in seconds.",
    topics: ["Why the first 3 seconds decide everything", "7 hook categories, 50 examples", "The fill-in-the-blank formula"],
    icon: "hook",
    page: 18,
  },
  {
    type: "content",
    kicker: "03 — THE HOOK LIBRARY",
    title: "50 hooks, organized by category",
    intro: "Curiosity & open loop",
    items: [
      "“Nobody told me this before I bought it...”",
      "“The one thing they don't put on the label.”",
      "“I almost returned this until I found out why it does this.”",
      "“This looked pointless until I actually tried it.”",
      "“There's a reason this sold out three times.”",
    ],
    page: 20,
  },
  {
    type: "divider",
    num: "05",
    chapter: "Chapter Five",
    title: "Shot Lists",
    subtitle:
      "Exactly what footage to capture for every major UGC format — so nothing important gets missed once you're already mid-shoot.",
    topics: ["Why shot variety matters", "5 ready-made shot lists", "The universal b-roll checklist"],
    icon: "clapper",
    page: 28,
  },
  {
    type: "table",
    kicker: "06 — THE 30-DAY PLANNER",
    title: "Your 30-day content calendar",
    rows: [
      { day: "01", format: "Testimonial", focus: "Honest first impression of a new product" },
      { day: "03", format: "Tutorial", focus: "3-step how-to using a hero product" },
      { day: "05", format: "Unboxing", focus: "Newest product to arrive that week" },
      { day: "07", format: "Comparison", focus: "Hero product vs. a well-known alternative" },
      { day: "10", format: "Before/after", focus: "7-day result reveal" },
    ],
    page: 34,
  },
  { type: "closing" },
];

function ChapterIconGlyph({ icon }: { icon: ChapterIcon }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8 } as const;
  if (icon === "target") {
    return (
      <svg {...common} className="h-5 w-5">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="0.6" fill="currentColor" />
      </svg>
    );
  }
  if (icon === "hook") {
    return (
      <svg {...common} strokeLinecap="round" className="h-5 w-5">
        <path d="M9 4v9a4 4 0 0 0 8 0v-2" />
        <circle cx="9" cy="4" r="1.3" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg {...common} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <rect x="3" y="8" width="18" height="12" rx="1.5" />
      <path d="M3 8l2.5-4h3L6 8M10 8l2.5-4h3L13 8M17 8l2.5-4h1.5" />
    </svg>
  );
}

function PageFrame({
  children,
  dark,
  footer,
  contents,
}: {
  children: React.ReactNode;
  dark?: boolean;
  footer?: string;
  contents?: boolean;
}) {
  return (
    <div
      className={`relative flex h-full w-full flex-col overflow-hidden rounded-[6px] px-6 py-7 ${
        dark ? "bg-chapter-dark text-white" : "bg-white text-foreground"
      }`}
    >
      <div className="flex-1">{children}</div>
      {footer && (
        <div
          className={`mt-4 flex items-center justify-between gap-2 border-t pt-3 text-[0.52rem] font-medium uppercase tracking-[0.1em] ${
            dark ? "border-white/10 text-white/40" : "border-border text-foreground/35"
          }`}
        >
          <span className="shrink-0">UGC Creator OS</span>
          {contents && (
            <span className={`truncate ${dark ? "text-white/60" : "text-foreground/50"}`}>↑ Contents</span>
          )}
          <span className={`shrink-0 ${dark ? "text-chapter-gold" : "text-accent"}`}>{footer}</span>
        </div>
      )}
    </div>
  );
}

function PageFace({ page }: { page: Page }) {
  switch (page.type) {
    case "cover":
      return (
        <PageFrame>
          <p className="max-w-[60%] text-[0.48rem] font-bold uppercase tracking-[0.1em] text-accent">
            The Complete System
            <br />
            for UGC Creators
          </p>
          <h3 className="mt-3 text-[1.85rem] font-bold leading-[0.86] tracking-tight">
            <span className="text-accent">UGC</span>
            <br />
            <span className="text-accent">Creator</span>
            <br />
            OS
          </h3>
          <div className="mt-2 h-[3px] w-10 bg-accent" />
          <p className="mt-3 text-[0.52rem] font-bold uppercase tracking-[0.08em] text-accent">
            The Practical UGC Playbook
          </p>
          <p className="mt-2 text-[0.56rem] leading-snug text-foreground/70">
            Create better content.
            <br />
            Build your portfolio.
            <br />
            Work with brands.
          </p>
          <span className="absolute right-5 top-6 flex h-11 w-11 items-center justify-center rounded-full bg-accent text-center text-[0.38rem] font-bold uppercase leading-tight text-white">
            For
            <br />
            Creators
          </span>
        </PageFrame>
      );

    case "toc":
      return (
        <PageFrame footer="003">
          <p className="text-[0.55rem] font-bold uppercase tracking-[0.12em] text-accent">Contents</p>
          <h3 className="mt-2 text-xl font-bold tracking-tight">What&rsquo;s inside</h3>
          <div className="mt-4 space-y-2">
            {[
              ["01", "Foundations"],
              ["02", "The Idea Vault"],
              ["03", "The Hook Library"],
              ["04", "Script Frameworks"],
              ["05", "Shot Lists"],
              ["06", "30-Day Planner"],
              ["07", "Repurposing"],
              ["08", "Portfolio"],
              ["09", "Brand Pitches"],
            ].map(([n, t]) => (
              <div key={n} className="flex items-center gap-2 text-[0.62rem]">
                <span className="font-bold text-accent">{n}</span>
                <span className="flex-1 truncate text-foreground/75">{t}</span>
                <span className="flex-1 border-b border-dotted border-border" />
              </div>
            ))}
          </div>
        </PageFrame>
      );

    case "divider":
      return (
        <PageFrame dark footer={String(page.page).padStart(3, "0")} contents>
          <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white">
            <ChapterIconGlyph icon={page.icon} />
          </span>
          <p className="text-[0.5rem] font-bold uppercase tracking-[0.12em] text-chapter-gold">
            {page.chapter}
          </p>
          <span className="pointer-events-none absolute right-4 top-4 text-[3.5rem] font-bold leading-none text-white/[0.06]">
            {page.num}
          </span>
          <h3 className="mt-2 text-[1.05rem] font-bold leading-[1.08] tracking-tight text-white">{page.title}</h3>
          <p className="mt-2 text-[0.52rem] italic leading-snug text-white/55">{page.subtitle}</p>
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-white/10 pt-2">
            {page.topics.map((t) => (
              <p key={t} className="text-[0.48rem] font-semibold leading-snug text-white/70">
                {t}
              </p>
            ))}
          </div>
        </PageFrame>
      );

    case "content":
      return (
        <PageFrame footer={String(page.page).padStart(3, "0")}>
          <p className="text-[0.52rem] font-bold uppercase tracking-[0.1em] text-accent">{page.kicker}</p>
          <h3 className="mt-2 text-[1.05rem] font-bold leading-tight tracking-tight">{page.title}</h3>
          {page.intro && (
            <p className="mt-2 text-[0.6rem] font-semibold leading-relaxed text-foreground/55">
              {page.intro}
            </p>
          )}
          <div className="mt-3 space-y-1.5">
            {page.items.map((item, i) => (
              <div key={item} className="flex gap-2 border-t border-border/70 pt-1.5 first:border-t-0 first:pt-0">
                <span className="text-[0.55rem] font-bold text-accent">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[0.58rem] leading-snug text-foreground/70">{item}</span>
              </div>
            ))}
          </div>
        </PageFrame>
      );

    case "table":
      return (
        <PageFrame footer={String(page.page).padStart(3, "0")}>
          <p className="text-[0.52rem] font-bold uppercase tracking-[0.1em] text-accent">{page.kicker}</p>
          <h3 className="mt-2 text-[1.05rem] font-bold leading-tight tracking-tight">{page.title}</h3>
          <div className="mt-3 overflow-hidden rounded-md border border-border">
            <div className="grid grid-cols-[1.4rem_3.6rem_1fr] gap-1 bg-accent-muted/40 px-2 py-1.5 text-[0.48rem] font-bold uppercase tracking-wide text-foreground/50">
              <span>Day</span>
              <span>Format</span>
              <span>Focus</span>
            </div>
            {page.rows.map((r, i) => (
              <div
                key={r.day}
                className={`grid grid-cols-[1.4rem_3.6rem_1fr] gap-1 px-2 py-1.5 text-[0.52rem] ${
                  i % 2 === 1 ? "bg-background" : "bg-white"
                }`}
              >
                <span className="font-bold text-accent">{r.day}</span>
                <span className="truncate font-semibold text-foreground/75">{r.format}</span>
                <span className="truncate text-foreground/55">{r.focus}</span>
              </div>
            ))}
          </div>
        </PageFrame>
      );

    case "closing":
      return (
        <PageFrame dark footer="056" contents>
          <p className="text-[0.55rem] font-bold uppercase tracking-[0.14em] text-chapter-gold">Last Thing</p>
          <h3 className="mt-3 text-[1.05rem] font-bold leading-[1.15] tracking-tight text-white">
            You don&rsquo;t need to feel ready. You need your next idea, your next hook, and a camera.
          </h3>
          <p className="mt-3 text-[0.58rem] italic leading-relaxed text-white/55">
            Every system in this guide only works once it&rsquo;s actually used.
          </p>
          <span className="mt-4 inline-flex items-center rounded-full bg-accent px-3 py-1.5 text-[0.52rem] font-semibold text-white">
            Get more templates &amp; tools →
          </span>
          <div className="mt-auto grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-[0.48rem] font-semibold text-white/70">
            <span>Ch.1 Strategy</span>
            <span>Ch.2 First idea</span>
            <span>Ch.6 First week</span>
          </div>
        </PageFrame>
      );
  }
}

export default function LookInsideSection() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lightboxIndex === null) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") setLightboxIndex((i) => (i === null ? i : (i + 1) % PAGES.length));
      if (e.key === "ArrowLeft") setLightboxIndex((i) => (i === null ? i : (i - 1 + PAGES.length) % PAGES.length));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxIndex]);

  const scrollByCard = (dir: 1 | -1) => {
    trackRef.current?.scrollBy({ left: dir * 240, behavior: "smooth" });
  };

  // A horizontally-scrollable track with no vertical overflow will otherwise
  // hijack a plain vertical mouse-wheel scroll into horizontal scroll on
  // itself instead of letting the page continue scrolling down.
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      window.scrollBy({ top: e.deltaY });
    }
  };

  return (
    <section className="bg-chapter-dark py-24 md:py-32">
      <div className="section-shell">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="kicker mb-6 flex items-center justify-center gap-3 text-chapter-gold">
            <span className="ornament text-chapter-gold" />
            Look Inside
          </p>
          <h2 className="text-[clamp(2.25rem,4.5vw,3.5rem)] font-bold leading-[1.02] tracking-[-0.02em] text-white">
            Flip through the <span className="text-accent">actual pages.</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-white/55">
            Not a mockup — this is the real 56-page playbook. Tap any page to
            open it full-size.
          </p>
        </Reveal>

        <div className="relative mt-16">
          <div
            ref={trackRef}
            onWheel={handleWheel}
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {PAGES.map((page, i) => (
              <button
                key={i}
                onClick={() => setLightboxIndex(i)}
                className="group relative aspect-[3/4] w-[230px] shrink-0 snap-start overflow-hidden rounded-[10px] shadow-[0_25px_55px_-20px_rgba(0,0,0,0.65)] outline outline-1 outline-white/10 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-3 hover:scale-[1.03] hover:shadow-[0_35px_70px_-18px_rgba(201,84,50,0.5)] hover:outline-accent/60 sm:w-[280px] lg:w-[320px]"
                aria-label={`Open page ${i + 1} of ${PAGES.length}`}
              >
                {/* Base design is authored at 220x293 — scaled up per breakpoint so text/spacing stay
                    proportionally sharp instead of looking sparse inside a much bigger card. */}
                <div
                  className="absolute left-0 top-0 h-[293px] w-[220px] origin-top-left scale-[1.0455] sm:scale-[1.2727] lg:scale-[1.4545]"
                >
                  <PageFace page={page} />
                </div>

                {/* Diagonal shine sweep on hover */}
                <span className="pointer-events-none absolute inset-0 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-700 ease-out group-hover:translate-x-full group-hover:opacity-100" />

                <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/35 group-hover:opacity-100">
                  <span className="scale-90 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-foreground shadow-lg transition-transform duration-300 group-hover:scale-100">
                    View page
                  </span>
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={() => scrollByCard(-1)}
            aria-label="Scroll left"
            className="absolute left-0 top-1/2 hidden h-10 w-10 -translate-x-4 -translate-y-1/2 items-center justify-center rounded-full bg-white text-foreground shadow-lg transition-transform hover:scale-105 md:flex"
          >
            ←
          </button>
          <button
            onClick={() => scrollByCard(1)}
            aria-label="Scroll right"
            className="absolute right-0 top-1/2 hidden h-10 w-10 -translate-y-1/2 translate-x-4 items-center justify-center rounded-full bg-white text-foreground shadow-lg transition-transform hover:scale-105 md:flex"
          >
            →
          </button>
        </div>

        <p className="mt-2 text-center text-xs uppercase tracking-[0.15em] text-white/30">
          {PAGES.length} of 56 pages shown &middot; swipe or tap to preview
        </p>
      </div>

      {lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex animate-[lightboxFade_0.25s_ease-out] items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            aria-label="Close preview"
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            ✕
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((i) => (i === null ? i : (i - 1 + PAGES.length) % PAGES.length));
            }}
            aria-label="Previous page"
            className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-8"
          >
            ←
          </button>

          <div
            key={lightboxIndex}
            onClick={(e) => e.stopPropagation()}
            className="aspect-[3/4] w-full max-w-[380px] origin-center animate-[lightboxZoom_0.3s_cubic-bezier(0.16,1,0.3,1)] overflow-hidden rounded-xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)] sm:max-w-[420px] lg:max-w-[460px]"
          >
            <PageFace page={PAGES[lightboxIndex]} />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((i) => (i === null ? i : (i + 1) % PAGES.length));
            }}
            aria-label="Next page"
            className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-8"
          >
            →
          </button>

          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium uppercase tracking-[0.15em] text-white/50">
            Page {lightboxIndex + 1} of {PAGES.length}
          </span>
        </div>
      )}

      <style>{`
        @keyframes lightboxFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes lightboxZoom {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </section>
  );
}
