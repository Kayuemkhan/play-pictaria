import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { visibleCollections } from "@/data/collections";
import { getDailyPicks } from "@/lib/daily-pick.functions";
import { isPortalPick, portalPickCode } from "@/lib/daily-display";
import { supabase } from "@/integrations/supabase/client";
import { HeroPuzzle } from "@/components/HeroPuzzle";

import heroImage from "@/assets/hero-sunset.jpg";
import palmLogo from "@/assets/logo-palms-only.png";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pictaria — Turn Your Pictures Into Play" },
      {
        name: "description",
        content:
          "Discover beautiful photography one puzzle \"peace\" at a time.",
      },
      { property: "og:title", content: "Pictaria — Turn Your Pictures Into Play" },
      {
        property: "og:description",
        content:
          "Discover beautiful photography one puzzle \"peace\" at a time.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://play-pictaria.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://play-pictaria.lovable.app/" }],
  }),
  component: Home,
});

const featured = visibleCollections;




function Home() {
  const navigate = useNavigate();
  const taps = useRef<{ count: number; last: number }>({ count: 0, last: 0 });
  const [signedUp, setSignedUp] = useState(false);
  const [todaysPuzzleId, setTodaysPuzzleId] = useState("turtle-09");
  const loadPicks = useServerFn(getDailyPicks);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user?.email) {
        setSignedUp(true);
        return;
      }
      if (localStorage.getItem("pictaria_daily_signed_up") === "1") {
        setSignedUp(true);
      }
    };
    check();
  }, []);

  useEffect(() => {
    const loadToday = async () => {
      try {
        const result = await loadPicks({});
        if (result.current?.puzzle_id) setTodaysPuzzleId(result.current.puzzle_id);
      } catch {
        // Keep the fallback puzzle if the pick can't be read.
      }
    };
    void loadToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The hidden admin page opens only after three quick taps on the palm logo.
  const handleLogoTap = () => {
    const now = Date.now();
    const state = taps.current;
    state.count = now - state.last > 1200 ? 1 : state.count + 1;
    state.last = now;
    if (state.count >= 3) {
      state.count = 0;
      navigate({ to: "/portal/new" });
    }
  };

  const dailyLink = signedUp
    ? isPortalPick(todaysPuzzleId)
      ? ({ to: "/p/$code", params: { code: portalPickCode(todaysPuzzleId) } } as const)
      : ({
          to: "/puzzle/$puzzleId",
          params: { puzzleId: todaysPuzzleId },
          search: { grid: undefined },
        } as const)
    : ({ to: "/daily" } as const);

  return (
    <main className="flex min-h-screen flex-col bg-deep">
      {/* hero */}
      <section className="relative overflow-hidden">
        <img
          src={heroImage}
          alt="Hibiscus and plumeria blossoms beside the ocean at a Hawaiian sunset"
          width={1024}
          height={1408}
          className="h-[68svh] max-h-[760px] min-h-[420px] w-full object-cover sm:h-screen sm:min-h-[520px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-deep/40 via-transparent to-deep/28" />




        {/* wordmark */}
        <div className="absolute inset-x-0 top-16 flex flex-col items-center px-6 text-center sm:top-10">
          <button
            type="button"
            onClick={handleLogoTap}
            aria-label="Pictaria"
            className="relative z-10"
          >
            <img
              src={palmLogo}
              alt="Pictaria"
              width={1024}
              height={1024}
              className="h-[3.25rem] w-auto cursor-pointer drop-shadow-[0_4px_18px_oklch(0.15_0.04_230/0.55)] transition-transform duration-500 ease-[var(--ease-calm)] hover:scale-[1.06] sm:h-[4.25rem]"
            />
          </button>
          <span className="mt-5 cursor-pointer bg-gradient-to-br from-[oklch(0.99_0.03_90)] via-[oklch(0.96_0.05_88)] to-[oklch(0.88_0.09_80)] bg-clip-text font-display text-3xl leading-none tracking-[0.14em] text-transparent uppercase drop-shadow-[0_3px_14px_oklch(0.15_0.04_230/0.5)] transition-transform duration-500 ease-[var(--ease-calm)] hover:scale-[1.04] sm:mt-6 sm:text-4xl">
            Pictaria
          </span>
          <span
            className="-mt-1 cursor-pointer font-display text-[0.81rem] tracking-[0.42em] uppercase transition-transform duration-500 ease-[var(--ease-calm)] hover:scale-[1.04] sm:text-[0.94rem]"
            style={{
              color: "oklch(0.98 0.025 85)",
              textShadow: "0 2px 12px oklch(0.15 0.04 230 / 0.55)",
            }}
          >
            Turn pictures into play
          </span>
        </div>


        {/* Four animating puzzle tiles in the lower-right corner */}
        <HeroPuzzle
          src={heroImage}
          cols={6}
          rows={6}
          wedge={3}
          depth={2}
          corner="bottom-right"
          inset={0}
          maxPieces={4}
          animated
        />

      </section>

      {/* panel */}
      <section className="relative flex-1 rounded-t-lg bg-shell px-4 pt-6 pb-8 sm:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm tracking-[0.2em] text-foreground uppercase">
              Collections
            </h2>
            <Link
              to="/collections"
              className="inline-flex items-center gap-1 text-[0.7rem] tracking-[0.16em] text-primary uppercase transition-opacity hover:opacity-70"
            >
              View all
              <span aria-hidden>›</span>
            </Link>
          </div>

          <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0">


            {featured.map((collection) => {
              const soon = collection.comingSoon === true;
              const inner = (
                <>
                  <img
                    src={collection.cover}
                    alt={collection.title}
                    loading="lazy"
                    width={768}
                    height={1024}
                    style={
                      collection.coverZoom
                        ? { transform: `scale(${collection.coverZoom})` }
                        : undefined
                    }
                    className="aspect-[3/4] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-deep via-deep/70 to-transparent px-3 pt-8 pb-3">
                    <p className="text-[11px] leading-snug tracking-[0.1em] text-deep-foreground uppercase">
                      {collection.title}
                    </p>
                    <p className="mt-1 text-[10px] tracking-[0.14em] text-accent uppercase">
                      {soon
                        ? "Coming soon"
                        : `${collection.puzzles.length} puzzles`}
                    </p>
                  </div>
                </>
              );

              const shell =
                "tile-sheen group relative block w-[27%] shrink-0 snap-start overflow-hidden rounded-[4px] border border-accent/60 shadow-soft transition-shadow duration-500 hover:shadow-lift sm:w-auto";

              if (soon) {
                return (
                  <div
                    key={collection.id}
                    className={`${shell} cursor-default opacity-80`}
                  >
                    {inner}
                  </div>
                );
              }

              return (
                <Link
                  key={collection.id}
                  to="/collection/$collectionId"
                  params={{ collectionId: collection.id }}
                  className={shell}
                >
                  {inner}
                </Link>
              );
            })}
          </div>

          <h2 className="mt-5 font-display text-sm tracking-[0.2em] text-foreground uppercase">
            Explore
          </h2>

          {/* launch CTA */}
          <div className="relative mt-2 overflow-hidden rounded-[4px] border border-accent/60 bg-deep-gradient p-4">
            <div className="relative flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display text-[0.85rem] leading-snug text-deep-foreground">
                  Watch the launch film and join the list — be first to send your special moments as a game.
                </p>
                <p className="mt-1 text-[0.6rem] tracking-[0.14em] text-accent uppercase">
                  Launching soon
                </p>
              </div>
              <Link
                to="/launch"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[0.55rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03]"
              >
                Join the launch list
                <span aria-hidden>›</span>
              </Link>
            </div>
          </div>

          {/* poem CTA — daily */}
          <div className="relative mt-3 overflow-hidden rounded-[4px] border border-accent/60 bg-card/70 p-4">
            <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
              <p className="min-w-0 font-display text-[0.85rem] leading-snug [color:color-mix(in_oklch,var(--foreground)_92%,black)]">
                I need a little paradise and I need just a little play — please send me a free Pictaria every single day
              </p>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-[0.55rem] tracking-[0.18em] text-muted-foreground uppercase">
                  Today's free Pictaria
                </span>
                <Link
                  to="/daily"
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[0.55rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03]"
                >
                  Play today's Pictaria
                  <span aria-hidden>›</span>
                </Link>
              </div>
            </div>
          </div>

          {/* poem CTA — storybook */}
          <div className="relative mt-3 overflow-hidden rounded-[4px] border border-accent/60 bg-card/70 p-4">
            <span
              aria-hidden
              className="pointer-events-none absolute -top-4 -left-5 font-display text-[6rem] leading-none text-accent/10 select-none"
            >
              ❦
            </span>
            <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
              <p className="min-w-0 font-display text-[0.85rem] leading-snug [color:color-mix(in_oklch,var(--foreground)_92%,black)]">
                Pictures say a thousand words and puzzles make them fun — Send your special moments as a game to those you love!
              </p>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-[0.55rem] tracking-[0.18em] text-muted-foreground uppercase">
                  Create your own Pictarias
                </span>
                <Link
                  to="/create"
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[0.55rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03]"
                >
                  Start here
                  <span aria-hidden>›</span>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

    </main>

  );
}
