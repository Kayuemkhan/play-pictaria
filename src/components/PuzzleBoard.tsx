import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

/** pos[pieceId] = cellIndex. Nothing starts home. */
function shufflePositions(count: number): number[] {
  for (let attempt = 0; attempt < 60; attempt++) {
    const a = Array.from({ length: count }, (_, i) => i);
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j]!, a[i]!];
    }
    if (a.every((cell, piece) => cell !== piece)) return a;
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
  /** pos[piece] = cell */
  const [pos, setPos] = useState<number[]>([]);
  /** groupOf[piece] = group id */
  const [groupOf, setGroupOf] = useState<number[]>([]);
  const [flash, setFlash] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [solved, setSolved] = useState(false);
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
    const p = shufflePositions(total);
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

  /** try to translate a group by (dCol, dRow); returns new positions or null */
  const tryMove = useCallback(
    (
      positions: number[],
      groups: number[],
      group: number,
      dCol: number,
      dRow: number,
    ) => {
      const members = groups
        .map((g, piece) => (g === group ? piece : -1))
        .filter((p) => p >= 0);
      const targets = new Map<number, number>(); // cell -> piece
      for (const piece of members) {
        const c = positions[piece]!;
        const r = Math.floor(c / grid) + dRow;
        const col = (c % grid) + dCol;
        if (r < 0 || r >= grid || col < 0 || col >= grid) return null;
        targets.set(r * grid + col, piece);
      }
      const sources = new Set(members.map((p) => positions[p]!));
      const vacated = [...sources].filter((c) => !targets.has(c));
      const displaced: number[] = [];
      for (const [cell] of targets) {
        if (sources.has(cell)) continue;
        const occupant = positions.indexOf(cell);
        if (occupant < 0) continue;
        // never shove another locked cluster around
        if (groups.filter((g) => g === groups[occupant]).length > 1) return null;
        displaced.push(occupant);
      }
      if (displaced.length !== vacated.length) return null;
      const next = [...positions];
      for (const [cell, piece] of targets) next[piece] = cell;
      displaced.forEach((piece, i) => (next[piece] = vacated[i]!));
      return next;
    },
    [grid],
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
      valid: !!tryMove(pos, groupOf, s.group, dCol, dRow),
    });
  };

  const endPointer = (e: React.PointerEvent) => {
    const s = dragStart.current;
    dragStart.current = null;
    setDrag(null);
    if (!s || !s.moved) return;
    const dCol = Math.round((e.clientX - s.x) / (cellW * scale));
    const dRow = Math.round((e.clientY - s.y) / (cellH * scale));
    commitMove(s.group, dCol, dRow);
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
