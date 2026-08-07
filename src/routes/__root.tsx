import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { BottomBackButton } from "@/components/BottomBackButton";
import { TopBackButton } from "@/components/TopBackButton";
import { MindfulMiniPlayer } from "@/components/MindfulMusic";

import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  const router = useRouter();

  // Legacy/stray URLs like "/index" should land on the homepage, not a dead end.
  useEffect(() => {
    const path = router.state.location.pathname.replace(/\/+$/, "");
    if (path === "/index" || path === "/home") {
      router.navigate({ to: "/", replace: true });
    }
  }, [router]);

  return (

    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1" },
      { title: "Pictaria" },
      { name: "description", content: "Relaxing jigsaw puzzles made from beautiful photography." },
      { name: "author", content: "Pictaria" },
      { property: "og:title", content: "Pictaria" },
      { property: "og:description", content: "Relaxing jigsaw puzzles made from beautiful photography." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#0f2f43" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Karla:wght@300;400;500&family=Great+Vibes&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Toaster position="bottom-center" />
        <Scripts />
      </body>
    </html>
  );
}

/**
 * Keeps the hardware/browser back button inside the app: when the user is on
 * the home screen we keep a sentinel history entry behind them so "back"
 * lands back on home instead of leaving Pictaria.
 */
function BackGuard() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isHome = () => {
      const p = router.state.location.pathname.replace(/\/+$/, "");
      return p === "" || p === "/";
    };

    const arm = () => {
      if (!isHome()) return;
      if (window.history.state?.__pictariaGuard) return;
      window.history.pushState(
        { ...(window.history.state ?? {}), __pictariaGuard: true },
        "",
        window.location.href,
      );
    };

    const onPop = () => {
      // Re-arm after a back press so home never exits the app.
      window.setTimeout(arm, 0);
    };

    arm();
    const unsub = router.subscribe("onResolved", arm);
    window.addEventListener("popstate", onPop);
    return () => {
      unsub();
      window.removeEventListener("popstate", onPop);
    };
  }, [router]);

  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const isHome =
    router.state.location.pathname.replace(/\/+$/, "") === "";

  return (
    <QueryClientProvider client={queryClient}>
      <BackGuard />
      {!isHome && <TopBackButton />}
      {!isHome && <BottomBackButton />}
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <MindfulMiniPlayer />

    </QueryClientProvider>
  );
}
