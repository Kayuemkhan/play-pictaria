import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { PortalGuard } from "@/components/portal/PortalGuard";
import {
  createBetaCode,
  deleteBetaCode,
  listBetaCodes,
  setBetaCodeDisabled,
} from "@/lib/beta.functions";
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

function suggestCode(tier: string) {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let tail = "";
  for (let i = 0; i < 4; i += 1) {
    tail += letters[Math.floor(Math.random() * letters.length)];
  }
  return tier === "brand" ? `BRAND-${tail}` : `ARTIST-${tail}`;
}

function Beta() {
  const load = useServerFn(listBetaCodes);
  const create = useServerFn(createBetaCode);
  const toggle = useServerFn(setBetaCodeDisabled);
  const remove = useServerFn(deleteBetaCode);

  const [codes, setCodes] = useState<BetaCodeRow[]>([]);
  const [redemptions, setRedemptions] = useState<BetaRedemptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState<"artist" | "brand">("artist");
  const [code, setCode] = useState(() => suggestCode("artist"));
  const [maxUses, setMaxUses] = useState("25");
  const [expires, setExpires] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    const result = await load({});
    setCodes(result.codes);
    setRedemptions(result.redemptions);
  };

  useEffect(() => {
    void refresh().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async () => {
    setError("");
    setSaving(true);
    try {
      await create({
        data: {
          code: code.trim(),
          max_uses: Number(maxUses) || 1,
          expires_at: expires ? new Date(expires).toISOString() : undefined,
          note: note.trim(),
          tier,
        },
      });
      setCode(suggestCode(tier));
      setNote("");
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Couldn't save that code.");
    } finally {
      setSaving(false);
    }
  };

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
          {loading ? "opening the list…" : "give away the artist version"}
        </p>
      </header>

      <div className="mx-auto mt-6 max-w-md">
        <section className="rounded-lg bg-shell/95 p-5 shadow-soft">
          <h2 className="font-display text-[1.1rem] text-foreground">New code</h2>
          <label className="mt-3 block text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
            Code
          </label>
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            className="mt-1 w-full rounded-full border border-accent/40 px-4 py-2.5 text-[13px] tracking-[0.1em] text-foreground"
          />

          <label className="mt-3 block text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
            Tier
          </label>
          <select
            value={tier}
            onChange={(event) => {
              const next = event.target.value as "artist" | "brand";
              setTier(next);
              setCode(suggestCode(next));
            }}
            className="mt-1 w-full rounded-full border border-accent/40 bg-transparent px-4 py-2.5 text-[13px] text-foreground"
          >
            <option value="artist">Artist Studio</option>
            <option value="brand">Brand Studio</option>
          </select>

          <div className="mt-3 flex gap-2">
            <div className="flex-1">
              <label className="block text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                How many people
              </label>
              <input
                type="number"
                min={1}
                value={maxUses}
                onChange={(event) => setMaxUses(event.target.value)}
                className="mt-1 w-full rounded-full border border-accent/40 px-4 py-2.5 text-[13px] text-foreground"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                Ends (optional)
              </label>
              <input
                type="date"
                value={expires}
                onChange={(event) => setExpires(event.target.value)}
                className="mt-1 w-full rounded-full border border-accent/40 px-3 py-2.5 text-[13px] text-foreground"
              />
            </div>
          </div>

          <label className="mt-3 block text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
            Note to yourself
          </label>
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="e.g. Maui artists group"
            className="mt-1 w-full rounded-full border border-accent/40 px-4 py-2.5 text-[13px] text-foreground"
          />

          {error && (
            <p className="mt-3 text-[11px] text-destructive">{error}</p>
          )}

          <button
            type="button"
            onClick={() => void submit()}
            disabled={saving}
            className="mt-4 w-full rounded-full bg-primary px-4 py-2.5 text-[11px] tracking-[0.16em] text-primary-foreground uppercase disabled:opacity-50"
          >
            {saving ? "Saving…" : "Create code"}
          </button>
        </section>

        <ul className="mt-5 space-y-2">
          {codes.map((row) => (
            <li key={row.id} className="rounded-lg bg-shell/90 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="font-display text-[1.05rem] tracking-[0.08em] text-foreground">
                  {row.code}
                </span>
                <span className="text-[9px] tracking-[0.12em] text-muted-foreground uppercase">
                  {row.uses}/{row.max_uses} claimed
                </span>
              </div>
              <p className="mt-0.5 text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
                {row.tier}
                {row.expires_at
                  ? ` · ends ${new Date(row.expires_at).toLocaleDateString()}`
                  : " · no end date"}
                {row.disabled ? " · off" : ""}
                {row.note ? ` · ${row.note}` : ""}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => void copyLink(row.code)}
                  className="flex-1 rounded-full bg-primary px-3 py-2 text-[10px] tracking-[0.14em] text-primary-foreground uppercase"
                >
                  {copied === row.code ? "Copied" : "Copy link"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    void toggle({ data: { id: row.id, disabled: !row.disabled } }).then(
                      refresh,
                    )
                  }
                  className="flex-1 rounded-full border border-accent/50 px-3 py-2 text-[10px] tracking-[0.14em] text-foreground uppercase"
                >
                  {row.disabled ? "Turn on" : "Turn off"}
                </button>
                <button
                  type="button"
                  onClick={() => void remove({ data: { id: row.id } }).then(refresh)}
                  aria-label={`Delete ${row.code}`}
                  className="rounded-full border border-accent/50 px-3 py-2 text-[10px] text-muted-foreground"
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>

        {!loading && codes.length === 0 && (
          <p className="mt-6 text-center text-[11px] text-shell/60">
            No beta codes yet.
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
