import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { PortalGuard } from "@/components/portal/PortalGuard";
import { listBetaCodes } from "@/lib/beta.functions";
import type { BetaCodeRow, BetaRedemptionRow } from "@/lib/beta.functions";

export const Route = createFileRoute("/portal/beta")({
  head: () => ({
    meta: [
      { title: "Beta Codes — Pictaria Project" },
      {
        name: "description",
        content: "Give away the Artist version with a beta code.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: GuardedBeta,
});

const CODE_LABELS: Record<string, string> = {
  ARTIST3: "Artist Studio — 3 months free",
  BRANDSTUDIO50: "Brand Studio — 50% off forever",
};

function Beta() {
  const load = useServerFn(listBetaCodes);

  const [codes, setCodes] = useState<BetaCodeRow[]>([]);
  const [redemptions, setRedemptions] = useState<BetaRedemptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");

  const refresh = async () => {
    const result = await load({});
    setCodes(result.codes);
    setRedemptions(result.redemptions);
  };

  useEffect(() => {
    void refresh().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shareLink = (value: string) =>
    `${window.location.origin}/beta?code=${encodeURIComponent(value)}`;

  const copyLink = async (value: string) => {
    await navigator.clipboard.writeText(shareLink(value));
    setCopied(value);
    window.setTimeout(() => setCopied(""), 2000);
  };

  return (
    <main className="min-h-screen bg-deep px-4 pt-12 pb-24">
      <header className="mx-auto max-w-md text-center">
        <h1 className="font-display text-[1.5rem] text-shell">Beta Codes</h1>
        <p className="mt-1 text-[10px] tracking-[0.2em] text-shell/60 uppercase">
          {loading ? "opening the list…" : "two codes, no fuss"}
        </p>
      </header>

      <div className="mx-auto mt-6 max-w-md space-y-3">
        {codes.map((row) => (
          <section
            key={row.id}
            className="rounded-lg bg-shell/95 p-5 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-[1.25rem] tracking-[0.08em] text-foreground">
                {row.code}
              </span>
              <span className="text-[9px] tracking-[0.12em] text-muted-foreground uppercase">
                {row.uses}/{row.max_uses} claimed
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {CODE_LABELS[row.code] ?? row.note}
            </p>
            {row.expires_at && (
              <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                Code expires {new Date(row.expires_at).toLocaleDateString()}
              </p>
            )}
            <button
              type="button"
              onClick={() => void copyLink(row.code)}
              className="mt-4 w-full rounded-full bg-primary px-4 py-2.5 text-[11px] tracking-[0.16em] text-primary-foreground uppercase"
            >
              {copied === row.code ? "Copied" : "Copy signup link"}
            </button>
          </section>
        ))}

        {!loading && codes.length === 0 && (
          <p className="text-center text-[11px] text-shell/60">
            No active beta codes.
          </p>
        )}

        {redemptions.length > 0 && (
          <section className="mt-8">
            <h2 className="text-center text-[10px] tracking-[0.2em] text-shell/60 uppercase">
              claimed by
            </h2>
            <ul className="mt-3 space-y-1.5">
              {redemptions.map((row) => (
                <li
                  key={`${row.email}-${row.code}`}
                  className="flex items-center justify-between rounded-lg bg-shell/90 px-4 py-2.5"
                >
                  <span className="truncate text-[12px] text-foreground">
                    {row.email}
                  </span>
                  <span className="ml-3 shrink-0 text-[9px] tracking-[0.12em] text-muted-foreground uppercase">
                    {row.code}
                  </span>
                </li>
              ))}
            </ul>
          </section>
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

function GuardedBeta() {
  return (
    <PortalGuard>
      <Beta />
    </PortalGuard>
  );
}
