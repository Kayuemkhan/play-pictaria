import { useEffect, useRef, useState } from "react";
import { Video, Download, Loader2 } from "lucide-react";

/**
 * Records this Pictaria coming together as a shareable video clip.
 *
 * Nothing is captured from the screen — the tiles are re-drawn onto a canvas
 * (framed like the actual puzzle page, with the title, the collection and the
 * counters) and that canvas is recorded, so there is no browser permission
 * dialog and the clip is always clean and social-ready. The replay runs full
 * screen at the same tempo the player actually played.
 */
export interface SolveFrame {
  pos: number[];
  at: number;
}

export interface RecordPlayButtonProps {
  /** The photograph being puzzled. */
  src: string;
  /** Tiles per side. */
  grid: number;
  /** True once the player has finished this Pictaria. */
  solved?: boolean;
  /** True once the player has made at least one move. */
  hasMoves?: boolean;
  /** Every board state the player passed through, with its timestamp. */
  getHistory?: () => SolveFrame[];
  /** Name of the picture, drawn at the top of the clip. */
  photoTitle?: string | undefined;
  /** Collection the picture came from, drawn under the board. */
  collectionName?: string | undefined;
}

const OUT_W = 720;
const BOARD_H = 960;
const HEAD_H = 118;
const FOOT_H = 122;
const OUT_H = HEAD_H + BOARD_H + FOOT_H;
const PAD = 22;
const STEP_MS = 320;
const HOLD_MS = 1600;
/** the whole clip stays inside this, however long the real solve took */
const MAX_CLIP_MS = 60000;

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

const clock = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export function RecordPlayButton({
  src,
  grid,
  solved = false,
  hasMoves = false,
  getHistory,
  photoTitle,
  collectionName,
}: RecordPlayButtonProps) {
  const [state, setState] = useState<
    "idle" | "info" | "working" | "ready" | "playing"
  >("idle");
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

  // The camera stays visible the whole time; the video needs a played game.
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

      // board sits inside the page frame
      const boardW = OUT_W - PAD * 2;
      const boardH = BOARD_H - PAD * 2;
      const boardX = PAD;
      const boardY = HEAD_H + PAD;

      // source crop keeps the picture at 3:4 like the board
      const srcAspect = img.width / img.height;
      const outAspect = boardW / boardH;
      let sw = img.width;
      let sh = img.height;
      if (srcAspect > outAspect) sw = img.height * outAspect;
      else sh = img.width / outAspect;
      const sx = (img.width - sw) / 2;
      const sy = (img.height - sh) / 2;

      const total = grid * grid;
      const tileW = boardW / grid;
      const tileH = boardH / grid;
      const stW = sw / grid;
      const stH = sh / grid;

      const history = (getHistory?.() ?? []).filter(
        (f) => f.pos.length === total,
      );
      const replay = history.length > 1;
      let pos = replay ? [...history[0]!.pos] : shuffle(total);
      const queue = replay ? [] : clumpOrder(pos, grid);

      const startedAt = replay ? history[0]!.at : Date.now();
      let movesShown = 0;
      let elapsedMs = 0;

      const cellXY = (cell: number) => ({
        x: boardX + (cell % grid) * tileW,
        y: boardY + Math.floor(cell / grid) * tileH,
      });

      const drawChrome = () => {
        // page background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, OUT_W, OUT_H);

        ctx.textAlign = "center";
        // size label + title, like the puzzle header
        ctx.fillStyle = "rgba(15,42,54,0.45)";
        ctx.font = "500 22px 'Inter', system-ui, sans-serif";
        ctx.fillText(`${grid} × ${grid}`, OUT_W / 2, 40);
        ctx.fillStyle = "#0f2a36";
        ctx.font = "400 46px 'Cormorant Garamond', Georgia, serif";
        ctx.fillText(photoTitle || "Pictaria", OUT_W / 2, 92);

        // footer: collection + counters
        const fy = HEAD_H + BOARD_H;
        if (collectionName) {
          ctx.fillStyle = "rgba(15,42,54,0.4)";
          ctx.font = "500 19px 'Inter', system-ui, sans-serif";
          ctx.fillText("COLLECTION", OUT_W / 2, fy + 30);
          ctx.fillStyle = "#0f7f8c";
          ctx.font = "400 34px 'Cormorant Garamond', Georgia, serif";
          ctx.fillText(collectionName, OUT_W / 2, fy + 66);
        }
        ctx.fillStyle = "rgba(15,42,54,0.5)";
        ctx.font = "500 21px 'Inter', system-ui, sans-serif";
        ctx.fillText(
          `${clock(elapsedMs / 1000)}   ·   ${movesShown} moves`,
          OUT_W / 2,
          fy + (collectionName ? 102 : 56),
        );
      };

      const drawFrame = (
        moving: { piece: number; from: number; to: number }[],
        t: number,
      ) => {
        drawChrome();
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

      /** hold the finished frame for a beat, like a real pause in play */
      const linger = (ms: number) =>
        new Promise<void>((resolve) => {
          if (ms <= 16) return resolve();
          const t0 = performance.now();
          const tick = () => {
            const done2 = performance.now() - t0 >= ms;
            drawFrame([], 1);
            if (!done2) requestAnimationFrame(tick);
            else resolve();
          };
          requestAnimationFrame(tick);
        });

      if (replay) {
        /* Play it back at the tempo the player actually played: each gap between
           two remembered board states is the real gap between their moves. Long
           pauses are trimmed, and the whole clip is scaled to stay shareable. */
        const gaps: number[] = [];
        for (let i = 1; i < history.length; i++) {
          gaps.push(
            Math.min(4000, Math.max(90, history[i]!.at - history[i - 1]!.at)),
          );
        }
        const realTotal = gaps.reduce((a, b) => a + b, 0);
        const scale = realTotal > MAX_CLIP_MS ? MAX_CLIP_MS / realTotal : 1;

        for (let i = 1; i < history.length; i++) {
          const next = history[i]!.pos;
          const gap = gaps[i - 1]! * scale;
          const moving = [] as { piece: number; from: number; to: number }[];
          for (let piece = 0; piece < total; piece++) {
            if (next[piece] !== pos[piece]) {
              moving.push({ piece, from: pos[piece]!, to: next[piece]! });
            }
          }
          const glideMs = Math.max(90, Math.min(gap, 420));
          if (moving.length) {
            movesShown++;
            elapsedMs = history[i]!.at - startedAt;
            await animate(moving, glideMs);
          }
          pos = [...next];
          await linger(gap - glideMs);
        }
      }

      for (const piece of queue) {
        if (pos[piece] === piece) continue;
        const other = pos.indexOf(piece);
        const from = pos[piece]!;
        const moving = [{ piece, from, to: piece }];
        if (other >= 0) moving.push({ piece: other, from: piece, to: from });
        movesShown++;
        elapsedMs += STEP_MS;
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
      // replay it full screen for them; the download waits for their tap
      setState("playing");
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
      ) : state === "ready" || state === "playing" ? (
        <button
          type="button"
          onClick={() => setState("playing")}
          aria-label="Watch your gameplay again"
          title="Watch your gameplay again"
          className="flex h-8 items-center px-0.5 text-primary"
        >
          <Download size={16} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setState(state === "info" ? "idle" : "info")}
          aria-label="Record my gameplay"
          title="Record my gameplay"
          className="flex h-8 items-center gap-1 px-0.5 text-muted-foreground/50 transition-colors hover:text-primary"
        >
          <Video size={16} />
        </button>
      )}

      {state === "info" && (
        <div className="absolute top-9 right-0 z-50 w-60 rounded-[8px] border border-border bg-card px-3 py-2.5 text-left text-[0.62rem] leading-relaxed text-muted-foreground shadow-soft">
          Pictaria remembers your gameplay. If you would like to post this on
          social media and share your moves as the picture comes together, just
          press this button after the game — you will watch it play back full
          screen, then you can download it to your photos.
          <div className="mt-2 flex items-center gap-3">
            {played ? (
              <button
                type="button"
                onClick={() => void record()}
                className="text-[0.55rem] tracking-[0.16em] text-primary uppercase"
              >
                Record my gameplay
              </button>
            ) : (
              <span className="text-[0.55rem] tracking-[0.16em] text-muted-foreground/60 uppercase">
                Play this puzzle
              </span>
            )}
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

      {/* Full-screen replay: fixed overlay so it fills the main screen
          rather than being trapped inside the puzzle toolbar. */}
      <div
        className={
          state === "working" || state === "playing"
            ? "fixed inset-0 z-[200] flex flex-col items-center justify-center gap-4 bg-black/90 px-4 py-6"
            : "pointer-events-none fixed -z-50 h-0 w-0 overflow-hidden opacity-0"
        }
      >
        <div
          ref={stageRef}
          className={
            state === "playing"
              ? "hidden"
              : "aspect-[3/5] max-h-[82vh] w-full max-w-md overflow-hidden rounded-[10px] bg-white"
          }
        />
        {state === "playing" && clip && (
          <video
            src={clip}
            autoPlay
            loop
            playsInline
            controls
            className="max-h-[80vh] w-full max-w-md rounded-[10px] bg-white object-contain"
          />
        )}
        <p className="text-[0.6rem] tracking-[0.18em] text-white/80 uppercase">
          {state === "playing" ? "Your gameplay" : "Making your video…"}
        </p>
        {state === "playing" && (
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => clip && void saveClip(clip, true)}
              className="text-[0.58rem] tracking-[0.18em] text-white uppercase"
            >
              Download / share
            </button>
            <button
              type="button"
              onClick={() => setState("ready")}
              className="text-[0.58rem] tracking-[0.18em] text-white/60 uppercase"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
