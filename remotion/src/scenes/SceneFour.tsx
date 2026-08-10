import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { PuzzleReveal } from "../components/PuzzleReveal";
import { Sparkles } from "../components/Sparkles";
import { WordsLine } from "../components/Type";
import { C } from "../theme";

export const SceneFour: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 140], [1.04, 1.0]);
  const drift = Math.sin(frame / 46) * 5;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(110% 70% at 25% 100%, #12414f 0%, ${C.deep} 50%, ${C.deeper} 100%)`,
      }}
    >
      <Sparkles count={18} seedShift={19} />

      <div style={{ position: "absolute", left: 92, right: 92, top: 130 }}>
        <WordsLine text="as a game to" delay={2} size={92} color={C.shell} stagger={4} />
        <WordsLine text="those you love!" delay={14} size={92} color={C.aqua} italic stagger={4} />
      </div>

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${zoom}) translateY(${drift + 30}px)`,
        }}
      >
        <PuzzleReveal
          src="images/birthday-two.jpg"
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
