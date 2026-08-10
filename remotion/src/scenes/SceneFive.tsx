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
import { Sparkles } from "../components/Sparkles";
import { body, C, display } from "../theme";

export const SceneFive: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logo = spring({ frame, fps, config: { damping: 200 } });
  const glow = 0.5 + 0.5 * Math.sin(frame / 18);
  const word = spring({ frame: frame - 14, fps, config: { damping: 200 } });
  const tag = interpolate(frame - 30, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const url = spring({ frame: frame - 44, fps, config: { damping: 18, stiffness: 140 } });

  const track = interpolate(word, [0, 1], [46, 26]);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(80% 55% at 50% 42%, #14485a 0%, ${C.deep} 45%, ${C.deeper} 100%)`,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Sparkles count={30} seedShift={31} />

      <div
        style={{
          transform: `scale(${interpolate(logo, [0, 1], [0.82, 1])}) translateY(${interpolate(
            logo,
            [0, 1],
            [40, 0],
          )}px)`,
          opacity: logo,
          filter: `drop-shadow(0 0 ${18 + glow * 22}px rgba(227,192,125,${0.35 + glow * 0.3}))`,
        }}
      >
        <Img src={staticFile("images/logo-palms-only.png")} style={{ width: 340 }} />
      </div>

      <div
        style={{
          marginTop: 26,
          fontFamily: display,
          fontSize: 132,
          fontWeight: 400,
          color: C.shell,
          letterSpacing: track,
          opacity: word,
          textTransform: "uppercase",
        }}
      >
        Pictaria
      </div>

      <div
        style={{
          marginTop: 10,
          fontFamily: body,
          fontSize: 28,
          letterSpacing: 11,
          textTransform: "uppercase",
          color: C.aqua,
          opacity: tag,
        }}
      >
        Pictures become play
      </div>

      <div
        style={{
          marginTop: 74,
          opacity: url,
          transform: `translateY(${interpolate(url, [0, 1], [28, 0])}px)`,
          background: C.shell,
          borderRadius: 999,
          padding: "22px 54px",
          fontFamily: body,
          fontSize: 32,
          fontWeight: 500,
          letterSpacing: 3,
          color: C.ink,
          boxShadow: "0 18px 44px rgba(0,0,0,0.45)",
        }}
      >
        play-pictaria.lovable.app
      </div>

      <div
        style={{
          marginTop: 26,
          fontFamily: body,
          fontSize: 26,
          letterSpacing: 6,
          textTransform: "uppercase",
          color: "rgba(251,247,241,0.65)",
          opacity: interpolate(frame - 58, [0, 16], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        A free puzzle every day
      </div>
    </AbsoluteFill>
  );
};
