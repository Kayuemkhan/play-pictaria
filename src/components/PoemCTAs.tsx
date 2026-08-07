import { Link } from "@tanstack/react-router";

/**
 * The two poem invitations from the homepage — reused on shared Pictaria pages
 * so whoever receives a Pictaria sees the same two ways in.
 */
export function PoemCTAs() {
  return (
    <div className="text-left">
      {/* poem CTA — storybook */}
      <div className="relative overflow-hidden rounded-[4px] border border-accent/60 bg-shell p-4">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-4 -left-5 font-display text-[6rem] leading-none text-accent/10 select-none"
        >
          ❦
        </span>
        <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <p className="min-w-0 font-display text-[0.85rem] leading-snug [color:color-mix(in_oklch,var(--foreground)_92%,black)]">
            Pictures say a thousand words and puzzles make them fun — I want to
            send my own story book to everyone I love
          </p>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="text-[0.55rem] tracking-[0.18em] text-muted-foreground uppercase">
              Create your own Pictarias
            </span>
            <Link
              to="/create"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[0.55rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03]"
            >
              Start here
              <span aria-hidden>›</span>
            </Link>
          </div>
        </div>
      </div>

      {/* poem CTA — daily */}
      <div className="relative mt-3 overflow-hidden rounded-[4px] border border-accent/60 bg-shell p-4">
        <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <p className="min-w-0 font-display text-[0.85rem] leading-snug [color:color-mix(in_oklch,var(--foreground)_92%,black)]">
            I need a little paradise and I need just a little play — please send
            me a free Pictaria every single day
          </p>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="text-[0.55rem] tracking-[0.18em] text-muted-foreground uppercase">
              Get a free Pictaria daily
            </span>
            <Link
              to="/daily"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[0.55rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03]"
            >
              Start here
              <span aria-hidden>›</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
