import { ArrayBufferTarget, Muxer } from "mp4-muxer";
import palmLogoUrl from "@/assets/logo-palms-only.png";

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

/** The finished clip lands at roughly this length, whatever the solve took. */
const TARGET_MS = 9000;
/** Keep the solved picture visible long enough for phones to capture it. */
const FINAL_HOLD_MS = 1400;
const RECORDER_WARMUP_MS = 150;
const RECORDER_FLUSH_MS = 300;

/**
 * The player's own rhythm, kept in proportion but stretched or squeezed so the
 * whole replay lasts about nine seconds.
 */
export function toBeats(frames: ReplayFrame[]): ReplayBeat[] {
  const MAX_PAUSE = 2500;
  let clock = 0;
  const raw = frames.map((f, i) => {
    if (i > 0) {
      const gap = f.t - frames[i - 1]!.t;
      clock += Math.min(Math.max(gap, 120), MAX_PAUSE);
    }
    return { pos: f.pos, at: clock };
  });

  const steps = Math.max(1, raw.length - 1);
  const glide = Math.min(700, Math.max(220, (TARGET_MS / steps) * 0.7));
  const span = clock;
  const replayWindow = Math.max(1200, TARGET_MS - glide);
  const scale = span > 0 ? replayWindow / span : 1;

  return raw.map((b, i) => ({
    pos: b.pos,
    at: Math.round(b.at * scale),
    glide: i === 0 ? 0 : glide,
  }));
}

const wait = (ms: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, ms));

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
 * iPhone Safari's MediaRecorder writes a streaming-style MP4 that the Photos
 * app refuses to accept ("Save Video" never appears in the share sheet). When
 * the device offers a hardware video encoder (WebCodecs), we instead write a
 * standard MP4 — the exact format Photos accepts, like the plumeria clip.
 */
interface HardwareEncoder {
  encodeFrame: (timestampUs: number) => void;
  finish: () => Promise<Blob | null>;
}

async function createHardwareEncoder(
  canvas: HTMLCanvasElement,
): Promise<HardwareEncoder | null> {
  if (
    typeof VideoEncoder === "undefined" ||
    typeof VideoFrame === "undefined"
  ) {
    return null;
  }

  const config: VideoEncoderConfig = {
    codec: "avc1.4d0028",
    width: CANVAS_W,
    height: CANVAS_H,
    bitrate: 5_000_000,
    framerate: 60,
  };

  try {
    const support = await VideoEncoder.isConfigSupported(config);
    if (!support.supported) return null;
  } catch {
    return null;
  }

  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: "avc", width: CANVAS_W, height: CANVAS_H },
    fastStart: "in-memory",
    firstTimestampBehavior: "offset",
  });

  let failed = false;
  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta ?? {}),
    error: () => {
      failed = true;
    },
  });
  encoder.configure(config);

  return {
    encodeFrame: (timestampUs: number) => {
      if (failed || encoder.state !== "configured") return;
      const frame = new VideoFrame(canvas, { timestamp: timestampUs });
      try {
        encoder.encode(frame);
      } catch {
        failed = true;
      }
      frame.close();
    },
    finish: async () => {
      if (failed) return null;
      try {
        await encoder.flush();
        encoder.close();
      } catch {
        return null;
      }
      muxer.finalize();
      const { buffer } = muxer.target as ArrayBufferTarget;
      return buffer.byteLength
        ? new Blob([buffer], { type: "video/mp4" })
        : null;
    },
  };
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

  // Prefer the hardware encoder: it produces the standard MP4 that phones
  // accept straight into Photos. MediaRecorder stays as the fallback.
  const hardware =
    img && ctx ? await createHardwareEncoder(canvas).catch(() => null) : null;

  const canRecord =
    !!hardware ||
    (!!img &&
      !!ctx &&
      typeof MediaRecorder !== "undefined" &&
      typeof canvas.captureStream === "function");

  let recorder: MediaRecorder | null = null;
  let stream: MediaStream | null = null;
  let requestCapturedFrame = () => {};
  const chunks: Blob[] = [];
  let finished: Promise<Blob> | null = null;
  let started: Promise<void> | null = null;

  if (canRecord && !hardware) {
    const mime = [
      "video/mp4;codecs=h264",
      "video/mp4;codecs=avc1.42E01E",
      "video/mp4;codecs=avc1",
      "video/mp4",
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
    ].find((m) => MediaRecorder.isTypeSupported?.(m));
    if (img && ctx) drawFrame(ctx, img, grid, beats[0]!.pos, undefined, 1);

    stream = canvas.captureStream(30);
    const [track] = stream.getVideoTracks();
    if (track && "requestFrame" in track) {
      const canvasTrack = track as CanvasCaptureMediaStreamTrack;
      requestCapturedFrame = () => canvasTrack.requestFrame();
    }
    recorder = new MediaRecorder(
      stream,
      mime ? { mimeType: mime, videoBitsPerSecond: 5_000_000 } : undefined,
    );
    recorder.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data);
    };
    const activeRecorder = recorder;
    finished = new Promise<Blob>((resolve) => {
      activeRecorder.onstop = () =>
        resolve(new Blob(chunks, { type: activeRecorder.mimeType || "video/webm" }));
    });
    started = new Promise<void>((resolve) => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        resolve();
      };
      activeRecorder.onstart = done;
      window.setTimeout(done, RECORDER_WARMUP_MS);
    });
    requestCapturedFrame();
    activeRecorder.start();
    await started;
    requestCapturedFrame();
    await wait(RECORDER_WARMUP_MS);
  }

  // Run the timeline: canvas gets smooth interpolation, the real board gets
  // each beat as it lands, then holds the final solved frame so the encoder
  // cannot cut off the last second of gameplay.
  await new Promise<void>((resolve) => {
    const start = performance.now();
    const finalBeat = beats[beats.length - 1]!;
    const animationEnd = finalBeat.at + finalBeat.glide;
    let lastIndex = -1;
      if (img && ctx) {
        drawFrame(ctx, img, grid, beats[0]!.pos, undefined, 1);
        requestCapturedFrame();
        hardware?.encodeFrame(0);
      }
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
      if (img && ctx) {
        if (elapsed >= animationEnd) drawFrame(ctx, img, grid, finalBeat.pos, undefined, 1);
        else drawFrame(ctx, img, grid, beat.pos, prev?.pos, eased);
        requestCapturedFrame();
        hardware?.encodeFrame(Math.round(elapsed * 1000));
      }
      if (elapsed < animationEnd + FINAL_HOLD_MS) requestAnimationFrame(step);
      else resolve();
    };
    requestAnimationFrame(step);
  });

  if (!recorder || !finished) {
    return { clip: null, error: "This browser can't record video. Try Chrome or Safari." };
  }

  // Give mobile encoders several explicit final frames before closing the file.
  const finalBeat = beats[beats.length - 1];
  if (img && ctx && finalBeat) {
    drawFrame(ctx, img, grid, finalBeat.pos, undefined, 1);
    for (let i = 0; i < 3; i++) {
      requestCapturedFrame();
      await wait(80);
    }
  }
  await wait(RECORDER_FLUSH_MS);
  if (recorder.state === "recording") {
    try {
      recorder.requestData();
    } catch {
      // Some mobile browsers only allow the final data request during stop().
    }
    recorder.stop();
  }
  const blob = await finished;
  stream?.getTracks().forEach((track) => track.stop());
  if (!blob.size) {
    return { clip: null, error: "The recording came out empty — please try once more." };
  }

  const recordedType = blob.type || recorder.mimeType || "";
  const ext = recordedType.includes("mp4") ? "mp4" : "webm";
  const type = ext === "mp4" ? "video/mp4" : "video/webm";
  const slug =
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "replay";
  return {
    clip: { url: URL.createObjectURL(blob), name: `pictaria-${slug}.${ext}`, blob, type },
  };
}
