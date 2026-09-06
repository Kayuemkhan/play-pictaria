import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/portal/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPushOverview, resumeMedleySchedule, sendMedleyNow } from "@/lib/push.functions";

export const Route = createFileRoute("/portal/push")({
  head: () => ({
    meta: [
      { title: "Notifications — Portal" },
      {
        name: "description",
        content: "Send the every-30-days Pictaria medley notification.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PushAdmin,
});

type Overview = Awaited<ReturnType<typeof getPushOverview>>;

const dateLabel = (value: string | null) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

function PushAdmin() {
  const load = useServerFn(getPushOverview);
  const send = useServerFn(sendMedleyNow);
  const resume = useServerFn(resumeMedleySchedule);

  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const refresh = () =>
    load({})
      .then(setOverview)
      .finally(() => setLoading(false));

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendNow = async () => {
    setSending(true);
    try {
      const result = await send({});
      toast.success(`Medley sent to ${result.sent} ${result.sent === 1 ? "phone" : "phones"}.`);
      if (result.degraded) toast.warning(result.degraded);
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "That medley didn't go out.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <AdminPageHeader
        title="Notifications"
        description={
          loading
            ? "Counting phones…"
            : `${overview?.devices ?? 0} ${overview?.devices === 1 ? "phone" : "phones"} listening`
        }
      />

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">The 30-day telegram</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Every 30 days a telegram arrives from Pictaria — “Telegram from Pictaria · From
              Oceanic Aquaria” — naming a few albums with new peaces, sent to every phone that asked
              for it.
            </p>
            <dl className="mt-4 space-y-1 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <dt>Last medley</dt>
                <dd className="text-foreground">{dateLabel(overview?.lastMedleyAt ?? null)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Next one due</dt>
                <dd className="text-foreground">
                  {overview?.due ? "Ready now" : dateLabel(overview?.nextDue ?? null)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Albums up next</dt>
                <dd className="text-right text-foreground">
                  {overview?.upcomingAlbums.join(", ") || "—"}
                </dd>
              </div>
            </dl>

            {overview?.paused && (
              <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3">
                <p className="text-sm text-foreground">
                  Paused: {overview.pausedReason ?? "unknown reason"}
                </p>
                <button
                  type="button"
                  onClick={() => void resume({}).then(refresh)}
                  className="mt-2 text-xs text-primary underline"
                >
                  Start it again
                </button>
              </div>
            )}

            <Button
              type="button"
              onClick={() => void sendNow()}
              disabled={sending || (overview?.devices ?? 0) === 0}
              className="mt-5 w-full"
            >
              {sending ? "Sending…" : "Write & send a medley now"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Sent medleys</CardTitle>
          </CardHeader>
          <CardContent>
            {(overview?.medleys.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">None yet.</p>
            ) : (
              <ul className="space-y-3">
                {overview?.medleys.map((medley) => (
                  <li
                    key={medley.id}
                    className="border-t border-border pt-3 first:border-0 first:pt-0"
                  >
                    <p className="text-sm text-foreground">{medley.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {medley.body}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground uppercase">
                      {dateLabel(medley.sent_at ?? medley.created_at)} · {medley.sent_count} sent
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
