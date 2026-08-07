import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { collections, findPuzzle } from "@/data/collections";
import { getDailyPicks, setDailyPick } from "@/lib/daily-pick.functions";
import type { DailyPick } from "@/lib/daily-pick.functions";
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

function DailyWaitingArea() {
  const load = useServerFn(getDailyPicks);
  const choose = useServerFn(setDailyPick);

  const [current, setCurrent] = useState<DailyPick | null>(null);
  const [past, setPast] = useState<DailyPick[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");

  const refresh = async () => {
    try {
      const result = await load({});
      setCurrent(result.current);
      setPast(result.past);
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

  const currentPuzzle = current ? findPuzzle(current.puzzle_id) : null;

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

        {/* Yesterday's folder */}
        <Link
          to="/portal/daily-past"
          className="flex items-center justify-between rounded-lg border border-accent/40 bg-shell/90 px-5 py-4 shadow-soft transition-transform hover:scale-[1.01]"
        >
          <span>
            <span className="block font-display text-[1.05rem] text-foreground">
              Yesterdailys
            </span>
            <span className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
              {past.length} in the folder
            </span>
          </span>
          <span aria-hidden className="text-primary">
            ›
          </span>
        </Link>

        {error && (
          <p className="text-center text-[11px] text-destructive">{error}</p>
        )}

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
