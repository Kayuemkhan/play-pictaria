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
  children: React.ReactNode;
};

/**
 * Wraps any visual with a real, invisible <input type="file"> on top so the tap
 * lands directly on the input — no programmatic .click(), which mobile browsers
 * and sandboxed frames often refuse.
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
  return (
    <span className={`relative isolate inline-flex ${className}`}>
      {children}
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
