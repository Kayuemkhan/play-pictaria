import { useCallback, useState } from "react";
import type { ReplayClip } from "@/lib/replay-video";

/**
 * The small popup that appears once the replay has finished on the board:
 * just the finished clip and one Save button.
 */
export function ReplaySaveModal({
  clip,
  title,
  onClose,
}: {
  clip: ReplayClip;
  title: string;
  onClose: () => void;
}) {
  const [note, setNote] = useState<string | null>(null);

  const save = useCallback(async () => {
    // 1) Native share sheet — the tap that lands it in Photos on a phone.
    try {
      const file = new File([clip.blob], clip.name, { type: clip.type });
      const nav = navigator as Navigator & {
        canShare?: (data: { files?: File[] }) => boolean;
      };
      if (nav.canShare?.({ files: [file] }) && nav.share) {
        await nav.share({ files: [file], title: `Pictaria — ${title}` });
        setNote("Saved. Your replay is in Photos.");
        return;
      }
    } catch {
      /* cancelled or unavailable — fall through to a plain download */
    }

    // 2) Plain file download (desktop browsers).
    try {
      const link = document.createElement("a");
      link.href = clip.url;
      link.download = clip.name;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setNote("Saved to your downloads.");
    } catch {
      setNote("Press and hold the video to save it to Photos.");
    }
  }, [clip, title]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-deep/70 px-4 py-6">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0" />
      <div className="relative w-full max-w-xs rounded-[22px] bg-white p-4 shadow-lift">
        <video
          src={clip.url}
          controls
          autoPlay
          loop
          muted
          playsInline
          className="w-full rounded-[14px] bg-black"
        />

        <p className="mt-3 text-center text-[0.7rem] leading-relaxed text-neutral-600">
          {note ?? "Your replay, exactly as you played it. Press and hold the video to save it to Photos."}
        </p>

        <div className="mt-4 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => void save()}
            className="w-full rounded-full border border-neutral-400 px-6 py-2 text-[0.62rem] tracking-[0.18em] text-neutral-700 uppercase transition-colors hover:bg-neutral-100"
          >
            Save video
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full px-6 py-2 text-[0.62rem] tracking-[0.18em] text-neutral-400 uppercase transition-colors hover:text-neutral-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
