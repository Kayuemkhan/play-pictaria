let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(value: boolean) {
  muted = value;
}

export function isMuted() {
  return muted;
}

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (muted) return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  freq: number,
  start: number,
  dur: number,
  gain: number,
  type: OscillatorType = "sine",
) {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime + start;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.018);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

/** A soft, inharmonic bell chime. */
function bellChime(rootFreq: number, start: number, gain: number) {
  // Bells have slightly stretched, non-integer partials
  const partials: [number, number, number][] = [
    [1.0, 0.9, 1.2], // fundamental
    [2.05, 0.5, 0.85], // tierce-ish
    [3.15, 0.28, 0.65], // quint-ish
    [4.35, 0.14, 0.5], // nominal
  ];
  partials.forEach(([mult, gMult, dur]) => {
    tone(rootFreq * mult, start, dur, gain * gMult, "sine");
    // Add a tiny detuned sister for shimmer
    tone(rootFreq * mult * 1.003, start + 0.005, dur * 0.9, gain * gMult * 0.25, "sine");
  });
}

function buzz(pattern: number | number[]) {
  if (muted) return;
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

/** A piece locking into another piece. */
export function playLock() {
  // Delicate, higher-pitched bell — airy, subtle, and quick
  bellChime(880, 0, 0.08);
  buzz(18);
}

/** Puzzle completed. */
export function playSolved() {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
    tone(f, i * 0.11, 0.42, 0.14),
  );
  buzz([35, 60, 35, 60, 140]);
}

export function playPick() {
  tone(440, 0, 0.05, 0.06);
}
