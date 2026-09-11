"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";

const TESTIMONIALS = [
  {
    quote:
      "This system gave me the confidence to finally start creating consistent content. The templates saved me hours each week.",
    name: "Priya K.",
    role: "Beauty Creator",
  },
  {
    quote:
      "The hook library transformed how I approach video openings. My engagement has steadily grown since.",
    name: "Alex R.",
    role: "Tech Creator",
  },
  {
    quote:
      "Having ready-to-use frameworks made my content process far more enjoyable and sustainable.",
    name: "Neha S.",
    role: "Lifestyle Creator",
  },
  {
    quote:
      "I used to spend an hour just deciding what to film. The idea vault alone paid for the whole thing.",
    name: "Rahul M.",
    role: "Fitness Creator",
  },
  {
    quote:
      "The pitch templates got me my first paid brand deal within two weeks of using them.",
    name: "Sara D.",
    role: "Fashion Creator",
  },
  {
    quote:
      "Finally a system that doesn't assume I already have a studio setup. Everything works with just my phone.",
    name: "Kabir T.",
    role: "Food Creator",
  },
  {
    quote:
      "The 30-day planner is the reason I actually post consistently now instead of disappearing for weeks.",
    name: "Meera J.",
    role: "Home & Lifestyle Creator",
  },
];

const AUTOPLAY_MS = 4500;

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isOnScreen, setIsOnScreen] = useState(false);

  // Scrolls only within the horizontal track — scrollIntoView() would also
  // scroll the whole page vertically to bring an off-screen card into view.
  const scrollToIndex = (i: number) => {
    const track = trackRef.current;
    const card = track?.children[i] as HTMLElement | undefined;
    if (!track || !card) return;
    const trackRect = track.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const left = track.scrollLeft + (cardRect.left - trackRect.left);
    track.scrollTo({ left, behavior: "smooth" });
  };

  // Autoplay should only ever run while this section is actually visible —
  // otherwise a timer ticking in the background would periodically jump the
  // page down to it.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setIsOnScreen(entry.isIntersecting), {
      threshold: 0.4,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (paused || !isOnScreen) return;
    const id = setInterval(() => {
      setActive((i) => {
        const next = (i + 1) % TESTIMONIALS.length;
        scrollToIndex(next);
        return next;
      });
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, isOnScreen]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const cards = Array.from(track.children) as HTMLElement[];
        const trackLeft = track.scrollLeft;
        let closest = 0;
        let closestDist = Infinity;
        cards.forEach((card, i) => {
          const dist = Math.abs(card.offsetLeft - track.offsetLeft - trackLeft);
          if (dist < closestDist) {
            closestDist = dist;
            closest = i;
          }
        });
        setActive(closest);
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = (i: number) => {
    setActive(i);
    scrollToIndex(i);
    setPaused(true);
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
    <section ref={sectionRef} className="bg-background-alt py-24 md:py-32">
      <div className="section-shell">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="kicker mb-6 flex items-center justify-center gap-3">
            <span className="ornament" />
            What Creators Are Saying
          </p>
          <h2 className="text-[clamp(2.25rem,4.8vw,3.75rem)] font-bold leading-[1.05] tracking-[-0.02em] text-foreground">
            Creator experiences.
          </h2>
        </Reveal>

        <div
          className="relative mt-16"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
        >
          <div
            ref={trackRef}
            onWheel={handleWheel}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="flex w-[280px] shrink-0 snap-start flex-col rounded-2xl border border-border/50 bg-white p-7 transition-shadow duration-300 hover:shadow-[0_20px_50px_-25px_rgba(43,37,33,0.3)] sm:w-[320px]"
              >
                <span className="mb-4 font-serif text-4xl leading-none text-accent/30">&ldquo;</span>
                <p className="flex-1 text-sm leading-relaxed text-foreground/70">{t.quote}</p>
                <div className="mt-6 flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
                    {t.name.charAt(0)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-foreground/50">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => goTo((active - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
            aria-label="Previous review"
            className="absolute left-0 top-1/2 hidden h-10 w-10 -translate-x-4 -translate-y-1/2 items-center justify-center rounded-full bg-white text-foreground shadow-lg transition-transform hover:scale-105 md:flex"
          >
            ←
          </button>
          <button
            onClick={() => goTo((active + 1) % TESTIMONIALS.length)}
            aria-label="Next review"
            className="absolute right-0 top-1/2 hidden h-10 w-10 -translate-y-1/2 translate-x-4 items-center justify-center rounded-full bg-white text-foreground shadow-lg transition-transform hover:scale-105 md:flex"
          >
            →
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          {TESTIMONIALS.map((t, i) => (
            <button
              key={t.name}
              onClick={() => goTo(i)}
              aria-label={`Go to review ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === active ? "w-6 bg-accent" : "w-1.5 bg-foreground/20 hover:bg-foreground/35"
              }`}
            />
          ))}
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-foreground/55">
            Thousands of creators trust this system
          </p>
        </div>
      </div>
    </section>
  );
}
