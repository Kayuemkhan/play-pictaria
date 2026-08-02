import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { playLock, playPick, playSolved } from "@/lib/feedback";

const WORLD_W = 1000;

interface View {
  s: number;
  tx: number;
  ty: number;
}

export interface PuzzleBoardProps {
  src: string;
  title: string;
  grid: number;
  onExit: () => void;
  onChangeDifficulty: () => void;
}

function formatTime(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Shuffled placement: slots[cellIndex] = pieceId, no piece starts home. */
function shuffleSlots(count: number): number[] {
  for (let attempt = 0; attempt < 50; attempt++) {
    const a = Array.from({ length: count }, (_, i) => i);
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j]!, a[i]!];
    }
    if (a.every((piece, cell) => piece !== cell)) return a;
  }
  return Array.from({ length: count }, (_, i) => (i + 1) % count);
}

export function PuzzleBoard({
  src,
  title,
  grid,
  onExit,
  onChangeDifficulty,
}: PuzzleBoardProps) {
  const viewportRef = useRef<HTMLDivElement>(null);

  const [aspect, setAspect] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [slots, setSlots] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [swapping, setSwapping] = useState<number[]>([]);
  const [view, setView] = useState<View>({ s: 1, tx: 0, ty: 0 });
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [solved, setSolved] = useState(false);

  const [drag, setDrag] = useState<{
    cell: number;
    x: number;
    y: number;
  } | null>(null);

  const viewRef = useRef<View>(view);
  viewRef.current = view;
  const panRef = useRef<{
    x: number;
    y: number;
    moved: boolean;
    cell: number | null;
  } | null>(null);
  const dragRef = useRef<{ cell: number } | null>(null);
  const pinchRef = useRef<{ dist: number; s: number } | null>(null);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());

  const worldH = aspect ? WORLD_W / aspect : WORLD_W;
  const total = grid * grid;
  const cellW = WORLD_W / grid;
  const cellH = worldH / grid;

  /** cell index under a client point, or null */
  const cellAtPoint = useCallback(
    (clientX: number, clientY: number) => {
      const el = viewportRef.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const v = viewRef.current;
      const wx = (clientX - rect.left - v.tx) / v.s;
      const wy = (clientY - rect.top - v.ty) / v.s;
      if (wx < 0 || wy < 0 || wx >= WORLD_W || wy >= worldH) return null;
      const col = Math.floor(wx / cellW);
      const row = Math.floor(wy / cellH);
      if (col < 0 || col >= grid || row < 0 || row >= grid) return null;
      return row * grid + col;
    },
    [grid, cellW, cellH, worldH],
  );


  const locked = useMemo(
    () => slots.map((piece, cell) => piece === cell),
    [slots],
  );

  /* image aspect ratio */
  useEffect(() => {
    const img = new Image();
    img.onload = () => setAspect(img.naturalWidth / img.naturalHeight);
    img.src = src;
  }, [src]);

  /* viewport size */
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() =>
      setSize({ w: el.clientWidth, h: el.clientHeight }),
    );
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const fitView = useCallback(() => {
    if (!size.w || !size.h) return;
    const s = Math.min(size.w / WORLD_W, size.h / worldH) * 0.92;
    setView({
      s,
      tx: (size.w - WORLD_W * s) / 2,
      ty: (size.h - worldH * s) / 2,
    });
  }, [size.w, size.h, worldH]);

  useEffect(() => {
    fitView();
  }, [fitView]);

  /* jumble */
  useEffect(() => {
    if (!aspect) return;
    setSlots(shuffleSlots(total));
    setSelected(null);
    setSwapping([]);
    setMoves(0);
    setSeconds(0);
    setSolved(false);
  }, [aspect, total, round]);

  /* timer */
  useEffect(() => {
    if (solved || !slots.length) return;
    const t = window.setInterval(() => setSeconds((v) => v + 1), 1000);
    return () => window.clearInterval(t);
  }, [solved, slots.length]);

  const zoomAt = useCallback((nextS: number, px: number, py: number) => {
    setView((v) => {
      const clamped = Math.min(4, Math.max(0.4, nextS));
      const k = clamped / v.s;
      return { s: clamped, tx: px - (px - v.tx) * k, ty: py - (py - v.ty) * k };
    });
  }, []);

  /* wheel zoom (non-passive) */
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const dy =
        e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      zoomAt(
        viewRef.current.s * Math.exp(-dy * 0.0018),
        e.clientX - rect.left,
        e.clientY - rect.top,
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const swapCells = (a: number, b: number) => {
    if (a === b || locked[a] || locked[b] || solved) return;
    setMoves((m) => m + 1);
    setSlots((prev) => {
      const next = [...prev];
      next[a] = prev[b]!;
      next[b] = prev[a]!;
      const settled = [a, b].filter((c) => next[c] === c);
      if (settled.length) {
        playLock();
        setSwapping(settled);
        window.setTimeout(() => setSwapping([]), 360);
      } else {
        playPick();
      }
      if (next.every((piece, i) => piece === i)) {
        setSolved(true);
        window.setTimeout(() => playSolved(), 260);
      }
      return next;
    });
  };

  const tapCell = (cell: number) => {
    if (solved || locked[cell]) return;
    if (selected === null) {
      setSelected(cell);
      playPick();
      return;
    }
    if (selected === cell) {
      setSelected(null);
      return;
    }
    const a = selected;
    setSelected(null);
    swapCells(a, cell);
  };


  const onPointerDown = (e: React.PointerEvent) => {
    const el = viewportRef.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 2) {
      const [a, b] = [...pointersRef.current.values()];
      panRef.current = null;
      pinchRef.current = {
        dist: Math.hypot(a!.x - b!.x, a!.y - b!.y),
        s: viewRef.current.s,
      };
      return;
    }
    const cellEl = (e.target as Element).closest("[data-cell]");
    panRef.current = {
      x: e.clientX,
      y: e.clientY,
      moved: false,
      cell: cellEl ? Number(cellEl.getAttribute("data-cell")) : null,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const el = viewportRef.current;
    if (!el) return;

    if (pointersRef.current.size >= 2 && pinchRef.current) {
      const [a, b] = [...pointersRef.current.values()];
      const dist = Math.hypot(a!.x - b!.x, a!.y - b!.y);
      const rect = el.getBoundingClientRect();
      zoomAt(
        (pinchRef.current.s * dist) / pinchRef.current.dist,
        (a!.x + b!.x) / 2 - rect.left,
        (a!.y + b!.y) / 2 - rect.top,
      );
      return;
    }

    if (panRef.current) {
      const dx = e.clientX - panRef.current.x;
      const dy = e.clientY - panRef.current.y;
      panRef.current.x = e.clientX;
      panRef.current.y = e.clientY;
      if (Math.abs(dx) + Math.abs(dy) > 2) panRef.current.moved = true;
      setView((v) => ({ ...v, tx: v.tx + dx, ty: v.ty + dy }));
    }
  };

  const endPointer = (e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
    const pan = panRef.current;
    panRef.current = null;
    if (!pan || pan.moved) return;
    if (pan.cell !== null) tapCell(pan.cell);
  };

  const remaining = locked.filter((v) => !v).length;

  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-mist-gradient">
      {/* top bar */}
      <header className="glass-panel z-20 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5 sm:px-5">
        <button
          onClick={onExit}
          className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          ← Gallery
        </button>
        <div className="min-w-0 text-center">
          <p className="truncate font-display text-lg leading-tight sm:text-xl">
            {title}
          </p>
          <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
            {grid}×{grid}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs tabular-nums sm:gap-3 sm:text-sm">
          <span className="rounded-full bg-secondary px-2.5 py-1 text-secondary-foreground">
            {formatTime(seconds)}
          </span>
          <span className="rounded-full bg-secondary px-2.5 py-1 text-secondary-foreground">
            {moves} moves
          </span>
        </div>
      </header>

      {/* stage */}
      <div
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        className="relative flex-1 touch-none overflow-hidden select-none"
      >
        <div
          className="absolute top-0 left-0 origin-top-left rounded-[18px]"
          style={{
            width: WORLD_W,
            height: worldH,
            transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.s})`,
            boxShadow: "var(--shadow-soft)",
          }}
        >
          {slots.map((piece, cell) => {
            const row = Math.floor(cell / grid);
            const col = cell % grid;
            const pr = Math.floor(piece / grid);
            const pc = piece % grid;
            const isLocked = locked[cell];
            const isSelected = selected === cell;
            const justLocked = swapping.includes(cell);
            return (
              <div
                key={cell}
                data-cell={cell}
                style={{
                  position: "absolute",
                  left: col * cellW,
                  top: row * cellH,
                  width: cellW,
                  height: cellH,
                  backgroundImage: `url(${src})`,
                  backgroundSize: `${WORLD_W}px ${worldH}px`,
                  backgroundPosition: `${-pc * cellW}px ${-pr * cellH}px`,
                  borderRadius: isLocked ? 2 : 6,
                  boxShadow: isSelected
                    ? "0 0 0 3px var(--accent), 0 12px 22px rgba(15,45,70,0.4)"
                    : isLocked
                      ? "none"
                      : "inset 0 0 0 1.5px rgba(255,255,255,0.55)",
                  transform: isSelected
                    ? "scale(0.94)"
                    : justLocked
                      ? "scale(1.02)"
                      : "scale(1)",
                  zIndex: isSelected ? 3 : justLocked ? 2 : 1,
                  cursor: isLocked ? "default" : "pointer",
                  transition:
                    "transform 0.28s var(--ease-calm), box-shadow 0.25s ease, border-radius 0.3s ease",
                }}
              />
            );
          })}
        </div>

        {/* zoom controls */}
        <div className="glass-panel absolute right-3 bottom-3 z-20 flex flex-col overflow-hidden rounded-2xl">
          {[
            {
              label: "+",
              action: () =>
                zoomAt(viewRef.current.s * 1.25, size.w / 2, size.h / 2),
            },
            {
              label: "−",
              action: () =>
                zoomAt(viewRef.current.s / 1.25, size.w / 2, size.h / 2),
            },
            { label: "⤢", action: fitView },
          ].map((b) => (
            <button
              key={b.label}
              onClick={b.action}
              className="h-10 w-10 text-base text-foreground/70 transition-colors hover:bg-secondary"
            >
              {b.label}
            </button>
          ))}
        </div>

        {!solved && (
          <p className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-card/70 px-3 py-1 text-center text-[11px] tracking-wide text-muted-foreground">
            {selected === null
              ? `Tap two pieces to swap — ${remaining} left`
              : "Tap where this piece belongs"}
          </p>
        )}
      </div>

      {/* celebration */}
      {solved && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-deep/55 backdrop-blur-md">
          {Array.from({ length: 14 }).map((_, i) => (
            <span
              key={i}
              className="animate-bubble pointer-events-none absolute bottom-0 rounded-full bg-seafoam/70"
              style={{
                left: `${(i * 7 + 5) % 96}%`,
                width: 6 + (i % 4) * 5,
                height: 6 + (i % 4) * 5,
                animationDelay: `${i * 0.32}s`,
                animationDuration: `${4 + (i % 3)}s`,
              }}
            />
          ))}
          <div className="animate-soft-in glass-panel mx-4 w-full max-w-sm rounded-3xl p-7 text-center shadow-lift">
            <p className="text-[11px] tracking-[0.3em] text-muted-foreground uppercase">
              Complete
            </p>
            <h2 className="mt-2 font-display text-4xl">{title}</h2>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-secondary/70 py-3">
                <p className="font-display text-2xl tabular-nums">
                  {formatTime(seconds)}
                </p>
                <p className="text-[11px] tracking-wider text-muted-foreground uppercase">
                  Time
                </p>
              </div>
              <div className="rounded-2xl bg-secondary/70 py-3">
                <p className="font-display text-2xl tabular-nums">{moves}</p>
                <p className="text-[11px] tracking-wider text-muted-foreground uppercase">
                  Moves
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={() => setRound((r) => r + 1)}
                className="rounded-full bg-primary py-3 text-sm tracking-wide text-primary-foreground transition-opacity hover:opacity-90"
              >
                Play again
              </button>
              <button
                onClick={onChangeDifficulty}
                className="rounded-full border border-border py-3 text-sm text-foreground transition-colors hover:bg-secondary"
              >
                Change difficulty
              </button>
              <button
                onClick={onExit}
                className="py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Back to gallery
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
