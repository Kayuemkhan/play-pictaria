import { createFileRoute, Link } from "@tanstack/react-router";

import eggFarm from "@/assets/easter-egg-farm-chickens.jpg";
import palmLogo from "@/assets/logo-palms-only.png";
import { hawaiianWords } from "@/data/hawaiian-words";

export const Route = createFileRoute("/easter-egg")({
  head: () => ({
    meta: [
      { title: "Easter Eggs — Pictaria" },
      {
        name: "description",
        content:
          "We built in some Easter eggs — gold palm trees that carry you home, and a little Hawaiian dictionary.",
      },
      { property: "og:title", content: "Easter Eggs — Pictaria" },
      {
        property: "og:description",
        content:
          "We built in some Easter eggs — gold palm trees that carry you home, and a little Hawaiian dictionary.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EasterEggPage,
});

function EasterEggPage() {
  return (
    <main className="relative min-h-screen bg-deep">
      {/* gold palms sit at the very top, in full color */}
      <Link
        to="/"
        aria-label="Home"
        className="pointer-events-auto fixed top-4 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-0 transition-[transform,opacity] hover:scale-105 active:scale-95"
      >
        <img
          src={palmLogo}
          alt="Pictaria"
          width={1024}
          height={1024}
          className="h-10 w-10 object-contain drop-shadow-[0_3px_12px_oklch(0.15_0.04_230/0.55)]"
        />
      </Link>

      {/* a Hawaiian farm at golden hour up top, fading down into the words */}
      <div className="absolute inset-x-0 top-0 h-[58vh] min-h-[340px]">
        <img
          src={eggFarm}
          alt="A Hawaiian farm with three hens eating feed and a mother hen walking with three chicks beneath lush mountains"
          width={1024}
          height={1408}
          className="h-full w-full object-cover object-bottom"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-deep/80 via-deep/15 via-55% to-deep/50" />
      </div>

      <div className="relative z-[2] flex min-h-screen flex-col items-center px-6 pt-[42vh] pb-20 text-center">

        <h1 className="mt-2 bg-gradient-to-br from-[oklch(0.99_0.03_90)] via-[oklch(0.96_0.05_88)] to-[oklch(0.88_0.09_80)] bg-clip-text font-display text-3xl leading-none tracking-[0.14em] text-transparent uppercase drop-shadow-[0_3px_14px_oklch(0.15_0.04_230/0.5)] sm:text-4xl">
          Easter Eggs
        </h1>

        {/* the box */}
        <div className="mt-8 w-full max-w-sm rounded-[6px] border border-accent/50 bg-deep/70 px-6 py-7 shadow-lift backdrop-blur-sm">
          <p className="font-display text-[0.95rem] leading-relaxed text-deep-foreground">
            We built in some Easter eggs. The first one is behind the palm trees
            — press on the palm trees anywhere you see them in the app, and
            you'll find they work just like clicking ruby slippers to bring you
            home.
          </p>
          <Link
            to="/puzzle/$puzzleId"
            params={{ puzzleId: "dog-02" }}
            search={{ grid: undefined }}
            className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-accent/50 px-4 py-2 text-[0.6rem] tracking-[0.18em] text-accent uppercase transition-colors hover:bg-accent/15"
          >
            Try the palm trees
            <span aria-hidden>›</span>
          </Link>
        </div>

        {/* the little Hawaiian dictionary */}
        <div className="mt-10 w-full max-w-sm rounded-[6px] border border-accent/50 bg-deep/70 px-6 py-7 text-left shadow-lift backdrop-blur-sm">
          <h2 className="font-display text-[0.7rem] tracking-[0.2em] text-accent uppercase">
            A Little Hawaiian Dictionary
          </h2>
          <p className="mt-3 font-display text-[0.95rem] leading-relaxed text-deep-foreground">
            Another quiet discovery hidden in Pictaria is the beauty of the
            Hawaiian language. Scattered through the photographs and their
            stories are words worth keeping — names for flowers, waves, weather
            and the way people care for one another. Here they all are in one
            place, in case you'd like to let a few of them into your own
            vocabulary.
          </p>

          <dl className="mt-6 space-y-4">
            {hawaiianWords.map((entry) => (
              <div key={entry.word}>
                <dt className="font-display text-[1rem] text-accent">
                  {entry.word}
                </dt>
                <dd className="mt-0.5 text-[0.82rem] leading-relaxed text-deep-foreground/85">
                  {entry.meaning}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </main>
  );
}

