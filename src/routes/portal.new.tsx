import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { BusinessEditor } from "@/components/portal/BusinessEditor";
import { PortalLock } from "@/components/portal/PortalLock";
import { listPortalBusinesses } from "@/lib/portal.functions";

export const Route = createFileRoute("/portal/new")({
  head: () => ({
    meta: [
      { title: "New Business — Pictaria Portal" },
      { name: "description", content: "Internal Pictaria field capture." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: NewBusiness,
});

function NewBusiness() {
  const load = useServerFn(listPortalBusinesses);
  const [locked, setLocked] = useState<boolean | null>(null);

  const check = async () => {
    const result = await load({});
    setLocked(result.locked);
  };

  useEffect(() => {
    void check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (locked === null) return <main className="min-h-screen bg-deep" />;
  if (locked) return <PortalLock onUnlocked={check} />;

  return (
    <main className="min-h-screen bg-deep px-4 pt-16 pb-24">
      <header className="mx-auto max-w-md text-center">
        <h1 className="font-display text-[1.5rem] text-shell">New business</h1>
        <p className="mt-1 text-[10px] tracking-[0.2em] text-shell/60 uppercase">
          One photo · one voice note
        </p>
        <Link
          to="/portal"
          className="mt-2 inline-block text-[10px] tracking-[0.18em] text-shell/70 uppercase"
        >
          All businesses
        </Link>
      </header>
      <div className="mx-auto mt-6 max-w-md">
        <BusinessEditor />
      </div>
    </main>
  );
}
