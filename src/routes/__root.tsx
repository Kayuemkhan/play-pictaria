import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { TopBackButton } from "@/components/TopBackButton";
import { TopHomeButton } from "@/components/TopHomeButton";
import { BottomHomeButton } from "@/components/BottomBackButton";
import { GlobalMenu } from "@/components/GlobalMenu";

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
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=5, user-scalable=yes",
      },
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


/**
 * Pages that already draw their own centered Pictaria palm + wordmark
 * at the top. We skip the global palm-tree home button there so the
 * branding doesn't stack or duplicate.
 */
const OWN_PALM_BRANDING = new Set([
  "/about",
  "/work-life-balance",
  "/beta",
  "/share",
  "/easter-egg",
  "/create",
]);

function hasOwnPalmBranding(path: string) {
  if (OWN_PALM_BRANDING.has(path)) return true;
  if (path.startsWith("/collection/")) return true;
  // /portal/daily has its own palms; /portal/daily-past does not.
  if (path === "/portal/daily") return true;
  return false;
}

/**
 * Top navigation on most screens: a back arrow in the top-left and a
 * palm-tree home button centered at the top. Home and puzzle screens draw
 * their own chrome, so we skip those to avoid duplicate controls.
 */
function GlobalChrome() {
  const raw = useRouterState({ select: (s) => s.location.pathname });
  const path = raw.replace(/\/+$/, "");

  const isHome = path === "" || path === "/";
  const hasOwnChrome =
    path.startsWith("/puzzle") || path.startsWith("/daily") || path.startsWith("/p/");

  if (isHome || hasOwnChrome) return null;

  return (
    <>
      <TopBackButton />
      {!hasOwnPalmBranding(path) && <TopHomeButton />}
    </>
  );
}

/**
 * The palm-tree home button fixed to the bottom-center of every page.
 * It complements the top back arrow by always returning to the home screen.
 */
function GlobalBottomChrome() {
  const raw = useRouterState({ select: (s) => s.location.pathname });
  const path = raw.replace(/\/+$/, "");

  // The strip behind the bottom palms used to show the pale page background on
  // dark pages, which read as a stray white box. Match the body to whatever
  // background the current page's <main> uses so it blends away.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const sync = () => {
      const main = document.querySelector("main");
      if (!main) return;
      const bg = window.getComputedStyle(main).backgroundColor;
      if (bg && bg !== "rgba(0, 0, 0, 0)") document.body.style.backgroundColor = bg;
    };
    const timer = window.setTimeout(sync, 60);
    sync();
    return () => window.clearTimeout(timer);
  }, [path]);

  if (path === "" || path === "/") return null;
  return <BottomHomeButton />;
}



function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <BackGuard />
      <GlobalMenu />
      <GlobalChrome />
      <div className="relative min-h-screen">
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <GlobalBottomChrome />
      </div>
    </QueryClientProvider>
  );
}
