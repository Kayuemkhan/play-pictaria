import { ImagePlus } from "lucide-react";
import resortCove from "@/assets/fsm-resort-cove.jpg.asset.json";

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
function captureSupported() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const embedded =
    /LovableApp|FBAN|FBAV|Instagram|Line\/|; wv\)/i.test(ua) ||
    (typeof window !== "undefined" && window.self !== window.top);
  if (embedded) return false;
  if (typeof document === "undefined") return true;
  return "capture" in document.createElement("input");
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
  const [allowCapture, setAllowCapture] = useState(false);
  useEffect(() => setAllowCapture(captureSupported()), []);
  return (
    <span className={`relative isolate ${className || "inline-flex"}`}>
      {children}
      <input
        type="file"
        accept={accept}
        {...(multiple ? { multiple: true } : {})}
        {...(capture && allowCapture ? { capture } : {})}
        disabled={disabled}
        aria-label={label}
        title={label}
        onChange={(event) => {
          onFiles(event.target.files);
          event.target.value = "";
        }}
        className="absolute inset-0 z-20 block h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
      />
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
