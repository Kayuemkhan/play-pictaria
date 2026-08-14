import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Music, Sparkle, Sparkles, VolumeX } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { collections, difficulties } from "@/data/collections";
import palmLogo from "@/assets/logo-palms-only.png";
import tropicalIslandBg from "@/assets/pinup-08.jpg";
import { playLock, playPick, playSolved, setMuted } from "@/lib/feedback";
import { cn } from "@/lib/utils";
import {
  TRACK_OPTIONS,
  playMindfulTrack,
  stopMindfulTrack,
  trackName,
  useMindfulPlayer,
} from "@/components/MindfulMusic";

type SoundscapeId = (typeof TRACK_OPTIONS)[number]["id"];



const WORLD_W = 1000;

/** [protectLocked, allowRelocate] — tried in order, gentlest first */
const MOVE_MODES: [boolean, boolean][] = [
  [true, false],
  [false, false],
  [true, true],
  [false, true],
];


export interface PuzzleBoardProps {
  src: string;
  title: string;
  grid: number;
  onExit: () => void;
  onChangeDifficulty?: () => void;
  /** Change grid from inside the puzzle without leaving the screen. */
  onChangeGrid?: (grid: number) => void;
  /** Move on to the next photograph in this gallery, at the same grid. */
  onNext?: () => void;
  /** Move to the next photograph in this same collection. */
  onNextInSeries?: () => void;
  /** Title of the next photograph, for the button label. */
  nextTitle?: string;
  /** Brand Studio Pictarias carry no Pictaria logo — only a tiny credit link. */
  unbranded?: boolean;
  /** Story about this picture, shown under the board. */
  info?: ReactNode;
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
  onChangeGrid,
  onNext,
  onNextInSeries,
  nextTitle,
  unbranded = false,
  info,
}: PuzzleBoardProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  /** always offer a way onward — a random picture from the whole Pictaria universe */
  const goSurprise = useCallback(() => {
    if (onNext) return onNext();
    const pool = collections.flatMap((c) => c.puzzles);
    if (!pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)]!;
    void navigate({
      to: "/puzzle/$puzzleId",
      params: { puzzleId: pick.id },
      search: { grid },
    });
  }, [onNext, navigate, grid]);

  const [aspect, setAspect] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [size, setSize] = useState({ w: 0, h: 0 });
  /** pos[piece] = cell */
  const [pos, setPos] = useState<number[]>([]);
  /** groupOf[piece] = group id */
  const [groupOf, setGroupOf] = useState<number[]>([]);
  const [floating, setFloating] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [solved, setSolved] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const { playing: musicPlaying, selected: musicSelected } = useMindfulPlayer();
  const musicOn = musicPlaying !== null;
  const musicTitle = trackName(musicPlaying ?? musicSelected);

  const [drag, setDrag] = useState<{
    group: number;
    dx: number;
    dy: number;
  } | null>(null);

  const total = grid * grid;
  const worldH = (WORLD_W * 4) / 3;
  const cellW = WORLD_W / grid;
  const cellH = worldH / grid;

  const scale = useMemo(() => {
    if (!size.w || !size.h) return 0;
    // a generous margin so tiles never touch the walls
    const inset = Math.max(6, Math.min(size.w, size.h) * 0.018);
    const w = Math.max(1, size.w - inset * 2);
    const h = Math.max(1, size.h - inset * 2);
    return Math.min(w / WORLD_W, h / worldH);
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
    setDrag(null);
  }, [aspect, total, round, mergePass]);

  /* timer */
  useEffect(() => {
    if (solved || !pos.length) return;
    const t = window.setInterval(() => setSeconds((v) => v + 1), 1000);
    return () => window.clearInterval(t);
  }, [solved, pos.length]);

  /* celebration: the congratulations drifts in and back out, then the finished
     picture is left alone to be admired — with a quiet "Next →" beside it. Only
     the last puzzle in a gallery falls through to the summary card. */
  const nextRef = useRef(onNext);
  nextRef.current = onNext;
  const hasNext = Boolean(onNext);
  const [congratsOut, setCongratsOut] = useState(false);
  const [linger, setLinger] = useState(false);
  useEffect(() => {
    if (!solved) {
      setShowSummary(false);
      setCongratsOut(false);
      setLinger(false);
      return;
    }
    const fade = window.setTimeout(() => setCongratsOut(true), 2800);
    const gone = window.setTimeout(() => setLinger(true), 4100);
    if (hasNext) {
      return () => {
        window.clearTimeout(fade);
        window.clearTimeout(gone);
      };
    }
    const t = window.setTimeout(() => setShowSummary(true), 6800);
    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(gone);
      window.clearTimeout(t);
    };
  }, [solved, hasNext]);
  void nextRef;






  const dragStart = useRef<{
    group: number;
    x: number;
    y: number;
    moved: boolean;
    pointerType: string;
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
      allowRelocate = true,
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
          // any piece already sitting at home is locked — route around it
          const locked = cluster.every((piece) => positions[piece] === piece);
          // a cluster sitting exactly at home is locked — never disturb it
          if (locked) return null;
          void protectLocked;

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
      /**
       * Anything left in swapRest can only be housed by relocating it somewhere
       * else on the board, which is exactly what makes tiles look like they
       * "won't stay put". Strict passes refuse those moves outright, and even a
       * permissive pass never scatters an assembled cluster.
       */
      if (!allowRelocate && swapRest.length) return null;
      if (protectLocked && swapRest.some((cluster) => cluster.length > 1))
        return null;

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
   * Least-disruptive first: keep assembled clusters intact and only allow rigid
   * swaps before falling back to relocating loose tiles.
   */
  const attemptMove = useCallback(
    (group: number, dCol: number, dRow: number) => {
      for (const [protectLocked, allowRelocate] of MOVE_MODES) {
        const next = tryMove(
          pos,
          groupOf,
          group,
          dCol,
          dRow,
          protectLocked,
          allowRelocate,
        );
        if (next) return next;
      }
      return null;
    },
    [pos, groupOf, tryMove],
  );






  const commitMove = useCallback(
    (group: number, dCol: number, dRow: number) => {
      if (solved || (dCol === 0 && dRow === 0)) return;
      const next = attemptMove(group, dCol, dRow);

      if (!next) return;
      const { groups, merged } = mergePass(next, groupOf);
      // pieces that changed cells "float" over to their new home
      const movedPieces = next
        .map((cell, piece) => (cell !== pos[piece] ? piece : -1))
        .filter((p) => p >= 0);
      // a piece that just settled into its own home cell locks for good
      const newlyHome = next
        .map((cell, piece) =>
          cell === piece && pos[piece] !== piece ? piece : -1,
        )
        .filter((p) => p >= 0);
      setFloating(movedPieces);
      window.setTimeout(() => setFloating([]), 880);
      setPos(next);
      setGroupOf(groups);
      setMoves((m) => m + 1);
      if (merged || newlyHome.length) {
        playLock();
      } else {
        playPick();
      }
      if (next.every((cell, piece) => cell === piece)) {
        setSolved(true);
        window.setTimeout(() => playSolved(), 260);
      }
    },
    [pos, groupOf, mergePass, attemptMove, solved],
  );

  /**
   * Auto complete — the puzzle finishes itself, one tile at a time, exactly the
   * way a person would: each tile slides across the grid and trades places with
   * whatever is sitting in its home cell, locking as it lands.
   */
  const [autoRunning, setAutoRunning] = useState(false);
  const autoRef = useRef(false);
  useEffect(() => {
    autoRef.current = false;
    setAutoRunning(false);
  }, [round, grid, src]);
  useEffect(() => () => { autoRef.current = false; }, []);

  const autoSolve = useCallback(() => {
    if (autoRef.current || solved || !pos.length) return;
    autoRef.current = true;
    setAutoRunning(true);
    setDrag(null);
    dragStart.current = null;

    let current = [...pos];
    const identity = () => Array.from({ length: total }, (_, i) => i);

    /**
     * Human-ish solve order: start a clump somewhere, grow it outward through
     * neighbours (with a little wandering), then abandon it and start a fresh
     * clump elsewhere — instead of marching 1,2,3,4 top to bottom.
     */
    const buildOrder = () => {
      const remaining = new Set<number>();
      for (let i = 0; i < total; i++) if (current[i] !== i) remaining.add(i);
      const order: number[] = [];
      const neighbours = (p: number) => {
        const r = Math.floor(p / grid);
        const c = p % grid;
        const out: number[] = [];
        if (r > 0) out.push(p - grid);
        if (r < grid - 1) out.push(p + grid);
        if (c > 0) out.push(p - 1);
        if (c < grid - 1) out.push(p + 1);
        return out;
      };
      const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]!;

      while (remaining.size) {
        // seed a new clump somewhere random
        let frontier = [pick([...remaining])];
        // clumps run 2–5 pieces before attention wanders elsewhere
        let budget = 2 + Math.floor(Math.random() * 4);
        while (frontier.length && budget > 0 && remaining.size) {
          const idx = Math.floor(Math.random() * frontier.length);
          const p = frontier.splice(idx, 1)[0]!;
          if (!remaining.has(p)) continue;
          remaining.delete(p);
          order.push(p);
          budget--;
          for (const n of neighbours(p)) {
            if (remaining.has(n) && !frontier.includes(n)) frontier.push(n);
          }
        }
      }
      return order;
    };

    let queue = buildOrder();
    let qi = 0;

    const finish = () => {
      autoRef.current = false;
      setAutoRunning(false);
      setSolved(true);
      window.setTimeout(() => playSolved(), 260);
    };

    const step = () => {
      if (!autoRef.current) return;
      while (qi < queue.length && current[queue[qi]!] === queue[qi]) qi++;
      if (qi >= queue.length) {
        // anything left over (shouldn't normally happen) gets a fresh pass
        if (current.some((cell, p) => cell !== p)) {
          queue = buildOrder();
          qi = 0;
          if (!queue.length) return finish();
        } else return finish();
      }

      const piece = queue[qi]!;
      const other = current.indexOf(piece);
      const from = current[piece]!;
      const next = [...current];
      next[piece] = piece;
      if (other >= 0) next[other] = from;
      current = next;

      setFloating(other >= 0 ? [piece, other] : [piece]);
      setPos(next);
      setGroupOf(mergePass(next, identity()).groups);
      setMoves((m) => m + 1);
      playLock();

      if (next.every((cell, p) => cell === p)) {
        window.setTimeout(() => setFloating([]), 880);
        window.setTimeout(finish, 520);
        return;
      }
      // uneven, human rhythm: quick within a clump, a beat before a new one
      const newClump = qi + 1 < queue.length && (() => {
        const nxt = queue[qi + 1]!;
        const r1 = Math.floor(piece / grid), c1 = piece % grid;
        const r2 = Math.floor(nxt / grid), c2 = nxt % grid;
        return Math.abs(r1 - r2) + Math.abs(c1 - c2) > 1;
      })();
      window.setTimeout(step, (newClump ? 780 : 480) + Math.random() * 220);
    };

    window.setTimeout(step, 220);
  }, [pos, solved, total, grid, mergePass]);


  const onPointerDown = (e: React.PointerEvent) => {
    if (solved || autoRunning) return;

    const cellEl = (e.target as Element).closest("[data-cell]");
    if (!cellEl) return;
    const cell = Number(cellEl.getAttribute("data-cell"));
    const piece = pos.indexOf(cell);
    if (piece < 0) return;
    const group = groupOf[piece];
    if (group === undefined) return;
    const groupIsHome = groupOf.every(
      (pieceGroup, member) => pieceGroup !== group || pos[member] === member,
    );
    if (groupIsHome) return; // only a whole cluster anchored in its final place stays put

    viewportRef.current?.setPointerCapture(e.pointerId);
    dragStart.current = {
      group,
      x: e.clientX,
      y: e.clientY,
      moved: false,
      pointerType: e.pointerType,
    };
  };

  /** Keep the whole dragged cluster visibly inside the play area, even when a
   * finger travels beyond the clipped stage during a fast swipe. */
  const clampDrag = useCallback(
    (group: number, dx: number, dy: number) => {
      const cells = pos.filter((_, piece) => groupOf[piece] === group);
      if (!cells.length || !scale) return { dx, dy };

      const cols = cells.map((cell) => cell % grid);
      const rows = cells.map((cell) => Math.floor(cell / grid));
      const minCol = Math.min(...cols);
      const maxCol = Math.max(...cols);
      const minRow = Math.min(...rows);
      const maxRow = Math.max(...rows);
      const gutter = 24;
      const minDx = gutter - (offX + minCol * cellW * scale);
      const maxDx =
        size.w - gutter - (offX + (maxCol + 1) * cellW * scale);
      const minDy = gutter - (offY + minRow * cellH * scale);
      const maxDy =
        size.h - gutter - (offY + (maxRow + 1) * cellH * scale);

      return {
        dx: Math.max(minDx, Math.min(maxDx, dx)),
        dy: Math.max(minDy, Math.min(maxDy, dy)),
      };
    },
    [pos, groupOf, scale, grid, offX, offY, cellW, cellH, size.w, size.h],
  );




  const onPointerMove = (e: React.PointerEvent) => {
    const s = dragStart.current;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (!s.moved && Math.abs(dx) + Math.abs(dy) < 3) return;
    s.moved = true;

    /**
     * The piece floats freely with the fingertip anywhere over the board. We
     * deliberately do NOT preview grid snapping or validity while the finger is
     * down — that makes the tile feel like it is deciding where to go. The
     * landing decision is made only on release.
     */
    const bounded = clampDrag(s.group, dx, dy);
    setDrag({ group: s.group, ...bounded });
  };


  /**
   * Where the cluster lands on release.
   *
   * The tile goes exactly where the finger left it — both axes at once. The
   * previous version collapsed every gesture onto a single axis, so a natural
   * diagonal drag (the normal way you carry a tile to its neighbour) landed one
   * cell sideways instead and nothing ever clicked together.
   *
   * Order of preference, all measured from the real finger position:
   *   1. a landing spot that locks the cluster onto a picture neighbour
   *   2. a landing spot that puts a piece in its own home cell
   *   3. the nearest legal landing spot (it simply settles there)
   */
  const snapMove = useCallback(
    (dx: number, dy: number, group: number, pointerType: string) => {
      const unitsX = dx / (cellW * scale);
      const unitsY = dy / (cellH * scale);
      const touchPointer = pointerType === "touch" || pointerType === "pen";
      /**
       * Two forgiveness radii. The magnet radius is generous: if a drop is
       * anywhere near a spot where the cluster would click onto its picture
       * neighbour (or land home) it is pulled there. The settle radius stays
       * tight so a tile never slides off to a far cell or hugs the board edge.
       */
      const magnetPx = touchPointer ? 52 : 34;
      const settlePx = touchPointer ? 24 : 14;
      const tol = (px: number) => ({
        x: Math.min(0.72, px / (cellW * scale)),
        y: Math.min(0.72, px / (cellH * scale)),
      });
      const magnet = tol(magnetPx);
      const settle = tol(settlePx);

      const isNear = (
        dCol: number,
        dRow: number,
        t: { x: number; y: number } = magnet,
      ) =>
        Math.abs(dCol - unitsX) <= t.x && Math.abs(dRow - unitsY) <= t.y;

      const axis = (u: number) => {
        const out = new Set<number>([
          Math.round(u),
          Math.floor(u),
          Math.ceil(u),
        ]);
        return [...out];
      };

      const candidates: { dCol: number; dRow: number; dist: number }[] = [];
      const seen = new Set<string>();
      const addCandidate = (dCol: number, dRow: number) => {
        if (dCol === 0 && dRow === 0) return;
        const key = `${dCol},${dRow}`;
        if (seen.has(key)) return;
        seen.add(key);
        candidates.push({
          dCol,
          dRow,
          dist: Math.hypot(dCol - unitsX, dRow - unitsY),
        });
      };

      for (const c of axis(unitsX)) for (const r of axis(unitsY)) addCandidate(c, r);


      const draggedPieces = groupOf
        .map((pieceGroup, piece) => (pieceGroup === group ? piece : -1))
        .filter((piece) => piece >= 0);
      const draggedSize = draggedPieces.length;
      const representative = draggedPieces[0];

      /**
       * Magnetic pull: exact lock offsets derived from the picture itself, so a
       * near miss is drawn onto the neighbour it belongs to.
       */
      for (const piece of draggedPieces) {
        const pieceCell = pos[piece];
        if (pieceCell === undefined) continue;
        const pieceHomeRow = Math.floor(piece / grid);
        const pieceHomeCol = piece % grid;
        const pieceRow = Math.floor(pieceCell / grid);
        const pieceCol = pieceCell % grid;

        // home cell of this very piece is always worth aiming at
        addCandidateIfNear(
          Math.floor(piece / grid) - pieceRow,
          (piece % grid) - pieceCol,
        );

        for (let neighbour = 0; neighbour < total; neighbour++) {
          if (groupOf[neighbour] === group) continue;
          const homeRowDelta = Math.floor(neighbour / grid) - pieceHomeRow;
          const homeColDelta = (neighbour % grid) - pieceHomeCol;
          if (Math.abs(homeRowDelta) + Math.abs(homeColDelta) !== 1) continue;

          const neighbourCell = pos[neighbour];
          if (neighbourCell === undefined) continue;
          const desiredRow = Math.floor(neighbourCell / grid) - homeRowDelta;
          const desiredCol = (neighbourCell % grid) - homeColDelta;
          if (
            desiredRow < 0 ||
            desiredRow >= grid ||
            desiredCol < 0 ||
            desiredCol >= grid
          )
            continue;

          addCandidateIfNear(desiredRow - pieceRow, desiredCol - pieceCol);
        }
      }

      function addCandidateIfNear(dRow: number, dCol: number) {
        // Keep forgiveness consistent in screen pixels. Checking each axis
        // separately prevents ordinary sideways finger drift from cancelling an
        // otherwise accurate drop on a phone.
        if (!isNear(dCol, dRow)) return;
        addCandidate(dCol, dRow);
      }

      candidates.sort((a, b) => a.dist - b.dist);

      const merges = (next: number[]) => {
        if (representative === undefined) return false;
        const groups = mergePass(next, groupOf).groups;
        const mergedGroup = groups[representative];
        return (
          groups.filter((pieceGroup) => pieceGroup === mergedGroup).length >
          draggedSize
        );
      };
      const landsHome = (next: number[]) =>
        next.some((cell, piece) => cell === piece && pos[piece] !== piece);

      // 1 + 2: nearest landing that actually clicks something into place —
      // generous magnet radius, so a near miss still locks
      for (const candidate of candidates) {
        if (!isNear(candidate.dCol, candidate.dRow, magnet)) continue;
        const next = attemptMove(group, candidate.dCol, candidate.dRow);
        if (!next) continue;
        if (merges(next) || landsHome(next)) return candidate;
      }

      // 3: settle on the cell under the finger, but only if the drop really is
      // there — otherwise the cluster stays where it was instead of drifting to
      // a far cell or sticking to the edge of the board.
      for (const candidate of candidates) {
        if (!isNear(candidate.dCol, candidate.dRow, settle)) continue;
        if (attemptMove(group, candidate.dCol, candidate.dRow)) return candidate;
      }


      return null;
    },
    [pos, groupOf, attemptMove, mergePass, cellW, cellH, scale, grid, total],
  );

  const endPointer = (e: React.PointerEvent) => {
    const s = dragStart.current;
    setDrag(null);
    if (!s || !s.moved) {
      dragStart.current = null;
      return;
    }
    const bounded = clampDrag(s.group, e.clientX - s.x, e.clientY - s.y);
    const { dx, dy } = bounded;
    const move = snapMove(dx, dy, s.group, s.pointerType);

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
      Math.abs(dx) >= cellW * scale * 0.85 ||
      Math.abs(dy) >= cellH * scale * 0.85;
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
      playLock();
      setSolved(true);
      window.setTimeout(() => playSolved(), 260);
    }
  };




  const groupSizes = useMemo(() => {
    const m = new Map<number, number>();
    groupOf.forEach((g) => m.set(g, (m.get(g) ?? 0) + 1));
    return m;
  }, [groupOf]);

  /**
   * A piece locks for good the moment it sits in its own home cell — alone or
   * as part of a cluster. Locked pieces can't be picked up again, and other
   * clusters are routed around them.
   */
  const lockedPieces = useMemo(() => {
    const locked = new Set<number>();
    if (!pos.length) return locked;
    pos.forEach((cell, piece) => {
      if (cell === piece) locked.add(piece);
    });
    const members = new Map<number, number[]>();
    groupOf.forEach((g, piece) => {
      const list = members.get(g);
      if (list) list.push(piece);
      else members.set(g, [piece]);
    });
    for (const list of members.values()) {
      if (list.every((piece) => pos[piece] === piece))
        list.forEach((piece) => locked.add(piece));
    }
    return locked;
  }, [pos, groupOf]);


  const clusters = groupSizes.size;


  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col bg-mist-gradient">
      {/* Pictaria branding, centered over every branded puzzle */}
      <div className="relative z-20 flex shrink-0 items-center justify-center pt-1 pb-0.5">
        <button
          type="button"
          onClick={onExit}
          aria-label="Back"
          className="absolute left-3 grid h-9 w-9 place-items-center text-accent/80 transition-transform hover:scale-105 active:scale-95 sm:left-5"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
        </button>

        {!unbranded && (
          <Link
            to="/"
            aria-label="Pictaria — turn pictures into play"
            className="group flex flex-col items-center"
          >
            <img
              src={palmLogo}
              alt="Pictaria"
              width={1024}
              height={1024}
              className="h-8 w-auto transition-transform duration-500 ease-[var(--ease-calm)] group-hover:scale-[1.05] sm:h-10"
            />
            <span className="mt-1 font-display text-xl leading-none tracking-[0.34em] text-primary uppercase sm:text-2xl">
              Pictaria
            </span>
            <span className="-mt-0.5 font-display text-[0.5rem] tracking-[0.42em] text-muted-foreground uppercase sm:text-[0.6rem]">
              Turn pictures into play
            </span>
          </Link>
        )}
      </div>


      {/* top bar */}
      <header className="glass-panel z-20 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-2 sm:px-5">
        <div className="flex items-center gap-2">
          {onChangeGrid ? (
            <Select
              value={String(grid)}
              onValueChange={(v) => onChangeGrid(Number(v))}
            >
              <SelectTrigger
                aria-label="Change difficulty"
                className="h-auto w-fit min-w-0 border-0 bg-transparent p-0 text-[11px] tracking-[0.18em] text-muted-foreground uppercase shadow-none hover:text-primary focus:ring-0 [&>svg]:ml-1 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground [&>span]:pr-1"
              >
                <SelectValue>
                  {grid}×{grid}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="min-w-[8rem]" align="start">
                {difficulties.map((d) => (
                  <SelectItem key={d.grid} value={String(d.grid)}>
                    <span className="font-display text-base">
                      {d.grid}×{d.grid}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {d.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
              {grid}×{grid}
            </p>
          )}
        </div>

        <div className="min-w-0 text-center">
          <p className="truncate font-display text-sm leading-tight sm:text-xl">
            {title}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs tabular-nums sm:gap-3 sm:text-sm">
          <Select
            value={musicOn ? (musicPlaying as string) : "off"}
            onValueChange={(v) => {
              if (v === "off") {
                stopMindfulTrack();
                setMuted(true);
                return;
              }
              setMuted(false);
              void playMindfulTrack(v as SoundscapeId);
            }}
          >
            <SelectTrigger
              aria-label="Choose a soundscape"
              title={
                musicTitle
                  ? `${musicTitle} — ${musicOn ? "on" : "off"}`
                  : "Mindful sound"
              }
              className="h-8 w-fit min-w-0 border-0 bg-transparent p-0 text-[10px] tracking-[0.14em] uppercase text-muted-foreground shadow-none hover:text-primary focus:ring-0 [&>svg]:h-4 [&>svg]:w-4"
            >
              {musicOn ? <Music size={16} /> : <VolumeX size={16} />}
            </SelectTrigger>
            <SelectContent align="end" className="min-w-[12rem]">
              <SelectItem value="off">
                <span className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    <VolumeX size={13} />
                  </span>
                  Sound off
                </span>
              </SelectItem>
              {TRACK_OPTIONS.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  <span className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/12 text-primary">
                      <Music size={13} />
                    </span>
                    {t.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="hidden rounded-full bg-secondary px-2 py-1 text-secondary-foreground sm:inline sm:text-sm">
            {moves} moves
          </span>
        </div>
      </header>

      {/* stage */}
      <div className="relative mx-auto aspect-[3/4] max-h-[88vh] w-full shrink-0 p-1 sm:p-2">
        {solved && congratsOut && (
          <button
            type="button"
            onClick={goSurprise}
            className="absolute top-7 left-1/2 z-40 -translate-x-1/2 rounded-full border border-primary/70 bg-card/85 px-3 py-1 text-[0.6rem] tracking-[0.16em] text-primary uppercase shadow-soft backdrop-blur-sm transition-colors hover:bg-card sm:top-10"
          >
            Surprise me
          </button>
        )}

        {onNextInSeries && solved && congratsOut && (
          <button
            type="button"
            onClick={onNextInSeries}
            className="absolute bottom-7 left-1/2 z-40 -translate-x-1/2 rounded-full border border-primary/70 bg-card/85 px-3 py-1 text-[0.6rem] tracking-[0.16em] text-primary uppercase shadow-soft backdrop-blur-sm transition-colors hover:bg-card sm:bottom-10"
          >
            Next
          </button>
        )}







        <div
          ref={viewportRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          className={cn(
            "relative h-full w-full touch-none overflow-hidden select-none",
            showReference ? "rounded-none" : "rounded-[12px]",
          )}
        >
          <div
            className={cn(
              "absolute top-0 left-0 origin-top-left",
              showReference ? "rounded-none" : "rounded-[18px]",
            )}
            style={{
              width: WORLD_W,
              height: worldH,
              transform: `translate(${offX}px, ${offY}px) scale(${scale})`,
            }}
          >
          {pos.map((cell, piece) => {
            const row = Math.floor(cell / grid);
            const col = cell % grid;
            const pr = Math.floor(piece / grid);
            const pc = piece % grid;
            const group = groupOf[piece]!;
            const inCluster = (groupSizes.get(group) ?? 1) > 1;
            const isLocked = lockedPieces.has(piece);
            const isDragged = drag?.group === group;
            const isFloating = floating.includes(piece);

            const joinedAt = (checkRow: number, checkCol: number) => {
              if (
                checkRow < 0 ||
                checkRow >= grid ||
                checkCol < 0 ||
                checkCol >= grid
              )
                return false;
              const neighbour = pos.indexOf(checkRow * grid + checkCol);
              return neighbour >= 0 && groupOf[neighbour] === group;
            };
            const joinedTop = joinedAt(row - 1, col);
            const joinedRight = joinedAt(row, col + 1);
            const joinedBottom = joinedAt(row + 1, col);
            const joinedLeft = joinedAt(row, col - 1);

            const seam = isLocked ? 2 : 0;
            return (
              <div
                key={piece}
                data-cell={cell}
                style={{
                  position: "absolute",
                  left: col * cellW - seam,
                  top: row * cellH - seam,
                  width: cellW + seam * 2,
                  height: cellH + seam * 2,
                  backgroundImage: `url(${src})`,
                  backgroundSize: `${bg.w}px ${bg.h}px`,
                  backgroundPosition: `${bg.x - pc * cellW + seam}px ${bg.y - pr * cellH + seam}px`,
                  backgroundRepeat: isLocked ? "no-repeat" : "repeat",
                  borderRadius:
                    isFloating && !inCluster ? 28 : isLocked || inCluster ? 0 : 28,
                  boxShadow: isDragged
                    ? "var(--shadow-piece)"
                    : isFloating
                      ? inCluster
                        ? "var(--shadow-piece)"
                        : "var(--shadow-piece)"
                      : isLocked || inCluster
                        ? "none"
                        : "none",

                  transform: isDragged
                    ? `translate(${drag!.dx / scale}px, ${drag!.dy / scale}px) scale(1.006)`
                    : "scale(1)",
                  zIndex: isDragged ? 4 : isFloating ? 3 : 1,
                  cursor: "grab",
                  transition: isDragged
                    ? "none"
                    : isFloating
                      ? "transform 880ms var(--ease-organic), left 880ms var(--ease-organic), top 880ms var(--ease-organic)"
                      : "box-shadow 320ms var(--ease-organic), border-radius 320ms var(--ease-organic), left 880ms var(--ease-organic), top 880ms var(--ease-organic)",
                }}
              >
                {!isLocked && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      boxSizing: "border-box",
                      borderTop: joinedTop
                        ? "0 solid transparent"
                        : "10px solid var(--piece-outline)",
                      borderRight: joinedRight
                        ? "0 solid transparent"
                        : "10px solid var(--piece-outline)",
                      borderBottom: joinedBottom
                        ? "0 solid transparent"
                        : "10px solid var(--piece-outline)",
                      borderLeft: joinedLeft
                        ? "0 solid transparent"
                        : "10px solid var(--piece-outline)",
                      borderRadius: inCluster ? 0 : 28,
                    }}
                  />
                )}
              </div>
            );


          })}

          {/* Solved overlay: one continuous image so locked tiles never show seams */}
          <div
            className={cn(
              "pointer-events-none absolute top-0 left-0 z-[2] origin-top-left transition-opacity duration-700",
              solved ? "opacity-100" : "opacity-0",
            )}
            style={{
              width: WORLD_W,
              height: worldH,
              backgroundImage: `url(${src})`,
              backgroundSize: `${bg.w}px ${bg.h}px`,
              backgroundPosition: `${bg.x}px ${bg.y}px`,
              borderRadius: showReference ? 0 : 18,
            }}
          />

        </div>

        {/* reference flash — completed puzzle, exactly the board's footprint */}
        {showReference && (
          <div
            onPointerDown={(e) => {
              e.stopPropagation();
              setShowReference(false);
            }}
            className="absolute top-0 left-0 z-20 origin-top-left overflow-hidden"
            style={{
              width: WORLD_W,
              height: worldH,
              transform: `translate(${offX}px, ${offY}px) scale(${scale})`,
              backgroundImage: `url(${src})`,
              backgroundSize: `${bg.w}px ${bg.h}px`,
              backgroundPosition: `${bg.x}px ${bg.y}px`,
            }}
          />
        )}
       </div>

      </div>

      {/* under-board controls — auto complete and the reference twinkle */}
      <div className="z-20 flex w-full shrink-0 items-center justify-between px-14 pb-0.5 sm:px-24">
        <button
          type="button"
          onClick={autoSolve}
          disabled={autoRunning || solved}
          aria-label={autoRunning ? "Completing puzzle" : "Auto complete puzzle"}
          title={autoRunning ? "Completing…" : "Auto complete"}
          className="p-3 text-primary transition-colors hover:text-accent-foreground disabled:opacity-40"
        >
          <Sparkles size={18} strokeWidth={1.25} />
        </button>
        <button
          type="button"
          aria-pressed={showReference}
          aria-label={
            showReference ? "Hide picture preview" : "Show picture preview"
          }
          title={showReference ? "Hide preview" : "Show preview"}
          onClick={() => setShowReference((v) => !v)}
          className={cn(
            "p-3 transition-colors hover:text-accent-foreground",
            showReference ? "text-accent-foreground" : "text-primary",
          )}
        >
          <Sparkle size={18} strokeWidth={1.25} />
        </button>
      </div>

      {info ? (
        <div className="z-20 px-4 pb-24 text-center sm:px-5">
          {info}
        </div>
      ) : null}


      {/* storybook invitation — carried on every branded Pictaria */}
      {!unbranded && (
        <div className="z-20 mt-8 shrink-0 px-2 pb-1 sm:px-5 sm:pb-2">
          <div className="relative overflow-hidden rounded-[4px] border border-accent/60 bg-card p-1.5">
            <span
              aria-hidden
              className="pointer-events-none absolute -top-3 -left-4 font-display text-[4rem] leading-none text-accent/10 select-none"
            >
              ❦
            </span>
            <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
              <p className="min-w-0 font-display text-[0.65rem] leading-snug [color:color-mix(in_oklch,var(--foreground)_92%,black)]">
                Pictures say a thousand words and puzzles make them fun — Send your
                special moments as a game to those you love!
              </p>
              <Link
                to="/create"
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-primary px-3 py-0.5 text-[0.5rem] tracking-[0.2em] text-primary uppercase transition-transform hover:scale-[1.03]"
              >
                Play
                <span aria-hidden>›</span>
              </Link>
            </div>
          </div>
        </div>
      )}



      {/* celebration — phase one: fine drifting sparkles and congratulations */}
      {solved && !linger && (
        <div
          className="pointer-events-none fixed inset-0 z-30 overflow-hidden transition-opacity duration-[1300ms] ease-[var(--ease-calm)]"
          style={{ opacity: congratsOut ? 0 : 1 }}
        >
          {/* fine drifting sparkles */}
          {Array.from({ length: 40 }).map((_, i) => (
            <svg
              key={`float-${i}`}
              viewBox="0 0 24 24"
              className="animate-star-float absolute"
              style={{
                left: `${(i * 37 + Math.sin(i) * 20) % 100}%`,
                top: `${(i * 19 + Math.cos(i) * 15) % 100}%`,
                width: 5 + (i % 5) * 3,
                height: 5 + (i % 5) * 3,
                animationDelay: `${i * 0.11}s`,
                animationDuration: `${3.5 + (i % 4)}s`,
                fill: i % 3 === 0 ? "var(--accent)" : "oklch(0.97 0.04 88)",
                filter: "drop-shadow(0 0 5px oklch(0.92 0.07 82 / 0.85))",
              }}
            >
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
            </svg>
          ))}

        </div>
      )}


      {/* celebration — phase two: the summary card, after a good long look */}
      {solved && showSummary && (
        <div className="fixed inset-0 z-40 flex items-center justify-center overflow-hidden">
          {/* faded tropical island background */}
          <div className="absolute inset-0">
            <img
              src={tropicalIslandBg}
              alt=""
              className="h-full w-full object-cover opacity-35 saturate-[0.35]"
              loading="lazy"
              width={1024}
              height={1024}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/55 via-deep/35 to-background/70" />
          </div>

          {/* slow drifting golden stars */}
          {Array.from({ length: 24 }).map((_, i) => (
            <svg
              key={`summary-star-${i}`}
              viewBox="0 0 24 24"
              className="animate-star-float absolute opacity-60"
              style={{
                left: `${(i * 41 + Math.sin(i) * 18) % 100}%`,
                top: `${(i * 23 + Math.cos(i) * 12) % 100}%`,
                width: 4 + (i % 4) * 3,
                height: 4 + (i % 4) * 3,
                animationDelay: `${i * 0.15}s`,
                animationDuration: `${4 + (i % 5)}s`,
                fill: i % 3 === 0 ? "var(--accent)" : "oklch(0.97 0.04 88)",
                filter: "drop-shadow(0 0 5px oklch(0.92 0.07 82 / 0.7))",
              }}
            >
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
            </svg>
          ))}

          <div className="animate-soft-in glass-panel relative mx-4 w-full max-w-sm rounded-3xl border border-accent/40 p-7 text-center shadow-lift">
            <h2 className="mt-2 font-display text-3xl">{title}</h2>
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
                  onClick={goSurprise}
                  className="rounded-full border border-primary/70 bg-transparent py-3 text-sm tracking-wide text-primary transition-colors hover:bg-primary/10"
                >
                  Surprise me ✨
                </button>
              <button
                onClick={() => setRound((r) => r + 1)}
                className="rounded-full border border-border py-3 text-sm text-foreground transition-colors hover:bg-secondary"
              >
                Play again
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

      {unbranded && (
        <Link
          to="/"
          className="absolute bottom-1 left-1/2 z-20 -translate-x-1/2 text-[0.5rem] leading-none tracking-[0.16em] text-foreground/35 lowercase transition-colors hover:text-foreground/70"
        >
          made with pictaria
        </Link>
      )}
    </div>
  );
}
