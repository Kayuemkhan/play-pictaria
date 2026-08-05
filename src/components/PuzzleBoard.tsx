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
  const [floating, setFloating] = useState<number[]>([]);
  const [sparkles, setSparkles] = useState<
    { id: number; x: number; y: number; size: number; delay: number; tx: number; ty: number }[]
  >([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [solved, setSolved] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
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
   * Translate the dragged cluster and relocate whatever it displaces into the
   * cells that are freed up. Displaced clusters keep their shape (they are
   * translated rigidly, as close to home as possible), so a locked block never
   * breaks apart — and a big block can always exchange places with the pieces
   * standing in its way, which is what the 3×3 endgame needs.
   */
  const tryMove = useCallback(
    (
      positions: number[],
      groups: number[],
      group: number,
      dCol: number,
      dRow: number,
      protectLocked = false,
    ): number[] | null => {

      const cells = grid * grid;
      const shift = (cell: number) => {
        const r = Math.floor(cell / grid) + dRow;
        const c = (cell % grid) + dCol;
        if (r < 0 || r >= grid || c < 0 || c >= grid) return -1;
        return r * grid + c;
      };

      const moving = new Map<number, number>();
      for (let piece = 0; piece < positions.length; piece++) {
        if (groups[piece] !== group) continue;
        const destination = shift(positions[piece]!);
        if (destination < 0) return null;
        moving.set(piece, destination);
      }
      if (!moving.size) return null;

      const newCells = new Set(moving.values());
      if (newCells.size !== moving.size) return null;

      // group pieces into clusters
      const clusters = new Map<number, number[]>();
      groups.forEach((g, piece) => {
        if (g === group) return;
        const list = clusters.get(g);
        if (list) list.push(piece);
        else clusters.set(g, [piece]);
      });

      const conflicting: number[][] = [];
      const free = new Set<number>();
      for (let c = 0; c < cells; c++) if (!newCells.has(c)) free.add(c);

      for (const cluster of clusters.values()) {
        if (cluster.some((piece) => newCells.has(positions[piece]!))) {
          // a merged cluster already sitting at home is locked — route around it
          const locked =
            cluster.length > 1 &&
            cluster.every((piece) => positions[piece] === piece);
          if (protectLocked && locked) return null;
          conflicting.push(cluster);
        } else {
          for (const piece of cluster) free.delete(positions[piece]!);
        }
      }


      const next = [...positions];
      for (const [piece, cell] of moving) next[piece] = cell;

      /**
       * Displaced clusters should SWAP into the cells the dragged cluster just
       * vacated (rigid translation by the opposite delta). Anything else makes
       * pieces appear to teleport around the board.
       */
      const swapRest: number[][] = [];
      for (const cluster of conflicting) {
        const destinations: number[] = [];
        let fits = true;
        for (const piece of cluster) {
          const cell = positions[piece]!;
          const row = Math.floor(cell / grid) - dRow;
          const col = (cell % grid) - dCol;
          if (row < 0 || row >= grid || col < 0 || col >= grid) {
            fits = false;
            break;
          }
          const destination = row * grid + col;
          if (!free.has(destination)) {
            fits = false;
            break;
          }
          destinations.push(destination);
        }
        if (fits) {
          cluster.forEach((piece, i) => {
            next[piece] = destinations[i]!;
            free.delete(destinations[i]!);
          });
        } else {
          swapRest.push(cluster);
        }
      }
      conflicting.length = 0;
      conflicting.push(...swapRest);



      // biggest shapes are hardest to fit — place them first
      conflicting.sort((a, b) => b.length - a.length);

      const place = (index: number): boolean => {
        if (index >= conflicting.length) return true;
        const cluster = conflicting[index]!;
        const anchor = positions[cluster[0]!]!;
        const anchorRow = Math.floor(anchor / grid);
        const anchorCol = anchor % grid;

        const targets = [...free].sort((a, b) => {
          const da =
            Math.abs(Math.floor(a / grid) - anchorRow) +
            Math.abs((a % grid) - anchorCol);
          const db =
            Math.abs(Math.floor(b / grid) - anchorRow) +
            Math.abs((b % grid) - anchorCol);
          return da - db;
        });

        for (const target of targets) {
          const deltaRow = Math.floor(target / grid) - anchorRow;
          const deltaCol = (target % grid) - anchorCol;
          const destinations: number[] = [];
          let fits = true;
          for (const piece of cluster) {
            const cell = positions[piece]!;
            const row = Math.floor(cell / grid) + deltaRow;
            const col = (cell % grid) + deltaCol;
            if (row < 0 || row >= grid || col < 0 || col >= grid) {
              fits = false;
              break;
            }
            const destination = row * grid + col;
            if (!free.has(destination)) {
              fits = false;
              break;
            }
            destinations.push(destination);
          }
          if (!fits) continue;

          cluster.forEach((piece, i) => {
            next[piece] = destinations[i]!;
            free.delete(destinations[i]!);
          });
          if (place(index + 1)) return true;
          cluster.forEach((piece, i) => {
            next[piece] = positions[piece]!;
            free.add(destinations[i]!);
          });
        }
        return false;
      };

      if (!place(0)) return null;
      if (new Set(next).size !== next.length) return null;
      return next;
    },
    [grid],
  );


  /**
   * Interpret every gesture on one grid axis. The axis is decided by the actual
   * finger travel in pixels — cells are taller than they are wide, so deciding
   * it from rounded cell counts used to turn a drag downwards into a sideways
   * move whenever the thumb drifted half a (narrow) column.
   */
  const resolveMove = useCallback(
    (
      dCol: number,
      dRow: number,
      dx: number,
      dy: number,
    ): { dCol: number; dRow: number } | null => {
      const candidates: [number, number][] = [];
      const push = (c: number, r: number) => {
        if (c === 0 && r === 0) return;
        if (!candidates.some(([a, b]) => a === c && b === r))
          candidates.push([c, r]);
      };

      const horizontal = Math.abs(dx) > Math.abs(dy);
      const primary = horizontal ? dCol : dRow;
      const secondary = horizontal ? dRow : dCol;

      // Try the requested distance, then each shorter distance on that axis.
      for (let distance = Math.abs(primary); distance >= 1; distance--) {
        const signed = Math.sign(primary) * distance;
        push(horizontal ? signed : 0, horizontal ? 0 : signed);
      }

      // If the dominant axis is blocked, honor a clear secondary-axis drag.
      for (let distance = Math.abs(secondary); distance >= 1; distance--) {
        const signed = Math.sign(secondary) * distance;
        push(horizontal ? 0 : signed, horizontal ? signed : 0);
      }

      const group = dragStart.current?.group ?? -1;
      for (const protectLocked of [false]) {
        for (const [c, r] of candidates) {
          if (tryMove(pos, groupOf, group, c, r, protectLocked))
            return { dCol: c, dRow: r };
        }
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
      // pieces that changed cells "float" over to their new home
      const movedPieces = next
        .map((cell, piece) => (cell !== pos[piece] ? piece : -1))
        .filter((p) => p >= 0);
      setFloating(movedPieces);
      window.setTimeout(() => setFloating([]), 520);
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

        // little gold sparkles where pieces just clicked together
        const burst = flashed.map((piece) => {
          const cell = next[piece]!;
          const cRow = Math.floor(cell / grid);
          const cCol = cell % grid;
          const cx = cCol * cellW + cellW / 2;
          const cy = cRow * cellH + cellH / 2;
          return Array.from({ length: 5 }).map((_, i) => {
            const angle = (i / 5) * Math.PI * 2 + Math.random() * 0.4;
            const dist = 18 + Math.random() * 22;
            return {
              id: Date.now() + Math.random(),
              x: cx,
              y: cy,
              size: 3 + Math.random() * 4,
              delay: Math.random() * 0.12,
              tx: Math.cos(angle) * dist,
              ty: Math.sin(angle) * dist,
            };
          });
        }).flat();
        setSparkles((prev) => [...prev, ...burst].slice(-120));
        window.setTimeout(() => {
          setSparkles((prev) => prev.filter((s) => !burst.find((b) => b.id === s.id)));
        }, 800);
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
    // every cluster stays movable — only a finished puzzle stops responding

    viewportRef.current?.setPointerCapture(e.pointerId);
    dragStart.current = {
      group: groupOf[piece]!,
      x: e.clientX,
      y: e.clientY,
      moved: false,
    };
  };

  /**
   * How many cells a finger travel represents. A drag only needs to cover 40%
   * of a cell to count as one step, so a short deliberate nudge downwards is
   * never rounded away to "no move".
   */
  const cellsTravelled = (raw: number, cellSize: number) => {
    const units = raw / (cellSize * scale);
    const steps = Math.sign(units) * Math.floor(Math.abs(units) + 0.6);
    return steps;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const s = dragStart.current;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (!s.moved && Math.abs(dx) + Math.abs(dy) < 3) return;
    s.moved = true;

    /**
     * The piece floats with the fingertip anywhere over the board — it does not
     * ride the grid while dragging. On release it settles into the nearest cell
     * it is allowed to occupy.
     */
    const c = Math.round(dx / (cellW * scale));
    const r = Math.round(dy / (cellH * scale));
    const valid =
      c === 0 && r === 0 ? true : !!tryMove(pos, groupOf, s.group, c, r);

    setDrag({ group: s.group, dx, dy, valid });
  };


  /**
   * Magnetic snap. On release we look at every landing spot within roughly
   * three quarters of a cell of where the finger actually stopped, and prefer
   * one that locks the cluster onto a piece it truly belongs to. That gives the
   * "you don't have to line it up exactly, but it only clicks when it's right"
   * feel: near misses get pulled in, wrong matches never lock.
   */
  const snapMove = useCallback(
    (dx: number, dy: number, group: number) => {
      const unitsX = dx / (cellW * scale);
      const unitsY = dy / (cellH * scale);
      const TOL = 0.62;
      const range = (u: number) => {
        const out: number[] = [];
        for (let v = Math.floor(u - TOL); v <= Math.ceil(u + TOL); v++) {
          if (Math.abs(v - u) <= TOL) out.push(v);
        }
        return out.sort((a, b) => Math.abs(a - u) - Math.abs(b - u));
      };

      let best: { dCol: number; dRow: number; dist: number } | null = null;
      // first choice: a landing spot that clicks the cluster onto its neighbours
      for (const protectLocked of [false]) {
        for (const c of range(unitsX)) {
          for (const r of range(unitsY)) {
            if (c === 0 && r === 0) continue;
            const next = tryMove(pos, groupOf, group, c, r, protectLocked);
            if (!next) continue;
            if (!mergePass(next, groupOf).merged) continue;
            const dist = Math.abs(c - unitsX) + Math.abs(r - unitsY);
            if (!best || dist < best.dist) best = { dCol: c, dRow: r, dist };
          }
        }
        if (best) break;
      }
      if (best) return best;

      // otherwise the piece simply settles wherever the finger left it
      for (const protectLocked of [false]) {
        for (const c of range(unitsX)) {
          for (const r of range(unitsY)) {
            if (c === 0 && r === 0) continue;
            if (!tryMove(pos, groupOf, group, c, r, protectLocked)) continue;
            const dist = Math.abs(c - unitsX) + Math.abs(r - unitsY);
            if (!best || dist < best.dist) best = { dCol: c, dRow: r, dist };
          }
        }
        if (best) break;
      }

      return best;
    },
    [pos, groupOf, tryMove, mergePass, cellW, cellH, scale],
  );

  const endPointer = (e: React.PointerEvent) => {
    const s = dragStart.current;
    setDrag(null);
    if (!s || !s.moved) {
      dragStart.current = null;
      return;
    }
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    const snap = snapMove(dx, dy, s.group);
    const move =
      snap ??
      resolveMove(
        cellsTravelled(dx, cellW),
        cellsTravelled(dy, cellH),
        dx,
        dy,
      );
    dragStart.current = null;
    if (move) {
      commitMove(s.group, move.dCol, move.dRow);
      return;
    }

    /**
     * A full board has no empty cell. Once one rigid cluster owns every cell
     * except the final one or two pieces, moving either remainder can require
     * displacing that almost-complete cluster into a shape that cannot fit.
     * Preserve all earlier locks, but treat a deliberate blocked endgame drag
     * as the final magnetic snap so a valid run can never deadlock at 7+2.
     */
    const sizes = new Map<number, number>();
    groupOf.forEach((group) => sizes.set(group, (sizes.get(group) ?? 0) + 1));
    const largest = Math.max(0, ...sizes.values());
    const draggedPieces = groupOf
      .map((group, piece) => (group === s.group ? piece : -1))
      .filter((piece) => piece >= 0);
    const draggedSize = draggedPieces.length;
    const deliberateDrag =
      Math.abs(dx) >= cellW * scale * 0.4 ||
      Math.abs(dy) >= cellH * scale * 0.4;
    const largestGroup = [...sizes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    const solvedMass =
      largestGroup !== undefined &&
      groupOf.every(
        (group, piece) => group !== largestGroup || pos[piece] === piece,
      );
    const pointsTowardHome = draggedPieces.some((piece) => {
      const cell = pos[piece];
      if (cell === undefined || cell === piece) return false;
      const homeRow = Math.floor(piece / grid);
      const homeCol = piece % grid;
      const row = Math.floor(cell / grid);
      const col = cell % grid;
      const horizontal = Math.abs(dx) > Math.abs(dy);
      return horizontal
        ? Math.sign(dx) === Math.sign(homeCol - col)
        : Math.sign(dy) === Math.sign(homeRow - row);
    });
    if (
      deliberateDrag &&
      pointsTowardHome &&
      solvedMass &&
      draggedSize <= 2 &&
      sizes.size <= 3 &&
      largest >= total - 2
    ) {
      const solvedPositions = Array.from({ length: total }, (_, piece) => piece);
      const solvedGroup = s.group;
      setPos(solvedPositions);
      setGroupOf(Array.from({ length: total }, () => solvedGroup));
      setMoves((count) => count + 1);
      setFlash(solvedPositions);
      playLock();
      setSolved(true);
      window.setTimeout(() => playSolved(), 260);
      window.setTimeout(() => setFlash([]), 380);
    }
  };




  const groupSizes = useMemo(() => {
    const m = new Map<number, number>();
    groupOf.forEach((g) => m.set(g, (m.get(g) ?? 0) + 1));
    return m;
  }, [groupOf]);

  /**
   * A piece is locked for good once it belongs to a merged cluster that is
   * sitting exactly where it belongs in the picture. Locked pieces can't be
   * picked up again, and other clusters are routed around them.
   */
  const lockedPieces = useMemo(() => {
    const locked = new Set<number>();
    if (!pos.length) return locked;
    const members = new Map<number, number[]>();
    groupOf.forEach((g, piece) => {
      const list = members.get(g);
      if (list) list.push(piece);
      else members.set(g, [piece]);
    });
    for (const list of members.values()) {
      if (list.length < 2) continue;
      if (list.every((piece) => pos[piece] === piece))
        list.forEach((piece) => locked.add(piece));
    }
    return locked;
  }, [pos, groupOf]);

  const clusters = groupSizes.size;


  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-mist-gradient">
      {/* top bar */}
      <header className="glass-panel z-20 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5 sm:px-5">
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
            aria-label="Flash puzzle box reference"
            onClick={() => {
              if (showReference) return;
              setShowReference(true);
              window.setTimeout(() => setShowReference(false), 900);
            }}
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
            const isFloating = floating.includes(piece);

            return (
              <div
                key={piece}
                data-cell={cell}
                className={justLocked ? "animate-snap-pop" : undefined}
                style={{
                  position: "absolute",
                  left: col * cellW,
                  top: row * cellH,
                  width: cellW,
                  height: cellH,
                  backgroundImage: `url(${src})`,
                  backgroundSize: `${bg.w}px ${bg.h}px`,
                  backgroundPosition: `${bg.x - pc * cellW}px ${bg.y - pr * cellH}px`,
                  borderRadius: inCluster ? 6 : 16,
                  boxShadow: isDragged
                    ? drag!.valid
                      ? "0 0 0 3px var(--accent), 0 18px 32px rgba(15,45,70,0.5)"
                      : "0 0 0 3px rgba(220,90,90,0.8)"
                    : justLocked
                      ? "0 0 0 2px var(--accent)"
                      : isFloating
                        ? "0 14px 26px rgba(15,45,70,0.38), inset 0 0 0 1px rgba(255,255,255,0.55)"
                        : inCluster
                          ? "none"
                          : "inset 0 0 0 1px rgba(255,255,255,0.65)",
                  transform: isDragged
                    ? `translate(${drag!.dx / scale}px, ${drag!.dy / scale}px) scale(1.03)`
                    : isFloating
                      ? "scale(1.045)"
                      : "scale(1)",
                  zIndex: isDragged ? 4 : isFloating ? 3 : justLocked ? 2 : 1,
                  cursor: "grab",
                  transition: isDragged
                    ? "none"
                    : "transform 0.5s cubic-bezier(0.32, 1.5, 0.4, 1), box-shadow 0.45s ease, border-radius 0.3s ease, left 0.52s cubic-bezier(0.28, 1.35, 0.36, 1), top 0.52s cubic-bezier(0.28, 1.35, 0.36, 1)",
                }}
              />
            );

          })}

          {/* gold sparkles on snap */}
          {sparkles.map((s) => (
            <span
              key={s.id}
              className="pointer-events-none absolute animate-sparkle-burst rounded-full bg-accent shadow-[0_0_6px_var(--accent)]"
              style={{
                left: s.x,
                top: s.y,
                width: s.size,
                height: s.size,
                marginLeft: -s.size / 2,
                marginTop: -s.size / 2,
                animationDelay: `${s.delay}s`,
                ["--tw-translate-x" as string]: `${s.tx}px`,
                ["--tw-translate-y" as string]: `${s.ty}px`,
              }}
            />
          ))}
        </div>

        {/* puzzle box flash */}
        {showReference && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-deep/70 p-6 backdrop-blur-sm animate-fade-in">
            <div className="glass-panel relative max-h-full max-w-sm overflow-hidden rounded-3xl shadow-lift animate-scale-in">
              <img
                src={src}
                alt="Puzzle box reference"
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
          </div>
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
