import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { collections, findPuzzle } from "@/data/collections";
import palmLogo from "@/assets/logo-palms-only.png";
import { getYesterdailys } from "@/lib/yesterdailys.functions";
import type { YesterdailyItem } from "@/lib/yesterdailys.functions";


export const Route = createFileRoute("/collection/$collectionId")({
  head: () => ({
    meta: [
      { title: "Puzzle collection — Pictaria" },
      {
        name: "description",
        content:
          "Browse every photograph in this Pictaria collection and pick the one you want to piece together.",
      },
      { property: "og:title", content: "Puzzle collection — Pictaria" },
      {
        property: "og:description",
        content: "Pick a photograph from this collection and start playing.",
      },
    ],
  }),
  component: CollectionPage,
});

function CollectionPage() {
  const { collectionId } = Route.useParams();
  const collection = collections.find((c) => c.id === collectionId);
  const isArchive = collectionId === "yesterdailys";

  const loadArchive = useServerFn(getYesterdailys);
  const [archive, setArchive] = useState<YesterdailyItem[]>([]);

  useEffect(() => {
    if (!isArchive) return;
    void loadArchive({}).then((result) => setArchive(result.items));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isArchive]);

  if (!collection) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-mist-gradient px-6 text-center">
        <h1 className="font-display text-4xl">Collection not found</h1>
        <Link
          to="/"
          className="mt-6 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground"
        >
          Back to album
        </Link>
      </main>
    );
  }




  return (
    <main className="min-h-screen bg-mist-gradient px-4 pb-20 sm:px-6">
      <div className="mx-auto w-full max-w-4xl pt-6">
        <div className="text-center">
          {/* secret palms — tap to slip straight home */}
          <Link to="/" aria-label="Home" className="inline-block">
            <img
              src={palmLogo}
              alt=""
              width={1024}
              height={1024}
              className="mx-auto h-9 w-auto transition-transform duration-500 ease-[var(--ease-calm)] hover:scale-105 active:scale-95"
            />
          </Link>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl">
            {collection.title}
          </h1>
          <p className="mt-1 text-[0.8rem] text-muted-foreground">
            {collection.tagline}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">

          {archive.map((item) => {
            const found = item.kind === "puzzle" ? findPuzzle(item.id) : null;
            const image = item.image ?? found?.puzzle.image ?? null;
            const title = found?.puzzle.title ?? item.title;
            if (!image) return null;
            const linkProps =
              item.kind === "shared"
                ? ({ to: "/p/$code", params: { code: item.id } } as const)
                : ({
                    to: "/puzzle/$puzzleId",
                    params: { puzzleId: item.id },
                    search: { grid: undefined },
                  } as const);
            return (
              <Link
                key={`${item.kind}-${item.id}`}
                {...linkProps}
                className="group relative block overflow-hidden rounded-[4px] border border-accent/60 shadow-soft transition-shadow duration-500 hover:shadow-lift"
              >
                <img
                  src={image}
                  alt={title}
                  loading="lazy"
                  className="aspect-[3/4] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-deep via-deep/70 to-transparent px-3 pt-8 pb-3 text-left">
                  <p className="text-[11px] leading-snug tracking-[0.1em] text-deep-foreground uppercase">
                    {title}
                  </p>
                  <p className="mt-1 text-[10px] tracking-[0.14em] text-accent uppercase">
                    {new Date(item.picked_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            );
          })}
          {collection.puzzles.map((puzzle) => {
            return (
              <Link
                key={puzzle.id}
                to="/puzzle/$puzzleId"
                params={{ puzzleId: puzzle.id }}
                search={{ grid: undefined }}
                className="group block"
              >
                <div className="overflow-hidden rounded-[4px] border border-accent/60 shadow-soft transition-shadow duration-500 group-hover:shadow-lift">
                  <img
                    src={puzzle.image}
                    alt={puzzle.title}
                    loading="lazy"
                    width={1024}
                    height={768}
                    className="aspect-[3/4] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  />
                </div>
                <div className="px-1 pt-2 text-center">
                  <p className="font-display text-base leading-tight text-foreground">
                    {puzzle.title}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </main>
  );
}

