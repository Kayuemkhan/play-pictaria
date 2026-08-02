import { useEffect, useRef, useState } from "react";

/**
 * Overlay for the hero photograph: the picture reads as fully solved except for
 * a soft diagonal wedge in the lower-left corner, where equal-sized vertical
 * rectangles slide between cells and blink gold as each clicks into its home.
 *
 * The pieces are cut from the same image that sits underneath, so the overlay
 * disappears into the photo everywhere except the unsolved wedge.
 */
const COLS = 6;
const ROWS = 8;
const GAP = 2; // px between pieces
/** Wedge depth from the bottom-left corner — larger covers more of the frame. */
const WEDGE = 5;

/** Cells in the unsolved lower-left diagonal wedge. */
const LOOSE: number[] = [];
for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    if (ROWS - 1 - row + col < WEDGE) LOOSE.push(row * COLS + col);
  }
}

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function HeroPuzzle({ src }: { src: string }) {
  const [cellFor, setCellFor] = useState<number[]>(LOOSE);
  const [blink, setBlink] = useState<number | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const jumble = () => {
      const mix = shuffled(LOOSE);
      setCellFor(mix);
    };

    const start = window.setTimeout(jumble, 800);

    const tick = window.setInterval(() => {
      setCellFor((prev) => {
        const wrong = prev
          .map((cell, piece) => ({ cell, piece }))
          .filter(({ cell, piece }) => cell !== LOOSE[piece]);

        if (!wrong.length) {
          const t = window.setTimeout(jumble, 1800);
          timers.current.push(t);
          return prev;
        }

        const next = [...prev];
        const pick = wrong[Math.floor(Math.random() * wrong.length)]!;
        const home = LOOSE[pick.piece]!;
        const other = next.indexOf(home);
        next[pick.piece] = home;
        if (other !== -1) next[other] = pick.cell;

        const t = window.setTimeout(() => setBlink(pick.piece), 620);
        const t2 = window.setTimeout(() => setBlink(null), 1200);
        timers.current.push(t, t2);
        return next;
      });
    }, 1100);

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
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {/* soft shadowed bed the loose pieces lift off of */}
      {LOOSE.map((cell) => {
        const col = cell % COLS;
        const row = Math.floor(cell / COLS);
        return (
          <div
            key={`bed-${cell}`}
            className="absolute rounded-[3px] bg-deep/55"
            style={{
              width: `calc(${colPct}% - ${GAP}px)`,
              height: `calc(${rowPct}% - ${GAP}px)`,
              left: `${col * colPct}%`,
              top: `${row * rowPct}%`,
              boxShadow: "inset 0 0 12px oklch(0.2 0.05 230 / 0.6)",
            }}
          />
        );
      })}

      {LOOSE.map((homeCell, piece) => {
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
