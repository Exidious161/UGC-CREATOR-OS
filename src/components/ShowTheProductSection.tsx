import Reveal from "./Reveal";

function Card({
  n,
  title,
  desc,
  children,
  delay,
}: {
  n: string;
  title: string;
  desc: string;
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <Reveal
      delay={delay}
      className="group rounded-2xl border border-border/50 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-30px_rgba(43,37,33,0.25)]"
    >
      <div className="mb-5 flex items-center justify-between">
        <span className="text-[0.65rem] font-semibold tracking-[0.1em] text-accent/70">
          {n}
        </span>
      </div>
      <h3 className="mb-1.5 text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mb-5 text-sm leading-relaxed text-foreground/55">{desc}</p>
      <div className="rounded-xl bg-accent-muted/25 p-4">{children}</div>
    </Reveal>
  );
}

const HOOK_TAGS = ["Problem-focused", "Benefit-driven", "Curiosity gap", "Platform tuned"];
const ANGLES = [
  "Tutorial",
  "Lifestyle",
  "Educational",
  "Humor",
  "Comparison",
  "Behind-the-scenes",
  "Collab",
  "Results",
];

export default function ShowTheProductSection() {
  return (
    <section id="what-inside" className="bg-background-alt py-24 md:py-32">
      <div className="section-shell">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="kicker mb-6 flex items-center justify-center gap-3">
            <span className="ornament" />
            See What&rsquo;s Inside
          </p>
          <h2 className="text-[clamp(2.25rem,4.8vw,3.75rem)] font-bold leading-[1.05] tracking-[-0.02em] text-foreground">
            Real pages. <span className="text-accent">Ready to use.</span>
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card n="01" title="Hook Library" desc="50 scroll-stopping openers by emotion and niche." delay={0}>
            <div className="flex flex-wrap gap-2">
              {HOOK_TAGS.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-accent/25 bg-white px-2.5 py-1 text-[0.7rem] font-medium text-foreground/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Card>

          <Card n="02" title="Script Framework" desc="Proven structures for authentic, converting UGC." delay={60}>
            <div className="space-y-2 font-mono text-[0.7rem] text-foreground/60">
              <p><span className="text-accent">Hook</span> — stop the scroll</p>
              <p><span className="text-accent">Problem</span> — name the pain</p>
              <p><span className="text-accent">Solution</span> — show the fix</p>
              <p><span className="text-accent">CTA</span> — one clear ask</p>
            </div>
          </Card>

          <Card n="03" title="10 Content Angles" desc="Turn one product into weeks of content." delay={120}>
            <div className="grid grid-cols-2 gap-1.5">
              {ANGLES.map((a) => (
                <span key={a} className="truncate rounded-md bg-white px-2 py-1 text-[0.68rem] text-foreground/65">
                  {a}
                </span>
              ))}
            </div>
          </Card>

          <Card n="04" title="30-Day Planner" desc="A done-for-you content calendar, filled in." delay={180}>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 21 }).map((_, i) => (
                <span
                  key={i}
                  className={`aspect-square rounded-[4px] ${
                    [2, 5, 9, 12, 15, 18].includes(i) ? "bg-accent" : "bg-white"
                  }`}
                />
              ))}
            </div>
          </Card>

          <Card n="05" title="Shot List" desc="Exactly what to film for every format." delay={240}>
            <div className="space-y-2 text-[0.72rem] text-foreground/65">
              {["Product close-up", "Creator using it", "Before / after", "B-roll cutaways"].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 shrink-0 rounded-[3px] border border-accent/40 bg-white" />
                  {s}
                </div>
              ))}
            </div>
          </Card>

          <Card n="06" title="Brand Pitch Templates" desc="Email scripts and media kits that work." delay={300}>
            <div className="space-y-2 rounded-lg bg-white p-3">
              <div className="h-2 w-2/3 rounded bg-foreground/15" />
              <div className="h-2 w-full rounded bg-foreground/10" />
              <div className="h-2 w-5/6 rounded bg-foreground/10" />
              <div className="mt-2 inline-block rounded bg-accent/10 px-2 py-1 text-[0.62rem] font-medium text-accent">
                Send pitch →
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
