import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { SceneOne } from "./scenes/SceneOne";
import { SceneTwo } from "./scenes/SceneTwo";
import { SceneThree } from "./scenes/SceneThree";
import { SceneFour } from "./scenes/SceneFour";
import { SceneFive } from "./scenes/SceneFive";
import { body, C } from "./theme";

export const MainVideo: React.FC = () => (
  <AbsoluteFill style={{ background: C.deeper, fontFamily: body }}>
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={145}>
        <SceneOne />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-bottom" })}
        timing={linearTiming({ durationInFrames: 12 })}
      />
      <TransitionSeries.Sequence durationInFrames={145}>
        <SceneTwo />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 12 })}
      />
      <TransitionSeries.Sequence durationInFrames={140}>
        <SceneThree />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: 12 })}
      />
      <TransitionSeries.Sequence durationInFrames={140}>
        <SceneFour />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 12 })}
      />
      <TransitionSeries.Sequence durationInFrames={135}>
        <SceneFive />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
);
