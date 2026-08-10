import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C } from "../theme";

/** Drifting glimmer specks — used sparingly over dark scenes. */
export const Sparkles: React.FC<{ count?: number; seedShift?: number }> = ({
  count = 26,
  seedShift = 0,
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => {
        const s = i + seedShift;
        const x = ((s * 97) % 100) + Math.sin((frame + s * 9) / 34) * 1.6;
        const yBase = ((s * 61) % 100);
        const y = (yBase - ((frame + s * 7) / 7) % 110 + 110) % 110;
        const size = 2 + ((s * 13) % 4);
        const twinkle = 0.25 + 0.75 * Math.abs(Math.sin((frame + s * 21) / 17));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              borderRadius: 99,
              background: i % 5 === 0 ? C.gold : "#ffffff",
              opacity: twinkle * 0.8,
              boxShadow: `0 0 ${size * 3}px ${i % 5 === 0 ? C.gold : C.aqua}`,
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" }),
        }}
      />
    </div>
  );
};
