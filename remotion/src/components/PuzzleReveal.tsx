import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { staticFile } from "remotion";
import { C } from "../theme";

/**
 * A photo sliced into equal rectangular tiles. The tiles begin SCRAMBLED
 * inside the puzzle square (swapped between grid cells, like a real
 * Pictaria) and then slide home one after another with a soft flash.
 */
export const PuzzleReveal: React.FC<{
  src: string;
  cols?: number;
  rows?: number;
  width: number;
  /** frame at which the first tile begins to land */
  start?: number;
  /** frames between tile landings */
  stagger?: number;
  radius?: number;
}> = ({ src, cols = 3, rows = 4, width, start = 0, stagger = 5, radius = 6 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const count = cols * rows;
  const tileW = width / cols;
  const boardH = (width * 4) / 3;
  const cellH = boardH / rows;

  // Deterministic scramble: perm[cell] = grid slot the tile starts in.
  const perm = React.useMemo(() => {
    const arr = Array.from({ length: count }, (_, i) => i);
    let seed = count * 7919 + 13;
    const rnd = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    // avoid any tile starting already at home (keeps it visibly scrambled)
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === i) {
        const k = (i + 1) % arr.length;
        [arr[i], arr[k]] = [arr[k], arr[i]];
      }
    }
    return arr;
  }, [count]);

  // Solve order: gentle sweep, not strictly row by row.
  const order = React.useMemo(() => {
    const list = Array.from({ length: count }, (_, i) => i);
    return list.sort((a, b) => ((a * 37) % 11) - ((b * 37) % 11) || a - b);
  }, [count]);

  return (
    <div style={{ position: "relative", width, height: boardH }}>
      {order.map((cell, idx) => {
        const col = cell % cols;
        const row = Math.floor(cell / cols);
        const slot = perm[cell];
        const sCol = slot % cols;
        const sRow = Math.floor(slot / cols);
        const delay = start + idx * stagger;
        const p = spring({
          frame: frame - delay,
          fps,
          config: { damping: 20, stiffness: 140, mass: 0.85 },
        });

        // offsets stay inside the square: from scrambled slot -> home cell
        const ox = (sCol - col) * tileW;
        const oy = (sRow - row) * cellH;

        const x = interpolate(p, [0, 1], [ox, 0]);
        const y = interpolate(p, [0, 1], [oy, 0]);
        const opacity = interpolate(frame, [0, 8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        const locked = frame - delay > 12;
        const flash = interpolate(frame - delay, [10, 15, 26], [0, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.ease,
        });
        const pop = interpolate(frame - delay, [11, 15, 22], [1, 1.02, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={cell}
            style={{
              position: "absolute",
              left: col * tileW,
              top: row * cellH,
              width: tileW,
              height: cellH,
              opacity,
              transform: `translate(${x}px, ${y}px) scale(${pop})`,
              zIndex: locked ? 1 : 3,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 2,
                borderRadius: radius,
                overflow: "hidden",
                backgroundImage: `url(${staticFile(src)})`,
                backgroundSize: `${cols * 100}% ${rows * 100}%`,
                backgroundPosition: `${(col / Math.max(cols - 1, 1)) * 100}% ${(row / Math.max(rows - 1, 1)) * 100}%`,
                boxShadow: locked
                  ? "0 2px 10px rgba(4,20,28,0.25)"
                  : "0 12px 26px rgba(4,20,28,0.45)",
                outline: "3px solid rgba(255,255,255,0.92)",
                outlineOffset: -3,
                filter: `brightness(${1 + flash * 0.35}) saturate(${1 + flash * 0.2})`,
              }}
            />
            {flash > 0.02 && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 6,
                  boxShadow: `0 0 ${18 * flash}px ${4 * flash}px ${C.aqua}`,
                  opacity: flash * 0.85,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
