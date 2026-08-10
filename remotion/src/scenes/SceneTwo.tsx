import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { PuzzleReveal } from "../components/PuzzleReveal";
import { Sparkles } from "../components/Sparkles";
import { WordsLine } from "../components/Type";
import { C } from "../theme";

export const SceneTwo: React.FC = () => {
  const frame = useCurrentFrame();
  const pan = interpolate(frame, [0, 105], [-40, 40]);
  const scale = interpolate(frame, [0, 105], [1.12, 1.02]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(165deg, #0d2e3c 0%, ${C.deep} 60%, ${C.deeper} 100%)`,
      }}
    >
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: 210,
          transform: `translateX(${pan}px) scale(${scale})`,
        }}
      >
        <PuzzleReveal
          src="images/lei-03.jpg"
          cols={2}
          rows={3}
          width={640}
          start={0}
          stagger={7}
        />
      </AbsoluteFill>

      <Sparkles count={18} seedShift={7} />

      <div style={{ position: "absolute", left: 92, right: 92, bottom: 210 }}>
        <WordsLine text="Puzzles make" delay={40} size={104} color={C.shell} stagger={5} />
        <WordsLine text="them fun." delay={54} size={104} color={C.aqua} italic stagger={5} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 92,
          bottom: 150,
          opacity: interpolate(frame, [70, 90], [0, 1], { extrapolateRight: "clamp" }),
          fontFamily: "inherit",
        }}
      >
        <span
          style={{
            fontSize: 26,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "rgba(251,247,241,0.6)",
          }}
        >
          Tiles that click into place
        </span>
      </div>
    </AbsoluteFill>
  );
};
