import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReplayClip } from "@/lib/replay-video";

/**
 * Two-step replay result:
 * 1. A "See my video" prompt appears right after the replay finishes.
 * 2. Tapping it reveals the clip with only a "Save to downloads" button.
 * The video's own play triangle handles replays, so no extra replay buttons are needed.
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
  const [showVideo, setShowVideo] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const temporaryDownloadUrl = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (temporaryDownloadUrl.current) URL.revokeObjectURL(temporaryDownloadUrl.current);
    };
  }, []);

  const saveToDownloads = useCallback(async () => {
    if (!clip) return;
    try {
      setNote("Saving your video…");
      const file = new File([clip.blob], clip.name, { type: clip.type });
      if (
        navigator.canShare?.({ files: [file] }) &&
        typeof navigator.share === "function"
      ) {
        try {
          await navigator.share({ files: [file], title: "Pictaria replay" });
          setNote("Choose Save to Files or Save Video from the menu.");
        } catch {
          setNote("If the menu closed, press Save to downloads again.");
        }
        return;
      }

      if (temporaryDownloadUrl.current) URL.revokeObjectURL(temporaryDownloadUrl.current);
      temporaryDownloadUrl.current = URL.createObjectURL(clip.blob);
      const link = document.createElement("a");
      link.href = temporaryDownloadUrl.current;
      link.download = clip.name;
      link.rel = "noopener";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => {
        if (temporaryDownloadUrl.current) {
          URL.revokeObjectURL(temporaryDownloadUrl.current);
          temporaryDownloadUrl.current = null;
        }
      }, 30_000);
      setNote("If nothing appears, press and hold the video, then choose Save Video.");
    } catch {
      setNote(
        "The browser blocked the download. Press and hold the video, then choose Save.",
      );
    }
  }, [clip]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-deep/70 px-4 py-6">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0"
      />
      <div className="relative w-full max-w-xs rounded-[22px] bg-white p-5 text-center shadow-lift">
        {!showVideo ? (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Play
                className="h-7 w-7 fill-primary text-primary"
                aria-hidden="true"
              />
            </div>
            <h3 className="font-display text-xl text-foreground">
              Your replay is ready
            </h3>
            <p className="mt-2 text-[0.8rem] leading-relaxed text-muted-foreground">
              See your solve come together again.
            </p>
            <Button
              type="button"
              onClick={() => setShowVideo(true)}
              className="mt-5 w-full rounded-full bg-primary px-6 py-3 text-[0.7rem] font-medium tracking-[0.12em] text-primary-foreground uppercase hover:bg-primary/90"
            >
              See my video
            </Button>
          </>
        ) : (
          <>
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
              <div className="flex aspect-[3/4] w-full items-center justify-center rounded-[14px] bg-muted px-5 text-center text-[0.7rem] leading-relaxed text-muted-foreground">
                {error ?? "Your video didn't finish this time."}
              </div>
            )}

            <p className="mt-3 text-center text-[0.7rem] leading-relaxed text-muted-foreground">
              {note ??
                (clip
                  ? "Press the triangle to replay. Tap below to save to your downloads."
                  : (error ?? "Please try the replay once more."))}
            </p>

            <div className="mt-4 flex flex-col items-center gap-2">
              {clip && (
                <Button
                  type="button"
                  onClick={saveToDownloads}
                  className="w-full rounded-full bg-primary px-6 py-3 text-[0.7rem] font-medium tracking-[0.12em] text-primary-foreground uppercase hover:bg-primary/90"
                >
                  <Download aria-hidden="true" />
                  Save to downloads
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
