import { useCallback, useEffect, useState } from "react";
import { Check, Download, Play } from "lucide-react";
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
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!clip) {
      setDownloadUrl(null);
      return;
    }

    const url = URL.createObjectURL(clip.blob);
    setDownloadUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [clip]);

  const downloadWithBrowser = useCallback(() => {
    if (!clip || !downloadUrl) return;

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = clip.name;
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, [clip, downloadUrl]);

  const markDownloadStarted = useCallback(() => {
    setSaved(true);
    setSaving(false);
    setNote("Saved.");
  }, []);

  const saveToDownloads = useCallback(async () => {
    if (!clip || saving) return;

    setSaving(true);
    setSaved(false);
    try {
      const file = new File([clip.blob], clip.name, { type: clip.type });
      if (
        navigator.canShare?.({ files: [file] }) &&
        typeof navigator.share === "function"
      ) {
        setNote("Opening the save menu…");
        await navigator.share({ files: [file], title: "Pictaria replay" });
        setSaved(true);
        setNote("Saved.");
        return;
      }

      downloadWithBrowser();
      setSaved(true);
      setNote("Saved.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setNote("Save canceled.");
        return;
      }
      downloadWithBrowser();
      setSaved(true);
      setNote("Saved.");
    } finally {
      setSaving(false);
    }
  }, [clip, downloadWithBrowser, saving]);

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
                  ? "Tap below to save your video."
                  : (error ?? "Please try the replay once more."))}
            </p>

            <div className="mt-4 flex flex-col items-center gap-2">
              {clip && (
                <Button
                  asChild={!!downloadUrl}
                  type={downloadUrl ? undefined : "button"}
                  onClick={downloadUrl ? markDownloadStarted : saveToDownloads}
                  disabled={saving}
                  className="w-full rounded-full bg-primary px-6 py-3 text-[0.7rem] font-medium tracking-[0.12em] text-primary-foreground uppercase hover:bg-primary/90"
                >
                  {downloadUrl ? (
                    <a href={downloadUrl} download={clip.name} rel="noopener noreferrer">
                      {saved ? <Check aria-hidden="true" /> : <Download aria-hidden="true" />}
                      {saved ? "Saved" : "Save to downloads"}
                    </a>
                  ) : (
                    <>
                      {saved ? <Check aria-hidden="true" /> : <Download aria-hidden="true" />}
                      {saved ? "Saved" : saving ? "Saving…" : "Save to downloads"}
                    </>
                  )}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
