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

/** A soft, glassy chime with a gentle attack and long, elegant decay. */
function elegantChime(rootFreq: number, start: number, gain: number) {
  // Fewer, softer partials for a refined, unobtrusive tone
  const partials: [number, number, number][] = [
    [1.0, 0.85, 1.6], // warm fundamental
    [2.02, 0.22, 1.1], // breathy octave-ish
    [3.06, 0.08, 0.7], // faint shimmer
  ];
  partials.forEach(([mult, gMult, dur]) => {
    tone(rootFreq * mult, start, dur, gain * gMult, "sine");
    // Very subtle detuned sister for airiness
    tone(rootFreq * mult * 1.002, start + 0.008, dur * 0.85, gain * gMult * 0.18, "sine");
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
  // Lower, softer chime — more like a distant glass bell than a bright ting
  elegantChime(659.25, 0, 0.045);
  buzz(14);
}

/** Puzzle completed. */
export function playSolved() {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
    tone(f, i * 0.11, 0.42, 0.14),
  );
  buzz([35, 60, 35, 60, 140]);
}

export function playPick() {
  tone(392, 0, 0.04, 0.035);
}
