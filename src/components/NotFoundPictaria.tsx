import { Link, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

import shores from "@/assets/cover-shores.webp";
import palms from "@/assets/logo-palms-only.webp";

/**
 * The Pictaria not-found page: a quiet tropical shore, a kind line of copy,
 * and the two doors people actually want — home, and every gallery.
 */
export function NotFoundPictaria() {
  const router = useRouter();

  // Legacy/stray URLs like "/index" should land on the homepage, not a dead end.
  useEffect(() => {
    const path = router.state.location.pathname.replace(/\/+$/, "");
    if (path === "/index" || path === "/home") {
      router.navigate({ to: "/", replace: true });
    }
  }, [router]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-deep">
      <img
        src={shores}
        alt="A calm Hawaiian shoreline at golden hour"
        className="absolute inset-0 h-full w-full object-cover opacity-80"
        loading="eager"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.22_0.05_235/0.35)_0%,oklch(0.22_0.05_235/0.74)_45%,oklch(0.22_0.05_235/0.88)_100%)]"
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-20 text-center">
        <img
          src={palms}
          alt=""
          aria-hidden
          className="h-16 w-auto opacity-90 drop-shadow-[0_2px_12px_oklch(0_0_0/0.45)]"
        />

        <p className="mt-6 text-[10px] tracking-[0.3em] text-shell/70 uppercase">
          you wandered off the map
        </p>

        <h1 className="mt-3 font-display text-[2rem] leading-tight text-shell sm:text-[2.4rem]">
          This little shore is empty
        </h1>

        <p className="mt-4 text-[0.95rem] leading-relaxed text-shell/80">
          The page you were looking for isn&rsquo;t here — maybe the tide took it,
          maybe the link had a typo. Nothing is lost. Your pictures, your
          galleries and today&rsquo;s Pictaria are all still waiting.
        </p>

        <div className="mt-9 flex w-full flex-col gap-3">
          <Link
            to="/"
            className="w-full rounded-full bg-primary px-6 py-3.5 text-[11px] tracking-[0.22em] text-primary-foreground uppercase shadow-lift transition-transform active:scale-[0.98]"
          >
            Take me home
          </Link>
          <Link
            to="/collections"
            className="w-full rounded-full border border-accent/50 bg-shell/10 px-6 py-3.5 text-[11px] tracking-[0.22em] text-shell uppercase backdrop-blur-sm transition-colors hover:bg-shell/20"
          >
            View all collections
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <Link
            to="/daily"
            className="text-[10px] tracking-[0.18em] text-shell/65 uppercase underline decoration-accent/50 underline-offset-4"
          >
            Today&rsquo;s Pictaria
          </Link>
          <Link
            to="/create"
            className="text-[10px] tracking-[0.18em] text-shell/65 uppercase underline decoration-accent/50 underline-offset-4"
          >
            Send a free Pictaria
          </Link>
          <Link
            to="/about"
            className="text-[10px] tracking-[0.18em] text-shell/65 uppercase underline decoration-accent/50 underline-offset-4"
          >
            Travel to Pictaria
          </Link>
        </div>
      </div>
    </main>
  );
}
