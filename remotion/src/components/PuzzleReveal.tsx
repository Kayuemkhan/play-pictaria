import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { staticFile } from "remotion";
import { C } from "../theme";

/**
 * A photo sliced into equal rectangular tiles that fly in from scattered
 * positions and lock into the grid, one after another, with a gold flash.
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
}> = ({ src, cols = 3, rows = 4, width, start = 0, stagger = 5, radius = 18 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const height = (width / cols) * (rows > 0 ? (4 / 3) * (cols / rows) * (rows / cols) : 1);
  const tileW = width / cols;
  const tileH = tileW * (4 / 3);
  const boardH = tileH * rows;

  const order = React.useMemo(() => {
    const list = Array.from({ length: cols * rows }, (_, i) => i);
    // deterministic pseudo-shuffle
    return list.sort((a, b) => ((a * 37) % 11) - ((b * 37) % 11) || a - b);
  }, [cols, rows]);

  return (
    <div style={{ position: "relative", width, height: boardH }}>
      {order.map((cell, idx) => {
        const col = cell % cols;
        const row = Math.floor(cell / cols);
        const delay = start + idx * stagger;
        const p = spring({
          frame: frame - delay,
          fps,
          config: { damping: 18, stiffness: 130, mass: 0.9 },
        });
        const dir = (cell * 53) % 4;
        const dist = 140 + ((cell * 29) % 120);
        const ox = dir === 0 ? -dist : dir === 1 ? dist : ((cell % 5) - 2) * 40;
        const oy = dir === 2 ? -dist : dir === 3 ? dist : ((cell % 3) - 1) * 60;
        const rot = (((cell * 17) % 9) - 4) * 2.2;

        const x = interpolate(p, [0, 1], [ox, 0]);
        const y = interpolate(p, [0, 1], [oy, 0]);
        const r = interpolate(p, [0, 1], [rot, 0]);
        const opacity = interpolate(frame - delay, [0, 6], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        const locked = frame - delay > 12;
        const flash = interpolate(frame - delay, [10, 15, 26], [0, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.ease,
        });
        const pop = interpolate(frame - delay, [11, 15, 22], [1, 1.045, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={cell}
            style={{
              position: "absolute",
              left: col * tileW,
              top: row * tileH,
              width: tileW,
              height: tileH,
              opacity,
              transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(${pop})`,
              zIndex: locked ? 1 : 3,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 2,
                borderRadius: locked ? 4 : radius,
                overflow: "hidden",
                backgroundImage: `url(${staticFile(src)})`,
                backgroundSize: `${cols * 100}% ${rows * 100}%`,
                backgroundPosition: `${(col / Math.max(cols - 1, 1)) * 100}% ${(row / Math.max(rows - 1, 1)) * 100}%`,
                boxShadow: locked
                  ? "0 2px 10px rgba(4,20,28,0.25)"
                  : "0 18px 40px rgba(4,20,28,0.55)",
                outline: locked ? "none" : "3px solid rgba(255,255,255,0.9)",
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
