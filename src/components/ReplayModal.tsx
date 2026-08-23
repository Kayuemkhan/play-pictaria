import { useCallback, useEffect, useRef, useState } from "react";

export interface ReplayFrame {
  /** ms since the puzzle began */
  t: number;
  /** pos[piece] = cell */
  pos: number[];
}

const CANVAS_W = 750;
const CANVAS_H = 1000;
const BORDER = 4;

/**
 * The white replay card: plays the player's own solve back at the exact tempo
 * they played it, and can hand them the same replay as a video file.
 */
export function ReplayModal({
  src,
  grid,
  frames,
  title,
  onClose,
  onShare,
}: {
  src: string;
  grid: number;
  frames: ReplayFrame[];
  title: string;
  onClose: () => void;
  onShare?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);

  /* load the picture once */
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setReady(true);
    };
    img.src = src;
  }, [src]);

  const drawFrame = useCallback(
    (pos: number[]) => {
      const canvas = canvasRef.current;
      const img = imgRef.current;
      if (!canvas || !img) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // cover-crop the photo into the 3:4 board
      const a = img.naturalWidth / img.naturalHeight;
      const boardAspect = CANVAS_W / CANVAS_H;
      const bw = a > boardAspect ? CANVAS_H * a : CANVAS_W;
      const bh = a > boardAspect ? CANVAS_H : CANVAS_W / a;
      const bx = (CANVAS_W - bw) / 2;
      const by = (CANVAS_H - bh) / 2;

      const cw = CANVAS_W / grid;
      const ch = CANVAS_H / grid;

      pos.forEach((cell, piece) => {
        const row = Math.floor(cell / grid);
        const col = cell % grid;
        const pr = Math.floor(piece / grid);
        const pc = piece % grid;

        // source rect inside the cover-cropped photo
        const sx = ((pc * CANVAS_W) / grid - bx) * (img.naturalWidth / bw);
        const sy = ((pr * CANVAS_H) / grid - by) * (img.naturalHeight / bh);
        const sw = cw * (img.naturalWidth / bw);
        const sh = ch * (img.naturalHeight / bh);

        const dx = col * cw;
        const dy = row * ch;

        ctx.drawImage(img, sx, sy, sw, sh, dx, dy, cw, ch);

        const home = cell === piece;
        if (!home) {
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = BORDER;
          ctx.strokeRect(
            dx + BORDER / 2,
            dy + BORDER / 2,
            cw - BORDER,
            ch - BORDER,
          );
        }
      });
    },
    [grid],
  );

  /** run the timeline, calling back on every animation frame */
  const runTimeline = useCallback(
    (onDone: () => void) => {
      if (!frames.length) {
        onDone();
        return () => {};
      }
      const start = performance.now();
      const span = frames[frames.length - 1]!.t;
      let raf = 0;
      let index = -1;
      const step = () => {
        const elapsed = performance.now() - start;
        let next = 0;
        for (let i = 0; i < frames.length; i++) {
          if (frames[i]!.t <= elapsed) next = i;
        }
        if (next !== index) {
          index = next;
          drawFrame(frames[index]!.pos);
        }
        if (elapsed < span + 1400) {
          raf = requestAnimationFrame(step);
        } else {
          onDone();
        }
      };
      drawFrame(frames[0]!.pos);
      raf = requestAnimationFrame(step);
      return () => cancelAnimationFrame(raf);
    },
    [frames, drawFrame],
  );

  /* looping preview */
  const [loop, setLoop] = useState(0);
  useEffect(() => {
    if (!ready || saving) return;
    const stop = runTimeline(() => setLoop((v) => v + 1));
    return stop;
  }, [ready, saving, loop, runTimeline]);

  const download = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || saving) return;
    setSaving(true);

    const mime = [
      "video/mp4;codecs=avc1",
      "video/mp4",
      "video/webm;codecs=vp9",
      "video/webm",
    ].find((m) => MediaRecorder.isTypeSupported?.(m));

    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(
      stream,
      mime ? { mimeType: mime, videoBitsPerSecond: 5_000_000 } : undefined,
    );
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data);
    };

    const finished = new Promise<Blob>((resolve) => {
      recorder.onstop = () =>
        resolve(new Blob(chunks, { type: recorder.mimeType || "video/webm" }));
    });

    recorder.start(100);
    await new Promise<void>((resolve) => {
      runTimeline(() => resolve());
    });
    recorder.stop();
    const blob = await finished;

    const ext = (recorder.mimeType || "").includes("mp4") ? "mp4" : "webm";
    const name = `pictaria-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "replay"}.${ext}`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 4000);
    setSaving(false);
  }, [runTimeline, saving, title]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-deep/70 px-4 py-6">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0"
      />
      <div className="relative max-h-full w-full max-w-sm overflow-y-auto rounded-[22px] bg-white p-4 shadow-lift">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="w-full rounded-[14px] bg-white"
        />

        <p className="mt-4 text-center text-[0.72rem] leading-relaxed text-neutral-600">
          Pictaria remembers how you played. When your picture comes together,
          tap record to keep the replay and share it anywhere.
        </p>

        <div className="mt-4 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => void download()}
            disabled={saving || !ready}
            className="w-full rounded-full border border-neutral-400 px-6 py-2 text-[0.62rem] tracking-[0.18em] text-neutral-700 uppercase transition-colors hover:bg-neutral-100 disabled:opacity-50"
          >
            {saving ? "…" : "Download"}
          </button>
          {onShare && (
            <button
              type="button"
              onClick={onShare}
              className="w-full rounded-full border border-neutral-300 px-6 py-2 text-[0.62rem] tracking-[0.18em] text-neutral-500 uppercase transition-colors hover:bg-neutral-100"
            >
              Share this Pictaria
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
