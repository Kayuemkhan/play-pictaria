import { useEffect, useState } from "react";

export type TrackId =
  | "ocean"
  | "bowls"
  | "binaural"
  | "binaural-4"
  | "binaural-6"
  | "binaural-10"
  | "binaural-15"
  | "binaural-20"
  | "binaural-528"
  | "didgeridoo"
  | "meditation"
  | "island-ambient"
  | "island-ukulele"
  | "island-guitar";

type Track = {
  id: TrackId;
  name: string;
  blurb: string;
  benefit: string;
};

export const TRACK_OPTIONS: { id: TrackId; name: string }[] = [
  { id: "island-ambient", name: "Tropical ʻUkulele" },
  { id: "island-ukulele", name: "Soft ʻUkulele" },
  { id: "island-guitar", name: "Two Guitars at Dusk" },
  { id: "ocean", name: "Ocean & Seagulls" },
  { id: "bowls", name: "Singing Bowls" },
  { id: "binaural", name: "Binaural Meditation" },
  { id: "binaural-4", name: "Sleep · 4 Hz" },
  { id: "binaural-6", name: "Memory · 6 Hz" },
  { id: "binaural-10", name: "Flow State · 10 Hz" },
  { id: "binaural-15", name: "Concentration · 15 Hz" },
  { id: "binaural-20", name: "Energy · 20 Hz" },
  { id: "binaural-528", name: "Repair · 528 Hz" },
  { id: "didgeridoo", name: "Didgeridoo & Drum" },
  { id: "meditation", name: "Meditation · 7.83 Hz" },
];

const TRACKS: Track[] = [
  {
    id: "island-ambient",
    name: "Tropical ʻUkulele",
    blurb:
      "Bright ʻukulele and marimba dancing lightly over a gentle island breeze.",
    benefit:
      "A soft-but-upbeat major-key groove lifts energy without jarring the focus — like sunshine on the puzzle board.",
  },
  {
    id: "island-ukulele",
    name: "Soft ʻUkulele",
    blurb: "Gentle ʻukulele with marimba and glockenspiel, light as trade wind.",
    benefit:
      "Warm plucked strings in a major key lift the mood without demanding attention — kind company while you play.",
  },
  {
    id: "island-guitar",
    name: "Two Guitars at Dusk",
    blurb:
      "Steel-string and classical guitar trading easy lines, slack-key calm.",
    benefit:
      "Sparse fingerpicked guitar at 68 beats a minute lets the breath lengthen and the shoulders drop.",
  },
  {
    id: "ocean",
    name: "Ocean & Seagulls",
    blurb: "Slow shore break with gulls calling over the water.",
    benefit:
      "Steady, unpredictable water sound masks sudden noise, which helps the nervous system stop scanning for threat and settle into rest.",
  },
  {
    id: "bowls",
    name: "Singing Bowls",
    blurb: "Warm struck bowls ringing into long, open silence.",
    benefit:
      "Long decaying tones slow the breath and lengthen the exhale — a simple way to nudge the body toward its calm, parasympathetic state.",
  },
  {
    id: "binaural",
    name: "Binaural Meditation",
    blurb: "A gentle theta pulse between the ears. Headphones welcome.",
    benefit:
      "A small pitch offset in each ear creates a slow pulse the brain follows, easing you toward the relaxed, drifting focus of meditation.",
  },
  {
    id: "binaural-4",
    name: "Sleep · 4 Hz",
    blurb: "4 Hz theta — deep sleep & healing.",
    benefit: "Supports the brainwave state linked to rest and recovery.",
  },
  {
    id: "binaural-6",
    name: "Memory · 6 Hz",
    blurb: "6 Hz theta — memory & visualization.",
    benefit: "Helps long-term memory consolidation and vivid mental imagery.",
  },
  {
    id: "binaural-10",
    name: "Flow State · 10 Hz",
    blurb: "10 Hz alpha — relaxed focus.",
    benefit: "Encourages the calm, alert state where anxiety drops and awareness stays open.",
  },
  {
    id: "binaural-15",
    name: "Concentration · 15 Hz",
    blurb: "15 Hz beta — active concentration.",
    benefit: "Sharpens logical thinking and alertness during demanding tasks.",
  },
  {
    id: "binaural-20",
    name: "Energy · 20 Hz",
    blurb: "20 Hz beta — energy & motivation.",
    benefit: "Boosts mental energy and reduces fatigue without feeling jarring.",
  },
  {
    id: "binaural-528",
    name: "Repair · 528 Hz",
    blurb: "528 Hz solfeggio — DNA repair & intention.",
    benefit: "Used for emotional release, intention-setting, and restorative meditation.",
  },
  {
    id: "didgeridoo",
    name: "Didgeridoo & Drum",
    blurb: "Earthy drone with a soft, unhurried heartbeat.",
    benefit:
      "Low drone and a slow drum near resting heart rate give the body a rhythm to sync with, grounding you when your thoughts feel scattered.",
  },
  {
    id: "meditation",
    name: "Meditation · 7.83 Hz",
    blurb: "7.83 Hz Schumann resonance over a 136.1 Hz Om carrier.",
    benefit:
      "7.83 Hz is the earth's own Schumann resonance — the frequency most associated with deep meditation, grounding, and the calm border between alpha and theta.",
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

type BinauralVoice = {
  /** base tone both ears share */
  carrier: number;
  /** difference between ears = entrainment frequency */
  beat: number;
  /** timbre of the carrier tones */
  wave?: OscillatorType;
  /** timbre of the bed underneath */
  padWave?: OscillatorType;
  /** how far below the carrier the bed sits (in octaves) */
  padOctaves?: number;
  /** brightness of the bed */
  padCutoff?: number;
  /** audible tremolo depth at the beat rate (0 = none) */
  pulse?: number;
  /** optional airy harmonic above the carrier */
  shimmer?: number;
  level?: number;
};

function startBinauralBeat(
  ctx: AudioContext,
  out: GainNode,
  voice: BinauralVoice
): Engine {
  const {
    carrier,
    beat,
    wave = "sine",
    padWave = "triangle",
    padOctaves = 1,
    padCutoff = 500,
    pulse = 0,
    shimmer = 0,
    level = 0.12,
  } = voice;

  const nodes: OscillatorNode[] = [];
  const left = ctx.createOscillator();
  const right = ctx.createOscillator();
  left.type = wave;
  right.type = wave;
  left.frequency.value = carrier - beat / 2;
  right.frequency.value = carrier + beat / 2;

  const panL = ctx.createStereoPanner();
  panL.pan.value = -1;
  const panR = ctx.createStereoPanner();
  panR.pan.value = 1;

  const gL = ctx.createGain();
  gL.gain.value = level;
  const gR = ctx.createGain();
  gR.gain.value = level;

  left.connect(gL).connect(panL).connect(out);
  right.connect(gR).connect(panR).connect(out);
  nodes.push(left, right);

  // Audible tremolo at the entrainment rate so each frequency has its own feel
  if (pulse > 0) {
    const trem = ctx.createOscillator();
    trem.type = "sine";
    trem.frequency.value = beat;
    const tremGain = ctx.createGain();
    tremGain.gain.value = level * pulse;
    trem.connect(tremGain);
    tremGain.connect(gL.gain);
    tremGain.connect(gR.gain);
    trem.start();
    nodes.push(trem);
  }

  // Soft bed underneath
  const pad = ctx.createOscillator();
  pad.type = padWave;
  pad.frequency.value = carrier / Math.pow(2, padOctaves);
  const padFilter = ctx.createBiquadFilter();
  padFilter.type = "lowpass";
  padFilter.frequency.value = padCutoff;
  const padGain = ctx.createGain();
  padGain.gain.value = 0.05;
  const breathe = ctx.createOscillator();
  breathe.frequency.value = 0.07;
  const breatheGain = ctx.createGain();
  breatheGain.gain.value = 0.03;
  breathe.connect(breatheGain).connect(padGain.gain);
  pad.connect(padFilter).connect(padGain).connect(out);
  pad.start();
  breathe.start();
  nodes.push(pad, breathe);

  // Airy harmonic for the brighter states
  if (shimmer > 0) {
    const high = ctx.createOscillator();
    high.type = "sine";
    high.frequency.value = carrier * 3;
    const highGain = ctx.createGain();
    highGain.gain.value = shimmer;
    high.connect(highGain).connect(out);
    high.start();
    nodes.push(high);
  }

  return {
    stop: () => {
      for (const n of nodes) {
        try {
          n.stop();
        } catch {
          /* already stopped */
        }
      }
    },
  };
}



function startBinaural(ctx: AudioContext, out: GainNode): Engine {
  return startBinauralBeat(ctx, out, {
    carrier: 196,
    beat: 6.5,
    padWave: "triangle",
    padCutoff: 500,
    pulse: 0.25,
  });
}

function startDidgeridoo(ctx: AudioContext, out: GainNode): Engine {
  // --- Drone: buzzing lip-reed tone with breath noise and moving formants ---
  const fundamental = 68.5; // low D-ish, classic didgeridoo drone
  const droneBus = ctx.createGain();
  droneBus.gain.value = 0.0001;
  droneBus.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 2.5);

  const oscs: OscillatorNode[] = [];
  // odd/even partials with sawtooth + square give the reedy buzz
  ([
    [1, 0.5, "sawtooth"],
    [2, 0.24, "square"],
    [3, 0.16, "sawtooth"],
    [5, 0.08, "square"],
  ] as const).forEach(([mult, level, type]) => {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = fundamental * mult;
    osc.detune.value = (Math.random() - 0.5) * 12;
    const g = ctx.createGain();
    g.gain.value = level;
    osc.connect(g).connect(droneBus);
    osc.start();
    oscs.push(osc);
  });

  // breath / air noise riding on the drone
  const breathNoise = ctx.createBufferSource();
  breathNoise.buffer = makeNoiseBuffer(ctx, 3);
  breathNoise.loop = true;
  const breathBand = ctx.createBiquadFilter();
  breathBand.type = "bandpass";
  breathBand.frequency.value = 900;
  breathBand.Q.value = 0.8;
  const breathGain = ctx.createGain();
  breathGain.gain.value = 0.06;
  breathNoise.connect(breathBand).connect(breathGain).connect(droneBus);
  breathNoise.start();

  // two vocal-tract formants that drift — the "wah-wah" didgeridoo character
  const f1 = ctx.createBiquadFilter();
  f1.type = "bandpass";
  f1.frequency.value = 300;
  f1.Q.value = 3.5;
  const f2 = ctx.createBiquadFilter();
  f2.type = "bandpass";
  f2.frequency.value = 1250;
  f2.Q.value = 4;
  const f1Gain = ctx.createGain();
  f1Gain.gain.value = 0.9;
  const f2Gain = ctx.createGain();
  f2Gain.gain.value = 0.45;

  const shape = ctx.createBiquadFilter();
  shape.type = "lowpass";
  shape.frequency.value = 2200;

  const droneOut = ctx.createGain();
  droneOut.gain.value = 0.26;

  droneBus.connect(f1).connect(f1Gain).connect(shape);
  droneBus.connect(f2).connect(f2Gain).connect(shape);
  droneBus.connect(droneOut); // keep some raw fundamental body
  shape.connect(droneOut);
  droneOut.connect(out);

  // slow tongue/jaw movement on the formants
  const mover = ctx.createOscillator();
  mover.frequency.value = 0.35;
  const moverGain = ctx.createGain();
  moverGain.gain.value = 140;
  mover.connect(moverGain).connect(f1.frequency);
  const mover2 = ctx.createOscillator();
  mover2.frequency.value = 0.23;
  const mover2Gain = ctx.createGain();
  mover2Gain.gain.value = 420;
  mover2.connect(mover2Gain).connect(f2.frequency);

  // breath pulse — the rhythmic push every couple of seconds
  const pulse = ctx.createOscillator();
  pulse.type = "sine";
  pulse.frequency.value = 0.45;
  const pulseGain = ctx.createGain();
  pulseGain.gain.value = 0.09;
  pulse.connect(pulseGain).connect(droneOut.gain);

  mover.start();
  mover2.start();
  pulse.start();

  // --- Frame drum: real membrane hits with a low boom and skin slap ---
  const drumBoom = (t: number, level: number, pitch: number) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    const g = ctx.createGain();
    osc.frequency.setValueAtTime(pitch * 2.1, t);
    osc.frequency.exponentialRampToValueAtTime(pitch, t + 0.09);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.7, t + 0.45);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(level, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    osc.connect(g).connect(out);
    osc.start(t);
    osc.stop(t + 0.6);

    // skin slap transient
    const slap = ctx.createBufferSource();
    slap.buffer = makeNoiseBuffer(ctx, 0.4);
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 1600;
    band.Q.value = 0.9;
    const sg = ctx.createGain();
    sg.gain.setValueAtTime(level * 0.5, t);
    sg.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
    slap.connect(band).connect(sg).connect(out);
    slap.start(t);
    slap.stop(t + 0.2);
  };

  // gentle 4-beat pattern: BOOM . ba . BOOM ba . .
  const pattern: Array<[number, number, number]> = [
    [0, 0.3, 62],
    [0.75, 0.1, 96],
    [1.5, 0.24, 62],
    [1.9, 0.12, 96],
    [2.6, 0.1, 88],
  ];
  const barLength = 3.2;
  const playBar = () => {
    const start = ctx.currentTime + 0.06;
    pattern.forEach(([offset, level, pitch]) => {
      drumBoom(start + offset, level, pitch);
    });
  };

  playBar();
  const timer = window.setInterval(playBar, barLength * 1000);

  return {
    stop: () => {
      window.clearInterval(timer);
      try {
        oscs.forEach((o) => o.stop());
        breathNoise.stop();
        mover.stop();
        mover2.stop();
        pulse.stop();
      } catch {
        /* already stopped */
      }
    },
  };
}

/**
 * Recorded pieces (Kevin MacLeod, incompetech.com — CC BY). Looped quietly
 * through the same master gain as the generated soundscapes.
 */
function startRecording(src: string, level = 0.55) {
  return (ctx: AudioContext, out: GainNode): Engine => {
    const el = new Audio(src);
    el.loop = true;
    el.crossOrigin = "anonymous";
    el.preload = "auto";
    const gain = ctx.createGain();
    gain.gain.value = level;
    const node = ctx.createMediaElementSource(el);
    node.connect(gain).connect(out);
    void el.play().catch(() => {
      /* blocked until a gesture; the toggle itself is a gesture */
    });
    return {
      stop: () => {
        try {
          el.pause();
          el.currentTime = 0;
          node.disconnect();
          gain.disconnect();
        } catch {
          /* already stopped */
        }
      },
    };
  };
}

const STARTERS: Record<TrackId, (ctx: AudioContext, out: GainNode) => Engine> = {
  ocean: startOcean,
  bowls: startBowls,
  binaural: startBinaural,
  // Each frequency gets its own carrier, timbre and pulse so they sound distinct
  "binaural-4": (ctx, out) =>
    startBinauralBeat(ctx, out, {
      carrier: 198,
      beat: 4,
      wave: "sine",
      padWave: "sine",
      padOctaves: 1,
      padCutoff: 420,
      pulse: 0.55,
      level: 0.16,
    }),
  "binaural-6": (ctx, out) =>
    startBinauralBeat(ctx, out, {
      carrier: 144,
      beat: 6,
      wave: "sine",
      padWave: "triangle",
      padOctaves: 1,
      padCutoff: 320,
      pulse: 0.4,
      shimmer: 0.012,
      level: 0.12,
    }),
  "binaural-10": (ctx, out) =>
    startBinauralBeat(ctx, out, {
      carrier: 220,
      beat: 10,
      wave: "triangle",
      padWave: "sine",
      padOctaves: 2,
      padCutoff: 600,
      pulse: 0.3,
      shimmer: 0.02,
      level: 0.11,
    }),
  "binaural-15": (ctx, out) =>
    startBinauralBeat(ctx, out, {
      carrier: 288,
      beat: 15,
      wave: "sine",
      padWave: "sawtooth",
      padOctaves: 2,
      padCutoff: 700,
      pulse: 0.22,
      shimmer: 0.016,
      level: 0.1,
    }),
  "binaural-20": (ctx, out) =>
    startBinauralBeat(ctx, out, {
      carrier: 330,
      beat: 20,
      wave: "triangle",
      padWave: "square",
      padOctaves: 3,
      padCutoff: 900,
      pulse: 0.2,
      shimmer: 0.024,
      level: 0.1,
    }),
  "binaural-528": (ctx, out) =>
    startBinauralBeat(ctx, out, {
      carrier: 528,
      beat: 0.5,
      wave: "sine",
      padWave: "sine",
      padOctaves: 1,
      padCutoff: 1200,
      pulse: 0,
      shimmer: 0.01,
      level: 0.09,
    }),

  didgeridoo: startDidgeridoo,
  // 7.83 Hz Schumann resonance — the classic meditation frequency
  meditation: (ctx, out) =>
    startBinauralBeat(ctx, out, {
      carrier: 136.1,
      beat: 7.83,
      wave: "sine",
      padWave: "triangle",
      padOctaves: 2,
      padCutoff: 480,
      pulse: 0.35,
      shimmer: 0.012,
      level: 0.14,
    }),

  "island-ambient": startRecording("/audio/island-meet-and-greet.mp3", 0.45),
  "island-ukulele": startRecording("/audio/carefree.mp3", 0.45),
  "island-guitar": startRecording("/audio/clear-air.mp3", 0.55),
};

/* ---------------------------------------------------------------
   Module-level player so a soundscape keeps playing while you move
   between pages and solve puzzles.
---------------------------------------------------------------- */
type Store = {
  ctx: AudioContext | null;
  master: GainNode | null;
  engine: Engine | null;
  playing: TrackId | null;
  /** Last track the listener chose, remembered even while paused. */
  selected: TrackId | null;
  listeners: Set<() => void>;
};

const SELECTED_KEY = "pictaria.mindful.selected";

const store: Store = {
  ctx: null,
  master: null,
  engine: null,
  playing: null,
  selected: null,
  listeners: new Set(),
};

function emit() {
  store.listeners.forEach((fn) => fn());
}

function readSelected(): TrackId | null {
  if (store.selected) return store.selected;
  if (typeof window === "undefined") return null;
  const saved = window.localStorage.getItem(SELECTED_KEY) as TrackId | null;
  if (saved && TRACKS.some((t) => t.id === saved)) {
    store.selected = saved;
    return saved;
  }
  return null;
}

export function stopMindfulTrack() {
  store.engine?.stop();
  store.engine = null;
  store.playing = null;
  emit();
}

export async function playMindfulTrack(id: TrackId) {
  if (store.playing === id) {
    stopMindfulTrack();
    return;
  }
  store.engine?.stop();
  store.engine = null;

  if (!store.ctx) {
    store.ctx = new AudioContext();
    const master = store.ctx.createGain();
    master.gain.value = 0.9;
    master.connect(store.ctx.destination);
    store.master = master;
  }
  if (store.ctx.state === "suspended") await store.ctx.resume();

  store.engine = STARTERS[id](store.ctx, store.master!);
  store.playing = id;
  store.selected = id;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SELECTED_KEY, id);
  }
  emit();
}

/** Turn the chosen soundscape on or off from anywhere (e.g. a puzzle). */
export async function toggleMindfulMusic() {
  if (store.playing) {
    stopMindfulTrack();
    return;
  }
  const id = readSelected() ?? "ocean";
  await playMindfulTrack(id);
}

export function useMindfulPlayer() {
  const [state, setState] = useState<{
    playing: TrackId | null;
    selected: TrackId | null;
  }>({ playing: store.playing, selected: store.selected });
  useEffect(() => {
    const listener = () =>
      setState({ playing: store.playing, selected: readSelected() });
    store.listeners.add(listener);
    listener();
    return () => {
      store.listeners.delete(listener);
    };
  }, []);
  return state;
}

export function trackName(id: TrackId | null) {
  return TRACKS.find((t) => t.id === id)?.name ?? null;
}


export function MindfulMusic() {
  const { playing, selected } = useMindfulPlayer();

  return (
    <div className="mt-8">
      <h2 className="font-display text-lg tracking-[0.18em] text-accent uppercase">
        Choose your sound
      </h2>
      <p className="mt-2 font-body text-xs leading-relaxed font-light text-shell/70">
        Switch a sound on here and it keeps playing while you solve. Inside a
        puzzle, the note button at the top turns it on and off.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {TRACKS.map((track) => {
          const active = playing === track.id;
          const chosen = selected === track.id;
          return (
            <div
              key={track.id}
              className={`rounded-[6px] border p-4 transition-colors ${
                active
                  ? "border-accent bg-accent/15"
                  : chosen
                    ? "border-accent/60 bg-deep/70"
                    : "border-accent/30 bg-deep/70"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className="font-body text-sm font-light tracking-[0.06em] text-shell">
                    {track.name}
                  </span>
                  <span className="mt-1.5 block font-body text-xs leading-relaxed font-light text-shell/70">
                    {track.blurb}
                  </span>
                  <span className="mt-2 block font-body text-[0.7rem] leading-relaxed font-light text-accent/80">
                    {track.benefit}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => void playMindfulTrack(track.id)}
                  aria-pressed={active}
                  aria-label={`${active ? "Turn off" : "Turn on"} ${track.name}`}
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
                    active
                      ? "border-accent bg-accent text-deep"
                      : "border-accent/40 bg-deep text-accent/70"
                  }`}
                >
                  <span className="font-body text-[0.55rem] font-medium tracking-[0.04em] uppercase">
                    {active ? "On" : "Off"}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {playing ? (
        <button
          type="button"
          onClick={stopMindfulTrack}
          className="mt-4 inline-flex items-center rounded-full border border-accent/40 px-5 py-2 font-body text-[0.65rem] tracking-[0.18em] text-shell/80 uppercase"
        >
          Stop sound
        </button>
      ) : null}

      <p className="mt-6 font-body text-[0.62rem] leading-relaxed font-light text-shell/45">
        Tropical ʻUkulele, Soft ʻUkulele and Two Guitars at Dusk are recorded
        pieces by Kevin MacLeod (incompetech.com), used under Creative Commons
        Attribution. The rest are generated live inside Pictaria.
      </p>
    </div>

  );
}


