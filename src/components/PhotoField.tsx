import { lazy, Suspense, useState } from "react";
import { ImagePlus } from "lucide-react";
import resortCove from "@/assets/fsm-resort-cove.jpg.asset.json";

const CameraCapture = lazy(() =>
  import("@/components/CameraCapture").then((m) => ({ default: m.CameraCapture })),
);

/**
 * The Lovable mobile app renders the preview inside an Android WebView, where a
 * plain <input type="file"> often opens nothing at all. In that environment we
 * drive the phone camera ourselves with getUserMedia instead.
 */
export function isEmbeddedApp() {
  if (typeof navigator === "undefined") return false;
  return /LovableApp|; wv\)/i.test(navigator.userAgent);
}

const filesFromDataUrl = async (dataUrl: string): Promise<FileList | null> => {
  const blob = await (await fetch(dataUrl)).blob();
  const file = new File([blob], `pictaria-${Date.now()}.jpg`, {
    type: blob.type || "image/jpeg",
  });
  const transfer = new DataTransfer();
  transfer.items.add(file);
  return transfer.files;
};

type PickProps = {
  onFiles: (files: FileList | null) => void;
  multiple?: boolean;
  capture?: "environment" | "user";
  accept?: string;
  disabled?: boolean;
  label: string;
  className?: string;
  children: React.ReactNode;
};

/**
 * Wraps any visual with a real, invisible <input type="file"> on top so the tap
 * lands directly on the input — no programmatic .click(), which mobile browsers
 * and sandboxed frames often refuse. When `capture` is set and we're inside the
 * embedded app WebView, the tap opens our own live camera instead.
 */
export function PhotoPick({
  onFiles,
  multiple,
  capture,
  accept = "image/*",
  disabled,
  label,
  className = "",
  children,
}: PickProps) {
  const [live, setLive] = useState(false);
  const useLiveCamera = Boolean(capture) && isEmbeddedApp();

  return (
    <span className={`relative isolate ${className || "inline-flex"}`}>
      {children}
      {useLiveCamera ? (
        <button
          type="button"
          disabled={disabled}
          aria-label={label}
          onClick={() => setLive(true)}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
        />
      ) : (
        <input
          type="file"
          accept={accept}
          {...(multiple ? { multiple: true } : {})}
          {...(capture ? { capture } : {})}
          disabled={disabled}
          aria-label={label}
          title={label}
          onChange={(event) => {
            onFiles(event.target.files);
            event.target.value = "";
          }}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />
      )}
      {live && (
        <Suspense fallback={null}>
          <CameraCapture
            onClose={() => setLive(false)}
            onCapture={(dataUrl) => {
              void filesFromDataUrl(dataUrl).then(onFiles);
            }}
          />
        </Suspense>
      )}
    </span>
  );
}

/** Softly faded tropical backdrop for any empty photo slot. */
export function PhotoPlaceholder({
  title = "Choose a photo",
  hint,
  tone = "light",
}: {
  title?: string;
  hint?: string;
  tone?: "light" | "dark";
}) {
  return (
    <>
      <img
        src={resortCove.url}
        alt=""
        className={`absolute inset-0 h-full w-full object-cover grayscale-[20%] ${
          tone === "dark" ? "opacity-25" : "opacity-30"
        }`}
      />
      <span
        className={`absolute inset-0 ${tone === "dark" ? "bg-deep/55" : "bg-shell/45"}`}
      />
      <span
        className={`relative flex h-full w-full flex-col items-center justify-center gap-2 px-4 ${
          tone === "dark" ? "text-deep-foreground" : "text-foreground"
        }`}
      >
        <ImagePlus className="h-8 w-8" strokeWidth={1.25} />
        <span className="text-[10px] tracking-[0.2em] uppercase">{title}</span>
        {hint && (
          <span
            className={`max-w-52 text-center text-[11px] leading-relaxed ${
              tone === "dark" ? "text-deep-foreground/70" : "text-muted-foreground"
            }`}
          >
            {hint}
          </span>
        )}
      </span>
    </>
  );
}
