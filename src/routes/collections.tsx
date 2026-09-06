import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { visibleCollections } from "@/data/collections";
import type { Collection } from "@/data/collections";
import { getLibraryCollections } from "@/lib/collection-catalog.functions";

const ORDER_KEY = "pictaria.collection-order.v1";
const LONG_PRESS_MS = 320;

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Puzzle Collections — Pictaria" },
      {
        name: "description",
        content: "Browse every Pictaria puzzle collection, from Hawaiian flowers and waterfalls to sea turtles and sunsets.",
      },
      { property: "og:title", content: "Puzzle Collections — Pictaria" },
      {
        property: "og:description",
        content: "Choose a beautiful Pictaria collection and start playing.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CollectionsPage,
});

function CollectionsPage() {
  const loadLibrary = useServerFn(getLibraryCollections);
  const [libraryCollections, setLibraryCollections] = useState<Collection[]>([]);
  const [order, setOrder] = useState<string[] | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragging = useRef(false);
  const dragIdRef = useRef<string | null>(null);
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const justDragged = useRef(false);
  const orderRef = useRef<string[]>([]);


  useEffect(() => {
    void loadLibrary({}).then((result) => setLibraryCollections(result.collections));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(ORDER_KEY);
      if (saved) setOrder(JSON.parse(saved) as string[]);
    } catch {
      /* ignore */
    }
  }, []);

  const allCollections = useMemo(() => {
    const base = [...libraryCollections, ...visibleCollections];
    if (!order) return base;
    const rank = new Map(order.map((id, i) => [id, i]));
    return [...base].sort(
      (a, b) => (rank.get(a.id) ?? 9999) - (rank.get(b.id) ?? 9999),
    );
  }, [libraryCollections, order]);

  const saveOrder = (ids: string[]) => {
    setOrder(ids);
    try {
      localStorage.setItem(ORDER_KEY, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  };

  const cancelPress = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };

  const moveTo = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const ids = [...orderRef.current];
    const from = ids.indexOf(fromId);
    const to = ids.indexOf(toId);
    if (from < 0 || to < 0) return;
    ids.splice(to, 0, ids.splice(from, 1)[0]!);
    saveOrder(ids);
  };

  const idUnderPoint = (x: number, y: number) => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    return el?.closest<HTMLElement>("[data-collection-id]")?.dataset["collectionId"] ?? null;
  };

  orderRef.current = allCollections.map((c) => c.id);

  // While a card is held, follow the finger at window level so the reorder keeps
  // tracking even as the cards move around underneath.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current || !dragIdRef.current) return;
      const overId = idUnderPoint(e.clientX, e.clientY);
      if (overId) moveTo(dragIdRef.current, overId);
    };
    // Touch devices need the page held still while dragging; touch-action alone
    // is decided when the gesture begins, so block the scroll here.
    const onTouchMove = (e: TouchEvent) => {
      if (dragging.current && e.cancelable) e.preventDefault();
    };
    const onUp = () => {
      cancelPress();
      if (dragging.current) {
        justDragged.current = true;
        setTimeout(() => {
          justDragged.current = false;
        }, 250);
      }
      dragging.current = false;
      dragIdRef.current = null;
      setDragId(null);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <main className="min-h-screen bg-mist-gradient px-4 pb-20 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <div className="pt-24 text-center">
          <p className="text-[10px] tracking-[0.28em] text-muted-foreground uppercase">
            The Pictaria albums
          </p>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl">All Collections</h1>
          <p className="mt-2 text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
            Press and hold an album to drag.
          </p>
        </div>

        <div ref={gridRef} className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
          {allCollections.map((collection) => {
            const isDragging = dragId === collection.id;
            return (
              <Link
                key={collection.id}
                to="/collection/$collectionId"
                params={{ collectionId: collection.id }}
data-collection-id={collection.id}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                onPointerDown={(e) => {
                  cancelPress();
                  dragging.current = false;
                  startPoint.current = { x: e.clientX, y: e.clientY };
                  pressTimer.current = setTimeout(() => {
                    dragging.current = true;
                    dragIdRef.current = collection.id;
                    setDragId(collection.id);
                    if (navigator.vibrate) navigator.vibrate(12);
                  }, LONG_PRESS_MS);
                }}
                onPointerMove={(e) => {
                  if (dragging.current) return;
                  const s = startPoint.current;
                  if (s && Math.hypot(e.clientX - s.x, e.clientY - s.y) > 10) cancelPress();
                }}
                onPointerUp={cancelPress}
                onPointerCancel={cancelPress}
                onContextMenu={(e) => {
                  if (dragging.current) e.preventDefault();
                }}
                onClick={(e) => {
                  if (dragging.current || justDragged.current) e.preventDefault();
                }}
                style={{
                  touchAction: dragId ? "none" : "manipulation",
                  // the held card must not sit under the finger, or the card
                  // beneath it can never be detected as the drop target
                  pointerEvents: isDragging ? "none" : undefined,
                }}

                className={`tile-sheen group relative block overflow-hidden rounded-[4px] border shadow-soft transition-[box-shadow,transform,border-color] duration-300 hover:shadow-lift ${
                  isDragging
                    ? "z-10 scale-[1.06] border-accent shadow-lift"
                    : "border-accent/60"
                }`}
              >
                <img
                  src={collection.cover}
                  alt={collection.title}
                  loading="lazy"
                  width={768}
                  height={1024}
                  draggable={false}
                  className="aspect-[3/4] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-deep via-deep/70 to-transparent px-2 pt-8 pb-2.5">
                  <p
                    className={`leading-tight text-deep-foreground/85 uppercase ${
                      collection.title.length > 10
                        ? "text-[9px] tracking-[0.01em]"
                        : "text-[10px] tracking-[0.06em]"
                    }`}
                  >
                    {collection.title}
                  </p>

                  <p className="mt-1 text-[10px] tracking-[0.14em] text-accent uppercase">
                    {collection.puzzles.length} puzzles
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
