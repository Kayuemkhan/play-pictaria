import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { AdminPageHeader } from "@/components/portal/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  component: CommunityQueue,
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
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    setBusy(null);
  };

  const shown = records.filter((r) => r.status === filter);

  return (
    <div className="mx-auto max-w-2xl">
      <AdminPageHeader
        title="To Be Authorized"
        description="Nothing reaches the community without your yes."
        actions={
          <div className="flex gap-1.5">
            {FILTERS.map(({ key, label }) => (
              <Button
                key={key}
                type="button"
                size="sm"
                variant={filter === key ? "default" : "outline"}
                onClick={() => setFilter(key)}
              >
                {label}
                {key === "pending" && records.some((r) => r.status === "pending")
                  ? ` · ${records.filter((r) => r.status === "pending").length}`
                  : ""}
              </Button>
            ))}
          </div>
        }
      />

      <div className="space-y-4">
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}

        {!loading && !shown.length && (
          <p className="text-sm text-muted-foreground">Nothing here yet.</p>
        )}

        {shown.map((record) => (
          <Card key={record.id} className="overflow-hidden">
            {record.photo_url && (
              <img
                src={record.photo_url}
                alt={record.title || "A picture offered to the community"}
                loading="lazy"
                className="aspect-[3/4] w-full max-w-xs object-cover"
              />
            )}
            <CardContent className="p-4">
              <p className="font-display text-lg text-foreground">{record.title || "Untitled"}</p>
              {record.tagline && <p className="text-sm text-muted-foreground">{record.tagline}</p>}
              {record.story && (
                <p className="mt-2 text-sm leading-relaxed text-foreground/80">{record.story}</p>
              )}
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">{record.tier}</Badge>
                {new Date(record.created_at).toLocaleDateString()}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <a
                  href={`/p/${record.share_code}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-8 items-center rounded-full border border-input px-3 text-xs text-foreground"
                >
                  View
                </a>
                {record.status !== "approved" && (
                  <Button
                    type="button"
                    size="sm"
                    disabled={busy === record.id}
                    onClick={() => void setStatus(record.id, "approved")}
                  >
                    Authorize
                  </Button>
                )}
                {record.status !== "declined" && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={busy === record.id}
                    onClick={() => void setStatus(record.id, "declined")}
                  >
                    Decline
                  </Button>
                )}
                {record.status !== "pending" && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={busy === record.id}
                    onClick={() => void setStatus(record.id, "pending")}
                  >
                    Back to waiting
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
