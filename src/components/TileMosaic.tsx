/**
 * Decorative "puzzle in progress" mosaic — equal-sized rectangular tiles
 * sliced out of a single image, some placed, some still missing.
 */
const COLS = 5;
const ROWS = 4;

// which cells are "placed" — the rest stay empty, like an unfinished puzzle
const PLACED = new Set([
  2, 3, 4, 6, 7, 8, 9, 11, 13, 14, 15, 16, 17, 18, 19,
]);

export function TileMosaic({ src }: { src: string }) {
  return (
    <div
      aria-hidden
      className="grid w-full gap-[3px]"
      style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: COLS * ROWS }, (_, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        if (!PLACED.has(i)) return <div key={i} className="aspect-square" />;
        return (
          <div
            key={i}
            className="aspect-square rounded-[2px] ring-1 ring-deep-foreground/70"
            style={{
              backgroundImage: `url(${src})`,
              backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
              backgroundPosition: `${(col / (COLS - 1)) * 100}% ${(row / (ROWS - 1)) * 100}%`,
              boxShadow: "var(--shadow-soft)",
              animation: `soft-in 0.7s var(--ease-calm) ${0.25 + i * 0.045}s both`,
            }}
          />
        );
      })}
    </div>
  );
}
