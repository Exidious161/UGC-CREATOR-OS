export default function BookCover() {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[20px] border border-border/60 bg-white px-7 py-8 shadow-[0_30px_60px_-20px_rgba(43,37,33,0.35)] sm:px-9 sm:py-10">
      <span className="absolute right-6 top-6 flex h-16 w-16 shrink-0 rotate-[6deg] items-center justify-center rounded-full bg-accent text-center text-[0.6rem] font-bold uppercase leading-tight tracking-wide text-white sm:h-20 sm:w-20 sm:text-[0.65rem]">
        For
        <br />
        Creators
        <br />
        By a
        <br />
        Creator
      </span>

      <p className="max-w-[65%] text-[0.62rem] font-bold uppercase leading-snug tracking-[0.1em] text-accent sm:text-xs">
        The Complete System
        <br />
        for UGC Creators
      </p>

      <h2 className="mt-6 text-[2.6rem] font-bold leading-[0.88] tracking-tight sm:mt-8 sm:text-[3.1rem]">
        <span className="text-accent">UGC</span>
        <br />
        <span className="text-accent">Creator</span>
        <br />
        <span className="text-foreground">OS</span>
      </h2>

      <div className="mt-5 h-[3px] w-12 bg-accent sm:mt-6" />

      <p className="mt-5 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-accent sm:mt-6 sm:text-xs">
        The Practical UGC Playbook
      </p>

      <p className="mt-3 text-[0.78rem] leading-relaxed text-foreground/70 sm:text-sm">
        Create better content.
        <br />
        Build your portfolio.
        <br />
        Work with brands.
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border pt-4 text-[0.55rem] font-semibold uppercase tracking-[0.08em] text-foreground/40 sm:text-[0.6rem]">
        <span>Ideas</span>
        <span className="text-accent/50">&middot;</span>
        <span>Scripts</span>
        <span className="text-accent/50">&middot;</span>
        <span>Shot Lists</span>
        <span className="text-accent/50">&middot;</span>
        <span>Planners</span>
        <span className="text-accent/50">&middot;</span>
        <span>Brand Opportunities</span>
      </div>
    </div>
  );
}
