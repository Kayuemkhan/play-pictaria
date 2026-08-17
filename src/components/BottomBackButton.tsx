import { Link } from "@tanstack/react-router";
import palmLogo from "@/assets/logo-palms-only.png";

/**
 * A subtle home button pinned to the bottom-center of every non-home screen.
 * It shows the two Pictaria palm trees, masked into the soft light-blue accent,
 * so it's the last thing you see on the page.
 */
export function BottomHomeButton() {
  return (
    <Link
      to="/"
      aria-label="Home"
      className="pointer-events-auto fixed bottom-4 left-4 z-50 flex flex-col items-center gap-1 text-accent/55 transition-transform hover:scale-105 active:scale-95"
    >

      <span
        aria-hidden
        className="block h-7 w-7 bg-accent/55"
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
