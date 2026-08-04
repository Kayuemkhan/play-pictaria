import { useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

/**
 * A small, consistent sideways-V back button that lives at the bottom-left of
 * every page. Tries the browser back stack first, then falls back to home.
 */
export function BottomBackButton() {
  const router = useRouter();

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      router.navigate({ to: "/" });
    }
  };

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label="Back"
      className="pointer-events-auto fixed bottom-4 left-4 z-50 grid h-10 w-10 place-items-center rounded-full border border-accent/40 bg-deep/85 text-accent shadow-lift backdrop-blur-sm transition-transform hover:scale-105 active:scale-95"
    >
      <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
    </button>
  );
}
