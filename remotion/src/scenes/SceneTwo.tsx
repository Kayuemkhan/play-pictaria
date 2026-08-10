import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { PuzzleReveal } from "../components/PuzzleReveal";
import { Sparkles } from "../components/Sparkles";
import { WordsLine } from "../components/Type";
import { C } from "../theme";

export const SceneTwo: React.FC = () => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 145], [1.0, 1.04]);
  const drift = Math.sin(frame / 44) * 5;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(165deg, #0d2e3c 0%, ${C.deep} 60%, ${C.deeper} 100%)`,
      }}
    >
      <Sparkles count={18} seedShift={7} />

      <div style={{ position: "absolute", left: 92, right: 92, top: 130 }}>
        <WordsLine text="And puzzles" delay={2} size={92} color={C.shell} stagger={4} />
        <WordsLine text="make them fun!" delay={14} size={92} color={C.aqua} italic stagger={4} />
      </div>

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${scale}) translateY(${drift + 160}px)`,
        }}
      >
        <PuzzleReveal
          src="images/pineapple-table-laughs.jpg"
          cols={3}
          rows={4}
          width={620}
          start={22}
          stagger={6}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
