import { useEffect, useRef, useState } from "react";

type TrackId = "ocean" | "bowls" | "binaural" | "didgeridoo";

type Track = {
  id: TrackId;
  name: string;
  blurb: string;
};

const TRACKS: Track[] = [
  {
    id: "ocean",
    name: "Ocean & Birdsong",
    blurb: "Slow shore break with distant birds at first light.",
  },
  {
    id: "bowls",
    name: "Singing Bowls",
    blurb: "Warm struck bowls ringing into long, open silence.",
  },
  {
    id: "binaural",
    name: "Binaural Meditation",
    blurb: "A gentle theta pulse between the ears. Headphones welcome.",
  },
  {
    id: "didgeridoo",
    name: "Didgeridoo & Drum",
    blurb: "Earthy drone with a soft, unhurried heartbeat.",
  },
];

type Engine = {
  stop: () => void;
};

function makeNoiseBuffer(ctx: AudioContext, seconds = 4) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i += 1) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.5;
  }
  return buffer;
}

function startOcean(ctx: AudioContext, out: GainNode): Engine {
  const noise = ctx.createBufferSource();
  noise.buffer = makeNoiseBuffer(ctx);
  noise.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 700;
  filter.Q.value = 0.4;

  const swell = ctx.createGain();
  swell.gain.value = 0.22;

  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.09;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.16;
  lfo.connect(lfoGain).connect(swell.gain);

  noise.connect(filter).connect(swell).connect(out);
  noise.start();
  lfo.start();

  // Seagull cries: harsh, nasal "kee-aah" calls that glide downward.
  const gull = (t: number, pitch: number, pan: number) => {
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    const g = ctx.createGain();
    const formant = ctx.createBiquadFilter();
    formant.type = "bandpass";
    formant.frequency.value = pitch * 3.2;
    formant.Q.value = 5;
    const shimmer = ctx.createBiquadFilter();
    shimmer.type = "highpass";
    shimmer.frequency.value = 500;
    const panner = ctx.createStereoPanner();
    panner.pan.value = pan;

    // rising squawk then a long falling wail
    osc.frequency.setValueAtTime(pitch * 0.8, t);
    osc.frequency.exponentialRampToValueAtTime(pitch * 1.25, t + 0.07);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.62, t + 0.42);

    // rapid warble gives the raspy gull texture
    const warble = ctx.createOscillator();
    warble.frequency.value = 22 + Math.random() * 8;
    const warbleGain = ctx.createGain();
    warbleGain.gain.value = pitch * 0.06;
    warble.connect(warbleGain).connect(osc.frequency);

    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.09, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.22);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.48);

    osc.connect(formant).connect(shimmer).connect(g).connect(panner).connect(out);
    osc.start(t);
    warble.start(t);
    osc.stop(t + 0.55);
    warble.stop(t + 0.55);
  };

  const birds = window.setInterval(() => {
    const now = ctx.currentTime + 0.1;
    const calls = 2 + Math.floor(Math.random() * 3);
    const pitch = 760 + Math.random() * 320;
    const pan = Math.random() * 1.6 - 0.8;
    for (let i = 0; i < calls; i += 1) {
      gull(now + i * (0.5 + Math.random() * 0.25), pitch * (1 - i * 0.04), pan);
    }
  }, 7000);


  return {
    stop: () => {
      window.clearInterval(birds);
      try {
        noise.stop();
        lfo.stop();
      } catch {
        /* already stopped */
      }
    },
  };
}

function startBowls(ctx: AudioContext, out: GainNode): Engine {
  const pad = ctx.createOscillator();
  pad.type = "sine";
  pad.frequency.value = 110;
  const padGain = ctx.createGain();
  padGain.gain.value = 0.04;
  pad.connect(padGain).connect(out);
  pad.start();

  const notes = [196, 233.08, 261.63, 293.66, 349.23];
  const strike = () => {
    const t = ctx.currentTime + 0.05;
    const root = notes[Math.floor(Math.random() * notes.length)] ?? 261.63;
    [1, 2.01, 2.98, 4.2].forEach((mult, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = root * mult;
      const peak = 0.16 / (i + 1.4);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + 0.12);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 7 - i * 0.8);
      osc.connect(g).connect(out);
      osc.start(t);
      osc.stop(t + 8);
    });
  };

  strike();
  const timer = window.setInterval(strike, 9000);

  return {
    stop: () => {
      window.clearInterval(timer);
      try {
        pad.stop();
      } catch {
        /* already stopped */
      }
    },
  };
}

function startBinaural(ctx: AudioContext, out: GainNode): Engine {
  const left = ctx.createOscillator();
  const right = ctx.createOscillator();
  left.type = "sine";
  right.type = "sine";
  left.frequency.value = 196;
  right.frequency.value = 202.5;

  const panL = ctx.createStereoPanner();
  panL.pan.value = -1;
  const panR = ctx.createStereoPanner();
  panR.pan.value = 1;

  const gL = ctx.createGain();
  gL.gain.value = 0.12;
  const gR = ctx.createGain();
  gR.gain.value = 0.12;

  left.connect(gL).connect(panL).connect(out);
  right.connect(gR).connect(panR).connect(out);

  const pad = ctx.createOscillator();
  pad.type = "triangle";
  pad.frequency.value = 98;
  const padFilter = ctx.createBiquadFilter();
  padFilter.type = "lowpass";
  padFilter.frequency.value = 500;
  const padGain = ctx.createGain();
  padGain.gain.value = 0.05;
  const breathe = ctx.createOscillator();
  breathe.frequency.value = 0.07;
  const breatheGain = ctx.createGain();
  breatheGain.gain.value = 0.03;
  breathe.connect(breatheGain).connect(padGain.gain);
  pad.connect(padFilter).connect(padGain).connect(out);

  left.start();
  right.start();
  pad.start();
  breathe.start();

  return {
    stop: () => {
      try {
        left.stop();
        right.stop();
        pad.stop();
        breathe.stop();
      } catch {
        /* already stopped */
      }
    },
  };
}

function startDidgeridoo(ctx: AudioContext, out: GainNode): Engine {
  const drone = ctx.createOscillator();
  drone.type = "sawtooth";
  drone.frequency.value = 73.42;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 380;
  filter.Q.value = 6;

  const wobble = ctx.createOscillator();
  wobble.frequency.value = 4.5;
  const wobbleGain = ctx.createGain();
  wobbleGain.gain.value = 160;
  wobble.connect(wobbleGain).connect(filter.frequency);

  const droneGain = ctx.createGain();
  droneGain.gain.value = 0.14;
  drone.connect(filter).connect(droneGain).connect(out);
  drone.start();
  wobble.start();

  const beat = () => {
    const t = ctx.currentTime + 0.05;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(48, t + 0.35);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    osc.connect(g).connect(out);
    osc.start(t);
    osc.stop(t + 0.6);
  };

  beat();
  const timer = window.setInterval(beat, 1800);

  return {
    stop: () => {
      window.clearInterval(timer);
      try {
        drone.stop();
        wobble.stop();
      } catch {
        /* already stopped */
      }
    },
  };
}

const STARTERS: Record<TrackId, (ctx: AudioContext, out: GainNode) => Engine> = {
  ocean: startOcean,
  bowls: startBowls,
  binaural: startBinaural,
  didgeridoo: startDidgeridoo,
};

export function MindfulMusic() {
  const [playing, setPlaying] = useState<TrackId | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const engineRef = useRef<Engine | null>(null);

  const stopAll = () => {
    engineRef.current?.stop();
    engineRef.current = null;
    setPlaying(null);
  };

  useEffect(() => () => engineRef.current?.stop(), []);

  const toggle = async (id: TrackId) => {
    if (playing === id) {
      stopAll();
      return;
    }
    engineRef.current?.stop();
    engineRef.current = null;

    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
      const master = ctxRef.current.createGain();
      master.gain.value = 0.9;
      master.connect(ctxRef.current.destination);
      masterRef.current = master;
    }
    const ctx = ctxRef.current;
    if (ctx.state === "suspended") await ctx.resume();

    engineRef.current = STARTERS[id](ctx, masterRef.current!);
    setPlaying(id);
  };

  return (
    <div className="mt-8">
      <h2 className="font-display text-lg tracking-[0.18em] text-accent uppercase">
        Choose your sound
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {TRACKS.map((track) => {
          const active = playing === track.id;
          return (
            <button
              key={track.id}
              type="button"
              onClick={() => void toggle(track.id)}
              aria-pressed={active}
              className={`rounded-[6px] border p-4 text-left transition-colors ${
                active
                  ? "border-accent bg-accent/15"
                  : "border-accent/30 bg-deep/70 hover:border-accent/60"
              }`}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="font-body text-sm font-light tracking-[0.06em] text-shell">
                  {track.name}
                </span>
                <span className="font-body text-[0.6rem] tracking-[0.18em] text-accent uppercase">
                  {active ? "Playing" : "Play"}
                </span>
              </span>
              <span className="mt-1.5 block font-body text-xs leading-relaxed font-light text-shell/70">
                {track.blurb}
              </span>
            </button>
          );
        })}
      </div>
      {playing ? (
        <button
          type="button"
          onClick={stopAll}
          className="mt-4 inline-flex items-center rounded-full border border-accent/40 px-5 py-2 font-body text-[0.65rem] tracking-[0.18em] text-shell/80 uppercase"
        >
          Stop sound
        </button>
      ) : null}
    </div>
  );
}
