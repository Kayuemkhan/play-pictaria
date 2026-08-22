import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Video, Download, Loader2 } from "lucide-react";

/**
 * Records this Pictaria coming together as a shareable video clip.
 *
 * Nothing is captured from the screen — the tiles are re-drawn onto a canvas and
 * that canvas is recorded, so there is no browser permission dialog and the clip
 * is always clean, square-on and social-ready. The canvas is shown while it
 * records, so the player watches the replay happen.
 */
export interface RecordPlayButtonProps {
  /** The photograph being puzzled. */
  src: string;
  /** Tiles per side. */
  grid: number;
  /** True once the player has finished this Pictaria. */
  solved?: boolean;
  /** True once the player has made at least one move. */
  hasMoves?: boolean;
  /** Every board state the player passed through, in order. */
  getHistory?: () => number[][];
}

const OUT_W = 720;
const OUT_H = 960;
const STEP_MS = 320;
const HOLD_MS = 1400;

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function shuffle(count: number) {
  const a = Array.from({ length: count }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  if (a.every((cell, piece) => cell === piece)) return shuffle(count);
  return a;
}

/** clumpy, human-ish solve order rather than 1,2,3,4 top to bottom */
function clumpOrder(pos: number[], grid: number) {
  const remaining = new Set<number>();
  pos.forEach((cell, piece) => {
    if (cell !== piece) remaining.add(piece);
  });
  const order: number[] = [];
  const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]!;
  const neighbours = (p: number) => {
    const r = Math.floor(p / grid);
    const c = p % grid;
    const out: number[] = [];
    if (r > 0) out.push(p - grid);
    if (r < grid - 1) out.push(p + grid);
    if (c > 0) out.push(p - 1);
    if (c < grid - 1) out.push(p + 1);
    return out;
  };
  while (remaining.size) {
    const frontier = [pick([...remaining])];
    let budget = 2 + Math.floor(Math.random() * 4);
    while (frontier.length && budget > 0 && remaining.size) {
      const p = frontier.splice(Math.floor(Math.random() * frontier.length), 1)[0]!;
      if (!remaining.has(p)) continue;
      remaining.delete(p);
      order.push(p);
      budget--;
      for (const n of neighbours(p)) {
        if (remaining.has(n) && !frontier.includes(n)) frontier.push(n);
      }
    }
  }
  return order;
}

export function RecordPlayButton({
  src,
  grid,
  solved = false,
  hasMoves = false,
  getHistory,
}: RecordPlayButtonProps) {
  const [state, setState] = useState<"idle" | "info" | "working" | "ready">(
    "idle",
  );
  const [note, setNote] = useState<string | null>(null);
  const [clip, setClip] = useState<string | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const fileName = useRef("pictaria-solve.webm");

  useEffect(() => {
    if (clip) {
      setClip(null);
      setState("idle");
    }
    // a new picture or size means the old clip no longer matches
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, grid]);

  useEffect(
    () => () => {
      if (clip) URL.revokeObjectURL(clip);
    },
    [clip],
  );

  // The camera stays visible the whole time; the video itself needs a played game.
  const played = hasMoves || solved;



  const saveClip = async (url: string, viaGesture: boolean) => {
    try {
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], fileName.current, { type: blob.type });
      const nav = navigator as Navigator & {
        canShare?: (d: { files: File[] }) => boolean;
      };
      if (viaGesture && nav.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "My Pictaria",
          text: solved
            ? "Watch me solve this Pictaria 🌺"
            : "Watch this Pictaria come together 🌺",
        });
        return;
      }
    } catch {
      /* fall through to download */
    }
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.current;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    window.setTimeout(() => a.remove(), 0);
  };

  const record = async () => {
    setNote(null);
    if (typeof MediaRecorder === "undefined") {
      setNote("This browser can’t make video clips yet.");
      return;
    }
    setState("working");
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.crossOrigin = "anonymous";
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("image"));
        el.src = src;
      });

      const canvas = document.createElement("canvas");
      canvas.width = OUT_W;
      canvas.height = OUT_H;
      canvas.className = "h-full w-full object-contain";
      stageRef.current?.appendChild(canvas);
      const ctx = canvas.getContext("2d")!;
      const stream = canvas.captureStream(30);
      const mime = ["video/mp4", "video/webm;codecs=vp9", "video/webm"].find(
        (m) => MediaRecorder.isTypeSupported(m),
      );
      fileName.current = mime?.startsWith("video/mp4")
        ? "pictaria-solve.mp4"
        : "pictaria-solve.webm";
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      const done = new Promise<Blob>((resolve) => {
        rec.onstop = () => resolve(new Blob(chunks, { type: mime || "video/webm" }));
      });

      // source crop keeps the picture at 3:4 like the board
      const srcAspect = img.width / img.height;
      const outAspect = OUT_W / OUT_H;
      let sw = img.width;
      let sh = img.height;
      if (srcAspect > outAspect) sw = img.height * outAspect;
      else sh = img.width / outAspect;
      const sx = (img.width - sw) / 2;
      const sy = (img.height - sh) / 2;

      const total = grid * grid;
      const tileW = OUT_W / grid;
      const tileH = OUT_H / grid;
      const stW = sw / grid;
      const stH = sh / grid;

      /* If the player solved it themselves, replay their real moves. Otherwise
         fall back to a clumpy auto-complete. */
      const history = (getHistory?.() ?? []).filter((f) => f.length === total);
      const replay = solved && history.length > 1;
      let pos = replay ? [...history[0]!] : shuffle(total);
      const queue = replay ? [] : clumpOrder(pos, grid);

      const cellXY = (cell: number) => ({
        x: (cell % grid) * tileW,
        y: Math.floor(cell / grid) * tileH,
      });

      const drawFrame = (
        moving: { piece: number; from: number; to: number }[],
        t: number,
      ) => {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, OUT_W, OUT_H);
        const glide = easeInOut(t);
        for (let piece = 0; piece < total; piece++) {
          const m = moving.find((x) => x.piece === piece);
          const homeCell = m ? m.to : pos[piece]!;
          const start = m ? cellXY(m.from) : cellXY(pos[piece]!);
          const end = cellXY(homeCell);
          const x = start.x + (end.x - start.x) * glide;
          const y = start.y + (end.y - start.y) * glide;
          ctx.drawImage(
            img,
            sx + (piece % grid) * stW,
            sy + Math.floor(piece / grid) * stH,
            stW,
            stH,
            Math.round(x),
            Math.round(y),
            Math.ceil(tileW),
            Math.ceil(tileH),
          );
          const settled = homeCell === piece && (!m || glide > 0.98);
          if (!settled) {
            ctx.strokeStyle = "rgba(255,255,255,0.9)";
            ctx.lineWidth = 3;
            ctx.strokeRect(
              Math.round(x) + 1.5,
              Math.round(y) + 1.5,
              tileW - 3,
              tileH - 3,
            );
          }
        }
      };

      rec.start();
      drawFrame([], 0);

      const animate = (
        moving: { piece: number; from: number; to: number }[],
        stepMs = STEP_MS,
      ) =>
        new Promise<void>((resolve) => {
          const t0 = performance.now();
          const tick = () => {
            const t = Math.min(1, (performance.now() - t0) / stepMs);
            drawFrame(moving, t);
            if (t < 1) requestAnimationFrame(tick);
            else resolve();
          };
          requestAnimationFrame(tick);
        });

      if (replay) {
        // keep the clip social-length: sample long solves down to ~90 steps
        const stride = Math.max(1, Math.ceil((history.length - 1) / 90));
        const stepMs = Math.max(120, Math.min(STEP_MS, 9000 / (history.length / stride)));
        for (let i = stride; i < history.length; i += stride) {
          const next = history[Math.min(i, history.length - 1)]!;
          const moving = [] as { piece: number; from: number; to: number }[];
          for (let piece = 0; piece < total; piece++) {
            if (next[piece] !== pos[piece]) {
              moving.push({ piece, from: pos[piece]!, to: next[piece]! });
            }
          }
          if (moving.length) await animate(moving, stepMs);
          pos = [...next];
        }
        const last = history[history.length - 1]!;
        if (last.some((c, i) => c !== pos[i])) {
          const moving = last
            .map((to, piece) => ({ piece, from: pos[piece]!, to }))
            .filter((m) => m.from !== m.to);
          if (moving.length) await animate(moving, stepMs);
          pos = [...last];
        }
      }

      for (const piece of queue) {
        if (pos[piece] === piece) continue;
        const other = pos.indexOf(piece);
        const from = pos[piece]!;
        const moving = [{ piece, from, to: piece }];
        if (other >= 0) moving.push({ piece: other, from: piece, to: from });
        await animate(moving);
        const next = [...pos];
        next[piece] = piece;
        if (other >= 0) next[other] = from;
        pos = next;
      }

      drawFrame([], 1);
      await new Promise((r) => window.setTimeout(r, HOLD_MS));
      rec.stop();
      const blob = await done;
      stream.getTracks().forEach((t) => t.stop());
      canvas.remove();
      const url = URL.createObjectURL(blob);
      setClip(url);
      setState("ready");
      // download straight away so the clip lands in their photos/files
      await saveClip(url, false);
    } catch {
      setNote("Sorry — that clip couldn’t be made. Please try again.");
      setState("idle");
    }
  };

  return (
    <div className="relative flex items-center">
      {state === "working" ? (
        <span className="flex h-8 items-center px-0.5 text-primary">
          <Loader2 size={16} className="animate-spin" />
        </span>
      ) : state === "ready" ? (
        <button
          type="button"
          onClick={() => clip && void saveClip(clip, true)}
          aria-label="Save or share your video"
          title="Save or share your video"
          className="flex h-8 items-center px-0.5 text-primary"
        >
          <Download size={16} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setState(state === "info" ? "idle" : "info")}
          aria-label="Make a video of your gameplay"
          title="Make a video of your gameplay"
          className="flex h-8 items-center gap-1 px-0.5 text-muted-foreground/50 transition-colors hover:text-primary"
        >
          <Video size={16} />
        </button>
      )}

      {state === "info" && (
        <div className="absolute top-9 right-0 z-50 w-60 rounded-[8px] border border-border bg-card px-3 py-2.5 text-left text-[0.62rem] leading-relaxed text-muted-foreground shadow-soft">
          Pictaria remembers your gameplay. If you would like to post this on
          social media and share your moves as the picture comes together, just
          press this button after the game — you will watch it play back, and it
          will download.
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => void record()}
              className="text-[0.55rem] tracking-[0.16em] text-primary uppercase"
            >
              Make my video
            </button>
            <button
              type="button"
              onClick={() => setState("idle")}
              className="text-[0.55rem] tracking-[0.16em] text-muted-foreground/70 uppercase"
            >
              Not now
            </button>
          </div>
        </div>
      )}

      {note && (
        <div className="absolute top-9 right-0 z-50 w-52 rounded-[8px] border border-border bg-card px-3 py-2 text-left text-[0.62rem] leading-snug text-muted-foreground shadow-soft">
          {note}
          <button
            type="button"
            onClick={() => setNote(null)}
            className="mt-1.5 block text-[0.55rem] tracking-[0.16em] text-primary uppercase"
          >
            Got it
          </button>
        </div>
      )}

      {/* live view of the clip while it records */}
      <div
        className={
          state === "working"
            ? "fixed inset-0 z-[120] flex flex-col items-center justify-center gap-3 bg-black/85 px-6"
            : "hidden"
        }
      >
        <div
          ref={stageRef}
          className="aspect-[3/4] max-h-[74vh] w-full max-w-sm overflow-hidden rounded-[10px] bg-white"
        />
        <p className="text-[0.6rem] tracking-[0.18em] text-white/80 uppercase">
          Making your video…
        </p>
      </div>
    </div>
  );
}
