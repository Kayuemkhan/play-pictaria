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

const menuLinks = [
  { to: "/collections", label: "Gallery" },
  { to: "/create", label: "Personal storybooks" },
  { to: "/pricing", label: "Bougie Studio" },
  { to: "/business", label: "For business" },
  { to: "/pricing", label: "Pricing" },
  { to: "/daily", label: "Daily Pictaria" },
] as const;



function Home() {
  const firstPuzzle = freeCollection.puzzles[0]!;
  const [cardPos, setCardPos] = useState({ x: 66, y: 46 });
  const [openPanel, setOpenPanel] = useState<"menu" | "search" | null>(null);
  const [query, setQuery] = useState("");
  const results = collections.filter((c) =>
    c.title.toLowerCase().includes(query.trim().toLowerCase()),
  );

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
          className="h-[68svh] max-h-[760px] min-h-[420px] w-full object-cover sm:h-screen sm:min-h-[520px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-deep/75 via-transparent to-deep/40" />

        <div className="absolute top-5 right-5 left-5 z-[6] flex items-start justify-between">
          <div className="relative">
            <button
              type="button"
              aria-label="Menu"
              aria-expanded={openPanel === "menu"}
              onClick={() =>
                setOpenPanel(openPanel === "menu" ? null : "menu")
              }
              className="grid h-11 w-11 place-items-center rounded-full bg-deep/80 text-accent backdrop-blur-sm transition-transform hover:scale-105"
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>
            {openPanel === "menu" && (
              <div className="absolute top-13 left-0 w-52 overflow-hidden rounded-[6px] border border-accent/40 bg-deep/95 py-1 shadow-lift backdrop-blur-sm">
                {menuLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpenPanel(null)}
                    className="block px-4 py-2.5 text-[0.6rem] tracking-[0.2em] text-shell uppercase transition-colors hover:bg-accent/15 hover:text-accent"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <button
              type="button"
              aria-label="Search puzzles"
              aria-expanded={openPanel === "search"}
              onClick={() =>
                setOpenPanel(openPanel === "search" ? null : "search")
              }
              className="grid h-11 w-11 place-items-center rounded-full bg-deep/80 text-accent backdrop-blur-sm transition-transform hover:scale-105"
            >
              <Search className="h-5 w-5" strokeWidth={1.5} />
            </button>
            {openPanel === "search" && (
              <div className="absolute top-13 right-0 w-60 overflow-hidden rounded-[6px] border border-accent/40 bg-deep/95 p-3 shadow-lift backdrop-blur-sm">
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search collections"
                  className="w-full rounded-full border border-accent/40 bg-deep/60 px-3 py-1.5 text-[0.7rem] text-shell placeholder:text-shell/50 focus:outline-none"
                />
                <div className="mt-2 max-h-56 overflow-y-auto">
                  {results.map((c) => (
                    <Link
                      key={c.id}
                      to="/collection/$collectionId"
                      params={{ collectionId: c.id }}
                      onClick={() => setOpenPanel(null)}
                      className="block rounded px-2 py-2 text-[0.6rem] tracking-[0.18em] text-shell uppercase transition-colors hover:bg-accent/15 hover:text-accent"
                    >
                      {c.title}
                    </Link>
                  ))}
                  {results.length === 0 && (
                    <p className="px-2 py-2 text-[0.6rem] tracking-[0.18em] text-shell/60 uppercase">
                      Nothing found
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>



        {/* wordmark */}
        <div className="absolute inset-x-0 top-20 flex flex-col items-center px-8 text-center sm:top-12">
          <img
            src={palmLogo}
            alt="Pictaria — two gold palm trees"
            width={1024}
            height={1024}
            className="h-11 w-auto [filter:brightness(1.35)_saturate(1.2)_drop-shadow(0_3px_14px_oklch(0.2_0.05_230/0.6))] sm:h-14"
          />
          <h1 className="relative -mt-1 pl-[0.3em] font-display text-[2rem] leading-none font-medium tracking-[0.3em] text-shell [text-shadow:0_2px_18px_oklch(0.2_0.05_230/0.85),0_0_2px_oklch(0.2_0.05_230/0.9)] sm:text-[3rem]">
            PICTARIA
          </h1>

          <div className="mt-1.5 flex w-56 items-center gap-2">
            <span className="h-px flex-1 bg-accent/70" />
            <span className="h-1 w-1 rotate-45 bg-accent" />
            <span className="h-px flex-1 bg-accent/70" />
          </div>
          <p className="mt-1 text-[12px] font-semibold tracking-[0.32em] text-shell uppercase [text-shadow:0_1px_12px_oklch(0.2_0.05_230/0.95),0_0_4px_oklch(0.2_0.05_230/0.95)]">
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

          {/* poem CTA — storybook */}
          <div className="relative mt-2 overflow-hidden rounded-[4px] border border-accent/60 bg-card/70 p-4">
            <span
              aria-hidden
              className="pointer-events-none absolute -top-4 -left-5 font-display text-[6rem] leading-none text-accent/10 select-none"
            >
              ❦
            </span>
            <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
              <p className="min-w-0 font-display text-[0.85rem] leading-snug [color:color-mix(in_oklch,var(--foreground)_92%,black)]">
                Pictures say a thousand words and puzzles make them fun — I want to send my own story book to everyone I love
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
