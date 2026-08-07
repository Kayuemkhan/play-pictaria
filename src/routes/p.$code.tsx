import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { PuzzleBoard } from "@/components/PuzzleBoard";
import { PoemCTAs } from "@/components/PoemCTAs";

import { difficulties } from "@/data/collections";
import { getSharedPictaria } from "@/lib/pictarias.functions";
import { reportPictaria } from "@/lib/reports.functions";
import palmLogo from "@/assets/logo-palms-only.png";
import samplePhoto from "@/assets/hero-pineapple.jpg";

/** A ready-made Pictaria so you can preview exactly what a recipient receives. */
const SAMPLE: Shared = {
  title: "A Pictaria for you",
  tagline: "Can you solve today's pineapple?",
  story:
    "Aloha! Someone thought of you today and turned one of their favourite pictures into a little puzzle.\n\nPick your pace below, slide the tiles together, and the picture will reveal itself.",
  grid: 4,
  photos: [samplePhoto],
};

export const Route = createFileRoute("/p/$code")({
  head: () => ({
    meta: [
      { title: "A Pictaria for You — Turn Pictures Into Play" },
      {
        name: "description",
        content:
          'Discover beautiful photography one puzzle "peace" at a time.',
      },
      { property: "og:title", content: "A Pictaria for You" },
      {
        property: "og:description",
        content:
          'Discover beautiful photography one puzzle "peace" at a time.',
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SharedPictaria,
});

interface Shared {
  title: string;
  tagline: string;
  story: string;
  grid: number;
  tier?: string;
  photos: string[];
}

function SharedPictaria() {
  const { code } = Route.useParams();
  const fetchShared = useServerFn(getSharedPictaria);
  const [state, setState] = useState<"loading" | "ready" | "missing">(
    "loading",
  );
  const [shared, setShared] = useState<Shared | null>(null);
  const [playing, setPlaying] = useState<{ url: string; grid: number } | null>(
    null,
  );
  const report = useServerFn(reportPictaria);
  const [reported, setReported] = useState(false);

  useEffect(() => {
    let active = true;
    if (code === "sample") {
      setShared(SAMPLE);
      setState("ready");
      return;
    }
    fetchShared({ data: { code } })
      .then((result) => {
        if (!active) return;
        if (!result) {
          setState("missing");
          return;
        }
        setShared(result as Shared);
        setState("ready");
      })
      .catch(() => active && setState("missing"));
    return () => {
      active = false;
    };
  }, [code, fetchShared]);

  const isBrand = shared?.tier === "brand";

  if (playing) {
    return (
      <PuzzleBoard
        key={`${playing.url}-${playing.grid}`}
        src={playing.url}
        title={shared?.title || "A Pictaria for you"}
        grid={playing.grid}
        unbranded={isBrand}
        onExit={() => setPlaying(null)}
        onChangeDifficulty={() => setPlaying(null)}
      />
    );
  }

  return (
    <main className="min-h-screen bg-deep px-3 py-10">
      <div className="mx-auto w-full max-w-xl text-center">
        {!isBrand && (
          <Link
            to="/"
            aria-label="Pictaria — turn pictures into play"
            className="group inline-flex flex-col items-center"
          >
            <img
              src={palmLogo}
              alt="Pictaria"
              width={1024}
              height={1024}
              className="h-16 w-auto drop-shadow-[0_4px_18px_oklch(0.15_0.04_230/0.55)] transition-transform duration-500 ease-[var(--ease-calm)] group-hover:scale-[1.06] sm:h-20"
            />
            <span className="mt-3 bg-gradient-to-br from-[oklch(0.99_0.03_90)] via-[oklch(0.96_0.05_88)] to-[oklch(0.88_0.09_80)] bg-clip-text font-display text-3xl leading-none tracking-[0.34em] text-transparent uppercase drop-shadow-[0_3px_14px_oklch(0.15_0.04_230/0.5)] transition-transform duration-500 ease-[var(--ease-calm)] group-hover:scale-[1.04] sm:text-4xl">
              Pictaria
            </span>
            <span
              className="-mt-0.5 font-display text-[0.65rem] tracking-[0.42em] uppercase transition-transform duration-500 ease-[var(--ease-calm)] group-hover:scale-[1.04] sm:text-[0.75rem]"
              style={{
                color: "oklch(0.98 0.025 85)",
                textShadow: "0 2px 12px oklch(0.15 0.04 230 / 0.55)",
              }}
            >
              Turn pictures into play
            </span>
          </Link>
        )}

        {state === "loading" && (
          <p className="mt-8 text-[10px] tracking-[0.24em] text-accent uppercase">
            Opening your Pictaria…
          </p>
        )}

        {state === "missing" && (
          <>
            <p className="mt-8 font-display text-lg text-shell">
              This Pictaria is no longer available.
            </p>
            <Link
              to="/"
              className="mt-4 inline-block text-[10px] tracking-[0.2em] text-accent uppercase"
            >
              Explore Pictaria
            </Link>
          </>
        )}

        {state === "ready" && shared && (
          <>
            {shared.title && (
              <h1 className="mt-6 font-display text-[1.4rem] tracking-[0.16em] text-shell uppercase">
                {shared.title}
              </h1>
            )}
            {shared.tagline && (
              <p className="mt-2 font-display text-sm text-accent">
                {shared.tagline}
              </p>
            )}

            <div className="mt-6 grid gap-6">
              {shared.photos.map((url, i) => (
                <div
                  key={url}
                  className="overflow-hidden rounded-[26px] bg-shell/5 shadow-lift"
                >
                  <img
                    src={url}
                    alt={`${shared.title || "Shared"} picture ${i + 1}`}
                    className="aspect-[3/4] w-full object-cover"
                  />
                  <div className="flex flex-nowrap items-center justify-center gap-2 overflow-x-auto px-4 py-4">
                    {difficulties.map((d) => (
                      <button
                        key={d.grid}
                        type="button"
                        onClick={() => setPlaying({ url, grid: d.grid })}
                        className="shrink-0 rounded-full border border-shell/25 bg-deep px-4 py-1.5 text-[0.6rem] tracking-[0.16em] text-shell uppercase shadow-soft transition-transform hover:scale-[1.03] active:scale-[0.98]"
                      >
                        {d.grid}×{d.grid}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {shared.story && (
              <p className="mt-6 text-left text-xs leading-relaxed whitespace-pre-line text-shell/85">
                {shared.story}
              </p>
            )}

            {isBrand ? (
              <Link
                to="/"
                className="mt-10 inline-block text-[0.55rem] leading-none tracking-[0.18em] text-shell/45 lowercase transition-colors hover:text-shell/80"
              >
                made with pictaria — play.pictaria
              </Link>
            ) : (
              <div className="mt-8">
                <PoemCTAs />
              </div>
            )}
          </>
        )}

        {state === "ready" && (
          <button
            type="button"
            disabled={reported}
            onClick={() => {
              setReported(true);
              void report({ data: { code, note: "" } }).catch(() => {});
            }}
            className="mx-auto mt-14 block text-[0.5rem] leading-none tracking-[0.14em] text-shell/15 lowercase transition-opacity hover:text-shell/40"
          >
            {reported
              ? "thank you — this has been passed along"
              : "report this pictaria if you would not show it to your mom"}
          </button>
        )}
      </div>
    </main>
  );
}
