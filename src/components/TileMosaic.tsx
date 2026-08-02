import { useEffect, useState } from "react";

/**
 * Decorative "puzzle solving itself" mosaic — equal-sized rectangular tiles
 * sliced from one image that keep sliding between grid cells, then settle.
 */
const COLS = 5;
const ROWS = 4;
const TOTAL = COLS * ROWS;
const GAP = 3; // px

// which cells hold a piece — the rest stay empty, like an unfinished puzzle
const PLACED = [2, 3, 4, 6, 7, 8, 9, 11, 13, 14, 15, 16, 17, 18, 19];

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function TileMosaic({ src }: { src: string }) {
  // cellFor[piece] = which grid cell that piece currently sits in
  const [cellFor, setCellFor] = useState<number[]>(PLACED);

  useEffect(() => {
    let solved = false;
    const jumble = window.setTimeout(
      () => setCellFor(shuffled(PLACED)),
      600,
    );
    const id = window.setInterval(() => {
      setCellFor((prev) => {
        if (solved) return shuffled(PLACED);
        // slide two pieces at a time toward home
        const next = [...prev];
        const wrong = next
          .map((cell, piece) => ({ cell, piece }))
          .filter(({ cell, piece }) => cell !== PLACED[piece]);
        if (!wrong.length) {
          solved = true;
          return next;
        }
        const pick = wrong[Math.floor(Math.random() * wrong.length)]!;
        const home = PLACED[pick.piece]!;
        const other = next.indexOf(home);
        next[pick.piece] = home;
        if (other !== -1) next[other] = pick.cell;
        solved = next.every((cell, piece) => cell === PLACED[piece]);
        return next;
      });
    }, 900);
    return () => {
      window.clearTimeout(jumble);
      window.clearInterval(id);
    };
  }, []);

  const cellPct = 100 / COLS;

  return (
    <div
      aria-hidden
      className="relative w-full"
      style={{ aspectRatio: `${COLS} / ${ROWS}` }}
    >
      {PLACED.map((homeCell, piece) => {
        const hc = homeCell % COLS;
        const hr = Math.floor(homeCell / COLS);
        const cur = cellFor[piece] ?? homeCell;
        const col = cur % COLS;
        const row = Math.floor(cur / COLS);
        const atHome = cur === homeCell;
        return (
          <div
            key={piece}
            className="absolute rounded-[2px] ring-1 ring-deep-foreground/70"
            style={{
              width: `calc(${cellPct}% - ${GAP}px)`,
              height: `calc(${(100 / ROWS).toFixed(4)}% - ${GAP}px)`,
              left: `${col * cellPct}%`,
              top: `${row * (100 / ROWS)}%`,
              backgroundImage: `url(${src})`,
              backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
              backgroundPosition: `${(hc / (COLS - 1)) * 100}% ${(hr / (ROWS - 1)) * 100}%`,
              boxShadow: atHome ? "var(--shadow-soft)" : "var(--shadow-lift)",
              zIndex: atHome ? 1 : 2,
              transition:
                "left 0.65s var(--ease-calm), top 0.65s var(--ease-calm), box-shadow 0.5s ease",
            }}
          />
        );
      })}
    </div>
  );
}
