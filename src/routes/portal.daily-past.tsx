import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { findPuzzle } from "@/data/collections";
import { getDailyPicks, setDailyPick } from "@/lib/daily-pick.functions";
import type { DailyPick } from "@/lib/daily-pick.functions";

export const Route = createFileRoute("/portal/daily-past")({
  head: () => ({
    meta: [
      { title: "Yesterday's Pictarias — Portal" },
      {
        name: "description",
        content: "Every puzzle that has already had its day as today's Pictaria.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PastPictarias,
});

function PastPictarias() {
  const load = useServerFn(getDailyPicks);
  const choose = useServerFn(setDailyPick);

  const [past, setPast] = useState<DailyPick[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const result = await load({});
      setPast(result.past);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const feature = async (puzzleId: string) => {
    setSaving(puzzleId);
    try {
      await choose({ data: { puzzleId } });
      await refresh();
    } finally {
      setSaving(null);
    }
  };

  return (
    <main className="min-h-screen bg-deep px-4 pt-12 pb-24">
      <header className="mx-auto max-w-md text-center">
        <h1 className="font-display text-[1.5rem] text-shell">
          Yesterday&apos;s Pictarias
        </h1>
        <p className="mt-1 text-[10px] tracking-[0.2em] text-shell/60 uppercase">
          {loading ? "opening the folder…" : `${past.length} already featured`}
        </p>
      </header>

      <div className="mx-auto mt-8 max-w-md">
        <div className="grid grid-cols-3 gap-2.5">
          {past.map((pick) => {
            const found = findPuzzle(pick.puzzle_id);
            if (!found) return null;
            return (
              <button
                key={pick.id}
                type="button"
                onClick={() => void feature(pick.puzzle_id)}
                disabled={saving !== null}
                title="Feature this one again"
                className="overflow-hidden rounded-[8px] border border-shell/20 text-left transition-transform hover:scale-[1.03] disabled:opacity-50"
              >
                <img
                  src={found.puzzle.image}
                  alt={found.puzzle.title}
                  className="aspect-[3/4] w-full object-cover"
                />
                <span className="block bg-shell px-1.5 py-1">
                  <span className="block truncate text-[10px] text-foreground">
                    {saving === pick.puzzle_id ? "Setting…" : found.puzzle.title}
                  </span>
                  <span className="block truncate text-[8px] tracking-[0.12em] text-muted-foreground uppercase">
                    {new Date(pick.picked_at).toLocaleDateString()}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {!loading && past.length === 0 && (
          <p className="text-center text-[11px] text-shell/60">
            Nothing here yet. Once you choose a second Pictaria, the first one
            settles into this folder.
          </p>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/portal/daily"
            className="text-[10px] tracking-[0.18em] text-shell/60 uppercase underline"
          >
            Back to the waiting area
          </Link>
        </div>
      </div>
    </main>
  );
}
