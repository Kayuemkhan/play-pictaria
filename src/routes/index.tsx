import { createFileRoute, Link } from "@tanstack/react-router";
import { collections, freeCollection } from "@/data/collections";
import heroImage from "@/assets/sample-lagoon.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pictaria — Relaxing Jigsaw Puzzles" },
      {
        name: "description",
        content:
          "Pictaria turns beautiful photography into calming jigsaw puzzles. Ten free sea turtle puzzles, four difficulty levels, no clutter.",
      },
      { property: "og:title", content: "Pictaria — Relaxing Jigsaw Puzzles" },
      {
        property: "og:description",
        content:
          "A peaceful jigsaw experience built on beautiful photography. Play ten sea turtle puzzles free.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const locked = collections.filter((c) => !c.free);

  return (
    <main className="min-h-screen bg-mist-gradient">
      {/* hero */}
      <section className="relative overflow-hidden">
        <img
          src={heroImage}
          alt="A calm Hawaiian lagoon at golden hour"
          width={1200}
          height={912}
          className="h-[52vh] min-h-[300px] w-full object-cover sm:h-[58vh]"
        />
        <div className="absolute inset-0 bg-deep/45" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-[11px] tracking-[0.42em] text-deep-foreground/80 uppercase">
            Jigsaw, quietly
          </p>
          <h1 className="mt-3 font-display text-6xl text-deep-foreground sm:text-7xl">
            Pictaria
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-deep-foreground/85 sm:text-base">
            Beautiful photography, softly broken into pieces. Choose a picture,
            choose a pace, and let the ocean do the rest.
          </p>
          <Link
            to="/puzzle/$puzzleId"
            params={{ puzzleId: freeCollection.puzzles[0]!.id }}
            className="mt-7 rounded-full bg-card/95 px-7 py-3 text-sm tracking-wide text-foreground shadow-lift transition-transform hover:scale-[1.03]"
          >
            Start a puzzle
          </Link>
        </div>
      </section>

      {/* free collection */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0">
            <h2 className="font-display text-3xl sm:text-4xl">
              {freeCollection.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {freeCollection.tagline}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-accent/25 px-3 py-1 text-[11px] tracking-[0.2em] text-accent-foreground uppercase">
            Free
          </span>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {freeCollection.puzzles.map((puzzle) => (
            <Link
              key={puzzle.id}
              to="/puzzle/$puzzleId"
              params={{ puzzleId: puzzle.id }}
              className="tile-sheen group relative block overflow-hidden rounded-3xl shadow-soft transition-shadow duration-500 hover:shadow-lift"
            >
              <img
                src={puzzle.image}
                alt={puzzle.title}
                loading="lazy"
                width={1024}
                height={768}
                className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-deep/45 px-4 py-3 backdrop-blur-[2px]">
                <p className="font-display text-xl text-deep-foreground">
                  {puzzle.title}
                </p>
                <p className="text-[11px] tracking-wide text-deep-foreground/75">
                  {puzzle.caption}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* locked collections */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
        <h2 className="font-display text-3xl sm:text-4xl">More collections</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Unlock every gallery with Pictaria Premium
        </p>

        <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {locked.map((collection) => (
            <Link
              key={collection.id}
              to="/unlock"
              className="group relative block overflow-hidden rounded-3xl shadow-soft transition-shadow duration-500 hover:shadow-lift"
            >
              <img
                src={collection.cover}
                alt={collection.title}
                loading="lazy"
                width={1024}
                height={768}
                className="aspect-[4/3] w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-deep/55 px-4 text-center">
                <span className="text-lg text-deep-foreground/80">✦</span>
                <p className="mt-1 font-display text-2xl text-deep-foreground">
                  {collection.title}
                </p>
                <p className="mt-1 text-[11px] tracking-wide text-deep-foreground/75">
                  {collection.tagline}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            to="/unlock"
            className="rounded-full bg-primary px-8 py-3.5 text-sm tracking-wide text-primary-foreground shadow-lift transition-transform hover:scale-[1.03]"
          >
            Unlock all collections
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        Pictaria — a slower kind of puzzle.
      </footer>
    </main>
  );
}
