import { useEffect, useRef, useState } from "react";
import { Video, Square, Download } from "lucide-react";

/**
 * Lets a player record themselves solving a Pictaria so they can post the clip
 * to social media. Uses the browser's screen-capture recorder where available;
 * on devices without it we say so gently instead of pretending.
 */
export function RecordPlayButton() {
  const [state, setState] = useState<"idle" | "recording" | "ready">("idle");
  const [note, setNote] = useState<string | null>(null);
  const [clip, setClip] = useState<string | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const stream = useRef<MediaStream | null>(null);
  const fileName = useRef("pictaria.webm");

  useEffect(() => {
    return () => {
      stream.current?.getTracks().forEach((t) => t.stop());
      if (clip) URL.revokeObjectURL(clip);
    };
  }, [clip]);

  const stop = () => {
    recorder.current?.stop();
    stream.current?.getTracks().forEach((t) => t.stop());
  };

  const start = async () => {
    setNote(null);
    const media = navigator.mediaDevices as
      | (MediaDevices & {
          getDisplayMedia?: (c: unknown) => Promise<MediaStream>;
        })
      | undefined;
    if (!media?.getDisplayMedia || typeof MediaRecorder === "undefined") {
      setNote(
        "Recording isn’t available in this browser. On a phone, use your screen recorder — then share the clip.",
      );
      return;
    }
    try {
      const s = await media.getDisplayMedia({
        video: { frameRate: 30 },
        audio: false,
      });
      stream.current = s;
      const mime = ["video/mp4", "video/webm;codecs=vp9", "video/webm"].find(
        (m) => MediaRecorder.isTypeSupported(m),
      );
      fileName.current = mime?.startsWith("video/mp4")
        ? "pictaria.mp4"
        : "pictaria.webm";
      const rec = new MediaRecorder(s, mime ? { mimeType: mime } : undefined);
      chunks.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) chunks.current.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunks.current, {
          type: mime || "video/webm",
        });
        if (clip) URL.revokeObjectURL(clip);
        setClip(URL.createObjectURL(blob));
        setState("ready");
      };
      s.getVideoTracks()[0]?.addEventListener("ended", () => stop());
      rec.start(1000);
      recorder.current = rec;
      setState("recording");
    } catch {
      setNote("Recording was cancelled.");
      setState("idle");
    }
  };

  const share = async () => {
    if (!clip) return;
    try {
      const blob = await (await fetch(clip)).blob();
      const file = new File([blob], fileName.current, { type: blob.type });
      const nav = navigator as Navigator & {
        canShare?: (d: { files: File[] }) => boolean;
      };
      if (nav.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "My Pictaria",
          text: "I just solved a Pictaria 🌺",
        });
        return;
      }
    } catch {
      /* fall through to download */
    }
    const a = document.createElement("a");
    a.href = clip;
    a.download = fileName.current;
    a.click();
  };

  return (
    <div className="relative flex items-center">
      {state === "recording" ? (
        <button
          type="button"
          onClick={stop}
          aria-label="Stop recording"
          title="Stop recording"
          className="flex h-8 items-center gap-1 px-0.5 text-primary"
        >
          <Square size={15} className="fill-current" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
        </button>
      ) : state === "ready" ? (
        <button
          type="button"
          onClick={share}
          aria-label="Save or share your recording"
          title="Save or share your recording"
          className="flex h-8 items-center px-0.5 text-primary"
        >
          <Download size={16} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => void start()}
          aria-label="Record yourself playing"
          title="Record yourself playing"
          className="flex h-8 items-center px-0.5 text-muted-foreground/50 transition-colors hover:text-primary"
        >
          <Video size={16} />
        </button>
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
    </div>
  );
}
