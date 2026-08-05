import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, Search } from "lucide-react";
import { collections } from "@/data/collections";
import { HeroPuzzle } from "@/components/HeroPuzzle";

import heroImage from "@/assets/hero-sunset.jpg";
import palmLogo from "@/assets/logo-palms-only.png";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pictaria — Turn Your Pictures Into Play" },
      {
        name: "description",
        content:
          "Discover beautiful photography one puzzle \"peace\" at a time...",
      },
      { property: "og:title", content: "Pictaria — Turn Your Pictures Into Play" },
      {
        property: "og:description",
        content:
          "Discover beautiful photography one puzzle \"peace\" at a time...",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://play-pictaria.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://play-pictaria.lovable.app/" }],
  }),
  component: Home,
});

const featured = collections;

const menuLinks = [
  { to: "/collections", label: "Gallery" },
  { to: "/about", label: "What is Pictaria?" },
  { to: "/create", label: "Send a free Pictaria" },
  { to: "/studio/personal", label: "Personal Studio" },
  { to: "/studio/artist", label: "Artist Studio" },
  { to: "/studio/brand", label: "Branding Studio" },
  { to: "/pricing", label: "Pricing" },
  { to: "/daily", label: "Daily Pictaria" },
  { to: "/mindfulness", label: "Mindfulness" },
] as const;



function Home() {
  const [openPanel, setOpenPanel] = useState<"menu" | "search" | null>(null);
  const [query, setQuery] = useState("");
  const results = collections.filter((c) =>
    c.title.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <main className="min-h-screen bg-deep pb-8">
      {/* hero */}
      <section className="relative overflow-hidden">
        <img
          src={heroImage}
          alt="Hibiscus and plumeria blossoms beside the ocean at a Hawaiian sunset"
          width={1024}
          height={1408}
          className="h-[68svh] max-h-[760px] min-h-[420px] w-full object-cover sm:h-screen sm:min-h-[520px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-deep/75 via-deep/20 to-deep/50" />

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
                    key={item.label}
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
        <div className="absolute inset-x-0 top-16 flex flex-col items-center px-6 text-center sm:top-10">
          <img
            src={palmLogo}
            alt="Pictaria"
            width={1024}
            height={1024}
            className="relative z-10 h-[3.25rem] w-auto cursor-pointer drop-shadow-[0_4px_18px_oklch(0.15_0.04_230/0.55)] transition-transform duration-500 ease-[var(--ease-calm)] hover:scale-[1.06] sm:h-[4.25rem]"
          />
          <span className="mt-5 cursor-pointer bg-gradient-to-br from-[oklch(0.99_0.03_90)] via-[oklch(0.96_0.05_88)] to-[oklch(0.88_0.09_80)] bg-clip-text font-display text-4xl leading-none tracking-[0.34em] text-transparent uppercase drop-shadow-[0_3px_14px_oklch(0.15_0.04_230/0.5)] transition-transform duration-500 ease-[var(--ease-calm)] hover:scale-[1.04] sm:mt-6 sm:text-5xl">
            Pictaria
          </span>
          <span
            className="-mt-1 cursor-pointer font-display text-[0.81rem] tracking-[0.42em] uppercase transition-transform duration-500 ease-[var(--ease-calm)] hover:scale-[1.04] sm:text-[0.94rem]"
            style={{
              color: "oklch(0.98 0.025 85)",
              textShadow: "0 2px 12px oklch(0.15 0.04 230 / 0.55)",
            }}
          >
            Turn pictures into play
          </span>
        </div>


        {/* Four animating puzzle tiles in the lower-right corner */}
        <HeroPuzzle
          src={heroImage}
          cols={6}
          rows={6}
          wedge={3}
          depth={2}
          corner="bottom-right"
          inset={0}
          maxPieces={4}
          animated
        />

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
                  Create your own Pictarias
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
                I need a little paradise and I need just a little play — please send me a free Pictaria every single day
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
