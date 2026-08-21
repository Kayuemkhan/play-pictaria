import { createFileRoute, Link } from "@tanstack/react-router";
import {
  collections,
  visitorAllowance,
  waitingCount,
} from "@/data/collections";


export const Route = createFileRoute("/storybook/$collectionId")({
  head: () => ({
    meta: [
      { title: "More puzzles are waiting — Pictaria" },
      {
        name: "description",
        content:
          "This storybook has more photographs waiting inside Pictaria. Step into the album of booklets and keep playing.",
      },
      { property: "og:title", content: "More puzzles are waiting — Pictaria" },
      {
        property: "og:description",
        content:
          "More photographs from this storybook are waiting inside Pictaria.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StorybookGatePage,
});

function StorybookGatePage() {
  const { collectionId } = Route.useParams();
  const collection = collections.find((c) => c.id === collectionId);

  if (!collection) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-mist-gradient px-6 text-center">
        <h1 className="font-display text-4xl">Storybook not found</h1>
        <Link
          to="/"
          className="mt-6 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground"
        >
          Back to album
        </Link>
      </main>
    );
  }

  const owner = collection.storybook?.owner ?? collection.title;
  const waiting = waitingCount(collection);
  const opened = Math.min(collection.puzzles.length, visitorAllowance(collection));
  const booklets = collections.filter((c) => !c.storybook).slice(0, 4);

  return (
    <main className="min-h-screen bg-mist-gradient px-4 pb-20 sm:px-6">
      <div className="mx-auto w-full max-w-3xl pt-8">
        <div className="rounded-[4px] border border-accent/60 bg-card/80 px-6 py-10 text-center shadow-lift backdrop-blur-sm">
          <p className="text-[11px] tracking-[0.3em] text-muted-foreground uppercase">
            {owner}&rsquo;s storybook
          </p>

          {waiting > 0 ? (
            <h1 className="mt-4 font-display text-3xl leading-tight sm:text-4xl">
              There are {waiting} puzzles from {owner}
              <br className="hidden sm:block" /> still waiting in Pictaria.
            </h1>
          ) : (
            <h1 className="mt-4 font-display text-3xl leading-tight sm:text-4xl">
              You&rsquo;ve pieced together all {opened} puzzles
              <br className="hidden sm:block" /> from {owner}.
            </h1>
          )}

          <p className="mt-4 text-sm text-muted-foreground">
            {waiting > 0
              ? "Do you want to go?"
              : "There is a whole album of booklets waiting inside Pictaria. Do you want to go?"}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/collections"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-[0.6rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03]"
            >
              Yes, take me to Pictaria
              <span aria-hidden>›</span>
            </Link>
            <Link
              to="/collection/$collectionId"
              params={{ collectionId: collection.id }}
              className="rounded-full border border-accent/60 px-5 py-2 text-[0.6rem] tracking-[0.2em] text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              Not yet
            </Link>
          </div>
        </div>

        <p className="mt-12 text-center text-[11px] tracking-[0.3em] text-muted-foreground uppercase">
          Booklets inside Pictaria
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {booklets.map((booklet) => (
            <Link
              key={booklet.id}
              to="/collection/$collectionId"
              params={{ collectionId: booklet.id }}
              className="group relative block overflow-hidden rounded-[4px] border border-accent/60 shadow-soft transition-shadow duration-500 hover:shadow-lift"
            >
              <img
                src={booklet.cover}
                alt={booklet.title}
                loading="lazy"
                width={768}
                height={1024}
                className="aspect-[3/4] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-deep via-deep/70 to-transparent px-3 pt-8 pb-3">
                <p className="text-[10px] leading-snug tracking-[0.1em] text-deep-foreground uppercase">
                  {booklet.title}
                </p>
                <p className="mt-1 text-[10px] tracking-[0.14em] text-accent uppercase">
                  {booklet.puzzles.length} puzzles
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/collections"
            className="text-[11px] tracking-[0.25em] text-accent uppercase transition-colors hover:text-foreground"
          >
            View all booklets ›
          </Link>
        </div>
      </div>
    </main>
  );
}
