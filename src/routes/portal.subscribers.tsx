import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { listSubscribers } from "@/lib/subscribers.functions";
import type { SubscriberRow } from "@/lib/subscribers.functions";

import { PortalGuard } from "@/components/portal/PortalGuard";

export const Route = createFileRoute("/portal/subscribers")({
  head: () => ({
    meta: [
      { title: "Subscribers — Portal" },
      {
        name: "description",
        content: "Every email address on the Pictaria daily list.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: GuardedSubscribers,
});

function Subscribers() {
  const load = useServerFn(listSubscribers);
  const [rows, setRows] = useState<SubscriberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void load({})
      .then((result) => setRows(result.rows))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emails = rows.map((row) => row.email).join(", ");

  const copy = async () => {
    await navigator.clipboard.writeText(emails);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const csv = [
      "email,source,joined",
      ...rows.map((row) => `${row.email},${row.source ?? ""},${row.created_at}`),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "pictaria-subscribers.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-deep px-4 pt-12 pb-24">
      <header className="mx-auto max-w-md text-center">
        <h1 className="font-display text-[1.5rem] text-shell">Subscribers</h1>
        <p className="mt-1 text-[10px] tracking-[0.2em] text-shell/60 uppercase">
          {loading ? "opening the list…" : `${rows.length} on the list`}
        </p>
      </header>

      <div className="mx-auto mt-6 max-w-md">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void copy()}
            disabled={rows.length === 0}
            className="flex-1 rounded-full bg-primary px-4 py-2.5 text-[11px] tracking-[0.16em] text-primary-foreground uppercase disabled:opacity-50"
          >
            {copied ? "Copied" : "Copy all emails"}
          </button>
          <button
            type="button"
            onClick={download}
            disabled={rows.length === 0}
            className="flex-1 rounded-full border border-shell/30 px-4 py-2.5 text-[11px] tracking-[0.16em] text-shell uppercase disabled:opacity-50"
          >
            Download CSV
          </button>
        </div>

        <ul className="mt-5 space-y-1.5">
          {rows.map((row) => (
            <li
              key={`${row.email}-${row.created_at}`}
              className="flex items-center justify-between rounded-lg bg-shell/90 px-4 py-2.5"
            >
              <span className="truncate text-[12px] text-foreground">
                {row.email}
              </span>
              <span className="ml-3 shrink-0 text-[9px] tracking-[0.12em] text-muted-foreground uppercase">
                {new Date(row.created_at).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>

        {!loading && rows.length === 0 && (
          <p className="mt-6 text-center text-[11px] text-shell/60">
            No one has joined the list yet.
          </p>
        )}

        <div className="mt-8 text-center">
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

function GuardedSubscribers() {
  return (
    <PortalGuard>
      <Subscribers />
    </PortalGuard>
  );
}
