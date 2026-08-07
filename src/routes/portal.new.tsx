import { createFileRoute, Link } from "@tanstack/react-router";

import { BusinessEditor } from "@/components/portal/BusinessEditor";

export const Route = createFileRoute("/portal/new")({
  head: () => ({
    meta: [
      { title: "Project Pictaria" },
      { name: "description", content: "A community project for Maui support." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: NewBusiness,
});

function NewBusiness() {
  return (
    <main className="min-h-screen bg-deep px-4 pt-16 pb-24">
      <header className="mx-auto max-w-md text-center">
        <h1 className="font-display text-[1.5rem] text-shell">Project Pictaria</h1>
        <p className="mt-1 text-[10px] tracking-[0.2em] text-shell/60 uppercase">
          a community project for Maui support
        </p>
      </header>
      <div className="mx-auto mt-6 max-w-md">
        <Link
          to="/portal/daily"
          className="mb-3 flex items-center justify-between rounded-lg border border-accent/40 bg-shell/90 px-5 py-4 shadow-soft transition-transform hover:scale-[1.01]"
        >
          <span>
            <span className="block font-display text-[1.05rem] text-foreground">
              Photo Warehouse
            </span>
            <span className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
              every business photo you&apos;ve collected
            </span>
          </span>
          <span aria-hidden className="text-primary">
            ›
          </span>
        </Link>

        <Link
          to="/portal/daily"
          className="mb-3 flex items-center justify-between rounded-lg border border-accent/40 bg-shell/90 px-5 py-4 shadow-soft transition-transform hover:scale-[1.01]"
        >
          <span>
            <span className="block font-display text-[1.05rem] text-foreground">
              Today&apos;s Pictaria
            </span>
            <span className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
              pick one from the warehouse
            </span>
          </span>
          <span aria-hidden className="text-primary">
            ›
          </span>
        </Link>

        <Link
          to="/portal/daily-past"
          className="mb-5 flex items-center justify-between rounded-lg border border-accent/40 bg-shell/90 px-5 py-4 shadow-soft transition-transform hover:scale-[1.01]"
        >
          <span>
            <span className="block font-display text-[1.05rem] text-foreground">
              Yesterdailys
            </span>
            <span className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
              already sent out
            </span>
          </span>
          <span aria-hidden className="text-primary">
            ›
          </span>
        </Link>
        <BusinessEditor />
      </div>
    </main>
  );
}

