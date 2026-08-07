import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { BusinessEditor } from "@/components/portal/BusinessEditor";
import { PortalLock } from "@/components/portal/PortalLock";
import { getPortalBusiness } from "@/lib/portal.functions";
import type { PortalRecord } from "@/lib/portal-types";

export const Route = createFileRoute("/portal/$id")({
  head: () => ({
    meta: [
      { title: "Business Record — Victoria's" },
      { name: "description", content: "A community project celebrating Maui businesses." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: BusinessRecord,
});

function BusinessRecord() {
  const { id } = Route.useParams();
  const load = useServerFn(getPortalBusiness);
  const [locked, setLocked] = useState<boolean | null>(null);
  const [record, setRecord] = useState<PortalRecord | null>(null);

  const check = async () => {
    const result = await load({ data: { id } });
    if (result.locked) {
      setLocked(true);
      return;
    }
    setLocked(false);
    setRecord(result.record);
  };

  useEffect(() => {
    void check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (locked === null) return <main className="min-h-screen bg-deep" />;
  if (locked) return <PortalLock onUnlocked={check} />;

  if (!record) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-deep px-6">
        <p className="text-[13px] text-shell/70">
          That business record no longer exists.
        </p>
        <Link
          to="/"
          className="mt-4 text-[10px] tracking-[0.18em] text-primary uppercase"
        >
          Back home
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-deep px-4 pt-16 pb-24">
      <header className="mx-auto max-w-md text-center">
        <h1 className="font-display text-[1.5rem] text-shell">
          {record.company_name || "Untitled business"}
        </h1>
        <p className="mt-1 text-[10px] tracking-[0.2em] text-shell/60 uppercase">
          {record.status} · updated {new Date(record.updated_at).toLocaleDateString()}
        </p>
      </header>
      <div className="mx-auto mt-6 max-w-md">
        <BusinessEditor record={record} />
      </div>
    </main>
  );
}
