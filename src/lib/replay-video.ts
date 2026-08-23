export interface ReplayFrame {
  /** ms since the puzzle began */
  t: number;
  /** pos[piece] = cell */
  pos: number[];
}

export interface ReplayBeat {
  pos: number[];
  at: number;
  glide: number;
}

const CANVAS_W = 750;
const CANVAS_H = 1000;
const BORDER = 4;

/**
 * The player's own rhythm, trimmed: the pause before each move is kept but
 * capped, so a long thoughtful solve still plays back as a watchable clip.
 */
export function toBeats(frames: ReplayFrame[]): ReplayBeat[] {
  const MAX_PAUSE = 900;
  const GLIDE = 300;
  let clock = 0;
  return frames.map((f, i) => {
    if (i > 0) {
      const gap = f.t - frames[i - 1]!.t;
      clock += Math.min(Math.max(gap, 90), MAX_PAUSE);
    }
    return { pos: f.pos, at: clock, glide: i === 0 ? 0 : GLIDE };
  });
}

/** Load the picture as a blob first: a remote image taints the canvas, and a
 *  tainted canvas makes captureStream() throw. */
async function loadImage(src: string): Promise<HTMLImageElement | null> {
  const load = (url: string, cors: boolean) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      if (cors) img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("image failed"));
      img.src = url;
    });
  try {
    const response = await fetch(src, { mode: "cors" });
    const blob = await response.blob();
    return await load(URL.createObjectURL(blob), false);
  } catch {
    try {
      return await load(src, true);
    } catch {
      return null;
    }
  }
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  grid: number,
  pos: number[],
  from: number[] | undefined,
  k: number,
) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  const a = img.naturalWidth / img.naturalHeight;
  const boardAspect = CANVAS_W / CANVAS_H;
  const bw = a > boardAspect ? CANVAS_H * a : CANVAS_W;
  const bh = a > boardAspect ? CANVAS_H : CANVAS_W / a;
  const bx = (CANVAS_W - bw) / 2;
  const by = (CANVAS_H - bh) / 2;

  const cw = CANVAS_W / grid;
  const ch = CANVAS_H / grid;

  pos.forEach((cell, piece) => {
    const pr = Math.floor(piece / grid);
    const pc = piece % grid;
    const sx = ((pc * CANVAS_W) / grid - bx) * (img.naturalWidth / bw);
    const sy = ((pr * CANVAS_H) / grid - by) * (img.naturalHeight / bh);
    const sw = cw * (img.naturalWidth / bw);
    const sh = ch * (img.naturalHeight / bh);

    const prev = from?.[piece] ?? cell;
    const lerp = (x: number, y: number) => x + (y - x) * k;
    const dx = lerp((prev % grid) * cw, (cell % grid) * cw);
    const dy = lerp(Math.floor(prev / grid) * ch, Math.floor(cell / grid) * ch);
    const moving = prev !== cell && k < 1;

    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, cw, ch);

    if (cell !== piece || moving) {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = BORDER;
      ctx.strokeRect(dx + BORDER / 2, dy + BORDER / 2, cw - BORDER, ch - BORDER);
    }
  });
}

export interface ReplayClip {
  url: string;
  name: string;
  blob: Blob;
  type: string;
}

/**
 * Replays the solve on the real board (through `onBeat`) while quietly
 * recording the same replay on an offscreen canvas, and hands back the clip.
 */
export async function recordReplay({
  src,
  grid,
  frames,
  title,
  onBeat,
}: {
  src: string;
  grid: number;
  frames: ReplayFrame[];
  title: string;
  onBeat: (pos: number[]) => void;
}): Promise<{ clip: ReplayClip | null; error?: string }> {
  const beats = toBeats(frames);
  if (!beats.length) return { clip: null, error: "No moves were recorded yet." };

  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext("2d");

  const canRecord =
    !!img &&
    !!ctx &&
    typeof MediaRecorder !== "undefined" &&
    typeof canvas.captureStream === "function";

  let recorder: MediaRecorder | null = null;
  let stream: MediaStream | null = null;
  const chunks: Blob[] = [];
  let finished: Promise<Blob> | null = null;

  if (canRecord) {
    const mime = [
      "video/mp4;codecs=avc1",
      "video/mp4",
      "video/webm;codecs=vp9",
      "video/webm",
    ].find((m) => MediaRecorder.isTypeSupported?.(m));
    stream = canvas.captureStream(30);
    recorder = new MediaRecorder(
      stream,
      mime ? { mimeType: mime, videoBitsPerSecond: 5_000_000 } : undefined,
    );
    recorder.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data);
    };
    finished = new Promise<Blob>((resolve) => {
      recorder!.onstop = () =>
        resolve(new Blob(chunks, { type: recorder!.mimeType || "video/webm" }));
    });
    recorder.start(100);
  }

  // Run the timeline: canvas gets smooth interpolation, the real board gets
  // each beat as it lands.
  await new Promise<void>((resolve) => {
    const start = performance.now();
    const span = beats[beats.length - 1]!.at;
    let lastIndex = -1;
    if (img && ctx) drawFrame(ctx, img, grid, beats[0]!.pos, undefined, 1);
    const step = () => {
      const elapsed = performance.now() - start;
      let index = 0;
      for (let i = 0; i < beats.length; i++) if (beats[i]!.at <= elapsed) index = i;
      const beat = beats[index]!;
      const prev = beats[index - 1];
      if (index !== lastIndex) {
        lastIndex = index;
        onBeat(beat.pos);
      }
      const k = beat.glide ? Math.min(1, (elapsed - beat.at) / beat.glide) : 1;
      const eased = 1 - Math.pow(1 - k, 3);
      if (img && ctx) drawFrame(ctx, img, grid, beat.pos, prev?.pos, eased);
      if (elapsed < span + 1400) requestAnimationFrame(step);
      else resolve();
    };
    requestAnimationFrame(step);
  });

  if (!recorder || !finished) {
    return { clip: null, error: "This browser can't record video. Try Chrome or Safari." };
  }

  // Give the encoder a beat to flush the final frames.
  await new Promise((resolve) => window.setTimeout(resolve, 250));
  recorder.stop();
  stream?.getTracks().forEach((track) => track.stop());
  const blob = await finished;
  if (!blob.size) {
    return { clip: null, error: "The recording came out empty — please try once more." };
  }

  const ext = (recorder.mimeType || "").includes("mp4") ? "mp4" : "webm";
  const type = ext === "mp4" ? "video/mp4" : "video/webm";
  const slug =
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "replay";
  return {
    clip: { url: URL.createObjectURL(blob), name: `pictaria-${slug}.${ext}`, blob, type },
  };
}
