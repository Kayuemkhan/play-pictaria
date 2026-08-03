import { createFileRoute, Link } from "@tanstack/react-router";
import {
  collections,
  visitorAllowance,
  waitingCount,
} from "@/data/collections";

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

  if (!collection) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-mist-gradient px-6 text-center">
        <h1 className="font-display text-4xl">Collection not found</h1>
        <Link
          to="/"
          className="mt-6 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground"
        >
          Back to gallery
        </Link>
      </main>
    );
  }

  const allowance = visitorAllowance(collection);
  const waiting = waitingCount(collection);
  const storybook = collection.storybook;

  return (
    <main className="min-h-screen bg-mist-gradient px-4 pb-20 sm:px-6">
      <div className="mx-auto w-full max-w-4xl">
        <Link
          to="/"
          className="inline-block py-5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Home
        </Link>

        <div className="text-center">
          <p className="text-[11px] tracking-[0.3em] text-muted-foreground uppercase">
            {storybook
              ? `${Math.min(allowance, collection.puzzles.length)} puzzles to open`
              : `${collection.puzzles.length} puzzles`}
          </p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl">
            {collection.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {collection.tagline}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {collection.puzzles.map((puzzle, index) => {
            const open = index < allowance;

            if (!open) {
              return (
                <Link
                  key={puzzle.id}
                  to="/storybook/$collectionId"
                  params={{ collectionId: collection.id }}
                  className="group relative block overflow-hidden rounded-[4px] border border-accent/60 shadow-soft transition-shadow duration-500 hover:shadow-lift"
                >
                  <img
                    src={puzzle.image}
                    alt={puzzle.title}
                    loading="lazy"
                    width={1024}
                    height={768}
                    className="aspect-[3/4] w-full scale-[1.02] object-cover blur-[6px]"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-deep/45 px-3 text-center">
                    <p className="font-display text-2xl text-deep-foreground">
                      {waiting}
                    </p>
                    <p className="mt-1 text-[10px] leading-snug tracking-[0.14em] text-accent uppercase">
                      Waiting in Pictaria
                    </p>
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={puzzle.id}
                to="/puzzle/$puzzleId"
                params={{ puzzleId: puzzle.id }}
                search={{ grid: undefined }}
                className="group relative block overflow-hidden rounded-[4px] border border-accent/60 shadow-soft transition-shadow duration-500 hover:shadow-lift"
              >
                <img
                  src={puzzle.image}
                  alt={puzzle.title}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="aspect-[3/4] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-deep via-deep/70 to-transparent px-3 pt-8 pb-3 text-left">
                  <p className="text-[11px] leading-snug tracking-[0.1em] text-deep-foreground uppercase">
                    {puzzle.title}
                  </p>
                  <p className="mt-1 text-[10px] tracking-[0.14em] text-accent uppercase">
                    Play
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {storybook && (
          <div className="mt-10 rounded-[4px] border border-accent/60 bg-card/80 px-5 py-6 text-center shadow-soft">
            <p className="font-display text-xl leading-snug">
              {waiting > 0
                ? `There are ${waiting} puzzles from ${storybook.owner} still waiting in Pictaria.`
                : `More beautiful booklets are waiting in Pictaria.`}
            </p>
            <Link
              to="/storybook/$collectionId"
              params={{ collectionId: collection.id }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-[0.6rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03]"
            >
              Do you want to go?
              <span aria-hidden>›</span>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

