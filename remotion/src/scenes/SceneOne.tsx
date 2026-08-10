import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { PuzzleReveal } from "../components/PuzzleReveal";
import { Sparkles } from "../components/Sparkles";
import { Kicker, WordsLine } from "../components/Type";
import { C } from "../theme";

export const SceneOne: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 105], [1.05, 1.0]);
  const drift = Math.sin(frame / 40) * 5;

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
          transform: `scale(${zoom}) translateY(${drift - 150}px)`,
        }}
      >
        <PuzzleReveal
          src="images/flower-hibiscus.jpg"
          cols={3}
          rows={4}
          width={660}
          start={16}
          stagger={5}
        />
      </AbsoluteFill>

      <div style={{ position: "absolute", left: 92, top: 150 }}>
        <Kicker text="Introducing Pictaria" delay={2} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 92,
          right: 92,
          bottom: 180,
        }}
      >
        <WordsLine
          text="A picture is worth"
          delay={44}
          size={96}
          color={C.shell}
          stagger={5}
        />
        <WordsLine
          text="a thousand words."
          delay={58}
          size={96}
          color={C.aqua}
          italic
          stagger={5}
        />
      </div>
    </AbsoluteFill>
  );
};
