import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Download, FolderDown, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  createReplayUpload,
  signReplayDownload,
} from "@/lib/replay-share.functions";

import type { ReplayClip, ReplaySpeed } from "@/lib/replay-video";

/**
 * Two-step replay result:
 * 1. A "See my video" prompt appears right after the replay finishes.
 * 2. Tapping it plays the clip, offers a simple speed choice (the player's real
 *    tempo, or twice as fast), and two clear iPhone-friendly saves:
 *    "Save to Photos" goes through the share sheet, and "Save to Files" uses a
 *    real https link (blob downloads never land anywhere on iOS Safari).
 * The video's own play triangle handles replays, so no extra replay buttons.
 */


export function ReplaySaveModal({
  clip,
  error,
  title,
  onRenderSpeed,
  onClose,
}: {
  clip: ReplayClip | null;
  error?: string | null;
  title: string;
  /** Re-renders the same solve at another speed, quietly and offscreen. */
  onRenderSpeed?: (speed: ReplaySpeed) => Promise<ReplayClip | null>;
  onClose: () => void;
}) {
  const [showVideo, setShowVideo] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [linkFailed, setLinkFailed] = useState(false);
  const [canShareFiles, setCanShareFiles] = useState(false);
  const [speed, setSpeed] = useState<ReplaySpeed>(1);
  const [fastClip, setFastClip] = useState<ReplayClip | null>(null);
  const [rendering, setRendering] = useState(false);
  const startUpload = useServerFn(createReplayUpload);
  const signDownload = useServerFn(signReplayDownload);

  const activeClip = speed === 2 ? fastClip : clip;

  /** Choosing a different speed means a different file: start its save fresh. */
  useEffect(() => {
    setLinkUrl(null);
    setLinkFailed(false);
    setSaved(false);
    setNote(null);
  }, [activeClip?.url]);

  useEffect(() => {
    if (!activeClip) {
      setCanShareFiles(false);
      return;
    }
    try {
      const file = new File([activeClip.blob], activeClip.name, {
        type: activeClip.type,
      });
      setCanShareFiles(
        typeof navigator.share === "function" &&
          Boolean(navigator.canShare?.({ files: [file] })),
      );
    } catch {
      setCanShareFiles(false);
    }
  }, [activeClip]);

  /**
   * The hosted link is prepared as soon as the video is revealed, so tapping
   * "Save to Files" is a direct user gesture on a real URL — Safari blocks
   * downloads that start after an await. The clip goes straight from the phone
   * to storage through a signed upload URL, which keeps the wait short.
   */
  useEffect(() => {
    if (!showVideo || !activeClip || linkUrl) return;
    let active = true;
    void (async () => {
      try {
        const { path, token } = await startUpload({
          data: { name: activeClip.name },
        });
        const { error: uploadError } = await supabase.storage
          .from("replays")
          .uploadToSignedUrl(path, token, activeClip.blob, {
            contentType: activeClip.type,
          });
        if (uploadError) throw uploadError;
        const { downloadUrl } = await signDownload({
          data: { path, name: activeClip.name },
        });
        if (active) setLinkUrl(downloadUrl);
      } catch {
        if (active) setLinkFailed(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [showVideo, activeClip, linkUrl, startUpload, signDownload]);

  const pickSpeed = useCallback(
    async (next: ReplaySpeed) => {
      if (next === speed || rendering) return;
      if (next === 1 || fastClip) {
        setSpeed(next);
        return;
      }
      if (!onRenderSpeed) return;
      setRendering(true);
      setNote("Making the faster version…");
      try {
        const made = await onRenderSpeed(2);
        if (made) {
          setFastClip(made);
          setSpeed(2);
          setNote(null);
        } else {
          setNote("The faster version didn't come out — real time still works.");
        }
      } catch {
        setNote("The faster version didn't come out — real time still works.");
      } finally {
        setRendering(false);
      }
    },
    [speed, rendering, fastClip, onRenderSpeed],
  );

  const shareToPhotos = useCallback(async () => {
    if (!activeClip || sharing) return;
    setSharing(true);
    try {
      const file = new File([activeClip.blob], activeClip.name, {
        type: activeClip.type,
      });
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
  }, [activeClip, sharing]);

  const hint = activeClip
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
            {activeClip ? (
              <video
                key={activeClip.url}
                src={activeClip.url}
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

            {clip && onRenderSpeed && (
              <div className="mt-3">
                <p className="text-[0.6rem] tracking-[0.16em] text-muted-foreground uppercase">
                  Video speed
                </p>
                <div className="mt-2 flex gap-2">
                  {([1, 2] as ReplaySpeed[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => void pickSpeed(option)}
                      disabled={rendering}
                      className={`flex-1 rounded-full px-3 py-2 text-[0.65rem] font-medium tracking-[0.1em] uppercase ${
                        speed === option
                          ? "bg-primary text-primary-foreground"
                          : "border border-primary/40 text-primary"
                      } ${rendering ? "opacity-60" : ""}`}
                    >
                      {option === 1 ? "Real time" : "2× faster"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="mt-3 text-center text-[0.7rem] leading-relaxed text-muted-foreground">
              {rendering ? "Making the faster version…" : (note ?? hint)}
            </p>

            {activeClip && !rendering && (
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
                    download={activeClip.name}
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
