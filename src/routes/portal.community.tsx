import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { PortalGuard } from "@/components/portal/PortalGuard";
import {
  listCommunitySubmissions,
  setCommunitySubmissionStatus,
  type CommunitySubmission,
} from "@/lib/community.functions";

export const Route = createFileRoute("/portal/community")({
  head: () => ({
    meta: [
      { title: "To Be Authorized — Portal" },
      {
        name: "description",
        content: "Pictures offered to the Pictaria community, waiting for approval.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: GuardedCommunityQueue,
});

type Filter = "pending" | "approved" | "declined";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "pending", label: "Waiting" },
  { key: "approved", label: "Authorized" },
  { key: "declined", label: "Declined" },
];

function CommunityQueue() {
  const load = useServerFn(listCommunitySubmissions);
  const decide = useServerFn(setCommunitySubmissionStatus);
  const [records, setRecords] = useState<CommunitySubmission[]>([]);
  const [filter, setFilter] = useState<Filter>("pending");
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const res = await load({ data: undefined });
      if (alive) {
        setRecords(res.records);
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [load]);

  const setStatus = async (id: string, status: Filter) => {
    setBusy(id);
    await decide({ data: { id, status } });
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r)),
    );
    setBusy(null);
  };

  const shown = records.filter((r) => r.status === filter);

  return (
    <main className="min-h-screen bg-deep px-4 pt-16 pb-24">
      <header className="mx-auto max-w-md text-center">
        <h1 className="font-display text-[1.5rem] text-shell">To Be Authorized</h1>
        <p className="mt-1 text-[10px] tracking-[0.2em] text-shell/60 uppercase">
          nothing reaches the community without your yes
        </p>
      </header>

      <div className="mx-auto mt-6 flex max-w-md justify-center gap-2">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            aria-pressed={filter === key}
            onClick={() => setFilter(key)}
            className={`rounded-full px-4 py-1.5 text-[10px] tracking-[0.16em] uppercase transition-colors ${
              filter === key
                ? "bg-primary text-primary-foreground"
                : "border border-accent/40 text-shell/70 hover:text-shell"
            }`}
          >
            {label}
            {key === "pending" && records.some((r) => r.status === "pending")
              ? ` · ${records.filter((r) => r.status === "pending").length}`
              : ""}
          </button>
        ))}
      </div>

      <div className="mx-auto mt-6 max-w-md space-y-4">
        {loading && (
          <p className="text-center text-[11px] tracking-[0.16em] text-shell/50 uppercase">
            loading…
          </p>
        )}

        {!loading && !shown.length && (
          <p className="text-center text-[11px] tracking-[0.16em] text-shell/50 uppercase">
            nothing here yet
          </p>
        )}

        {shown.map((record) => (
          <article
            key={record.id}
            className="overflow-hidden rounded-lg border border-accent/40 bg-shell/90 shadow-soft"
          >
            {record.photo_url && (
              <img
                src={record.photo_url}
                alt={record.title || "A picture offered to the community"}
                loading="lazy"
                className="aspect-[3/4] w-full object-cover"
              />
            )}
            <div className="px-4 py-3">
              <p className="font-display text-[1.05rem] text-foreground">
                {record.title || "Untitled"}
              </p>
              {record.tagline && (
                <p className="text-[0.72rem] text-muted-foreground">{record.tagline}</p>
              )}
              {record.story && (
                <p className="mt-2 text-[0.72rem] leading-relaxed text-foreground/80">
                  {record.story}
                </p>
              )}
              <p className="mt-2 text-[9px] tracking-[0.16em] text-muted-foreground uppercase">
                {record.tier} · {new Date(record.created_at).toLocaleDateString()}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <a
                  href={`/p/${record.share_code}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-accent/50 px-4 py-1.5 text-[10px] tracking-[0.16em] text-foreground uppercase"
                >
                  View
                </a>
                {record.status !== "approved" && (
                  <button
                    type="button"
                    disabled={busy === record.id}
                    onClick={() => void setStatus(record.id, "approved")}
                    className="rounded-full bg-primary px-4 py-1.5 text-[10px] tracking-[0.16em] text-primary-foreground uppercase disabled:opacity-60"
                  >
                    Authorize
                  </button>
                )}
                {record.status !== "declined" && (
                  <button
                    type="button"
                    disabled={busy === record.id}
                    onClick={() => void setStatus(record.id, "declined")}
                    className="rounded-full border border-accent/50 px-4 py-1.5 text-[10px] tracking-[0.16em] text-muted-foreground uppercase disabled:opacity-60"
                  >
                    Decline
                  </button>
                )}
                {record.status !== "pending" && (
                  <button
                    type="button"
                    disabled={busy === record.id}
                    onClick={() => void setStatus(record.id, "pending")}
                    className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase underline disabled:opacity-60"
                  >
                    Back to waiting
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

function GuardedCommunityQueue() {
  return (
    <PortalGuard>
      <CommunityQueue />
    </PortalGuard>
  );
}
