import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { PuzzleReveal } from "../components/PuzzleReveal";
import { Sparkles } from "../components/Sparkles";
import { WordsLine } from "../components/Type";
import { C } from "../theme";

export const SceneOne: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 145], [1.04, 1.0]);
  const drift = Math.sin(frame / 40) * 5;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 80% at 20% 0%, #10394a 0%, ${C.deep} 45%, ${C.deeper} 100%)`,
      }}
    >
      <Sparkles count={22} />

      <div style={{ position: "absolute", left: 92, right: 92, top: 130 }}>
        <WordsLine text="A picture is worth" delay={2} size={92} color={C.shell} stagger={4} />
        <WordsLine text="a thousand words." delay={14} size={92} color={C.aqua} italic stagger={4} />
      </div>

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${zoom}) translateY(${drift + 30}px)`,
        }}
      >
        <PuzzleReveal
          src="images/flower-hibiscus.jpg"
          cols={3}
          rows={4}
          width={780}
          start={18}
          stagger={5}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
