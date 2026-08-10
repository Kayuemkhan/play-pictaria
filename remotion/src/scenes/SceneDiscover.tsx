import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PuzzleReveal } from "../components/PuzzleReveal";
import { Sparkles } from "../components/Sparkles";
import { WordsLine } from "../components/Type";
import { body, C } from "../theme";

export const SceneDiscover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const zoom = interpolate(frame, [0, 120], [1.0, 1.05]);
  const chip = spring({ frame: frame - 78, fps, config: { damping: 16, stiffness: 150 } });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(110% 70% at 80% 0%, #12414f 0%, ${C.deep} 50%, ${C.deeper} 100%)`,
      }}
    >
      <Sparkles count={16} seedShift={23} />

      <div style={{ position: "absolute", left: 92, right: 92, top: 170 }}>
        <WordsLine text="Discover beautiful" delay={8} size={80} color={C.shell} stagger={5} />
        <WordsLine text="photography, one puzzle" delay={20} size={70} color={C.shell} stagger={4} />
        <WordsLine text="&ldquo;peace&rdquo; at a time." delay={34} size={80} color={C.aqua} italic stagger={5} />
      </div>

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 210,
          transform: `scale(${zoom})`,
        }}
      >
        <PuzzleReveal
          src="images/turtle-snorkeler.jpg"
          cols={3}
          rows={4}
          width={560}
          start={26}
          stagger={5}
        />
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 120,
          display: "flex",
          justifyContent: "center",
          opacity: chip,
          transform: `translateY(${interpolate(chip, [0, 1], [26, 0])}px)`,
        }}
      >
        <div
          style={{
            border: `1px solid ${C.aqua}`,
            borderRadius: 999,
            padding: "16px 40px",
            fontFamily: body,
            fontSize: 27,
            letterSpacing: 5,
            textTransform: "uppercase",
            color: C.aqua,
          }}
        >
          Or you can send your own!
        </div>
      </div>
    </AbsoluteFill>
  );
};
