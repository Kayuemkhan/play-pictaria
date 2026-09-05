import { Link } from "@tanstack/react-router";
import palmLogo from "@/assets/logo-palms-only.webp";

/**
 * The gold Pictaria palm trees, sitting at the very top of the page content.
 * They scroll away with the page instead of floating over it.
 */
export function TopHomeButton() {
  return (
    <Link
      to="/"
      aria-label="Home"
      data-top-home
      className="pointer-events-auto absolute top-4 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-0 transition-[transform,opacity] hover:scale-105 active:scale-95"
    >

      <img
        src={palmLogo}
        alt=""
        aria-hidden
        width={1024}
        height={1024}
        className="h-9 w-9 object-contain drop-shadow-[0_2px_8px_oklch(0.15_0.04_230/0.45)]"
      />

    </Link>
  );
}
