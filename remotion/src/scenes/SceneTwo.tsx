import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { PuzzleReveal } from "../components/PuzzleReveal";
import { Sparkles } from "../components/Sparkles";
import { WordsLine } from "../components/Type";
import { C } from "../theme";

export const SceneTwo: React.FC = () => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 110], [1.04, 1.0]);
  const drift = Math.sin(frame / 44) * 5;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(165deg, #0d2e3c 0%, ${C.deep} 60%, ${C.deeper} 100%)`,
      }}
    >
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${scale}) translateY(${drift - 150}px)`,
        }}
      >
        <PuzzleReveal
          src="images/pineapple-table-laughs.jpg"
          cols={3}
          rows={4}
          width={660}
          start={14}
          stagger={5}
        />
      </AbsoluteFill>

      <Sparkles count={18} seedShift={7} />

      <div style={{ position: "absolute", left: 92, right: 92, bottom: 180 }}>
        <WordsLine text="And puzzles" delay={44} size={96} color={C.shell} stagger={5} />
        <WordsLine text="make them fun." delay={58} size={96} color={C.aqua} italic stagger={5} />
      </div>
    </AbsoluteFill>
  );
};
