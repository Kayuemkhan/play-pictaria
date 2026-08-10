import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { PuzzleReveal } from "../components/PuzzleReveal";
import { Sparkles } from "../components/Sparkles";
import { WordsLine } from "../components/Type";
import { C } from "../theme";

export const SceneFour: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 105], [1.05, 1.0]);
  const drift = Math.sin(frame / 46) * 5;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(110% 70% at 25% 100%, #12414f 0%, ${C.deep} 50%, ${C.deeper} 100%)`,
      }}
    >
      <Sparkles count={18} seedShift={19} />

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${zoom}) translateY(${drift - 150}px)`,
        }}
      >
        <PuzzleReveal
          src="images/birthday-two.jpg"
          cols={3}
          rows={4}
          width={660}
          start={12}
          stagger={5}
        />
      </AbsoluteFill>

      <div style={{ position: "absolute", left: 92, right: 92, bottom: 180 }}>
        <WordsLine text="to everyone" delay={44} size={96} color={C.shell} stagger={5} />
        <WordsLine text="you love." delay={58} size={96} color={C.aqua} italic stagger={5} />
      </div>
    </AbsoluteFill>
  );
};
