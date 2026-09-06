import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { visibleCollections } from "@/data/collections";
import type { Collection } from "@/data/collections";
import { getLibraryCollections } from "@/lib/collection-catalog.functions";


export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Puzzle Collections — Pictaria" },
      {
        name: "description",
        content: "Browse every Pictaria puzzle collection, from Hawaiian flowers and waterfalls to sea turtles and sunsets.",
      },
      { property: "og:title", content: "Puzzle Collections — Pictaria" },
      {
        property: "og:description",
        content: "Choose a beautiful Pictaria collection and start playing.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CollectionsPage,
});

function CollectionsPage() {
  const loadLibrary = useServerFn(getLibraryCollections);
  const [libraryCollections, setLibraryCollections] = useState<Collection[]>([]);

  useEffect(() => {
    void loadLibrary({}).then((result) => setLibraryCollections(result.collections));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allCollections = [...libraryCollections, ...visibleCollections];

  return (
    <main className="min-h-screen bg-mist-gradient px-4 pb-20 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <div className="pt-24 text-center">
          <p className="text-[10px] tracking-[0.28em] text-muted-foreground uppercase">
            The Pictaria albums
          </p>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl">All Collections</h1>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">

          {allCollections.map((collection) => (
            <Link
              key={collection.id}
              to="/collection/$collectionId"
              params={{ collectionId: collection.id }}
              className="tile-sheen group relative block overflow-hidden rounded-[4px] border border-accent/60 shadow-soft transition-shadow duration-500 hover:shadow-lift"
            >
              <img
                src={collection.cover}
                alt={collection.title}
                loading="lazy"
                width={768}
                height={1024}
                className="aspect-[3/4] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-deep via-deep/70 to-transparent px-2 pt-8 pb-2.5">
                <p
                  className={`leading-tight text-deep-foreground/85 uppercase ${
                    collection.title.length > 10
                      ? "text-[9px] tracking-[0.01em]"
                      : "text-[10px] tracking-[0.06em]"
                  }`}
                >
                  {collection.title}
                </p>

                <p className="mt-1 text-[10px] tracking-[0.14em] text-accent uppercase">
                  {collection.puzzles.length} puzzles
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}