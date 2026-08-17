import { Link } from "@tanstack/react-router";
import palmLogo from "@/assets/logo-palms-only.png";

/**
 * A small palm-tree home button fixed to the top-right corner.
 * It mirrors the bottom home button but stays visible while scrolling,
 * so the home screen is always one tap away.
 */
export function TopHomeButton() {
  return (
    <Link
      to="/"
      aria-label="Home"
      className="pointer-events-auto fixed top-4 right-4 z-50 flex flex-col items-center gap-0 text-accent/55 transition-transform hover:scale-105 active:scale-95"
    >
      <span
        aria-hidden
        className="block h-8 w-8 bg-accent/55"
        style={{
          maskImage: `url(${palmLogo})`,
          WebkitMaskImage: `url(${palmLogo})`,
          maskSize: "contain",
          WebkitMaskSize: "contain",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
        }}
      />
      <span className="text-[0.55rem] font-medium tracking-[0.14em] uppercase">
        home
      </span>
    </Link>
  );
}
