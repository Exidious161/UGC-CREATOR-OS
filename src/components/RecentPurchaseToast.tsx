"use client";

import { useEffect, useRef, useState } from "react";

// Swap this for a real feed later (e.g. poll an API backed by your Razorpay
// webhook) — the component doesn't care where entries come from, it just
// shows one, waits, then shows the next.
const RECENT_ACTIVITY = [
  { name: "Priya", location: "Mumbai" },
  { name: "Alex", location: "Bengaluru" },
  { name: "Neha", location: "Delhi" },
  { name: "Rahul", location: "Pune" },
  { name: "Sara", location: "Hyderabad" },
  { name: "Kabir", location: "Chennai" },
];

const VISIBLE_MS = 5000;
const MAX_SHOWS_PER_SESSION = 4;
const MIN_GAP_MS = 22000;
const MAX_GAP_MS = 42000;
const FIRST_DELAY_MS = 6000;

function randomBetween(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min));
}

export default function RecentPurchaseToast() {
  const [entry, setEntry] = useState<typeof RECENT_ACTIVITY[number] | null>(null);
  const [visible, setVisible] = useState(false);
  const dismissedRef = useRef(false);
  const showsRef = useRef(0);
  const poolRef = useRef<number[]>([]);

  useEffect(() => {
    if (sessionStorage.getItem("ugc_toast_dismissed") === "1") {
      dismissedRef.current = true;
      return;
    }

    let hideTimer: ReturnType<typeof setTimeout>;
    let nextTimer: ReturnType<typeof setTimeout>;

    const nextIndex = () => {
      if (poolRef.current.length === 0) {
        poolRef.current = RECENT_ACTIVITY.map((_, i) => i).sort(() => Math.random() - 0.5);
      }
      return poolRef.current.pop()!;
    };

    const showOne = () => {
      if (dismissedRef.current || showsRef.current >= MAX_SHOWS_PER_SESSION) return;

      setEntry(RECENT_ACTIVITY[nextIndex()]);
      setVisible(true);
      showsRef.current += 1;

      hideTimer = setTimeout(() => {
        setVisible(false);
        if (showsRef.current < MAX_SHOWS_PER_SESSION) {
          nextTimer = setTimeout(showOne, randomBetween(MIN_GAP_MS, MAX_GAP_MS));
        }
      }, VISIBLE_MS);
    };

    const firstTimer = setTimeout(showOne, FIRST_DELAY_MS);

    return () => {
      clearTimeout(firstTimer);
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    dismissedRef.current = true;
    sessionStorage.setItem("ugc_toast_dismissed", "1");
  };

  if (!entry) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-5 left-5 z-40 max-w-[280px] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-white p-3.5 pr-4 shadow-[0_16px_40px_-12px_rgba(43,37,33,0.25)]">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
          {entry.name.charAt(0)}
        </span>
        <p className="text-xs leading-snug text-foreground/75">
          <span className="font-semibold text-foreground">{entry.name}</span> from{" "}
          {entry.location} just got the{" "}
          <span className="font-semibold text-foreground">UGC Creator OS</span>
        </p>
        <button
          onClick={dismiss}
          aria-label="Dismiss notification"
          className="ml-auto shrink-0 self-start text-foreground/30 transition-colors hover:text-foreground/60"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
