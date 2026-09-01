import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Download, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadReplayClip } from "@/lib/replay-share.functions";
import type { ReplayClip } from "@/lib/replay-video";

/**
 * Two-step replay result:
 * 1. A "See my video" prompt appears right after the replay finishes.
 * 2. Tapping it reveals the clip with only a "Save to downloads" button.
 * The video's own play triangle handles replays, so no extra replay buttons are needed.
 */
const toBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error("That clip couldn't be read."));
    reader.readAsDataURL(blob);
  });

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
  const [hostedUrl, setHostedUrl] = useState<string | null>(null);
  const upload = useServerFn(uploadReplayClip);

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

  /**
   * Blob downloads never reach Files or Photos on iOS Safari, so the clip is
   * uploaded and handed back as a real https download link. Safari's download
   * manager writes that to Downloads, and the link can be shared as-is.
   */
  const saveViaLink = useCallback(async () => {
    if (!clip) return false;
    try {
      const base64 = await toBase64(clip.blob);
      const { downloadUrl: hosted } = await upload({
        data: {
          base64,
          name: clip.name,
          type: clip.type === "video/mp4" ? "video/mp4" : "video/webm",
        },
      });
      setHostedUrl(hosted);
      window.location.href = hosted;
      setSaved(true);
      setNote("Saved to your downloads. Tap the link below if it didn't start.");
      return true;
    } catch {
      return false;
    }
  }, [clip, upload]);

  /**
   * Phones only put a video in Photos when it comes through the native share
   * sheet ("Save Video"). So always try the share sheet first, then fall back
   * to a hosted download link, and finally to a plain browser download.
   */
  const saveVideo = useCallback(async () => {
    if (!clip || saving) return;

    setSaving(true);
    setSaved(false);
    try {
      const file = new File([clip.blob], clip.name, { type: clip.type });
      if (
        typeof navigator.share === "function" &&
        navigator.canShare?.({ files: [file] })
      ) {
        try {
          setNote("Choose “Save Video” to keep it in your photos.");
          await navigator.share({ files: [file], title: "Pictaria replay" });
          setSaved(true);
          setNote("Saved.");
          return;
        } catch (shareError) {
          if (
            shareError instanceof DOMException &&
            shareError.name === "AbortError"
          ) {
            setNote("Save canceled.");
            return;
          }
        }
      }

      setNote("Preparing your download…");
      if (await saveViaLink()) return;

      downloadWithBrowser();
      setSaved(true);
      setNote("Saved.");
    } finally {
      setSaving(false);
    }
  }, [clip, downloadWithBrowser, saveViaLink, saving]);

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
                  type="button"
                  onClick={saveVideo}
                  disabled={saving}
                  className="w-full rounded-full bg-primary px-6 py-3 text-[0.7rem] font-medium tracking-[0.12em] text-primary-foreground uppercase hover:bg-primary/90"
                >
                  {saved ? <Check aria-hidden="true" /> : <Download aria-hidden="true" />}
                  {saved ? "Saved" : saving ? "Saving…" : "Save my video"}
                </Button>
              )}
              {hostedUrl && (
                <a
                  href={hostedUrl}
                  className="text-[0.7rem] leading-relaxed text-primary underline"
                >
                  Open my video link
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
