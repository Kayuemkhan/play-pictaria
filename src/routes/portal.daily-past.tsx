import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { AdminPageHeader } from "@/components/portal/AdminPageHeader";
import { findPuzzle } from "@/data/collections";
import { getDailyPicks, removeDailyPick, setDailyPick } from "@/lib/daily-pick.functions";
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
  const wipe = useServerFn(removeDailyPick);

  const loadWarehouse = useServerFn(listPortalBusinesses);
  const [warehouse, setWarehouse] = useState<
    { title: string; photo_url: string | null; share_code: string | null }[]
  >([]);
  const [past, setPast] = useState<DailyPick[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [erasing, setErasing] = useState<string | null>(null);

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

  const erase = async (id: string) => {
    setErasing(id);
    try {
      await wipe({ data: { id } });
      await refresh();
    } finally {
      setErasing(null);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <AdminPageHeader
        title="Yesterdailys"
        description={loading ? "Opening the folder…" : `${past.length} already featured`}
      />

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
            caption = "Pictaria Project";
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
                className="w-full overflow-hidden rounded-md border border-border bg-card text-left transition-transform hover:scale-[1.03] disabled:opacity-50"
              >
                <img src={image ?? ""} alt={title} className="aspect-[3/4] w-full object-cover" />
                <span className="block px-1.5 py-1">
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
                className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-foreground/80 text-xs leading-none text-background disabled:opacity-50"
              >
                {erasing === pick.id ? "…" : "×"}
              </button>
            </div>
          );
        })}
      </div>

      {!loading && past.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">
          Nothing here yet. Once you choose a second Pictaria, the first one settles into this
          folder.
        </p>
      )}
    </div>
  );
}
