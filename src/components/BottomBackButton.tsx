import { Link } from "@tanstack/react-router";
import palmLogo from "@/assets/logo-palms-only.png";

/**
 * A subtle home button placed at the bottom of the page content.
 * It shows the two Pictaria palm trees, masked into the soft light-blue accent,
 * so it appears after the user scrolls to the end of the page.
 */
export function BottomHomeButton() {
  return (
    <Link
      to="/"
      aria-label="Home"
      className="pointer-events-auto relative z-50 mx-4 mt-8 mb-4 flex w-fit flex-col items-center gap-0 text-accent/55 transition-transform hover:scale-105 active:scale-95"
    >
      <span
        aria-hidden
        className="block h-10 w-10 bg-accent/55"
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
