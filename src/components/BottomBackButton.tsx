import { Link } from "@tanstack/react-router";
import palmLogo from "@/assets/logo-palms-only.webp";

/**
 * A little pair of gold Pictaria palm trees at the end of the page content —
 * it appears at the bottom of each scroll and carries you home.
 */
export function BottomHomeButton() {
  return (
    <Link
      to="/"
      aria-label="Home"
      className="pointer-events-auto absolute bottom-4 left-4 z-50 flex w-fit flex-col items-center gap-0 transition-transform hover:scale-105 active:scale-95"
    >
      <img
        src={palmLogo}
        alt=""
        aria-hidden
        width={1024}
        height={1024}
        className="h-11 w-11 object-contain drop-shadow-[0_2px_8px_oklch(0.15_0.04_230/0.45)]"
      />

    </Link>
  );
}
