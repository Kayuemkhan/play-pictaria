import { useEffect, useRef, useState } from "react";
import { Camera, X, RefreshCw, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
};

/** Full-screen live camera view using getUserMedia — works where input capture= is ignored. */
export function CameraCapture({ onCapture, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setError("");

    const open = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play().catch(() => undefined);
        }
        setReady(true);
      } catch {
        if (!cancelled) {
          setError("Camera access was blocked. Allow it in your browser, or choose a photo instead.");
        }
      }
    };

    void open();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [facing]);

  const shoot = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    onCapture(canvas.toDataURL("image/jpeg", 0.9));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-white/30 p-2 text-white"
          aria-label="Close camera"
        >
          <X className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setFacing((f) => (f === "environment" ? "user" : "environment"))}
          className="rounded-full border border-white/30 p-2 text-white"
          aria-label="Flip camera"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="h-full w-full object-cover"
        />
        {!ready && !error && (
          <span className="absolute inset-0 flex items-center justify-center text-white">
            <Loader2 className="h-6 w-6 animate-spin" />
          </span>
        )}
        {error && (
          <span className="absolute inset-0 flex items-center justify-center px-8 text-center text-[13px] leading-relaxed text-white">
            {error}
          </span>
        )}
      </div>

      <div className="flex items-center justify-center py-6">
        <Button
          type="button"
          onClick={shoot}
          disabled={!ready}
          className="h-16 w-16 rounded-full bg-white p-0 text-black hover:bg-white/90"
          aria-label="Take photo"
        >
          <Camera className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
