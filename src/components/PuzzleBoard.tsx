import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { playLock, playPick, playSolved } from "@/lib/feedback";

const WORLD_W = 1000;

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

/** true if any two picture-neighbour pieces already sit adjacent correctly */
function hasPreLockedPair(positions: number[], grid: number) {
  for (let p = 0; p < positions.length; p++) {
    const pc = positions[p]!;
    const pr = Math.floor(pc / grid);
    const pcol = pc % grid;
    for (const [dr, dc] of [
      [0, 1],
      [1, 0],
    ] as const) {
      const nr = pr + dr;
      const nc = pcol + dc;
      if (nr >= grid || nc >= grid) continue;
      const q = positions.indexOf(nr * grid + nc);
      if (q < 0) continue;
      if (
        Math.floor(q / grid) === Math.floor(p / grid) + dr &&
        q % grid === (p % grid) + dc
      )
        return true;
    }
  }
  return false;
}

/** pos[pieceId] = cellIndex. Nothing starts home, nothing starts locked. */
function shufflePositions(count: number, grid: number): number[] {
  let fallback: number[] | null = null;
  for (let attempt = 0; attempt < 400; attempt++) {
    const a = Array.from({ length: count }, (_, i) => i);
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j]!, a[i]!];
    }
    if (!a.every((cell, piece) => cell !== piece)) continue;
    if (!fallback) fallback = a;
    if (!hasPreLockedPair(a, grid)) return a;
  }
  return fallback ?? Array.from({ length: count }, (_, i) => (i + 1) % count);
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
  /** pos[piece] = cell */
  const [pos, setPos] = useState<number[]>([]);
  /** groupOf[piece] = group id */
  const [groupOf, setGroupOf] = useState<number[]>([]);
  const [flash, setFlash] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [solved, setSolved] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const [drag, setDrag] = useState<{
    group: number;
    dx: number;
    dy: number;
    valid: boolean;
  } | null>(null);

  const total = grid * grid;
  const worldH = (WORLD_W * 4) / 3;
  const cellW = WORLD_W / grid;
  const cellH = worldH / grid;

  const scale = useMemo(() => {
    if (!size.w || !size.h) return 0;
    return Math.min(size.w / WORLD_W, size.h / worldH);
  }, [size.w, size.h, worldH]);

  const offX = (size.w - WORLD_W * scale) / 2;
  const offY = (size.h - worldH * scale) / 2;

  /** cover-crop the photo into the portrait board */
  const bg = useMemo(() => {
    const a = aspect ?? 3 / 4;
    const boardAspect = WORLD_W / worldH;
    const w = a > boardAspect ? worldH * a : WORLD_W;
    const h = a > boardAspect ? worldH : WORLD_W / a;
    return { w, h, x: (WORLD_W - w) / 2, y: (worldH - h) / 2 };
  }, [aspect, worldH]);

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

  /** merge every pair of pieces that sit correctly side by side */
  const mergePass = useCallback(
    (positions: number[], groups: number[]) => {
      const g = [...groups];
      let merged = false;
      const relink = (from: number, to: number) => {
        for (let i = 0; i < g.length; i++) if (g[i] === from) g[i] = to;
      };
      let changed = true;
      while (changed) {
        changed = false;
        for (let p = 0; p < positions.length; p++) {
          const pc = positions[p]!;
          const pr = Math.floor(pc / grid);
          const pcol = pc % grid;
          for (const [dr, dc] of [
            [0, 1],
            [1, 0],
          ] as const) {
            const nr = pr + dr;
            const nc = pcol + dc;
            if (nr >= grid || nc >= grid) continue;
            const nCell = nr * grid + nc;
            const q = positions.indexOf(nCell);
            if (q < 0 || g[q] === g[p]) continue;
            // are p and q neighbours in the picture, in the same direction?
            const homeOkRow = Math.floor(q / grid) === Math.floor(p / grid) + dr;
            const homeOkCol = q % grid === (p % grid) + dc;
            if (homeOkRow && homeOkCol) {
              relink(g[q]!, g[p]!);
              merged = true;
              changed = true;
            }
          }
        }
      }
      return { groups: g, merged };
    },
    [grid],
  );

  /* jumble */
  useEffect(() => {
    if (!aspect) return;
    const p = shufflePositions(total, grid);
    const init = Array.from({ length: total }, (_, i) => i);
    setPos(p);
    setGroupOf(mergePass(p, init).groups);
    setMoves(0);
    setSeconds(0);
    setSolved(false);
    setFlash([]);
    setDrag(null);
  }, [aspect, total, round, mergePass]);

  /* timer */
  useEffect(() => {
    if (solved || !pos.length) return;
    const t = window.setInterval(() => setSeconds((v) => v + 1), 1000);
    return () => window.clearInterval(t);
  }, [solved, pos.length]);

  const dragStart = useRef<{
    group: number;
    x: number;
    y: number;
    moved: boolean;
  } | null>(null);

  /**
   * Translate the dragged cluster and move whatever it displaces into the cells
   * it vacated. Existing clusters stay rigid. This makes the important 3×3
   * endgame possible: a six-piece block can exchange places with the remaining
   * three-piece strip instead of trying to push that strip off the board.
   */
  const tryMove = useCallback(
    (
      positions: number[],
      groups: number[],
      group: number,
      dCol: number,
      dRow: number,
    ): number[] | null => {
      const shift = (cell: number) => {
        const r = Math.floor(cell / grid) + dRow;
        const c = (cell % grid) + dCol;
        if (r < 0 || r >= grid || c < 0 || c >= grid) return -1;
        return r * grid + c;
      };

      const members = groups
        .map((g, piece) => (g === group ? piece : -1))
        .filter((piece) => piece >= 0);
      const moving = new Map<number, number>();
      for (const piece of members) {
        const destination = shift(positions[piece]!);
        if (destination < 0) return null;
        moving.set(piece, destination);
      }

      const newCells = new Set(moving.values());
      if (newCells.size !== moving.size) return null;

      const oldCells = new Set(
        [...moving.keys()].map((piece) => positions[piece]!),
      );
      const vacated = [...oldCells].filter((c) => !newCells.has(c)).sort((a, b) => a - b);
      const displaced = positions
        .map((cell, piece) => ({ cell, piece }))
        .filter(({ cell, piece }) => !moving.has(piece) && newCells.has(cell))
        .sort((a, b) => a.cell - b.cell)
        .map(({ piece }) => piece);

      if (displaced.length !== vacated.length) return null;

      const next = [...positions];
      for (const [piece, cell] of moving) next[piece] = cell;

      const remainingVacated = new Set(vacated);
      const displacedGroups = [...new Set(displaced.map((piece) => groups[piece]!))];
      const placed = new Set<number>();

      // Preserve every displaced multi-piece cluster by finding a translation
      // that fits its complete shape into the vacated cells.
      for (const displacedGroup of displacedGroups) {
        const cluster = groups
          .map((g, piece) => (g === displacedGroup ? piece : -1))
          .filter((piece) => piece >= 0);
        if (cluster.length < 2) continue;
        if (!cluster.every((piece) => displaced.includes(piece))) return null;

        const anchor = positions[cluster[0]!]!;
        let placement: Map<number, number> | null = null;
        for (const target of remainingVacated) {
          const deltaRow = Math.floor(target / grid) - Math.floor(anchor / grid);
          const deltaCol = (target % grid) - (anchor % grid);
          const candidate = new Map<number, number>();
          let fits = true;
          for (const piece of cluster) {
            const cell = positions[piece]!;
            const row = Math.floor(cell / grid) + deltaRow;
            const col = (cell % grid) + deltaCol;
            const destination = row * grid + col;
            if (
              row < 0 || row >= grid || col < 0 || col >= grid ||
              !remainingVacated.has(destination)
            ) {
              fits = false;
              break;
            }
            candidate.set(piece, destination);
          }
          if (fits) {
            placement = candidate;
            break;
          }
        }
        if (!placement) return null;
        for (const [piece, cell] of placement) {
          next[piece] = cell;
          placed.add(piece);
          remainingVacated.delete(cell);
        }
      }

      const loose = displaced.filter((piece) => !placed.has(piece));
      const looseCells = [...remainingVacated].sort((a, b) => a - b);
      if (loose.length !== looseCells.length) return null;
      loose.forEach((piece, index) => (next[piece] = looseCells[index]!));
      if (new Set(next).size !== next.length) return null;
      return next;
    },
    [grid],
  );

  /** the closest legal interpretation of a drag: full, single-axis, then shorter */
  const resolveMove = useCallback(
    (dCol: number, dRow: number): { dCol: number; dRow: number } | null => {
      const step = (n: number) => (n > 0 ? 1 : n < 0 ? -1 : 0);
      const candidates: [number, number][] = [];
      const push = (c: number, r: number) => {
        if (c === 0 && r === 0) return;
        if (!candidates.some(([a, b]) => a === c && b === r))
          candidates.push([c, r]);
      };

      // full drag first, then progressively shorter versions of it, then axes
      const maxLen = Math.max(Math.abs(dCol), Math.abs(dRow));
      for (let k = maxLen; k >= 1; k--) {
        const c = Math.max(-k, Math.min(k, dCol));
        const r = Math.max(-k, Math.min(k, dRow));
        if (Math.abs(dCol) >= Math.abs(dRow)) {
          push(c, r);
          push(c, 0);
          push(0, r);
        } else {
          push(c, r);
          push(0, r);
          push(c, 0);
        }
      }
      push(step(dCol), step(dRow));
      push(step(dCol), 0);
      push(0, step(dRow));

      const group = dragStart.current?.group ?? -1;
      for (const [c, r] of candidates) {
        if (tryMove(pos, groupOf, group, c, r)) return { dCol: c, dRow: r };
      }
      return null;
    },
    [pos, groupOf, tryMove],
  );




  const commitMove = useCallback(
    (group: number, dCol: number, dRow: number) => {
      if (solved || (dCol === 0 && dRow === 0)) return;
      const next = tryMove(pos, groupOf, group, dCol, dRow);
      if (!next) return;
      const { groups, merged } = mergePass(next, groupOf);
      setPos(next);
      setGroupOf(groups);
      setMoves((m) => m + 1);
      if (merged) {
        playLock();
        const rep = groupOf.findIndex((g) => g === group);
        const newGroup = groups[rep];
        const flashed = groups
          .map((g, piece) => (g === newGroup ? piece : -1))
          .filter((p) => p >= 0);
        setFlash(flashed);
        window.setTimeout(() => setFlash([]), 380);
      } else {
        playPick();
      }
      if (next.every((cell, piece) => cell === piece)) {
        setSolved(true);
        window.setTimeout(() => playSolved(), 260);
      }
    },
    [pos, groupOf, mergePass, tryMove, solved],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    if (solved) return;
    const cellEl = (e.target as Element).closest("[data-cell]");
    if (!cellEl) return;
    const cell = Number(cellEl.getAttribute("data-cell"));
    const piece = pos.indexOf(cell);
    if (piece < 0) return;
    viewportRef.current?.setPointerCapture(e.pointerId);
    dragStart.current = {
      group: groupOf[piece]!,
      x: e.clientX,
      y: e.clientY,
      moved: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const s = dragStart.current;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (!s.moved && Math.abs(dx) + Math.abs(dy) < 3) return;
    s.moved = true;
    const dCol = Math.round(dx / (cellW * scale));
    const dRow = Math.round(dy / (cellH * scale));
    setDrag({
      group: s.group,
      dx,
      dy,
      valid: !!resolveMove(dCol, dRow),
    });
  };

  const endPointer = (e: React.PointerEvent) => {
    const s = dragStart.current;
    setDrag(null);
    if (!s || !s.moved) {
      dragStart.current = null;
      return;
    }
    const dCol = Math.round((e.clientX - s.x) / (cellW * scale));
    const dRow = Math.round((e.clientY - s.y) / (cellH * scale));
    const move = resolveMove(dCol, dRow);
    dragStart.current = null;
    if (move) commitMove(s.group, move.dCol, move.dRow);
  };


  const groupSizes = useMemo(() => {
    const m = new Map<number, number>();
    groupOf.forEach((g) => m.set(g, (m.get(g) ?? 0) + 1));
    return m;
  }, [groupOf]);

  const clusters = groupSizes.size;

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
          <button
            aria-label="Peek at the puzzle box"
            aria-pressed={showReference}
            onClick={() => setShowReference((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <Search size={16} />
          </button>
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
            transform: `translate(${offX}px, ${offY}px) scale(${scale})`,
            boxShadow: "var(--shadow-soft)",
          }}
        >
          {pos.map((cell, piece) => {
            const row = Math.floor(cell / grid);
            const col = cell % grid;
            const pr = Math.floor(piece / grid);
            const pc = piece % grid;
            const group = groupOf[piece]!;
            const inCluster = (groupSizes.get(group) ?? 1) > 1;
            const isDragged = drag?.group === group;
            const justLocked = flash.includes(piece);
            return (
              <div
                key={piece}
                data-cell={cell}
                style={{
                  position: "absolute",
                  left: col * cellW,
                  top: row * cellH,
                  width: cellW,
                  height: cellH,
                  backgroundImage: `url(${src})`,
                  backgroundSize: `${bg.w}px ${bg.h}px`,
                  backgroundPosition: `${bg.x - pc * cellW}px ${bg.y - pr * cellH}px`,
                  borderRadius: inCluster ? 2 : 6,
                  boxShadow: isDragged
                    ? drag!.valid
                      ? "0 0 0 3px var(--accent), 0 16px 28px rgba(15,45,70,0.45)"
                      : "0 0 0 3px rgba(220,90,90,0.8)"
                    : inCluster
                      ? "none"
                      : "inset 0 0 0 1.5px rgba(255,255,255,0.55)",
                  transform: isDragged
                    ? `translate(${drag!.dx / scale}px, ${drag!.dy / scale}px) scale(1.02)`
                    : justLocked
                      ? "scale(1.02)"
                      : "scale(1)",
                  zIndex: isDragged ? 4 : justLocked ? 2 : 1,
                  cursor: "grab",
                  transition: isDragged
                    ? "none"
                    : "transform 0.26s var(--ease-calm), box-shadow 0.25s ease, border-radius 0.3s ease, left 0.26s var(--ease-calm), top 0.26s var(--ease-calm)",
                }}
              />
            );
          })}
        </div>

        {/* puzzle box peek */}
        {showReference && (
          <button
            onClick={() => setShowReference(false)}
            className="absolute inset-0 z-20 flex items-center justify-center bg-deep/70 p-6 backdrop-blur-sm"
          >
            <div className="glass-panel relative max-h-full max-w-sm overflow-hidden rounded-3xl shadow-lift">
              <img
                src={src}
                alt="Puzzle box reference"
                className="max-h-[70vh] w-auto object-contain"
              />
              <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-5 pb-4 pt-8 text-center text-sm text-white">
                Tap anywhere to hide
              </p>
            </div>
          </button>
        )}
      </div>

      {/* celebration */}
      {solved && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-deep/55 backdrop-blur-md">
          {/* magical star swirl */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              className="animate-star-swirl absolute"
              style={{ width: 420, height: 420 }}
            >
              {Array.from({ length: 24 }).map((_, i) => {
                const angle = (i / 24) * Math.PI * 2;
                const radius = 90 + (i % 5) * 28;
                return (
                  <svg
                    key={`swirl-${i}`}
                    viewBox="0 0 24 24"
                    className="animate-sparkle absolute"
                    style={{
                      left: `calc(50% + ${Math.cos(angle) * radius}px)`,
                      top: `calc(50% + ${Math.sin(angle) * radius}px)`,
                      width: 10 + (i % 4) * 4,
                      height: 10 + (i % 4) * 4,
                      transform: "translate(-50%, -50%)",
                      animationDelay: `${i * 0.18}s`,
                      fill: i % 3 === 0 ? "var(--accent)" : "oklch(0.92 0.04 80)",
                      filter: "drop-shadow(0 0 6px oklch(0.85 0.06 70 / 0.8))",
                    }}
                  >
                    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                  </svg>
                );
              })}
            </div>
          </div>

          {/* floating twinkling stars */}
          {Array.from({ length: 36 }).map((_, i) => (
            <svg
              key={`float-${i}`}
              viewBox="0 0 24 24"
              className="animate-star-float pointer-events-none absolute"
              style={{
                left: `${(i * 37 + Math.sin(i) * 20) % 100}%`,
                top: `${(i * 19 + Math.cos(i) * 15) % 100}%`,
                width: 6 + (i % 5) * 4,
                height: 6 + (i % 5) * 4,
                animationDelay: `${i * 0.14}s`,
                animationDuration: `${4 + (i % 4)}s`,
                fill:
                  i % 4 === 0
                    ? "var(--accent)"
                    : i % 4 === 1
                      ? "oklch(0.95 0.03 85)"
                      : "oklch(0.88 0.05 190)",
                filter: "drop-shadow(0 0 4px oklch(0.9 0.05 80 / 0.7))",
              }}
            >
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
            </svg>
          ))}

          <div className="animate-soft-in glass-panel relative mx-4 w-full max-w-sm rounded-3xl p-7 text-center shadow-lift">
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
