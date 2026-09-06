import { createFileRoute, Link } from "@tanstack/react-router";

import { BusinessEditor } from "@/components/portal/BusinessEditor";

import { PortalGuard } from "@/components/portal/PortalGuard";

export const Route = createFileRoute("/portal/new")({
  head: () => ({
    meta: [
      { title: "Pictaria Project" },
      { name: "description", content: "A community project for Maui support." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: GuardedNewBusiness,
});

function NewBusiness() {
  return (
    <main className="min-h-screen bg-deep px-4 pt-16 pb-24">
      <header className="mx-auto max-w-md text-center">
        <h1 className="font-display text-[1.5rem] text-shell">Pictaria Project</h1>
        <p className="mt-1 text-[10px] tracking-[0.2em] text-shell/60 uppercase">
          a community project for Maui support
        </p>
      </header>
      <div className="mx-auto mt-6 max-w-md">
        <Link
          to="/portal/dashboard"
          className="mb-3 flex items-center justify-between rounded-lg border border-accent/40 bg-shell/90 px-5 py-4 shadow-soft transition-transform hover:scale-[1.01]"
        >
          <span>
            <span className="block font-display text-[1.05rem] text-foreground">
              Dashboard
            </span>
            <span className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
              traffic, waitlist and subscribers
            </span>
          </span>
          <span aria-hidden className="text-primary">
            ›
          </span>
        </Link>

        <Link
          to="/portal/library"
          className="mb-3 flex items-center justify-between rounded-lg border border-accent/40 bg-shell/90 px-5 py-4 shadow-soft transition-transform hover:scale-[1.01]"
        >
          <span>
            <span className="block font-display text-[1.05rem] text-foreground">
              Photo Library
            </span>
            <span className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
              add images, categories and collections
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

        <Link
          to="/portal/subscribers"
          className="mb-3 flex items-center justify-between rounded-lg border border-accent/40 bg-shell/90 px-5 py-4 shadow-soft transition-transform hover:scale-[1.01]"
        >
          <span>
            <span className="block font-display text-[1.05rem] text-foreground">
              Subscribers
            </span>
            <span className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
              every email on the daily list
            </span>
          </span>
          <span aria-hidden className="text-primary">
            ›
          </span>
        </Link>

        <Link
          to="/portal/community"
          className="mb-3 flex items-center justify-between rounded-lg border border-accent/40 bg-shell/90 px-5 py-4 shadow-soft transition-transform hover:scale-[1.01]"
        >
          <span>
            <span className="block font-display text-[1.05rem] text-foreground">
              To Be Authorized
            </span>
            <span className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
              community pictures waiting on your yes
            </span>
          </span>
          <span aria-hidden className="text-primary">
            ›
          </span>
        </Link>

        <Link
          to="/portal/push"
          className="mb-3 flex items-center justify-between rounded-lg border border-accent/40 bg-shell/90 px-5 py-4 shadow-soft transition-transform hover:scale-[1.01]"
        >
          <span>
            <span className="block font-display text-[1.05rem] text-foreground">
              Notifications
            </span>
            <span className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
              the 30-day album medley
            </span>
          </span>
          <span aria-hidden className="text-primary">
            ›
          </span>
        </Link>


        <Link
          to="/portal/beta"
          className="mb-5 flex items-center justify-between rounded-lg border border-accent/40 bg-shell/90 px-5 py-4 shadow-soft transition-transform hover:scale-[1.01]"
        >
          <span>
            <span className="block font-display text-[1.05rem] text-foreground">
              Beta Codes
            </span>
            <span className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
              give away the artist version
            </span>
          </span>
          <span aria-hidden className="text-primary">
            ›
          </span>
        </Link>

        <Link
          to="/collection/$collectionId"
          params={{ collectionId: "portal" }}
          className="mb-5 flex items-center justify-between rounded-lg border border-accent/40 bg-shell/90 px-5 py-4 shadow-soft transition-transform hover:scale-[1.01]"
        >
          <span>
            <span className="block font-display text-[1.05rem] text-foreground">
              I Choose Me
            </span>
            <span className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
              the hidden collection
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


function GuardedNewBusiness() {
  return (
    <PortalGuard>
      <NewBusiness />
    </PortalGuard>
  );
}
