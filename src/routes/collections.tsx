import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { visibleCollections } from "@/data/collections";
import type { Collection } from "@/data/collections";
import { getLibraryCollections } from "@/lib/collection-catalog.functions";

const ORDER_KEY = "pictaria.collection-order.v1";
const LONG_PRESS_MS = 260;
const FLIP_MS = 220;

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
  const cardEls = useRef(new Map<string, HTMLElement>());
  const prevRects = useRef(new Map<string, DOMRect>());

  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragIdRef = useRef<string | null>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const justDragged = useRef(false);
  const orderRef = useRef<string[]>([]);
  const frame = useRef<number | null>(null);
  const lastSwap = useRef(0);

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

  orderRef.current = allCollections.map((c) => c.id);

  const saveOrder = (ids: string[]) => {
    // remember where every card sits so the shuffle can be animated
    prevRects.current.clear();
    cardEls.current.forEach((el, id) => {
      prevRects.current.set(id, el.getBoundingClientRect());
    });
    setOrder(ids);
    try {
      localStorage.setItem(ORDER_KEY, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  };

  // FLIP: slide the untouched cards from their old slots into their new ones.
  useLayoutEffect(() => {
    if (prevRects.current.size === 0) return;
    const rects = prevRects.current;
    prevRects.current = new Map();

    cardEls.current.forEach((el, id) => {
      if (id === dragIdRef.current) return;
      const before = rects.get(id);
      if (!before) return;
      const after = el.getBoundingClientRect();
      const dx = before.left - after.left;
      const dy = before.top - after.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      el.style.transition = "none";
      el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      requestAnimationFrame(() => {
        el.style.transition = `transform ${FLIP_MS}ms cubic-bezier(0.22,0.61,0.36,1)`;
        el.style.transform = "translate3d(0, 0, 0)";
      });
    });
  }, [allCollections]);

  const cancelPress = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };

  // Keep the held card glued to the finger. Recomputed from the card's own
  // resting slot each frame, so it stays accurate after every reorder.
  const paint = () => {
    frame.current = null;
    const id = dragIdRef.current;
    const p = pointer.current;
    if (!id || !p) return;
    const el = cardEls.current.get(id);
    if (!el) return;
    el.style.transition = "none";
    el.style.transform = "translate3d(0,0,0) scale(1)";
    const rect = el.getBoundingClientRect();
    const dx = p.x - (rect.left + rect.width / 2);
    const dy = p.y - (rect.top + rect.height / 2);
    el.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(1.07)`;
  };

  const requestPaint = () => {
    if (frame.current === null) frame.current = requestAnimationFrame(paint);
  };

  const moveTo = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const ids = [...orderRef.current];
    const from = ids.indexOf(fromId);
    const to = ids.indexOf(toId);
    if (from < 0 || to < 0) return;
    // let the shuffle animation settle before accepting the next swap
    const now = Date.now();
    if (now - lastSwap.current < FLIP_MS) return;
    lastSwap.current = now;
    ids.splice(to, 0, ids.splice(from, 1)[0]!);
    saveOrder(ids);
  };

  // Which card is the finger over? Compare against resting slots rather than
  // elementFromPoint, so the lifted card never blocks the hit test.
  const idUnderPoint = (x: number, y: number) => {
    let best: string | null = null;
    cardEls.current.forEach((el, id) => {
      if (id === dragIdRef.current) return;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) best = id;
    });
    return best;
  };

  const startDrag = (id: string) => {
    dragIdRef.current = id;
    setDragId(id);
    if (navigator.vibrate) navigator.vibrate(12);
    requestPaint();
  };

  const endDrag = () => {
    cancelPress();
    const id = dragIdRef.current;
    if (id) {
      justDragged.current = true;
      setTimeout(() => {
        justDragged.current = false;
      }, 250);
      const el = cardEls.current.get(id);
      if (el) {
        el.style.transition = `transform ${FLIP_MS}ms cubic-bezier(0.22,0.61,0.36,1)`;
        el.style.transform = "translate3d(0, 0, 0)";
      }
    }
    dragIdRef.current = null;
    pointer.current = null;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    setDragId(null);
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragIdRef.current) return;
      if (e.cancelable) e.preventDefault();
      pointer.current = { x: e.clientX, y: e.clientY };
      requestPaint();
      const overId = idUnderPoint(e.clientX, e.clientY);
      if (overId) moveTo(dragIdRef.current, overId);
    };
    // touch-action is decided when the gesture begins, so hold the page still here
    const onTouchMove = (e: TouchEvent) => {
      if (dragIdRef.current && e.cancelable) e.preventDefault();
    };
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
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

        <div ref={gridRef} className="relative mt-5 grid grid-cols-3 gap-2 sm:gap-3">
          {allCollections.map((collection) => {
            const isDragging = dragId === collection.id;
            return (
              <Link
                key={collection.id}
                to="/collection/$collectionId"
                params={{ collectionId: collection.id }}
                data-collection-id={collection.id}
                ref={(el) => {
                  if (el) cardEls.current.set(collection.id, el as unknown as HTMLElement);
                  else cardEls.current.delete(collection.id);
                }}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                onPointerDown={(e) => {
                  cancelPress();
                  startPoint.current = { x: e.clientX, y: e.clientY };
                  pointer.current = { x: e.clientX, y: e.clientY };
                  pressTimer.current = setTimeout(
                    () => startDrag(collection.id),
                    LONG_PRESS_MS,
                  );
                }}
                onPointerMove={(e) => {
                  if (dragIdRef.current) return;
                  const s = startPoint.current;
                  if (s && Math.hypot(e.clientX - s.x, e.clientY - s.y) > 12) cancelPress();
                }}
                onPointerUp={cancelPress}
                onPointerCancel={cancelPress}
                onContextMenu={(e) => {
                  if (dragIdRef.current) e.preventDefault();
                }}
                onClick={(e) => {
                  if (dragIdRef.current || justDragged.current) e.preventDefault();
                }}
                style={{
                  touchAction: dragId ? "none" : "manipulation",
                  zIndex: isDragging ? 20 : undefined,
                  willChange: isDragging ? "transform" : undefined,
                }}
                className={`tile-sheen group relative block overflow-hidden rounded-[4px] border shadow-soft ${
                  isDragging
                    ? "border-accent opacity-95 shadow-lift"
                    : "border-accent/60 hover:shadow-lift"
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
