import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { buildPuzzle } from "@/lib/jigsaw";
import { playLock, playPick, playSolved } from "@/lib/feedback";

const WORLD_W = 1000;

interface PieceState {
  x: number;
  y: number;
  group: number;
  locked: boolean;
  z: number;
}

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

export function PuzzleBoard({
  src,
  title,
  grid,
  onExit,
  onChangeDifficulty,
}: PuzzleBoardProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const viewportRef = useRef<HTMLDivElement>(null);

  const [aspect, setAspect] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [pieces, setPieces] = useState<PieceState[]>([]);
  const [view, setView] = useState<View>({ s: 1, tx: 0, ty: 0 });
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [solved, setSolved] = useState(false);

  const piecesRef = useRef<PieceState[]>([]);
  piecesRef.current = pieces;
  const viewRef = useRef<View>(view);
  viewRef.current = view;
  const zRef = useRef(1);
  const [draggingGroup, setDraggingGroup] = useState<number | null>(null);

  const dragRef = useRef<{ group: number; x: number; y: number } | null>(null);
  const panRef = useRef<{ x: number; y: number } | null>(null);
  const pinchRef = useRef<{ dist: number; s: number } | null>(null);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());

  const worldH = aspect ? WORLD_W / aspect : WORLD_W;

  const geo = useMemo(
    () => (aspect ? buildPuzzle(grid, WORLD_W, worldH) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [grid, aspect, round],
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
    const ro = new ResizeObserver(() => {
      setSize({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const fitView = useCallback(() => {
    if (!size.w || !size.h) return;
    const s = Math.min(size.w / WORLD_W, size.h / worldH) * 0.9;
    setView({ s, tx: (size.w - WORLD_W * s) / 2, ty: (size.h - worldH * s) / 2 });
  }, [size.w, size.h, worldH]);

  useEffect(() => {
    fitView();
  }, [fitView]);

  /* scatter pieces */
  useEffect(() => {
    if (!geo) return;
    const { cellW, cellH } = geo;
    const gap = Math.min(cellW, cellH) * 0.6;
    const next: PieceState[] = geo.pieces.map((p, i) => {
      let x = 0;
      let y = 0;
      for (let attempt = 0; attempt < 20; attempt++) {
        x = Math.random() * (WORLD_W - cellW);
        y = Math.random() * (worldH - cellH);
        const tx = p.col * cellW;
        const ty = p.row * cellH;
        if (Math.hypot(x - tx, y - ty) > gap) break;
      }
      return { x, y, group: i + 1, locked: false, z: 1 };
    });
    zRef.current = next.length + 1;
    setPieces(next);
    setMoves(0);
    setSeconds(0);
    setSolved(false);
  }, [geo, worldH]);

  /* timer */
  useEffect(() => {
    if (solved || !pieces.length) return;
    const t = window.setInterval(() => setSeconds((v) => v + 1), 1000);
    return () => window.clearInterval(t);
  }, [solved, pieces.length]);

  const zoomAt = useCallback(
    (nextS: number, px: number, py: number) => {
      setView((v) => {
        const clamped = Math.min(4, Math.max(0.25, nextS));
        const k = clamped / v.s;
        return {
          s: clamped,
          tx: px - (px - v.tx) * k,
          ty: py - (py - v.ty) * k,
        };
      });
    },
    [],
  );

  /* wheel + pinch zoom (non-passive) */
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      const next = viewRef.current.s * Math.exp(-dy * 0.0018);
      zoomAt(next, e.clientX - rect.left, e.clientY - rect.top);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const bringToFront = (group: number) => {
    const z = ++zRef.current;
    setPieces((prev) => prev.map((p) => (p.group === group ? { ...p, z } : p)));
  };

  const settle = useCallback(
    (group: number) => {
      if (!geo) return;
      const { cellW, cellH } = geo;
      const defs = geo.pieces;
      const threshold = Math.min(cellW, cellH) * 0.26;
      const cur = piecesRef.current.map((p) => ({ ...p }));
      const members = cur
        .map((p, i) => ({ p, i }))
        .filter((e) => e.p.group === group);
      if (!members.length) return;

      let dx = 0;
      let dy = 0;
      let anchor = false;
      let mergeInto: number | null = null;

      for (const { p, i } of members) {
        const def = defs[i]!;
        const tx = def.col * cellW;
        const ty = def.row * cellH;
        if (Math.abs(p.x - tx) < threshold && Math.abs(p.y - ty) < threshold) {
          dx = tx - p.x;
          dy = ty - p.y;
          anchor = true;
          break;
        }
      }

      if (!anchor) {
        outer: for (const { p, i } of members) {
          const def = defs[i]!;
          for (const [dr, dc] of [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
          ] as const) {
            const nr = def.row + dr;
            const nc = def.col + dc;
            if (nr < 0 || nc < 0 || nr >= grid || nc >= grid) continue;
            const j = nr * grid + nc;
            const q = cur[j]!;
            if (q.group === group) continue;
            const wantX = q.x - dc * cellW;
            const wantY = q.y - dr * cellH;
            if (
              Math.abs(p.x - wantX) < threshold &&
              Math.abs(p.y - wantY) < threshold
            ) {
              dx = wantX - p.x;
              dy = wantY - p.y;
              mergeInto = q.group;
              break outer;
            }
          }
        }
      }

      if (!anchor && mergeInto === null) return;

      const targetLocked =
        anchor ||
        (mergeInto !== null &&
          cur.some((p) => p.group === mergeInto && p.locked));

      let merged = cur.map((p) => {
        if (p.group !== group) return p;
        return {
          ...p,
          x: p.x + dx,
          y: p.y + dy,
          group: anchor ? 0 : mergeInto!,
          locked: targetLocked,
        };
      });

      if (targetLocked) {
        const gid = anchor ? 0 : mergeInto!;
        merged = merged.map((p) =>
          p.group === gid ? { ...p, group: 0, locked: true, z: 0 } : p,
        );
      }

      // whole picture assembled as one floating group -> settle it home
      const gidNow = targetLocked ? 0 : mergeInto!;
      const groupCount = merged.filter((p) => p.group === gidNow).length;
      if (!targetLocked && groupCount === merged.length) {
        merged = merged.map((p, i) => {
          const def = defs[i]!;
          return {
            ...p,
            x: def.col * cellW,
            y: def.row * cellH,
            group: 0,
            locked: true,
            z: 0,
          };
        });
      }

      setPieces(merged);
      playLock();

      if (merged.every((p) => p.locked)) {
        setSolved(true);
        window.setTimeout(() => playSolved(), 260);
      }
    },
    [geo, grid],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    const el = viewportRef.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 2) {
      const [a, b] = [...pointersRef.current.values()];
      dragRef.current = null;
      setDraggingGroup(null);
      panRef.current = null;
      pinchRef.current = {
        dist: Math.hypot(a!.x - b!.x, a!.y - b!.y),
        s: viewRef.current.s,
      };
      return;
    }

    const pieceEl = (e.target as Element).closest("[data-piece]");
    if (pieceEl && !solved) {
      const i = Number(pieceEl.getAttribute("data-piece"));
      const piece = piecesRef.current[i];
      if (piece && !piece.locked) {
        dragRef.current = { group: piece.group, x: e.clientX, y: e.clientY };
        setDraggingGroup(piece.group);
        bringToFront(piece.group);
        playPick();
        return;
      }
    }
    panRef.current = { x: e.clientX, y: e.clientY };
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
      const cx = (a!.x + b!.x) / 2 - rect.left;
      const cy = (a!.y + b!.y) / 2 - rect.top;
      zoomAt((pinchRef.current.s * dist) / pinchRef.current.dist, cx, cy);
      return;
    }

    if (dragRef.current) {
      const { group, x, y } = dragRef.current;
      const s = viewRef.current.s;
      const dx = (e.clientX - x) / s;
      const dy = (e.clientY - y) / s;
      dragRef.current = { group, x: e.clientX, y: e.clientY };
      setPieces((prev) =>
        prev.map((p) =>
          p.group === group ? { ...p, x: p.x + dx, y: p.y + dy } : p,
        ),
      );
      return;
    }

    if (panRef.current) {
      const dx = e.clientX - panRef.current.x;
      const dy = e.clientY - panRef.current.y;
      panRef.current = { x: e.clientX, y: e.clientY };
      setView((v) => ({ ...v, tx: v.tx + dx, ty: v.ty + dy }));
    }
  };

  const endPointer = (e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
    if (dragRef.current) {
      const group = dragRef.current.group;
      dragRef.current = null;
      setDraggingGroup(null);
      setMoves((m) => m + 1);
      settle(group);
    }
    panRef.current = null;
  };

  const remaining = pieces.filter((p) => !p.locked).length;

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
          className="absolute top-0 left-0 origin-top-left"
          style={{
            width: WORLD_W,
            height: worldH,
            transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.s})`,
          }}
        >
          {/* board ghost */}
          <div
            className="absolute inset-0 overflow-hidden rounded-[18px] ring-1 ring-border"
            style={{ boxShadow: "var(--shadow-soft)" }}
          >
            <img
              src={src}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover opacity-15"
            />
          </div>

          {geo?.pieces.map((def, i) => {
            const st = pieces[i];
            if (!st) return null;
            const w = geo.cellW + def.padX * 2;
            const h = geo.cellH + def.padY * 2;
            const isDragging = draggingGroup === st.group;
            return (
              <svg
                key={def.id}
                data-piece={i}
                width={w}
                height={h}
                viewBox={`0 0 ${w} ${h}`}
                style={{
                  position: "absolute",
                  left: st.x - def.padX,
                  top: st.y - def.padY,
                  zIndex: st.locked ? 1 : st.z + 1,
                  overflow: "visible",
                  cursor: st.locked ? "default" : "grab",
                  filter: st.locked
                    ? "none"
                    : `drop-shadow(${isDragging ? "0 10px 18px" : "0 4px 8px"} rgba(15,45,70,0.35))`,
                  transition: isDragging
                    ? "none"
                    : "left 0.22s var(--ease-calm), top 0.22s var(--ease-calm), filter 0.2s ease",
                }}
              >
                <defs>
                  <clipPath id={`clip-${uid}-${i}`} clipPathUnits="userSpaceOnUse">
                    <path
                      d={def.path}
                      transform={`translate(${def.padX},${def.padY})`}
                    />
                  </clipPath>
                </defs>
                <g clipPath={`url(#clip-${uid}-${i})`}>
                  <image
                    href={src}
                    x={def.padX - def.col * geo.cellW}
                    y={def.padY - def.row * geo.cellH}
                    width={WORLD_W}
                    height={worldH}
                    preserveAspectRatio="none"
                  />
                </g>
                <path
                  d={def.path}
                  transform={`translate(${def.padX},${def.padY})`}
                  fill="none"
                  stroke="rgba(255,255,255,0.45)"
                  strokeWidth={1.2}
                />
              </svg>
            );
          })}
        </div>

        {/* zoom controls */}
        <div className="glass-panel absolute right-3 bottom-3 z-20 flex flex-col overflow-hidden rounded-2xl">
          {[
            { label: "+", action: () => zoomAt(viewRef.current.s * 1.25, size.w / 2, size.h / 2) },
            { label: "−", action: () => zoomAt(viewRef.current.s / 1.25, size.w / 2, size.h / 2) },
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
          <p className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-card/70 px-3 py-1 text-[11px] tracking-wide text-muted-foreground">
            {remaining} pieces left
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
