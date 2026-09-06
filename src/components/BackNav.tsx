import { useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

/**
 * Shared back behaviour: prefer the router's own history stack, but if going
 * back doesn't actually change the page (sentinel entries, fresh loads,
 * embedded previews), fall back to the parent path and finally home.
 */
export function useGoBack() {
  const router = useRouter();

  return () => {
    const path = router.state.location.pathname.replace(/\/+$/, "");

    // Already home — nothing to go back to.
    if (path === "") return;

    const fallback = () => {
      const segments = path.split("/").filter(Boolean);
      if (segments.length > 1) {
        const parent = `/${segments.slice(0, -1).join("/")}`;
        // `/portal` immediately redirects to `/portal/new`, so using it as a
        // fallback leaves the Project back button visibly doing nothing.
        if (
          parent !== "/portal" &&
          router.routesByPath?.[parent as never] !== undefined
        ) {
          router.navigate({ to: parent as never });
          return;
        }
      }
      router.navigate({ to: "/" });
    };

    if (router.history.canGoBack()) {
      router.history.back();
      // If the location is unchanged shortly after, the history entry was a
      // sentinel (or blocked) — take the deterministic route instead.
      window.setTimeout(() => {
        const now = window.location.pathname.replace(/\/+$/, "");
        if (now === path) fallback();
      }, 260);
      return;
    }

    fallback();
  };
}

export function BackChevron({ position }: { position: "top" | "bottom" }) {
  const goBack = useGoBack();

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label="Back"
      className={`pointer-events-auto fixed left-1.5 z-50 grid h-11 w-11 place-items-center text-accent/80 transition-transform hover:scale-105 active:scale-95 ${
        // sits below the fixed three-line menu so both stay tappable
        position === "top" ? "top-[3.5rem]" : "bottom-4"
      }`}
    >
      <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
    </button>
  );
}
