import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Kicker, WordsLine } from "../components/Type";
import { C } from "../theme";

const SHOTS = [
  "images/turtle-05.jpg",
  "images/whale-02.jpg",
  "images/waterfall-06.jpg",
  "images/lei-09.jpg",
  "images/wave-03.jpg",
  "images/pineapple-02.jpg",
  "images/flower-hibiscus.jpg",
  "images/mindfulness-lotus.jpg",
  "images/sunset-04.jpg",
];

export const SceneThree: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = interpolate(frame, [0, 105], [40, -40]);

  return (
    <AbsoluteFill style={{ background: C.deeper }}>
      <AbsoluteFill
        style={{
          padding: "0 60px",
          alignItems: "center",
          justifyContent: "center",
          transform: `translateY(${rise}px)`,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 14,
            width: "100%",
          }}
        >
          {SHOTS.map((src, i) => {
            const p = spring({
              frame: frame - i * 3,
              fps,
              config: { damping: 200 },
            });
            const y = interpolate(p, [0, 1], [60, 0]);
            const float = Math.sin((frame + i * 24) / 38) * 5;
            return (
              <div
                key={src}
                style={{
                  aspectRatio: "3 / 4",
                  borderRadius: 6,
                  overflow: "hidden",
                  opacity: p,
                  transform: `translateY(${y + float}px)`,
                  boxShadow: "0 12px 30px rgba(0,0,0,0.45)",
                }}
              >
                <Img
                  src={staticFile(src)}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(4,20,28,0.9) 0%, rgba(4,20,28,0.1) 34%, rgba(4,20,28,0.55) 66%, rgba(4,20,28,0.96) 100%)",
        }}
      />

      <div style={{ position: "absolute", left: 0, right: 0, top: 170 }}>
        <Kicker text="A gallery of Hawaiʻi" delay={12} align="center" />
      </div>

      <div style={{ position: "absolute", left: 70, right: 70, bottom: 200 }}>
        <WordsLine
          text="Turtles. Whales."
          delay={38}
          size={86}
          color={C.shell}
          align="center"
          stagger={4}
        />
        <WordsLine
          text="Waterfalls. Leis."
          delay={50}
          size={86}
          color={C.aqua}
          italic
          align="center"
          stagger={4}
        />
      </div>
    </AbsoluteFill>
  );
};
