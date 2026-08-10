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

const LINES = [
  "Be first to send your own",
  "Early access · founding member perks",
];

export const SceneSix: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logo = spring({ frame, fps, config: { damping: 200 } });
  const glow = 0.5 + 0.5 * Math.sin(frame / 16);
  const head = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  const field = spring({ frame: frame - 30, fps, config: { damping: 20, stiffness: 150 } });
  const url = interpolate(frame - 60, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const caret = frame % 24 < 14 ? 1 : 0.15;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(78% 52% at 50% 34%, #165062 0%, ${C.deep} 46%, ${C.deeper} 100%)`,
        alignItems: "center",
        paddingTop: 380,
      }}
    >
      <Sparkles count={26} seedShift={57} />

      <div
        style={{
          opacity: logo,
          transform: `translateY(${interpolate(logo, [0, 1], [26, 0])}px)`,
          filter: `drop-shadow(0 0 ${14 + glow * 18}px rgba(227,192,125,${0.3 + glow * 0.28}))`,
        }}
      >
        <Img src={staticFile("images/logo-palms-only.png")} style={{ width: 190 }} />
      </div>

      <div
        style={{
          marginTop: 18,
          fontFamily: display,
          fontSize: 96,
          color: C.shell,
          letterSpacing: interpolate(head, [0, 1], [24, 8]),
          opacity: head,
          textAlign: "center",
          lineHeight: 1.05,
        }}
      >
        Join the
        <br />
        launch list
      </div>

      {LINES.map((line, i) => {
        const o = interpolate(frame - (18 + i * 10), [0, 14], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={line}
            style={{
              marginTop: i === 0 ? 26 : 10,
              fontFamily: body,
              fontSize: i === 0 ? 40 : 30,
              letterSpacing: i === 0 ? 2 : 4,
              color: i === 0 ? "rgba(251,247,241,0.9)" : C.aqua,
              opacity: o,
              transform: `translateY(${interpolate(o, [0, 1], [16, 0])}px)`,
              textAlign: "center",
            }}
          >
            {line}
          </div>
        );
      })}

      <div
        style={{
          marginTop: 46,
          opacity: field,
          transform: `translateY(${interpolate(field, [0, 1], [30, 0])}px)`,
          width: 760,
          display: "flex",
          alignItems: "center",
          gap: 18,
          background: "rgba(251,247,241,0.08)",
          border: "2px solid rgba(251,247,241,0.35)",
          borderRadius: 999,
          padding: "26px 34px",
        }}
      >
        <div
          style={{
            fontFamily: body,
            fontSize: 34,
            color: "rgba(251,247,241,0.8)",
            letterSpacing: 1,
          }}
        >
          your@email.com
        </div>
        <div
          style={{
            width: 3,
            height: 38,
            background: C.aqua,
            opacity: caret,
          }}
        />
      </div>

      <div
        style={{
          marginTop: 22,
          opacity: field,
          transform: `scale(${interpolate(field, [0, 1], [0.9, 1])})`,
          background: C.shell,
          color: C.ink,
          borderRadius: 999,
          padding: "22px 62px",
          fontFamily: body,
          fontSize: 34,
          fontWeight: 500,
          letterSpacing: 3,
          textTransform: "uppercase",
          boxShadow: "0 18px 44px rgba(0,0,0,0.45)",
        }}
      >
        Count me in
      </div>

      <div
        style={{
          marginTop: 40,
          fontFamily: body,
          fontSize: 30,
          letterSpacing: 4,
          color: "rgba(251,247,241,0.7)",
          opacity: url,
        }}
      >
        play-pictaria.lovable.app
      </div>
    </AbsoluteFill>
  );
};
