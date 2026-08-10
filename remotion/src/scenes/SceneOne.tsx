import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { PuzzleReveal } from "../components/PuzzleReveal";
import { Sparkles } from "../components/Sparkles";
import { Kicker, WordsLine } from "../components/Type";
import { C } from "../theme";

export const SceneOne: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 105], [1.06, 1.0]);
  const drift = Math.sin(frame / 40) * 6;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 80% at 20% 0%, #10394a 0%, ${C.deep} 45%, ${C.deeper} 100%)`,
      }}
    >
      <Sparkles count={22} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${zoom}) translateY(${drift - 170}px)`,
        }}
      >
        <PuzzleReveal src="images/hero-sunset.jpg" width={700} start={4} stagger={5} />
      </AbsoluteFill>

      <div style={{ position: "absolute", left: 92, top: 150 }}>
        <Kicker text="Introducing" delay={2} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 92,
          right: 92,
          bottom: 190,
        }}
      >
        <WordsLine
          text="Pictures say a"
          delay={44}
          size={104}
          color={C.shell}
          stagger={5}
        />
        <WordsLine
          text="thousand words."
          delay={58}
          size={104}
          color={C.aqua}
          italic
          stagger={5}
        />
      </div>
    </AbsoluteFill>
  );
};
