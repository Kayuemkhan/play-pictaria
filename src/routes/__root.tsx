import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useRef, type ReactNode } from "react";
import { toast } from "sonner";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
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
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
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
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
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
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Karla:wght@300;400;500&display=swap",
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

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const backToastShownRef = useRef(false);
  const previousPathRef = useRef<string | null>(null);

  // Android closes a standalone web app when the current page is its first
  // history entry. Keep a same-page guard above every Pictaria route so the
  // hardware Back button reaches us before the browser can close the app.
  useEffect(() => {
    if (typeof window === "undefined") return;

    type PictariaHistoryState = {
      pictariaBase?: boolean;
      pictariaGuard?: boolean;
      pictariaPath?: string;
      pictariaHasPriorPage?: boolean;
    };

    const protectCurrentPage = () => {
      const path = `${window.location.pathname}${window.location.search}`;
      const state = (window.history.state ?? {}) as PictariaHistoryState;

      if (state.pictariaGuard && state.pictariaPath === path) {
        previousPathRef.current = path;
        return;
      }

      const hasPriorPage = previousPathRef.current !== null;
      const baseState = {
        ...state,
        pictariaBase: true,
        pictariaGuard: false,
        pictariaPath: path,
        pictariaHasPriorPage: hasPriorPage,
      };

      window.history.replaceState(baseState, "", window.location.href);
      window.history.pushState(
        { ...baseState, pictariaBase: false, pictariaGuard: true },
        "",
        window.location.href,
      );
      previousPathRef.current = path;
    };

    protectCurrentPage();
    const unsubscribe = router.subscribe("onResolved", protectCurrentPage);

    const handlePopState = () => {
      const state = (window.history.state ?? {}) as PictariaHistoryState;
      if (!state.pictariaBase) return;

      const path = `${window.location.pathname}${window.location.search}`;

      if (state.pictariaHasPriorPage) {
        // The entry below is the guard belonging to the actual prior page.
        // Pop to it, allowing TanStack Router to restore that page normally.
        window.setTimeout(() => window.history.back(), 0);
        return;
      }

      if (window.location.pathname !== "/") {
        // A gallery or puzzle may be the first screen after launching from a
        // saved link. In that case there is no browser history, so return Home
        // without ever handing control back to Android's app closer.
        router.navigate({ to: "/", replace: true });
        return;
      }

      if (!backToastShownRef.current) {
        toast.message("You’re at the Pictaria home page", { duration: 2000 });
        backToastShownRef.current = true;
        window.setTimeout(() => {
          backToastShownRef.current = false;
        }, 2000);
      }

      // Home is the bottom of Pictaria's navigation, so keep it open.
      window.history.pushState(
        { ...state, pictariaBase: false, pictariaGuard: true, pictariaPath: path },
        "",
        window.location.href,
      );
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      unsubscribe();
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router]);


  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
