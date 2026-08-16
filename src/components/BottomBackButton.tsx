import { Home } from "lucide-react";
import { Link } from "@tanstack/react-router";

/**
 * A subtle fixed home button for the bottom-left of non-home screens.
 * The top arrow still goes back; this one always returns to the home page.
 */
export function BottomHomeButton() {
  return (
    <Link
      to="/"
      aria-label="Home"
      className="pointer-events-auto fixed bottom-4 left-4 z-50 flex flex-col items-center gap-0.5 text-accent/55 transition-transform hover:scale-105 active:scale-95"
    >
      <Home className="h-4 w-4" strokeWidth={1.5} />
      <span className="text-[0.55rem] font-medium tracking-[0.14em] uppercase">
        home
      </span>
    </Link>
  );
}
