import Reveal from "./Reveal";

const BEFORE = [
  "No clear content strategy",
  "Inconsistent posting schedule",
  "Hours lost brainstorming",
  "Low engagement on content",
  "Struggling to pitch brands",
  "Inconsistent income",
];

const AFTER = [
  "Clear strategy for every product",
  "Consistent posting schedule",
  "Done-for-you content ideas",
  "Higher engagement and reach",
  "Professional pitch templates",
  "Steady creator income",
];

export default function WhatsInsideSection() {
  return (
    <section id="transformation" className="bg-background py-24 md:py-32">
      <div className="section-shell">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="kicker mb-6 flex items-center justify-center gap-3">
            <span className="ornament" />
            The Transformation
          </p>
          <h2 className="text-[clamp(2.25rem,4.8vw,3.75rem)] font-bold leading-[1.05] tracking-[-0.02em] text-foreground">
            Before &amp; <span className="text-accent">after the system.</span>
          </h2>
        </Reveal>

        <div className="relative mx-auto mt-16 grid max-w-4xl gap-6 md:grid-cols-2">
          <Reveal delay={80} className="rounded-2xl border border-border/50 bg-white p-8">
            <p className="kicker mb-4 text-foreground/40">Before</p>
            <h3 className="mb-6 text-xl font-semibold text-foreground">
              Struggling Creator
            </h3>
            <ul className="space-y-3.5">
              {BEFORE.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-foreground/70">
                  <span className="mt-0.5 text-foreground/30">✕</span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal
            delay={160}
            className="rounded-2xl border border-accent/30 bg-white p-8 shadow-[0_20px_50px_-25px_rgba(201,84,50,0.35)]"
          >
            <p className="kicker mb-4">After</p>
            <h3 className="mb-6 text-xl font-semibold text-foreground">
              Creator Using the OS
            </h3>
            <ul className="space-y-3.5">
              {AFTER.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                  <span className="mt-0.5 text-accent">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <span className="pointer-events-none absolute left-1/2 top-1/2 hidden h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background text-accent md:flex">
            →
          </span>
        </div>
      </div>
    </section>
  );
}
