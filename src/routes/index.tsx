import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, Search } from "lucide-react";
import { collections, freeCollection } from "@/data/collections";
import { HeroPuzzle } from "@/components/HeroPuzzle";
import heroImage from "@/assets/hero-sunset.jpg";
import palmLogo from "@/assets/logo-palms.png";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pictaria — Turn Your Pictures Into Play" },
      {
        name: "description",
        content:
          "Pictaria turns beautiful photography into calming jigsaw puzzles. Ten free sea turtle puzzles, four difficulty levels, no clutter.",
      },
      { property: "og:title", content: "Pictaria — Turn Your Pictures Into Play" },
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
  const [cardPos, setCardPos] = useState({ x: 68, y: 38 });

  const startDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const frame = e.currentTarget.parentElement;
    if (!frame) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => {
      const r = frame.getBoundingClientRect();
      const x = ((ev.clientX - r.left) / r.width) * 100;
      const y = ((ev.clientY - r.top) / r.height) * 100;
      setCardPos({
        x: Math.min(90, Math.max(10, x)),
        y: Math.min(92, Math.max(8, y)),
      });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };



  return (
    <main className="min-h-screen bg-deep pb-8">
      {/* hero */}
      <section className="relative overflow-hidden">
        <img
          src={heroImage}
          alt="Golden Hawaiian sunset over the ocean with plumeria blossoms"
          width={1024}
          height={1408}
          className="h-screen min-h-[520px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-deep/75 via-transparent to-deep/40" />

        <div className="absolute top-5 right-5 left-5 z-[5] flex items-center justify-between">
          <button
            type="button"
            aria-label="Menu"
            className="grid h-11 w-11 place-items-center rounded-full bg-deep/80 text-accent backdrop-blur-sm transition-transform hover:scale-105"
          >
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            aria-label="Search puzzles"
            className="grid h-11 w-11 place-items-center rounded-full bg-deep/80 text-accent backdrop-blur-sm transition-transform hover:scale-105"
          >
            <Search className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>


        {/* wordmark */}
        <div className="absolute inset-x-0 top-10 flex flex-col items-center px-8 text-center sm:top-12">
          <img
            src={palmLogo}
            alt="Pictaria — two gold palm trees"
            width={1024}
            height={1024}
            className="h-11 w-auto drop-shadow-[0_3px_14px_oklch(0.2_0.05_230/0.6)] sm:h-14"
          />
          <h1 className="relative -mt-1 pl-[0.3em] font-display text-[2rem] leading-none font-medium tracking-[0.3em] text-shell [text-shadow:0_2px_18px_oklch(0.2_0.05_230/0.85),0_0_2px_oklch(0.2_0.05_230/0.9)] sm:text-[3rem]">
            PICTARIA
          </h1>

          <div className="mt-1.5 flex w-56 items-center gap-2">
            <span className="h-px flex-1 bg-accent/70" />
            <span className="h-1 w-1 rotate-45 bg-accent" />
            <span className="h-px flex-1 bg-accent/70" />
          </div>
          <p className="mt-1 text-[11px] font-medium tracking-[0.32em] text-accent uppercase [text-shadow:0_1px_12px_oklch(0.2_0.05_230/0.95),0_0_3px_oklch(0.2_0.05_230/0.9)]">
            Turn pictures into play
          </p>

        </div>

        {/* hero image puzzle — solved except the lower-left wedge */}
        <HeroPuzzle
          src={heroImage}
          cols={6}
          rows={8}
          wedge={4}
          depth={3}
          corner="bottom-right"
          inset={0}
        />


        {/* headline + CTA — draggable, so it can be placed anywhere on the sunset */}
        <div
          role="group"
          aria-label="Drag to position the headline"
          onPointerDown={startDrag}
          style={{
            left: `${cardPos.x}%`,
            top: `${cardPos.y}%`,
            transform: "translate(-50%, -50%)",
          }}
          className="absolute z-[4] w-[52%] cursor-grab touch-none rounded-xl bg-deep/55 px-3 py-2 backdrop-blur-[3px] active:cursor-grabbing sm:w-[34%]"
        >
          <p className="font-display text-[0.85rem] leading-tight text-shell">
            Can you solve today&rsquo;s {firstPuzzle.title.toLowerCase()}?
          </p>
          <Link
            to="/puzzle/$puzzleId"
            params={{ puzzleId: firstPuzzle.id }}
            search={{ grid: 3 }}
            className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[0.5rem] tracking-[0.14em] text-deep uppercase shadow-lift transition-transform hover:scale-[1.03]"
          >
            Play now
            <span aria-hidden>›</span>
          </Link>
        </div>


      </section>

      {/* panel */}
      <section className="relative rounded-t-lg bg-shell px-4 pt-6 pb-8 sm:px-8">
        <div className="mx-auto w-full max-w-5xl">
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
                "tile-sheen group relative block w-[46%] shrink-0 snap-start overflow-hidden rounded-[4px] border border-accent/60 shadow-soft transition-shadow duration-500 hover:shadow-lift sm:w-auto";

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

          {/* poem CTA — storybook */}
          <div className="relative mt-5 overflow-hidden rounded-[4px] border border-accent/60 bg-card/70 p-4">
            <span
              aria-hidden
              className="pointer-events-none absolute -top-4 -left-5 font-display text-[6rem] leading-none text-accent/10 select-none"
            >
              ❦
            </span>
            <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
              <p className="min-w-0 font-display text-[0.85rem] leading-snug [color:color-mix(in_oklch,var(--foreground)_92%,black)]">
                Pictures say a thousand words and puzzles make them fun — I want to build a Pictaria storybook for everyone I love
              </p>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-[0.55rem] tracking-[0.18em] text-muted-foreground uppercase">
                  Build your storybook
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

          {/* poem CTA — daily */}
          <div className="relative mt-3 overflow-hidden rounded-[4px] border border-accent/60 bg-card/70 p-4">
            <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
              <p className="min-w-0 font-display text-[0.85rem] leading-snug [color:color-mix(in_oklch,var(--foreground)_92%,black)]">
                Everyday I need just a little paradise and I need just a little play — please send me a free Pictaria every single day
              </p>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-[0.55rem] tracking-[0.18em] text-muted-foreground uppercase">
                  Get a free Pictaria daily
                </span>
                <Link
                  to="/daily"
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
