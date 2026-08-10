import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { body, display } from "../theme";

/** Word-by-word display line: blur-to-sharp, rising, staggered. */
export const WordsLine: React.FC<{
  text: string;
  delay?: number;
  size?: number;
  color?: string;
  weight?: number;
  italic?: boolean;
  letterSpacing?: number;
  lineHeight?: number;
  align?: "left" | "center" | "right";
  stagger?: number;
}> = ({
  text,
  delay = 0,
  size = 96,
  color = "#fbf7f1",
  weight = 300,
  italic = false,
  letterSpacing = 0,
  lineHeight = 1.02,
  align = "left",
  stagger = 4,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: `0 ${size * 0.22}px`,
        justifyContent:
          align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
        fontFamily: display,
        fontSize: size,
        fontWeight: weight,
        fontStyle: italic ? "italic" : "normal",
        color,
        letterSpacing,
        lineHeight,
        textAlign: align,
      }}
    >
      {words.map((w, i) => {
        const d = delay + i * stagger;
        const p = spring({ frame: frame - d, fps, config: { damping: 200 } });
        const y = interpolate(p, [0, 1], [34, 0]);
        const blur = interpolate(p, [0, 1], [10, 0]);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              transform: `translateY(${y}px)`,
              filter: `blur(${blur}px)`,
              opacity: p,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** Small uppercase kicker with an aqua rule that draws itself. */
export const Kicker: React.FC<{
  text: string;
  delay?: number;
  color?: string;
  align?: "left" | "center";
}> = ({ text, delay = 0, color = "#8fe3e8", align = "left" }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        justifyContent: align === "center" ? "center" : "flex-start",
        opacity: p,
      }}
    >
      <div style={{ height: 1, width: 64 * p, background: color, opacity: 0.8 }} />
      <span
        style={{
          fontFamily: body,
          fontSize: 24,
          fontWeight: 400,
          letterSpacing: 7,
          textTransform: "uppercase",
          color,
        }}
      >
        {text}
      </span>
    </div>
  );
};
