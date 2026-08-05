import { createFileRoute, Link } from "@tanstack/react-router";
import { collections } from "@/data/collections";


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
  return (
    <main className="min-h-screen bg-mist-gradient px-4 pb-20 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <div className="pt-8 text-center">
          <p className="text-[11px] tracking-[0.3em] text-muted-foreground uppercase">
            The Pictaria gallery
          </p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl">All Collections</h1>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {collections.map((collection) => (
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
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-deep via-deep/70 to-transparent px-3 pt-8 pb-3">
                <p className="text-[11px] leading-snug tracking-[0.1em] text-deep-foreground uppercase">
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
      <BottomBackButton />
    </main>
  );
}