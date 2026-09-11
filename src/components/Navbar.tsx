"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/#system", label: "The System" },
  { href: "/#what-inside", label: "What's Inside" },
  { href: "/#for-creators", label: "For Creators" },
  { href: "/#faq", label: "FAQ" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (window.location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-background/90 backdrop-blur-md border-b border-border/40 shadow-[0_1px_0_0_rgba(0,0,0,0.02)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="section-shell">
        <div className="flex items-center justify-between py-4 md:py-5">
          <Link
            href="/"
            onClick={handleLogoClick}
            className="text-[0.95rem] font-semibold tracking-[0.08em] text-foreground uppercase"
          >
            UGC Creator <span className="text-accent">OS</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative text-sm text-foreground/65 hover:text-foreground transition-colors duration-200"
              >
                {link.label}
                <span className="absolute left-0 -bottom-1 h-px w-0 bg-accent transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          <div className="hidden md:block">
            <Link
              href="/#pricing"
              className="inline-flex h-10 items-center justify-center rounded-full border border-accent/40 px-5 text-xs font-semibold uppercase tracking-[0.1em] text-accent transition-all duration-300 hover:border-accent hover:bg-accent hover:text-white"
            >
              Get the OS
            </Link>
          </div>

          <button
            onClick={() => setIsOpen((v) => !v)}
            className="md:hidden flex h-9 w-9 items-center justify-center text-foreground"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            <span className="relative block h-4 w-5">
              <span
                className={`absolute left-0 block h-px w-5 bg-foreground transition-all duration-300 ${
                  isOpen ? "top-2 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-2 block h-px w-5 bg-foreground transition-all duration-300 ${
                  isOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 block h-px w-5 bg-foreground transition-all duration-300 ${
                  isOpen ? "top-2 -rotate-45" : "top-4"
                }`}
              />
            </span>
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden flex flex-col gap-1 pb-6">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="py-2.5 text-base text-foreground/70 hover:text-foreground transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/#pricing"
              onClick={() => setIsOpen(false)}
              className="mt-3 inline-flex h-11 items-center justify-center rounded-full bg-accent text-white text-sm font-semibold"
            >
              Get the OS
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
