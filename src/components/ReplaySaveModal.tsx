import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Download, FolderDown, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  createReplayUpload,
  signReplayDownload,
} from "@/lib/replay-share.functions";

import type { ReplayClip } from "@/lib/replay-video";

/**
 * Two-step replay result:
 * 1. A "See my video" prompt appears right after the replay finishes.
 * 2. Tapping it plays the clip and offers two clear iPhone-friendly saves:
 *    "Save to Photos" goes through the share sheet, and "Save to Files" uses a
 *    real https link (blob downloads never land anywhere on iOS Safari).
 * The video's own play triangle handles replays, so no extra replay buttons.
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
  const [sharing, setSharing] = useState(false);
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [linkFailed, setLinkFailed] = useState(false);
  const [canShareFiles, setCanShareFiles] = useState(false);
  const startUpload = useServerFn(createReplayUpload);
  const signDownload = useServerFn(signReplayDownload);

  useEffect(() => {
    if (!clip) {
      setCanShareFiles(false);
      return;
    }
    try {
      const file = new File([clip.blob], clip.name, { type: clip.type });
      setCanShareFiles(
        typeof navigator.share === "function" &&
          Boolean(navigator.canShare?.({ files: [file] })),
      );
    } catch {
      setCanShareFiles(false);
    }
  }, [clip]);

  /**
   * The hosted link is prepared as soon as the video is revealed, so tapping
   * "Save to Files" is a direct user gesture on a real URL — Safari blocks
   * downloads that start after an await. The clip goes straight from the phone
   * to storage through a signed upload URL, which keeps the wait short.
   */
  useEffect(() => {
    if (!showVideo || !clip || linkUrl) return;
    let active = true;
    void (async () => {
      try {
        const { path, token } = await startUpload({
          data: { name: clip.name },
        });
        const { error: uploadError } = await supabase.storage
          .from("replays")
          .uploadToSignedUrl(path, token, clip.blob, {
            contentType: clip.type,
          });
        if (uploadError) throw uploadError;
        const { downloadUrl } = await signDownload({
          data: { path, name: clip.name },
        });
        if (active) setLinkUrl(downloadUrl);
      } catch {
        if (active) setLinkFailed(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [showVideo, clip, linkUrl, startUpload, signDownload]);



  const shareToPhotos = useCallback(async () => {
    if (!clip || sharing) return;
    setSharing(true);
    try {
      const file = new File([clip.blob], clip.name, { type: clip.type });
      setNote("Choose “Save Video” to keep it in your Photos.");
      await navigator.share({ files: [file], title: "Pictaria replay" });
      setSaved(true);
      setNote("Saved to your Photos.");
    } catch (shareError) {
      if (shareError instanceof DOMException && shareError.name === "AbortError") {
        setNote("Save canceled.");
      } else {
        setNote("Photos didn't accept it — try Save to Files instead.");
      }
    } finally {
      setSharing(false);
    }
  }, [clip, sharing]);

  const hint = clip
    ? canShareFiles
      ? "Save to Photos opens the share sheet — choose “Save Video”."
      : "Save to Files downloads the video to your phone."
    : (error ?? "Please try the replay once more.");

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
              {note ?? hint}
            </p>

            {clip && (
              <div className="mt-4 flex flex-col items-center gap-2">
                {canShareFiles && (
                  <Button
                    type="button"
                    onClick={shareToPhotos}
                    disabled={sharing}
                    className="w-full rounded-full bg-primary px-6 py-3 text-[0.7rem] font-medium tracking-[0.12em] text-primary-foreground uppercase hover:bg-primary/90"
                  >
                    {saved ? (
                      <Check aria-hidden="true" />
                    ) : (
                      <Download aria-hidden="true" />
                    )}
                    {saved ? "Saved" : sharing ? "Saving…" : "Save to Photos"}
                  </Button>
                )}

                {linkUrl ? (
                  <a
                    href={linkUrl}
                    download={clip.name}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setNote("Saving to your Files…")}
                    className={`flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-[0.7rem] font-medium tracking-[0.12em] uppercase ${
                      canShareFiles
                        ? "border border-primary/40 text-primary"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <FolderDown className="h-4 w-4" aria-hidden="true" />
                    Save to Files
                  </a>
                ) : linkFailed ? (
                  <p className="text-[0.65rem] leading-relaxed text-muted-foreground">
                    The download link didn’t prepare this time. Please replay
                    once more.
                  </p>
                ) : (
                  <p className="flex items-center justify-center gap-2 text-[0.65rem] tracking-[0.12em] text-muted-foreground uppercase">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    Preparing download…
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
