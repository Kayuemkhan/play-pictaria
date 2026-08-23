import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { PortalGuard } from "@/components/portal/PortalGuard";
import {
  getPushOverview,
  resumeMedleySchedule,
  sendMedleyNow,
} from "@/lib/push.functions";

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
  component: GuardedPush,
});

type Overview = Awaited<ReturnType<typeof getPushOverview>>;

const dateLabel = (value: string | null) =>
  value ? new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—";

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
    <main className="min-h-screen bg-deep px-4 pt-12 pb-24">
      <header className="mx-auto max-w-md text-center">
        <h1 className="font-display text-[1.5rem] text-shell">Notifications</h1>
        <p className="mt-1 text-[10px] tracking-[0.2em] text-shell/60 uppercase">
          {loading
            ? "counting phones…"
            : `${overview?.devices ?? 0} ${overview?.devices === 1 ? "phone" : "phones"} listening`}
        </p>
      </header>

      <div className="mx-auto mt-6 max-w-md space-y-4">
        <section className="rounded-[6px] border border-accent/30 bg-deep/50 p-5 backdrop-blur-sm">
          <h2 className="font-display text-[1.05rem] text-shell">The 30-day medley</h2>
          <p className="mt-2 text-[0.8rem] leading-relaxed text-shell/75">
            Every 30 days Pictaria writes one notification that names a few
            albums — “from Oceanic Aquarium, from Healing Plants of Hawaiʻi” —
            and sends it to every phone that asked for it.
          </p>
          <dl className="mt-4 space-y-1 text-[0.75rem] text-shell/70">
            <div className="flex justify-between">
              <dt>Last medley</dt>
              <dd className="text-shell">{dateLabel(overview?.lastMedleyAt ?? null)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Next one due</dt>
              <dd className="text-shell">
                {overview?.due ? "Ready now" : dateLabel(overview?.nextDue ?? null)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Albums up next</dt>
              <dd className="text-right text-shell">
                {overview?.upcomingAlbums.join(", ") || "—"}
              </dd>
            </div>
          </dl>

          {overview?.paused && (
            <div className="mt-4 rounded-[6px] border border-destructive/40 bg-destructive/10 p-3">
              <p className="text-[0.75rem] text-shell">
                Paused: {overview.pausedReason ?? "unknown reason"}
              </p>
              <button
                type="button"
                onClick={() => void resume({}).then(refresh)}
                className="mt-2 text-[10px] tracking-[0.14em] text-accent uppercase underline"
              >
                Start it again
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => void sendNow()}
            disabled={sending || (overview?.devices ?? 0) === 0}
            className="mt-5 w-full rounded-full bg-primary px-4 py-3 text-[0.55rem] tracking-[0.2em] text-primary-foreground uppercase disabled:opacity-50"
          >
            {sending ? "Sending…" : "Write & send a medley now"}
          </button>
        </section>

        <section className="rounded-[6px] border border-accent/30 bg-deep/50 p-5 backdrop-blur-sm">
          <h2 className="font-display text-[1.05rem] text-shell">Sent medleys</h2>
          {(overview?.medleys.length ?? 0) === 0 ? (
            <p className="mt-2 text-[0.8rem] text-shell/70">None yet.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {overview?.medleys.map((medley) => (
                <li key={medley.id} className="border-t border-shell/10 pt-3 first:border-0 first:pt-0">
                  <p className="text-[0.85rem] text-shell">{medley.title}</p>
                  <p className="mt-1 text-[0.75rem] leading-relaxed text-shell/70">{medley.body}</p>
                  <p className="mt-1 text-[10px] tracking-[0.14em] text-shell/50 uppercase">
                    {dateLabel(medley.sent_at ?? medley.created_at)} · {medley.sent_count} sent
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Link
          to="/portal/new"
          className="block text-center text-[10px] tracking-[0.16em] text-shell/60 uppercase underline"
        >
          Back to the portal
        </Link>
      </div>
    </main>
  );
}

function GuardedPush() {
  return (
    <PortalGuard>
      <PushAdmin />
    </PortalGuard>
  );
}
