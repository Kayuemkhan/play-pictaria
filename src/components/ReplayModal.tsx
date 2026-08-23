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
  const [note, setNote] = useState<string | null>(null);

  /**
   * Load the picture once. The photo is fetched as a blob first: drawing a
   * remote image straight onto the canvas taints it, and a tainted canvas makes
   * captureStream() throw — which is why the recording silently never appeared.
   */
  useEffect(() => {
    let objectUrl = "";
    let cancelled = false;

    const load = (url: string, cors: boolean) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        if (cors) img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("image failed"));
        img.src = url;
      });

    (async () => {
      let img: HTMLImageElement | null = null;
      try {
        const response = await fetch(src, { mode: "cors" });
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        img = await load(objectUrl, false);
      } catch {
        try {
          img = await load(src, true);
        } catch {
          img = null;
        }
      }
      if (cancelled || !img) return;
      imgRef.current = img;
      setReady(true);
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);



  const drawFrame = useCallback(
    (pos: number[], from?: number[], k = 1) => {
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
        const pr = Math.floor(piece / grid);
        const pc = piece % grid;

        // source rect inside the cover-cropped photo
        const sx = ((pc * CANVAS_W) / grid - bx) * (img.naturalWidth / bw);
        const sy = ((pr * CANVAS_H) / grid - by) * (img.naturalHeight / bh);
        const sw = cw * (img.naturalWidth / bw);
        const sh = ch * (img.naturalHeight / bh);

        // slide from the previous cell to this one, so a move reads as a move
        const prev = from?.[piece] ?? cell;
        const lerp = (x: number, y: number) => x + (y - x) * k;
        const dx = lerp((prev % grid) * cw, (cell % grid) * cw);
        const dy = lerp(Math.floor(prev / grid) * ch, Math.floor(cell / grid) * ch);
        const moving = prev !== cell && k < 1;

        ctx.drawImage(img, sx, sy, sw, sh, dx, dy, cw, ch);

        if (cell !== piece || moving) {
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

  /**
   * The player's own rhythm, trimmed: the pause before each move is kept but
   * capped, so a long thoughtful solve still plays back as a watchable clip.
   */
  const beats = useRef<{ pos: number[]; at: number; glide: number }[]>([]);
  if (!beats.current.length && frames.length) {
    const MAX_PAUSE = 900;
    const GLIDE = 300;
    let clock = 0;
    beats.current = frames.map((f, i) => {
      if (i > 0) {
        const gap = f.t - frames[i - 1]!.t;
        clock += Math.min(Math.max(gap, 90), MAX_PAUSE);
      }
      return { pos: f.pos, at: clock, glide: i === 0 ? 0 : GLIDE };
    });
  }

  /** run the timeline, calling back when the replay reaches its end */
  const runTimeline = useCallback(
    (onDone: () => void) => {
      const list = beats.current;
      if (!list.length) {
        onDone();
        return () => {};
      }
      const start = performance.now();
      const span = list[list.length - 1]!.at;
      let raf = 0;
      const step = () => {
        const elapsed = performance.now() - start;
        let index = 0;
        for (let i = 0; i < list.length; i++) if (list[i]!.at <= elapsed) index = i;
        const beat = list[index]!;
        const prev = list[index - 1];
        const k = beat.glide
          ? Math.min(1, (elapsed - beat.at) / beat.glide)
          : 1;
        const eased = 1 - Math.pow(1 - k, 3);
        drawFrame(beat.pos, prev?.pos, eased);
        if (elapsed < span + 1600) {
          raf = requestAnimationFrame(step);
        } else {
          onDone();
        }
      };
      drawFrame(list[0]!.pos);
      raf = requestAnimationFrame(step);
      return () => cancelAnimationFrame(raf);
    },
    [drawFrame],
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
    const type = ext === "mp4" ? "video/mp4" : "video/webm";
    const name = `pictaria-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "replay"}.${ext}`;

    // 1) Native share sheet — lets the user tap "Save Video" so it lands in Photos.
    try {
      const file = new File([blob], name, { type });
      const nav = navigator as Navigator & {
        canShare?: (data: { files?: File[] }) => boolean;
      };
      if (nav.canShare?.({ files: [file] }) && nav.share) {
        await nav.share({ files: [file], title: `Pictaria — ${title}` });
        setSaving(false);
        return;
      }
    } catch {
      /* user cancelled or share unavailable — fall through to download */
    }

    // 2) Fallback: plain file download (desktop browsers).
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
          tap record to keep the replay and share it on any of your socials as a video.
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
