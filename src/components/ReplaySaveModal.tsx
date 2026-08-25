import { useCallback, useState } from "react";
import { Download, ExternalLink, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const shareOrSave = useCallback(async () => {
    if (!clip) return;

    try {
      const file = new File([clip.blob], clip.name, { type: clip.type });
      const nav = navigator as Navigator & {
        canShare?: (data: { files?: File[] }) => boolean;
      };
      if (nav.canShare?.({ files: [file] }) && nav.share) {
        await nav.share({ files: [file], title: `Pictaria — ${title}` });
        setNote("If the share sheet showed Save Video, it will land in Photos. If it only offered apps or Files, use Open Video and press-and-hold the movie.");
        return;
      }
      setNote("This browser is not offering a video share sheet for this file. Try Download, or Open Video and press-and-hold the movie.");
    } catch {
      setNote("The share sheet closed without saving. Try Download, or Open Video and press-and-hold the movie.");
    }
  }, [clip, title]);

  const download = useCallback(() => {
    if (!clip) return;
    try {
      const link = document.createElement("a");
      link.href = clip.url;
      link.download = clip.name;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setNote(
        clip.type.includes("webm")
          ? "Downloaded as a .webm file. Some iPhones save this to Files/Downloads instead of Photos."
          : "Downloaded. If it did not appear in Photos, check Files or Downloads.",
      );
    } catch {
      setNote("The browser blocked the download. Use Open Video and press-and-hold the movie.");
    }
  }, [clip]);

  const openVideo = useCallback(() => {
    if (!clip) return;
    const opened = window.open(clip.url, "_blank", "noopener,noreferrer");
    setNote(
      opened
        ? "Opened the video by itself. Press and hold the movie, then choose Save Video, Save to Photos, or Download Video."
        : "Your browser blocked the new tab. Press and hold the video above, then choose Save Video, Save to Photos, or Download Video.",
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
              ? "Your replay, exactly as you played it. Try Share / Save first. If Photos still does not appear, use Download or Open Video."
              : (error ?? "Please try the replay once more."))}
        </p>

        <div className="mt-4 flex flex-col items-center gap-2">
          {clip && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => void shareOrSave()}
                className="w-full border-neutral-400 bg-white px-6 py-2 text-[0.62rem] tracking-[0.18em] text-neutral-700 uppercase hover:bg-neutral-100"
              >
                <Share2 aria-hidden="true" />
                Share / Save
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={download}
                className="w-full border-neutral-300 bg-white px-6 py-2 text-[0.62rem] tracking-[0.18em] text-neutral-600 uppercase hover:bg-neutral-100"
              >
                <Download aria-hidden="true" />
                Download
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={openVideo}
                className="w-full px-6 py-2 text-[0.62rem] tracking-[0.18em] text-neutral-500 uppercase hover:bg-neutral-100 hover:text-neutral-700"
              >
                <ExternalLink aria-hidden="true" />
                Open Video
              </Button>
            </>
          )}
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="w-full px-6 py-2 text-[0.62rem] tracking-[0.18em] text-neutral-400 uppercase hover:text-neutral-600"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
