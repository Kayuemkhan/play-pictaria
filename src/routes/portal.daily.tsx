import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { collections, findPuzzle } from "@/data/collections";
import { getDailyPicks, setDailyPick } from "@/lib/daily-pick.functions";
import type { DailyPick } from "@/lib/daily-pick.functions";
import { createPortalShareLink, listPortalBusinesses } from "@/lib/portal.functions";
import { isPortalPick, portalPickCode, portalPickId } from "@/lib/daily-display";
import palmLogo from "@/assets/logo-palms-only.png";

export const Route = createFileRoute("/portal/daily")({
  head: () => ({
    meta: [
      { title: "Today's Pictaria — Portal" },
      { name: "description", content: "Choose which puzzle is today's Pictaria." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DailyWaitingArea,
});

interface GalleryItem {
  id: string;
  title: string;
  image: string;
  collection: string;
}

function allPuzzles(): GalleryItem[] {
  const items: GalleryItem[] = [];
  for (const collection of collections) {
    for (const puzzle of collection.puzzles) {
      items.push({
        id: puzzle.id,
        title: puzzle.title,
        image: puzzle.image,
        collection: collection.title,
      });
    }
  }
  return items;
}

interface WarehouseItem {
  id: string;
  title: string;
  photo_url: string | null;
  share_code: string | null;
  category: string;
  product_service: string;
  story_ideas: string;
}

interface PreviewDraft {
  item: WarehouseItem;
  title: string;
  tagline: string;
  story: string;
  grid: number;
}

const GRID_LABELS: Record<number, string> = {
  3: "Relaxing",
  4: "Engaging",
  5: "Intriguing",
  6: "Challenging",
};

function DailyWaitingArea() {
  const load = useServerFn(getDailyPicks);
  const choose = useServerFn(setDailyPick);
  const loadWarehouse = useServerFn(listPortalBusinesses);
  const makeLink = useServerFn(createPortalShareLink);
  const [warehouse, setWarehouse] = useState<WarehouseItem[]>([]);
  const [preview, setPreview] = useState<PreviewDraft | null>(null);

  const [current, setCurrent] = useState<DailyPick | null>(null);
  const [past, setPast] = useState<DailyPick[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");


  const refresh = async () => {
    try {
      const [result, shed] = await Promise.all([load({}), loadWarehouse({})]);
      setCurrent(result.current);
      setPast(result.past);
      if (!shed.locked) {
        setWarehouse(
          shed.records
            .filter((row) => Boolean(row.photo_url))
            .map((row) => ({
              id: row.id,
              title: row.company_name || "Untitled photograph",
              photo_url: row.photo_url,
              share_code: row.share_code,
              category: row.category,
            })),
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load the daily picks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const usedIds = useMemo(() => {
    const set = new Set<string>();
    if (current) set.add(current.puzzle_id);
    for (const pick of past) set.add(pick.puzzle_id);
    return set;
  }, [current, past]);

  const shedWaiting = useMemo(
    () =>
      warehouse.filter(
        (item) => !item.share_code || !usedIds.has(portalPickId(item.share_code)),
      ),
    [warehouse, usedIds],
  );

  const featureBusiness = async (item: WarehouseItem) => {
    setSaving(item.id);
    setError("");
    try {
      const { code } = await makeLink({ data: { id: item.id } });
      await choose({ data: { puzzleId: portalPickId(code) } });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That pick didn't save.");
    } finally {
      setSaving(null);
    }
  };

  const waiting = useMemo(
    () => allPuzzles().filter((item) => !usedIds.has(item.id)),
    [usedIds],
  );

  const pick = async (puzzleId: string) => {
    setSaving(puzzleId);
    setError("");
    try {
      await choose({ data: { puzzleId } });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That pick didn't save.");
    } finally {
      setSaving(null);
    }
  };

  const currentPuzzle =
    current && !isPortalPick(current.puzzle_id) ? findPuzzle(current.puzzle_id) : null;
  const currentBusiness =
    current && isPortalPick(current.puzzle_id)
      ? (warehouse.find(
          (item) => item.share_code === portalPickCode(current.puzzle_id),
        ) ?? null)
      : null;

  return (
    <main className="min-h-screen bg-deep px-4 pt-12 pb-24">
      <header className="mx-auto max-w-md text-center">
        <img
          src={palmLogo}
          alt=""
          width={1024}
          height={1024}
          className="mx-auto h-12 w-auto"
        />
        <h1 className="mt-3 font-display text-[1.5rem] text-shell">
          Today&apos;s Pictaria
        </h1>
        <p className="mt-1 text-[10px] tracking-[0.2em] text-shell/60 uppercase">
          the waiting area
        </p>
      </header>

      <div className="mx-auto mt-8 max-w-md space-y-6">
        {/* Currently featured */}
        <section className="rounded-lg border border-accent/60 bg-shell p-5 text-center shadow-soft">
          <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            Featured right now
          </p>
          {loading ? (
            <p className="mt-3 text-[12px] text-muted-foreground">Loading…</p>
          ) : currentBusiness ? (
            <>
              <div className="mx-auto mt-3 w-32 overflow-hidden rounded-[6px] border border-accent/50">
                <img
                  src={currentBusiness.photo_url ?? ""}
                  alt={currentBusiness.title}
                  className="aspect-[3/4] w-full object-cover"
                />
              </div>
              <p className="mt-3 font-display text-[1.15rem] text-foreground">
                {currentBusiness.title}
              </p>
              <p className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                Project Pictaria
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Chosen {new Date(current!.picked_at).toLocaleDateString()}
              </p>
            </>
          ) : currentPuzzle ? (
            <>
              <div className="mx-auto mt-3 w-32 overflow-hidden rounded-[6px] border border-accent/50">
                <img
                  src={currentPuzzle.puzzle.image}
                  alt={currentPuzzle.puzzle.title}
                  className="aspect-[3/4] w-full object-cover"
                />
              </div>
              <p className="mt-3 font-display text-[1.15rem] text-foreground">
                {currentPuzzle.puzzle.title}
              </p>
              <p className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                {currentPuzzle.collection.title}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Chosen {new Date(current!.picked_at).toLocaleDateString()}
              </p>
            </>
          ) : (
            <p className="mt-3 text-[12px] text-muted-foreground">
              Nothing chosen yet — pick a photograph below and it becomes
              today&apos;s Pictaria straight away.
            </p>
          )}
        </section>


        {error && (
          <p className="text-center text-[11px] text-destructive">{error}</p>
        )}

        {/* Project Pictaria warehouse */}
        <section>
          <p className="text-center text-[10px] tracking-[0.2em] text-shell/60 uppercase">
            Project Pictaria warehouse · {shedWaiting.length}
          </p>
          <p className="mt-1 text-center text-[10px] text-shell/40">
            Every business photograph you have collected. Tap one to make it
            today&apos;s Pictaria.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {shedWaiting.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => void featureBusiness(item)}
                disabled={saving !== null}
                className="overflow-hidden rounded-[8px] border border-accent/40 text-left transition-transform hover:scale-[1.03] disabled:opacity-50"
              >
                <img
                  src={item.photo_url ?? ""}
                  alt={item.title}
                  className="aspect-[3/4] w-full object-cover"
                />
                <span className="block bg-shell px-1.5 py-1">
                  <span className="block truncate text-[10px] text-foreground">
                    {saving === item.id ? "Setting…" : item.title}
                  </span>
                  <span className="block truncate text-[8px] tracking-[0.12em] text-muted-foreground uppercase">
                    {item.category}
                  </span>
                </span>
              </button>
            ))}
          </div>
          {!loading && shedWaiting.length === 0 && (
            <p className="mt-3 text-center text-[11px] text-shell/60">
              No business photographs waiting — add one in Project Pictaria.
            </p>
          )}
        </section>

        {/* Waiting gallery */}
        <section>
          <p className="text-center text-[10px] tracking-[0.2em] text-shell/60 uppercase">
            Waiting to be chosen · {waiting.length}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {waiting.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => void pick(item.id)}
                disabled={saving !== null}
                className="group overflow-hidden rounded-[8px] border border-shell/20 text-left transition-transform hover:scale-[1.03] disabled:opacity-50"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="aspect-[3/4] w-full object-cover"
                />
                <span className="block bg-shell px-1.5 py-1">
                  <span className="block truncate text-[10px] text-foreground">
                    {saving === item.id ? "Setting…" : item.title}
                  </span>
                  <span className="block truncate text-[8px] tracking-[0.12em] text-muted-foreground uppercase">
                    {item.collection}
                  </span>
                </span>
              </button>
            ))}
          </div>
          {!loading && waiting.length === 0 && (
            <p className="mt-4 text-center text-[11px] text-shell/60">
              Every photograph has had its day. Add a new collection to keep
              going.
            </p>
          )}
        </section>

        <div className="text-center">
          <Link
            to="/portal/new"
            className="text-[10px] tracking-[0.18em] text-shell/60 uppercase underline"
          >
            Back to Project Pictaria
          </Link>
        </div>
      </div>
    </main>
  );
}
