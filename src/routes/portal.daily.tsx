import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { AdminPageHeader } from "@/components/portal/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { collections, findPuzzle } from "@/data/collections";
import { getDailyPicks, setDailyPick } from "@/lib/daily-pick.functions";
import type { DailyPick } from "@/lib/daily-pick.functions";
import { createPortalShareLink, listPortalBusinesses } from "@/lib/portal.functions";
import { isPortalPick, portalPickCode, portalPickId } from "@/lib/daily-display";

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

interface AlbumItem {
  id: string;
  title: string;
  image: string;
  collection: string;
}

function allPuzzles(): AlbumItem[] {
  const items: AlbumItem[] = [];
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
  notes: string;
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
              category: row.category as string,
              product_service: row.product_service ?? "",
              story_ideas: row.story_ideas ?? "",
              notes: row.notes ?? "",
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
      warehouse.filter((item) => !item.share_code || !usedIds.has(portalPickId(item.share_code))),
    [warehouse, usedIds],
  );

  const openPreview = (item: WarehouseItem) => {
    setError("");
    setPreview({
      item,
      title: item.title === "Untitled photograph" ? "" : item.title,
      tagline: item.product_service,
      story: [item.product_service, item.story_ideas, item.notes]
        .map((part) => part.trim())
        .filter(Boolean)
        .join("\n\n"),
      grid: 4,
    });
  };

  const publishPreview = async () => {
    if (!preview) return;
    setSaving(preview.item.id);
    setError("");
    try {
      const { code } = await makeLink({
        data: {
          id: preview.item.id,
          title: preview.title,
          tagline: preview.tagline,
          story: preview.story,
          grid: preview.grid,
        },
      });
      await choose({ data: { puzzleId: portalPickId(code) } });
      setPreview(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That pick didn't save.");
    } finally {
      setSaving(null);
    }
  };

  const waiting = useMemo(() => allPuzzles().filter((item) => !usedIds.has(item.id)), [usedIds]);

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
      ? (warehouse.find((item) => item.share_code === portalPickCode(current.puzzle_id)) ?? null)
      : null;

  return (
    <div className="mx-auto max-w-2xl">
      <AdminPageHeader title="Today's Pictaria" description="The waiting area." />

      <div className="space-y-6">
        {/* Currently featured */}
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              Featured right now
            </p>
            {loading ? (
              <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
            ) : currentBusiness ? (
              <>
                <div className="mx-auto mt-3 w-32 overflow-hidden rounded-md border border-border">
                  <img
                    src={currentBusiness.photo_url ?? ""}
                    alt={currentBusiness.title}
                    className="aspect-[3/4] w-full object-cover"
                  />
                </div>
                <p className="mt-3 font-display text-lg text-foreground">{currentBusiness.title}</p>
                <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                  Pictaria Project
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Chosen {new Date(current!.picked_at).toLocaleDateString()}
                </p>
              </>
            ) : currentPuzzle ? (
              <>
                <div className="mx-auto mt-3 w-32 overflow-hidden rounded-md border border-border">
                  <img
                    src={currentPuzzle.puzzle.image}
                    alt={currentPuzzle.puzzle.title}
                    className="aspect-[3/4] w-full object-cover"
                  />
                </div>
                <p className="mt-3 font-display text-lg text-foreground">
                  {currentPuzzle.puzzle.title}
                </p>
                <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                  {currentPuzzle.collection.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Chosen {new Date(current!.picked_at).toLocaleDateString()}
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Nothing chosen yet — pick a photograph below and it becomes today&apos;s Pictaria
                straight away.
              </p>
            )}
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* Preview & edit before sending */}
        {preview && (
          <Card>
            <CardContent className="p-5">
              <p className="text-center text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                Preview · edit before you send
              </p>

              <div className="mx-auto mt-4 w-40">
                <div className="relative overflow-hidden rounded-md border border-border">
                  <img
                    src={preview.item.photo_url ?? ""}
                    alt={preview.title || preview.item.title}
                    className="aspect-[3/4] w-full object-cover"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 grid"
                    style={{
                      gridTemplateColumns: `repeat(${preview.grid}, minmax(0, 1fr))`,
                      gridTemplateRows: `repeat(${preview.grid}, minmax(0, 1fr))`,
                    }}
                  >
                    {Array.from({ length: preview.grid * preview.grid }).map((_, i) => (
                      <span key={i} className="border border-white/50" />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-center font-display text-base leading-tight text-foreground">
                  {preview.title || "A Pictaria for you"}
                </p>
                {preview.tagline && (
                  <p className="text-center text-xs text-muted-foreground">{preview.tagline}</p>
                )}
              </div>

              <div className="mt-5 space-y-3">
                <label className="block">
                  <span className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                    Title
                  </span>
                  <input
                    value={preview.title}
                    onChange={(e) => setPreview({ ...preview, title: e.target.value })}
                    placeholder="A Pictaria for you"
                    className="mt-1 w-full rounded-full border border-input bg-background px-4 py-2 text-sm text-foreground outline-none focus:border-ring"
                  />
                </label>

                <label className="block">
                  <span className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                    Tagline
                  </span>
                  <input
                    value={preview.tagline}
                    onChange={(e) => setPreview({ ...preview, tagline: e.target.value })}
                    placeholder="What they are known for"
                    className="mt-1 w-full rounded-full border border-input bg-background px-4 py-2 text-sm text-foreground outline-none focus:border-ring"
                  />
                </label>

                <label className="block">
                  <span className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                    Story
                  </span>
                  <textarea
                    value={preview.story}
                    onChange={(e) => setPreview({ ...preview, story: e.target.value })}
                    rows={4}
                    placeholder="The little story that travels with this Pictaria"
                    className="mt-1 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm leading-relaxed text-foreground outline-none focus:border-ring"
                  />
                </label>

                <div>
                  <span className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                    Difficulty
                  </span>
                  <div className="mt-2 flex flex-nowrap gap-1.5">
                    {[3, 4, 5, 6].map((grid) => (
                      <button
                        key={grid}
                        type="button"
                        onClick={() => setPreview({ ...preview, grid })}
                        className={`flex-1 rounded-full border px-1 py-1.5 text-[9px] tracking-[0.08em] uppercase ${
                          preview.grid === grid
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-input text-muted-foreground"
                        }`}
                      >
                        {grid}×{grid}
                        <span className="block text-[8px] normal-case">{GRID_LABELS[grid]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  disabled={saving !== null}
                  className="flex-1 rounded-full border border-input px-4 py-2.5 text-xs tracking-[0.1em] text-muted-foreground uppercase disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void publishPreview()}
                  disabled={saving !== null}
                  className="flex-1 rounded-full bg-primary px-4 py-2.5 text-xs tracking-[0.1em] text-primary-foreground uppercase disabled:opacity-50"
                >
                  {saving ? "Sending…" : "Make it today's"}
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pictaria Project warehouse */}
        <section>
          <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            Pictaria Project warehouse · {shedWaiting.length}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Every business photograph you have collected. Tap one to preview and edit it before it
            becomes today&apos;s Pictaria.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {shedWaiting.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openPreview(item)}
                disabled={saving !== null}
                className={`overflow-hidden rounded-md border bg-card text-left transition-transform hover:scale-[1.03] disabled:opacity-50 ${
                  preview?.item.id === item.id
                    ? "border-primary ring-1 ring-primary"
                    : "border-border"
                }`}
              >
                <img
                  src={item.photo_url ?? ""}
                  alt={item.title}
                  className="aspect-[3/4] w-full object-cover"
                />
                <span className="block px-1.5 py-1">
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
            <p className="mt-3 text-sm text-muted-foreground">
              No business photographs waiting — add one in New Business.
            </p>
          )}
        </section>

        {/* Waiting album */}
        <section>
          <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            Waiting to be chosen · {waiting.length}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {waiting.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => void pick(item.id)}
                disabled={saving !== null}
                className="overflow-hidden rounded-md border border-border bg-card text-left transition-transform hover:scale-[1.03] disabled:opacity-50"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="aspect-[3/4] w-full object-cover"
                />
                <span className="block px-1.5 py-1">
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
            <p className="mt-4 text-sm text-muted-foreground">
              Every photograph has had its day. Add a new collection to keep going.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
