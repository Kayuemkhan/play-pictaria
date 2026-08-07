import { useEffect, useState } from "react";

type TrackId = "ocean" | "bowls" | "binaural" | "didgeridoo" | "meditation";

type Track = {
  id: TrackId;
  name: string;
  blurb: string;
  benefit: string;
};

const TRACKS: Track[] = [
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
    id: "didgeridoo",
    name: "Didgeridoo & Drum",
    blurb: "Earthy drone with a soft, unhurried heartbeat.",
    benefit:
      "Low drone and a slow drum near resting heart rate give the body a rhythm to sync with, grounding you when your thoughts feel scattered.",
  },
  {
    id: "meditation",
    name: "Stillness (Meditation)",
    blurb: "Slow, drifting chords with a distant shimmer of light.",
    benefit:
      "Soft, slowly changing harmony with no rhythm to follow lets attention widen and soften — the quiet, spacious feeling of a settled meditation.",
  },
];

function startMeditation(ctx: AudioContext, out: GainNode): Engine {
  const bus = ctx.createGain();
  bus.gain.value = 0.0001;
  bus.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 6);

  const warm = ctx.createBiquadFilter();
  warm.type = "lowpass";
  warm.frequency.value = 1600;
  warm.Q.value = 0.4;
  warm.connect(bus).connect(out);

  // Slow, drifting pad chords (A minor 9 / F major 9 feel)
  const chords = [
    [110, 164.81, 220, 329.63],
    [87.31, 130.81, 174.61, 261.63],
    [98, 146.83, 196, 293.66],
  ];

  const oscs: OscillatorNode[] = [];
  const gains: GainNode[] = [];
  for (let v = 0; v < 4; v += 1) {
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    const detune = ctx.createOscillator();
    detune.frequency.value = 0.07 + v * 0.013;
    const detuneGain = ctx.createGain();
    detuneGain.gain.value = 3.5;
    detune.connect(detuneGain).connect(osc.detune);
    detune.start();
    oscs.push(detune);

    const g = ctx.createGain();
    g.gain.value = 0.12 - v * 0.015;
    osc.connect(g).connect(warm);
    osc.frequency.value = chords[0]![v]!;
    osc.start();
    oscs.push(osc);
    gains.push(g);
  }

  let index = 0;
  const move = () => {
    index = (index + 1) % chords.length;
    const chord = chords[index]!;
    const t = ctx.currentTime;
    oscs
      .filter((o) => o.type === "triangle")
      .forEach((osc, v) => {
        osc.frequency.setTargetAtTime(chord[v]!, t, 3.5);
      });
  };
  const chordTimer = window.setInterval(move, 16000);

  // Distant shimmer: rare, high, very soft bell-like tones
  const shimmer = () => {
    const t = ctx.currentTime + 0.1;
    const base = chords[index]![Math.floor(Math.random() * 4)]! * 4;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = base;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.035, t + 1.6);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 7);
    osc.connect(g).connect(out);
    osc.start(t);
    osc.stop(t + 7.5);
  };
  const shimmerTimer = window.setInterval(shimmer, 11000);

  return {
    stop: () => {
      window.clearInterval(chordTimer);
      window.clearInterval(shimmerTimer);
      try {
        oscs.forEach((o) => o.stop());
      } catch {
        /* already stopped */
      }
    },
  };
}


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


const STARTERS: Record<TrackId, (ctx: AudioContext, out: GainNode) => Engine> = {
  ocean: startOcean,
  bowls: startBowls,
  binaural: startBinaural,
  didgeridoo: startDidgeridoo,
  meditation: startMeditation,
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
              <div className="flex items-center justify-between gap-3">
                <span className="font-body text-sm font-light tracking-[0.06em] text-shell">
                  {track.name}
                </span>
                <button
                  type="button"
                  onClick={() => void playMindfulTrack(track.id)}
                  aria-pressed={active}
                  aria-label={`${active ? "Turn off" : "Turn on"} ${track.name}`}
                  className={`flex h-6 w-12 shrink-0 items-center rounded-full border px-0.5 transition-colors ${
                    active
                      ? "justify-end border-accent bg-accent/40"
                      : "justify-start border-accent/40 bg-deep"
                  }`}
                >
                  <span
                    className={`h-4.5 w-4.5 rounded-full transition-colors ${
                      active ? "bg-accent" : "bg-accent/40"
                    }`}
                  />
                </button>
              </div>
              <span className="mt-1 block font-body text-[0.6rem] tracking-[0.18em] text-accent uppercase">
                {active ? "On" : "Off"}
              </span>
              <span className="mt-1.5 block font-body text-xs leading-relaxed font-light text-shell/70">
                {track.blurb}
              </span>
              <span className="mt-2 block font-body text-[0.7rem] leading-relaxed font-light text-accent/80">
                {track.benefit}
              </span>
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
    </div>
  );
}

/** Small floating control shown anywhere in the app while a track plays. */
export function MindfulMiniPlayer() {
  const { playing } = useMindfulPlayer();
  if (!playing) return null;
  const track = TRACKS.find((t) => t.id === playing);
  return (
    <div className="pointer-events-auto fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-accent/40 bg-deep/90 px-4 py-2 shadow-soft backdrop-blur-md">
      <div className="flex items-center gap-3">
        <span aria-hidden className="text-accent">
          ♪
        </span>
        <span className="font-body text-[0.7rem] font-light tracking-[0.08em] text-shell/85">
          {track?.name}
        </span>
        <button
          type="button"
          onClick={stopMindfulTrack}
          className="font-body text-[0.6rem] tracking-[0.18em] text-accent uppercase"
        >
          Stop
        </button>
      </div>
    </div>
  );
}

