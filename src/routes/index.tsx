import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Home as HomeIcon, LayoutGrid, Menu, User } from "lucide-react";
import { collections, freeCollection } from "@/data/collections";
import { TileMosaic } from "@/components/TileMosaic";
import heroImage from "@/assets/hero-sunset.jpg";
import palmLogo from "@/assets/logo-palms.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pictaria — Turn Pictures Into Play" },
      {
        name: "description",
        content:
          "Pictaria turns beautiful photography into calming jigsaw puzzles. Ten free sea turtle puzzles, four difficulty levels, no clutter.",
      },
      { property: "og:title", content: "Pictaria — Turn Pictures Into Play" },
      {
        property: "og:description",
        content:
          "A peaceful jigsaw experience built on beautiful photography. Play ten sea turtle puzzles free.",
      },
    ],
  }),
  component: Home,
});

const featured = collections;

function Home() {
  const firstPuzzle = freeCollection.puzzles[0]!;

  return (
    <main className="min-h-screen bg-deep pb-32">
      {/* hero */}
      <section className="relative overflow-hidden">
        <img
          src={heroImage}
          alt="Golden Hawaiian sunset over the ocean with plumeria blossoms"
          width={1024}
          height={1408}
          className="h-[78vh] min-h-[520px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-deep/75 via-transparent to-deep/40" />

        <button
          type="button"
          aria-label="Menu"
          className="absolute top-5 left-5 grid h-11 w-11 place-items-center rounded-full bg-deep/80 text-accent backdrop-blur-sm transition-transform hover:scale-105"
        >
          <Menu className="h-5 w-5" strokeWidth={1.5} />
        </button>

        {/* wordmark */}
        <div className="absolute inset-x-0 top-6 flex flex-col items-center px-10 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[150%] -translate-x-1/2 rounded-[50%] bg-deep/50 blur-2xl"
          />
          <img
            src={palmLogo}
            alt="Pictaria — two gold palm trees"
            width={1024}
            height={768}
            className="h-16 w-auto drop-shadow-[0_2px_10px_oklch(0.2_0.05_230/0.55)] sm:h-20"
          />
          <h1 className="-mt-2 pl-[0.18em] font-display text-[1.9rem] leading-tight tracking-[0.22em] text-shell sm:text-[2.6rem]">
            PICTARIA
          </h1>

          <div className="mt-2 flex w-60 items-center gap-2">
            <span className="h-px flex-1 bg-accent/70" />
            <span className="h-1 w-1 rotate-45 bg-accent" />
            <span className="h-px flex-1 bg-accent/70" />
          </div>
          <p className="mt-2 text-[10px] tracking-[0.36em] text-accent uppercase">
            Turn pictures into play
          </p>
        </div>


        {/* headline + CTA */}
        <div className="absolute top-[30%] left-5 max-w-[62%] sm:left-10">
          <p className="font-display text-3xl leading-tight text-deep sm:text-4xl">
            Can you solve
            <br />
            tonight&rsquo;s hibiscus?
          </p>
          <Link
            to="/puzzle/$puzzleId"
            params={{ puzzleId: firstPuzzle.id }}
            search={{ grid: 3 }}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-deep px-6 py-3 text-sm tracking-[0.14em] text-accent uppercase shadow-lift transition-transform hover:scale-[1.03]"
          >
            Play now
            <span aria-hidden>›</span>
          </Link>
        </div>


        {/* unfinished tile puzzle */}
        <div className="absolute right-4 bottom-8 w-[38%] max-w-[210px] sm:right-8 sm:bottom-12">
          <TileMosaic src={firstPuzzle.image} />
        </div>
      </section>

      {/* panel */}
      <section className="relative -mt-6 rounded-t-[28px] bg-shell px-4 pt-6 pb-8 sm:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <h2 className="min-w-0 truncate font-display text-base tracking-[0.2em] text-foreground uppercase">
              Featured
            </h2>
            <Link
              to="/collection/$collectionId"
              params={{ collectionId: freeCollection.id }}
              className="flex shrink-0 items-center gap-1 text-[11px] tracking-[0.18em] text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              View all <span aria-hidden>›</span>
            </Link>
          </div>

          <div className="-mx-4 mt-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0">

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
                "tile-sheen group relative block w-[46%] shrink-0 snap-start overflow-hidden rounded-2xl shadow-soft transition-shadow duration-500 hover:shadow-lift sm:w-auto";

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

          {/* storybook CTA */}
          <div className="relative mt-5 overflow-hidden rounded-2xl border border-border bg-card/70 p-5">
            <span
              aria-hidden
              className="pointer-events-none absolute -top-6 -left-8 font-display text-[9rem] leading-none text-accent/10 select-none"
            >
              ❦
            </span>
            <div className="relative grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="min-w-0">
                <h3 className="font-display text-2xl leading-tight">
                  Create Your
                  <br />
                  Pictaria Storybook
                </h3>
                <div className="mt-3 flex w-40 items-center gap-2">
                  <span className="h-px flex-1 bg-accent/60" />
                  <span className="h-1 w-1 rounded-full bg-accent" />
                  <span className="h-px flex-1 bg-accent/60" />
                </div>
                <p className="mt-3 text-[10px] leading-relaxed tracking-[0.18em] text-muted-foreground uppercase">
                  Send and share
                  <br />
                  to your friends!
                </p>
              </div>
              <Link
                to="/collection/$collectionId"
                params={{ collectionId: freeCollection.id }}
                className="justify-self-start rounded-full bg-deep px-6 py-3 text-[11px] tracking-[0.2em] text-accent uppercase shadow-lift transition-transform hover:scale-[1.03] sm:justify-self-end"
              >
                Get started
              </Link>

            </div>
          </div>
        </div>
      </section>

      {/* bottom nav */}
      <nav className="fixed inset-x-3 bottom-3 z-20 mx-auto max-w-md rounded-3xl bg-deep/95 px-2 py-3 shadow-lift backdrop-blur">
        <ul className="grid grid-cols-4 text-center">
          <li>
            <Link
              to="/"
              className="flex flex-col items-center gap-1 text-accent"
            >
              <HomeIcon className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-[10px] tracking-wide">Home</span>
            </Link>
          </li>
          <li>
            <Link
              to="/collection/$collectionId"
              params={{ collectionId: freeCollection.id }}

              className="flex flex-col items-center gap-1 text-deep-foreground/60 transition-colors hover:text-deep-foreground"
            >
              <LayoutGrid className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-[10px] tracking-wide">Library</span>
            </Link>
          </li>
          <li>
            <button
              type="button"
              className="flex w-full flex-col items-center gap-1 text-deep-foreground/40"
            >
              <Heart className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-[10px] tracking-wide">Favorites</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              className="flex w-full flex-col items-center gap-1 text-deep-foreground/40"
            >
              <User className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-[10px] tracking-wide">Profile</span>
            </button>
          </li>

        </ul>
      </nav>
    </main>
  );
}
