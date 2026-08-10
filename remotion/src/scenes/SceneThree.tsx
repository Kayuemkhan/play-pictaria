import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { PuzzleReveal } from "../components/PuzzleReveal";
import { Sparkles } from "../components/Sparkles";
import { WordsLine } from "../components/Type";
import { C } from "../theme";

export const SceneThree: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 140], [1.0, 1.04]);
  const drift = Math.sin(frame / 42) * 5;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(110% 75% at 75% 5%, #12414f 0%, ${C.deep} 50%, ${C.deeper} 100%)`,
      }}
    >
      <Sparkles count={20} seedShift={13} />

      <div style={{ position: "absolute", left: 92, right: 92, top: 130 }}>
        <WordsLine text="Send your special" delay={2} size={88} color={C.shell} stagger={4} />
        <WordsLine text="moments" delay={14} size={88} color={C.aqua} italic stagger={4} />
      </div>

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${zoom}) translateY(${drift + 30}px)`,
        }}
      >
        <PuzzleReveal
          src="images/wedding-couple.jpg"
          cols={3}
          rows={4}
          width={780}
          start={22}
          stagger={6}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
