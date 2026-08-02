import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Home as HomeIcon, LayoutGrid, Menu, User } from "lucide-react";
import { collections, freeCollection } from "@/data/collections";
import { TileMosaic } from "@/components/TileMosaic";
import heroImage from "@/assets/hero-sunset.jpg";

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
        <div className="absolute inset-x-0 top-7 flex flex-col items-center px-10 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 left-1/2 h-64 w-[140%] -translate-x-1/2 rounded-[50%] bg-deep/45 blur-2xl"
          />
          <span className="font-display text-2xl leading-none text-accent">
            ⛱
          </span>
          <h1 className="mt-1 pl-[0.16em] font-display text-[1.75rem] leading-tight tracking-[0.16em] text-shell sm:text-4xl">
            PICTARIA
          </h1>

          <div className="mt-2 flex w-56 items-center gap-2">
            <span className="h-px flex-1 bg-accent/70" />
            <span className="h-1 w-1 rounded-full bg-accent" />
            <span className="h-px flex-1 bg-accent/70" />
          </div>
          <p className="mt-2 text-[10px] tracking-[0.32em] text-accent uppercase">
            Turn pictures into play
          </p>
        </div>

        {/* headline + CTA */}
        <div className="absolute top-[30%] left-5 max-w-[62%] sm:left-10">
          <p className="font-display text-3xl leading-tight text-deep sm:text-4xl">
            Can you solve
            <br />
            tonight&rsquo;s sunset?
          </p>
          <Link
            to="/puzzle/$puzzleId"
            params={{ puzzleId: firstPuzzle.id }}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-deep px-6 py-3 text-sm tracking-[0.14em] text-accent uppercase shadow-lift transition-transform hover:scale-[1.03]"
          >
            Play now
            <span aria-hidden>›</span>
          </Link>
        </div>

        {/* unfinished tile puzzle */}
        <div className="absolute right-3 bottom-4 w-[52%] max-w-[280px] sm:right-8 sm:bottom-8">
          <TileMosaic src={heroImage} />
        </div>
      </section>

      {/* panel */}
      <section className="relative -mt-6 rounded-t-[28px] bg-shell px-4 pt-6 pb-8 sm:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <h2 className="min-w-0 truncate font-display text-base tracking-[0.2em] text-foreground uppercase">
              Featured Pictarias
            </h2>
            <Link
              to="/unlock"
              className="flex shrink-0 items-center gap-1 text-[11px] tracking-[0.18em] text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              View all <span aria-hidden>›</span>
            </Link>
          </div>

          <div className="-mx-4 mt-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0">
            {featured.map((collection) => {
              const target = collection.free
                ? { to: "/puzzle/$puzzleId", params: { puzzleId: firstPuzzle.id } }
                : { to: "/unlock" };
              return (
                <Link
                  key={collection.id}
                  {...(target as { to: string })}
                  className="tile-sheen group relative block w-[46%] shrink-0 snap-start overflow-hidden rounded-2xl shadow-soft transition-shadow duration-500 hover:shadow-lift sm:w-auto"
                >
                  <img
                    src={collection.cover}
                    alt={collection.title}
                    loading="lazy"
                    width={1024}
                    height={768}
                    className="aspect-[3/4] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-deep via-deep/70 to-transparent px-3 pt-8 pb-3">
                    <p className="text-[11px] leading-snug tracking-[0.1em] text-deep-foreground uppercase">
                      {collection.title}
                    </p>
                    <p className="mt-1 text-[10px] tracking-[0.14em] text-accent uppercase">
                      {collection.puzzles.length || 10} puzzles
                    </p>
                  </div>
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
                to="/unlock"
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
              to="/puzzle/$puzzleId"
              params={{ puzzleId: firstPuzzle.id }}
              className="flex flex-col items-center gap-1 text-deep-foreground/60 transition-colors hover:text-deep-foreground"
            >
              <LayoutGrid className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-[10px] tracking-wide">Library</span>
            </Link>
          </li>
          <li>
            <Link
              to="/unlock"
              className="flex flex-col items-center gap-1 text-deep-foreground/60 transition-colors hover:text-deep-foreground"
            >
              <Heart className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-[10px] tracking-wide">Favorites</span>
            </Link>
          </li>
          <li>
            <Link
              to="/unlock"
              className="flex flex-col items-center gap-1 text-deep-foreground/60 transition-colors hover:text-deep-foreground"
            >
              <User className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-[10px] tracking-wide">Profile</span>
            </Link>
          </li>
        </ul>
      </nav>
    </main>
  );
}
