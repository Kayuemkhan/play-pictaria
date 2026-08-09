import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { findPuzzle } from "@/data/collections";
import { getDailyPicks, setDailyPick } from "@/lib/daily-pick.functions";
import type { DailyPick } from "@/lib/daily-pick.functions";
import { listPortalBusinesses } from "@/lib/portal.functions";
import { isPortalPick, portalPickCode } from "@/lib/daily-display";

export const Route = createFileRoute("/portal/daily-past")({
  head: () => ({
    meta: [
      { title: "Yesterdailys — Portal" },
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

  const loadWarehouse = useServerFn(listPortalBusinesses);
  const [warehouse, setWarehouse] = useState<
    { title: string; photo_url: string | null; share_code: string | null }[]
  >([]);
  const [past, setPast] = useState<DailyPick[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const [result, shed] = await Promise.all([load({}), loadWarehouse({})]);
      setPast(result.past);
      if (!shed.locked) {
        setWarehouse(
          shed.records.map((row) => ({
            title: row.company_name || "Untitled photograph",
            photo_url: row.photo_url,
            share_code: row.share_code,
          })),
        );
      }
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
          Yesterdailys
        </h1>
        <p className="mt-1 text-[10px] tracking-[0.2em] text-shell/60 uppercase">
          {loading ? "opening the folder…" : `${past.length} already featured`}
        </p>
      </header>

      <div className="mx-auto mt-8 max-w-md">
        <div className="grid grid-cols-3 gap-2.5">
          {past.map((pick) => {
            let image: string | null = null;
            let title = "";
            let caption = new Date(pick.picked_at).toLocaleDateString();

            if (isPortalPick(pick.puzzle_id)) {
              const code = portalPickCode(pick.puzzle_id);
              const business = warehouse.find((item) => item.share_code === code);
              if (!business) return null;
              image = business.photo_url;
              title = business.title;
              caption = "Project Pictaria";
            } else {
              const found = findPuzzle(pick.puzzle_id);
              if (!found) return null;
              image = found.puzzle.image;
              title = found.puzzle.title;
            }

            return (
              <div key={pick.id} className="relative">
                <button
                  type="button"
                  onClick={() => void feature(pick.puzzle_id)}
                  disabled={saving !== null}
                  title="Feature this one again"
                  className="w-full overflow-hidden rounded-[8px] border border-shell/20 text-left transition-transform hover:scale-[1.03] disabled:opacity-50"
                >
                  <img
                    src={image ?? ""}
                    alt={title}
                    className="aspect-[3/4] w-full object-cover"
                  />
                  <span className="block bg-shell px-1.5 py-1">
                    <span className="block truncate text-[10px] text-foreground">
                      {saving === pick.puzzle_id ? "Setting…" : title}
                    </span>
                    <span className="block truncate text-[8px] tracking-[0.12em] text-muted-foreground uppercase">
                      {caption}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => void erase(pick.id)}
                  disabled={erasing !== null}
                  title="Erase from Yesterdailys"
                  aria-label={`Erase ${title} from Yesterdailys`}
                  className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-deep/80 text-[12px] leading-none text-shell disabled:opacity-50"
                >
                  {erasing === pick.id ? "…" : "×"}
                </button>
              </div>
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
