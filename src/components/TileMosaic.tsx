import { useEffect, useRef, useState } from "react";

/**
 * Decorative "puzzle solving itself" mosaic — equal-sized vertical rectangles
 * sliced from one photo, laid out in a staircase. The lower stair is already
 * solved and locked; the upper pieces keep sliding between cells and blink
 * gold as each one clicks into its home cell.
 */
const COLS = 3;
const ROWS = 4;
const PIECE_ASPECT = 3 / 4; // vertical rectangles
const GAP = 3; // px

/** Grid cells that hold a piece, in staircase formation. */
const HOME = [0, 3, 4, 6, 7, 8, 9, 10, 11];
/** Cells whose pieces are permanently solved (the finished part of the stair). */
const LOCKED = new Set([6, 7, 8, 9, 10, 11]);

const LOOSE = HOME.filter((cell) => !LOCKED.has(cell));

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function TileMosaic({ src }: { src: string }) {
  // cellFor[pieceIndex] = grid cell that piece currently sits in
  const [cellFor, setCellFor] = useState<number[]>(HOME);
  const [blink, setBlink] = useState<number | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const jumbleLoose = () => {
      const mix = shuffled(LOOSE);
      setCellFor(
        HOME.map((home) =>
          LOCKED.has(home) ? home : mix[LOOSE.indexOf(home)]!,
        ),
      );
    };

    const start = window.setTimeout(jumbleLoose, 700);

    const tick = window.setInterval(() => {
      setCellFor((prev) => {
        const wrong = prev
          .map((cell, piece) => ({ cell, piece }))
          .filter(({ cell, piece }) => cell !== HOME[piece]);

        if (!wrong.length) {
          const t = window.setTimeout(jumbleLoose, 1600);
          timers.current.push(t);
          return prev;
        }

        const next = [...prev];
        const pick = wrong[Math.floor(Math.random() * wrong.length)]!;
        const home = HOME[pick.piece]!;
        const other = next.indexOf(home);
        next[pick.piece] = home;
        if (other !== -1) next[other] = pick.cell;

        const t = window.setTimeout(() => setBlink(pick.piece), 620);
        const t2 = window.setTimeout(() => setBlink(null), 1180);
        timers.current.push(t, t2);
        return next;
      });
    }, 1150);

    return () => {
      window.clearTimeout(start);
      window.clearInterval(tick);
      timers.current.forEach(window.clearTimeout);
      timers.current = [];
    };
  }, []);

  const colPct = 100 / COLS;
  const rowPct = 100 / ROWS;

  return (
    <div
      aria-hidden
      className="relative w-full"
      style={{ aspectRatio: `${COLS * PIECE_ASPECT} / ${ROWS}` }}
    >
      {HOME.map((homeCell, piece) => {
        const hc = homeCell % COLS;
        const hr = Math.floor(homeCell / COLS);
        const cur = cellFor[piece] ?? homeCell;
        const col = cur % COLS;
        const row = Math.floor(cur / COLS);
        const atHome = cur === homeCell;
        const locking = blink === piece;
        return (
          <div
            key={piece}
            className="absolute rounded-[3px]"
            style={{
              width: `calc(${colPct}% - ${GAP}px)`,
              height: `calc(${rowPct}% - ${GAP}px)`,
              left: `${col * colPct}%`,
              top: `${row * rowPct}%`,
              backgroundImage: `url(${src})`,
              backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
              backgroundPosition: `${(hc / (COLS - 1)) * 100}% ${(hr / (ROWS - 1)) * 100}%`,
              boxShadow: locking
                ? "0 0 0 2px oklch(0.82 0.12 85), var(--shadow-lift)"
                : atHome
                  ? "var(--shadow-soft)"
                  : "var(--shadow-lift)",
              filter: locking ? "brightness(1.18)" : "none",
              zIndex: locking ? 3 : atHome ? 1 : 2,
              transition:
                "left 0.6s var(--ease-calm), top 0.6s var(--ease-calm), box-shadow 0.35s ease, filter 0.35s ease",
            }}
          />
        );
      })}
    </div>
  );
}
