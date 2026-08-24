import { useCallback, useState } from "react";
import type { ReplayClip } from "@/lib/replay-video";

/**
 * The small popup that appears once the replay has finished on the board:
 * just the finished clip and one Save button.
 */
export function ReplaySaveModal({
  clip,
  error,
  title,
  onClose,
}: {
  clip: ReplayClip | null;
  error?: string | null;
  title: string;
  onClose: () => void;
}) {
  const [note, setNote] = useState<string | null>(null);

  const save = useCallback(async () => {
    if (!clip) return;
    const isWebm = clip.type.includes("webm");

    // 1) Native share sheet — the tap that lands it in Photos on a phone.
    try {
      const file = new File([clip.blob], clip.name, { type: clip.type });
      const nav = navigator as Navigator & {
        canShare?: (data: { files?: File[] }) => boolean;
      };
      if (nav.canShare?.({ files: [file] }) && nav.share) {
        await nav.share({ files: [file], title: `Pictaria — ${title}` });
        setNote("Saved. Choose “Save Video” in the share sheet to put it in Photos, then share it with all your socials.");
        return;
      }
    } catch {
      /* cancelled or unavailable — fall through */
    }

    // 2) Plain file download (desktop browsers, and phones outside the preview).
    let downloaded = false;
    try {
      const link = document.createElement("a");
      link.href = clip.url;
      link.download = clip.name;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
      downloaded = true;
    } catch {
      /* blocked inside the editor preview iframe */
    }

    // 3) Last resort: open the clip on its own so it can be held and saved.
    if (!downloaded) {
      const opened = window.open(clip.url, "_blank");
      setNote(
        opened
          ? "Opened the video in a new tab — press and hold it there to save to Photos, then share it with all your socials."
          : "Your browser blocked saving here. Press and hold the video above to save it to Photos, or open Pictaria outside the editor preview.",
      );
      return;
    }

    setNote(
      isWebm
        ? "Saved to your downloads as a .webm file. Photos only accepts .mp4, so open Pictaria in Safari or Chrome on your phone to get an mp4 you can share with all your socials."
        : "Saved to your downloads. On a phone it lands in Photos, ready to share with all your socials.",
    );
  }, [clip, title]);


  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-deep/70 px-4 py-6">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0" />
      <div className="relative w-full max-w-xs rounded-[22px] bg-white p-4 shadow-lift">
        {clip ? (
          <video
            src={clip.url}
            controls
            autoPlay
            muted
            playsInline
            className="w-full rounded-[14px] bg-black"
          />
        ) : (
          <div className="flex aspect-[3/4] w-full items-center justify-center rounded-[14px] bg-neutral-100 px-5 text-center text-[0.7rem] leading-relaxed text-neutral-500">
            Your video didn’t finish this time.
          </div>
        )}

        <p className="mt-3 text-center text-[0.7rem] leading-relaxed text-neutral-600">
          {note ??
            (clip
              ? "Your replay, exactly as you played it. Tap Save to Photos — or press and hold the video above and choose “Save to Photos” / “Download video”."
              : (error ?? "Please try the replay once more."))}
        </p>

        <div className="mt-4 flex flex-col items-center gap-2">
          {clip && (
            <button
              type="button"
              onClick={() => void save()}
              className="w-full rounded-full border border-neutral-400 px-6 py-2 text-[0.62rem] tracking-[0.18em] text-neutral-700 uppercase transition-colors hover:bg-neutral-100"
            >
              Save to Photos
            </button>
          )}
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
