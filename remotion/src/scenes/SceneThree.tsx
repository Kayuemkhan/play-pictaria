import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { PuzzleReveal } from "../components/PuzzleReveal";
import { Sparkles } from "../components/Sparkles";
import { WordsLine } from "../components/Type";
import { C } from "../theme";

export const SceneThree: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 105], [1.0, 1.05]);
  const drift = Math.sin(frame / 42) * 5;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(110% 75% at 75% 5%, #12414f 0%, ${C.deep} 50%, ${C.deeper} 100%)`,
      }}
    >
      <Sparkles count={20} seedShift={13} />

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${zoom}) translateY(${drift - 150}px)`,
        }}
      >
        <PuzzleReveal
          src="images/wedding-couple.jpg"
          cols={3}
          rows={4}
          width={660}
          start={12}
          stagger={5}
        />
      </AbsoluteFill>

      <div style={{ position: "absolute", left: 92, right: 92, bottom: 180 }}>
        <WordsLine text="Send a free" delay={44} size={96} color={C.shell} stagger={5} />
        <WordsLine text="Pictaria" delay={58} size={96} color={C.aqua} italic stagger={5} />
      </div>
    </AbsoluteFill>
  );
};
