import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

/**
 * Overlay for a hero photograph: the picture reads as fully solved except for
 * a soft diagonal wedge in one corner, where equal-sized vertical rectangles
 * sit jumbled — and, when animated, slide between cells and blink gold as each
 * clicks into its home.
 *
 * Pieces are cut from the very same rendered (cover-cropped) image, so outside
 * the wedge the overlay is invisible.
 */
export type HeroCorner =
  | "bottom-left"
  | "bottom-right"
  | "top-left"
  | "top-right";

export interface HeroPuzzleProps {
  src: string;
  /** columns across the photo */
  cols?: number;
  /** rows down the photo */
  rows?: number;
  /** diagonal depth of the unsolved wedge, in cells */
  wedge?: number;
  corner?: HeroCorner;
  /** when false the wedge stays jumbled (email / print safe) */
  animated?: boolean;
}

const GAP = 2; // px between pieces

function wedgeCells(
  cols: number,
  rows: number,
  wedge: number,
  corner: HeroCorner,
) {
  const fromBottom = corner.startsWith("bottom");
  const fromLeft = corner.endsWith("left");
  const cells: number[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const dr = fromBottom ? rows - 1 - row : row;
      const dc = fromLeft ? col : cols - 1 - col;
      if (dr + dc < wedge) cells.push(row * cols + col);
    }
  }
  return cells;
}

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function HeroPuzzle({
  src,
  cols = 6,
  rows = 8,
  wedge = 5,
  corner = "bottom-left",
  animated = true,
}: HeroPuzzleProps) {
  const loose = useMemo(
    () => wedgeCells(cols, rows, wedge, corner),
    [cols, rows, wedge, corner],
  );

  const [cellFor, setCellFor] = useState<number[]>(loose);
  const [blink, setBlink] = useState<number | null>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const wrap = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!animated) {
      setCellFor(shuffled(loose));
      return;
    }

    setCellFor(loose);
    const jumble = () => setCellFor(shuffled(loose));
    const start = window.setTimeout(jumble, 800);

    const tick = window.setInterval(() => {
      setCellFor((prev) => {
        const wrong = prev
          .map((cell, piece) => ({ cell, piece }))
          .filter(({ cell, piece }) => cell !== loose[piece]);

        if (!wrong.length) {
          const t = window.setTimeout(jumble, 1800);
          timers.current.push(t);
          return prev;
        }

        const next = [...prev];
        const pick = wrong[Math.floor(Math.random() * wrong.length)]!;
        const home = loose[pick.piece]!;
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
  }, [animated, loose]);

  const cw = box.w / cols;
  const ch = box.h / rows;

  return (
    <div
      ref={wrap}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {box.w > 0 && (
        <>
          {/* shadowed bed the loose pieces lift off of */}
          {loose.map((cell) => (
            <div
              key={`bed-${cell}`}
              className="absolute rounded-[3px] bg-deep/55"
              style={{
                width: cw - GAP,
                height: ch - GAP,
                left: (cell % cols) * cw,
                top: Math.floor(cell / cols) * ch,
                boxShadow: "inset 0 0 14px oklch(0.2 0.05 230 / 0.65)",
              }}
            />
          ))}

          {loose.map((homeCell, piece) => {
            const hc = homeCell % cols;
            const hr = Math.floor(homeCell / cols);
            const cur = cellFor[piece] ?? homeCell;
            const atHome = cur === homeCell;
            const locking = blink === piece;
            return (
              <div
                key={piece}
                className="absolute overflow-hidden rounded-[3px]"
                style={{
                  width: cw - GAP,
                  height: ch - GAP,
                  left: (cur % cols) * cw,
                  top: Math.floor(cur / cols) * ch,
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
              >
                <img
                  src={src}
                  alt=""
                  className="absolute object-cover"
                  style={{
                    width: box.w,
                    height: box.h,
                    left: -hc * cw,
                    top: -hr * ch,
                  }}
                />
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
