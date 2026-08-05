import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { PuzzleBoard } from "@/components/PuzzleBoard";
import { BottomBackButton } from "@/components/BottomBackButton";
import { difficulties } from "@/data/collections";
import { getSharedPictaria } from "@/lib/pictarias.functions";
import { reportPictaria } from "@/lib/reports.functions";
import palmLogo from "@/assets/logo-palms-only.png";

export const Route = createFileRoute("/p/$code")({
  head: () => ({
    meta: [
      { title: "A Pictaria for You — Turn Pictures Into Play" },
      {
        name: "description",
        content:
          "Someone sent you a Pictaria. Slide the tiles together and reveal the picture behind the puzzle.",
      },
      { property: "og:title", content: "A Pictaria for You" },
      {
        property: "og:description",
        content: "Someone sent you a puzzle made from their own photograph.",
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

  if (playing) {
    return (
      <PuzzleBoard
        key={`${playing.url}-${playing.grid}`}
        src={playing.url}
        title={shared?.title || "A Pictaria for you"}
        grid={playing.grid}
        onExit={() => setPlaying(null)}
        onChangeDifficulty={() => setPlaying(null)}
      />
    );
  }

  return (
    <main className="min-h-screen bg-deep px-5 py-10">
      <div className="mx-auto w-full max-w-xl text-center">
        <img
          src={palmLogo}
          alt="Pictaria"
          width={1024}
          height={1024}
          className="mx-auto h-24 w-auto rounded-[8px] drop-shadow-[0_4px_18px_oklch(0.15_0.04_230/0.65)]"
        />

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
                  <div className="flex flex-wrap justify-center gap-2 px-4 py-4">
                    {difficulties.map((d) => (
                      <button
                        key={d.grid}
                        type="button"
                        onClick={() => setPlaying({ url, grid: d.grid })}
                        className="rounded-full bg-accent px-3.5 py-1.5 text-[0.55rem] tracking-[0.18em] text-deep uppercase shadow-soft transition-transform hover:scale-[1.03]"
                      >
                        {d.label} {d.grid}×{d.grid}
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

            <Link
              to="/create"
              className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[0.6rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift"
            >
              Send a free Pictaria
              <span aria-hidden>›</span>
            </Link>
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
      <BottomBackButton />
    </main>
  );
}
