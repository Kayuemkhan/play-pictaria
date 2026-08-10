import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PuzzleReveal } from "../components/PuzzleReveal";
import { Sparkles } from "../components/Sparkles";
import { Kicker, WordsLine } from "../components/Type";
import { body, C } from "../theme";

export const SceneFour: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const zoom = interpolate(frame, [0, 105], [1.0, 1.05]);
  const chip = spring({ frame: frame - 66, fps, config: { damping: 16, stiffness: 150 } });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(110% 70% at 80% 100%, #12414f 0%, ${C.deep} 50%, ${C.deeper} 100%)`,
      }}
    >
      <Sparkles count={16} seedShift={19} />

      <div style={{ position: "absolute", left: 92, top: 160 }}>
        <Kicker text="Your photographs" delay={4} />
        <div style={{ marginTop: 24 }}>
          <WordsLine text="Send your own" delay={12} size={96} color={C.shell} stagger={5} />
          <WordsLine text="as a puzzle." delay={26} size={96} color={C.aqua} italic stagger={5} />
        </div>
      </div>

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 200,
          transform: `scale(${zoom})`,
        }}
      >
        <PuzzleReveal
          src="images/sunset-08.jpg"
          cols={3}
          rows={3}
          width={620}
          start={24}
          stagger={5}
        />
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 130,
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
          One photo · one link · instant play
        </div>
      </div>
    </AbsoluteFill>
  );
};
