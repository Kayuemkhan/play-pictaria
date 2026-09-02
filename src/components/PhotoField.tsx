import { useEffect, useId, useState } from "react";
import { Camera } from "lucide-react";
import resortCove from "@/assets/fsm-resort-cove.jpg";
import { CameraCapture } from "@/components/CameraCapture";

type PickProps = {
  onFiles: (files: FileList | null) => void;
  multiple?: boolean;
  capture?: "environment" | "user";
  accept?: string;
  disabled?: boolean;
  label: string;
  className?: string;
  /** Kept for existing call sites; native file controls now handle every environment. */
  fallbackToCamera?: boolean;
  children: React.ReactNode;
};

type FilePickerHandle = { getFile: () => Promise<File> };
type FilePickerWindow = Window & {
  showOpenFilePicker?: (options: {
    multiple: boolean;
    types: Array<{ description: string; accept: Record<string, string[]> }>;
  }) => Promise<FilePickerHandle[]>;
};

/**
 * Wraps any visual with a real, invisible <input type="file"> on top so the tap
 * lands directly on the input — no programmatic .click(), which mobile browsers
 * and sandboxed frames often refuse. The capture hint opens the phone's native
 * camera, while an input without it opens the photo library.
 */
/**
 * Some embedded WebViews (the Lovable in-app preview, Facebook/Instagram
 * browsers, older Android WebViews) accept `capture` on a file input but never
 * hand the intent to a camera app, so the tap silently does nothing. In those
 * environments we drop `capture` and let the OS show its normal sheet, which
 * still offers "Camera" as the first option.
 */
function isEmbeddedPicker() {
  if (typeof navigator === "undefined") return false;
  return /LovableApp/i.test(navigator.userAgent);
}

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
  const inputId = useId();
  const [embedded, setEmbedded] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  useEffect(() => setEmbedded(isEmbeddedPicker()), []);

  const sendFile = (file: File) => {
    const transfer = new DataTransfer();
    transfer.items.add(file);
    onFiles(transfer.files);
  };

  const openEmbeddedPicker = async () => {
    if (capture) {
      setCameraOpen(true);
      return;
    }
    try {
      const picker = (window as FilePickerWindow).showOpenFilePicker;
      if (!picker) {
        document.getElementById(inputId)?.click();
        return;
      }
      const handles = await picker({
        multiple: Boolean(multiple),
        types: [{ description: "Photos", accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".heic"] } }],
      });
      for (const handle of handles) sendFile(await handle.getFile());
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      document.getElementById(inputId)?.click();
    }
  };

  return (
    <>
      <span className={`relative isolate ${className || "inline-flex"}`}>
        <span className="pointer-events-none block h-full w-full">{children}</span>
        <input
          id={inputId}
          type="file"
          accept={accept}
          {...(multiple ? { multiple: true } : {})}
          {...(capture && !embedded ? { capture } : {})}
          disabled={disabled}
          aria-label={label}
          title={label}
          onChange={(event) => {
            onFiles(event.target.files);
            event.target.value = "";
          }}
          className="sr-only"
        />
        {embedded && capture ? (
          <button
            type="button"
            onClick={openEmbeddedPicker}
            disabled={disabled}
            aria-label={label}
            title={label}
            className="absolute inset-0 z-20 block h-full w-full cursor-pointer disabled:cursor-not-allowed"
          />
        ) : (
          <label
            htmlFor={inputId}
            aria-label={label}
            title={label}
            className={`absolute inset-0 z-20 block cursor-pointer ${
              disabled ? "cursor-not-allowed" : ""
            }`}
          />
        )}
      </span>
      {cameraOpen && (
        <CameraCapture
          onClose={() => setCameraOpen(false)}
          onCapture={(dataUrl) => {
            void fetch(dataUrl)
              .then((response) => response.blob())
              .then((blob) => sendFile(new File([blob], `pictaria-${Date.now()}.jpg`, { type: "image/jpeg" })));
          }}
        />
      )}
    </>
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
  const dark = tone === "dark";
  return (
    <>
      <img
        src={resortCove}
        alt=""
        className={`absolute inset-0 h-full w-full object-cover ${
          dark ? "opacity-40 grayscale-[70%]" : "opacity-30 grayscale-[60%]"
        }`}
      />
      <span
        className={`absolute inset-0 ${dark ? "bg-deep/55" : "bg-shell/45"}`}
      />
      <span
        className={`relative flex h-full w-full flex-col items-center justify-center gap-2 px-4 ${
          dark ? "text-shell" : "text-foreground"
        }`}
      >
        <Camera
          className="h-10 w-10 drop-shadow-[0_1px_6px_oklch(0.15_0.04_230/0.65)]"
          strokeWidth={1.6}
        />
        <span className="text-[10px] tracking-[0.2em] uppercase drop-shadow-[0_1px_6px_oklch(0.15_0.04_230/0.6)]">
          {title}
        </span>
        {hint && (
          <span
            className={`max-w-52 text-center text-[11px] leading-relaxed ${
              dark ? "text-shell/85" : "text-foreground/75"
            }`}
          >
            {hint}
          </span>
        )}
      </span>
    </>
  );
}

