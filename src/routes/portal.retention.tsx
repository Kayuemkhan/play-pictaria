import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { PortalGuard } from "@/components/portal/PortalGuard";
import {
  listSubscriptionRequests,
  markSubscriptionRequestDone,
  type SubscriptionRequestRow,
} from "@/lib/subscription.functions";

export const Route = createFileRoute("/portal/retention")({
  head: () => ({
    meta: [
      { title: "Free months & cancellations — Portal" },
      {
        name: "description",
        content: "Everyone who accepted a free month or asked to cancel.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: GuardedRetention,
});

function Retention() {
  const load = useServerFn(listSubscriptionRequests);
  const markDone = useServerFn(markSubscriptionRequestDone);
  const [rows, setRows] = useState<SubscriptionRequestRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void load({})
      .then((result) => setRows(result.rows))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handle = async (id: string) => {
    await markDone({ data: { id } });
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, status: "handled" } : row)),
    );
  };

  const pending = rows.filter((row) => row.status !== "handled").length;

  return (
    <main className="min-h-screen bg-deep px-4 pt-12 pb-24">
      <header className="mx-auto max-w-md text-center">
        <h1 className="font-display text-[1.5rem] text-shell">
          Free months &amp; cancellations
        </h1>
        <p className="mt-1 text-[10px] tracking-[0.2em] text-shell/60 uppercase">
          {loading ? "opening the list…" : `${pending} waiting on you`}
        </p>
      </header>

      <div className="mx-auto mt-6 max-w-md space-y-2">
        {rows.map((row) => (
          <div
            key={row.id}
            className="rounded-lg bg-shell/90 px-4 py-3 text-left"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[12px] text-foreground">
                  {row.email}
                </p>
                <p className="mt-0.5 text-[9px] tracking-[0.14em] text-muted-foreground uppercase">
                  {row.kind === "free_month"
                    ? "accepted a free month"
                    : "asked to cancel"}
                  {row.plan ? ` · ${row.plan}` : ""} ·{" "}
                  {new Date(row.created_at).toLocaleDateString()}
                </p>
                {row.reason && (
                  <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                    “{row.reason}”
                  </p>
                )}
              </div>
              {row.status === "handled" ? (
                <span className="shrink-0 text-[9px] tracking-[0.14em] text-primary uppercase">
                  handled
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => void handle(row.id)}
                  className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-[9px] tracking-[0.14em] text-primary-foreground uppercase"
                >
                  Mark done
                </button>
              )}
            </div>
          </div>
        ))}

        {!loading && rows.length === 0 && (
          <p className="mt-6 text-center text-[11px] text-shell/60">
            Nobody has been near the cancel button yet.
          </p>
        )}

        <div className="pt-6 text-center">
          <Link
            to="/portal/new"
            className="text-[10px] tracking-[0.18em] text-shell/60 uppercase underline"
          >
            Back to Pictaria Project
          </Link>
        </div>
      </div>
    </main>
  );
}

function GuardedRetention() {
  return (
    <PortalGuard>
      <Retention />
    </PortalGuard>
  );
}
