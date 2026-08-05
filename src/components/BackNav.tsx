import { useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

/**
 * Shared back behaviour: prefer the router's own history stack (so we never
 * step outside the app or land on the home sentinel entry), otherwise walk up
 * one path segment, otherwise go home.
 */
export function useGoBack() {
  const router = useRouter();

  return () => {
    const path = router.state.location.pathname.replace(/\/+$/, "");

    // Already home — nothing to go back to.
    if (path === "") return;

    if (router.history.canGoBack()) {
      router.history.back();
      return;
    }

    const segments = path.split("/").filter(Boolean);
    if (segments.length > 1) {
      router.navigate({ to: `/${segments.slice(0, -1).join("/")}` as never });
    } else {
      router.navigate({ to: "/" });
    }
  };
}

export function BackChevron({ position }: { position: "top" | "bottom" }) {
  const goBack = useGoBack();

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label="Back"
      className={`pointer-events-auto fixed left-4 z-50 grid h-11 w-11 place-items-center text-accent/80 transition-transform hover:scale-105 active:scale-95 ${
        position === "top" ? "top-4" : "bottom-4"
      }`}
    >
      <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
    </button>
  );
}
