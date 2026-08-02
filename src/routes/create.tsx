import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ImagePlus, Sparkles } from "lucide-react";
import { HeroPuzzle, type HeroCorner } from "@/components/HeroPuzzle";
import { PuzzleBoard } from "@/components/PuzzleBoard";
import { difficulties } from "@/data/collections";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Create Your Story — Pictaria Brand Studio" },
      {
        name: "description",
        content:
          "Upload your own photograph and Pictaria turns it into an elegant hero puzzle — a third of the picture left beautifully unsolved, ready for social, email and play.",
      },
      {
        property: "og:title",
        content: "Create Your Story — Pictaria Brand Studio",
      },
      {
        property: "og:description",
        content:
          "Bring your own photograph. Pictaria composes it into a hero puzzle you can play and share.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CreatePage,
});

const corners: { value: HeroCorner; label: string }[] = [
  { value: "bottom-left", label: "Lower left" },
  { value: "bottom-right", label: "Lower right" },
  { value: "top-left", label: "Upper left" },
  { value: "top-right", label: "Upper right" },
];

function CreatePage() {
  const [src, setSrc] = useState<string | null>(null);
  const [brand, setBrand] = useState("");
  const [headline, setHeadline] = useState("Can you solve today's picture?");
  const [corner, setCorner] = useState<HeroCorner>("bottom-left");
  const [wedge, setWedge] = useState(5);
  const [animated, setAnimated] = useState(true);
  const [grid, setGrid] = useState<number | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  const pick = (file: File | undefined) => {
    if (!file) return;
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const url = URL.createObjectURL(file);
    urlRef.current = url;
    setSrc(url);
  };

  if (src && grid) {
    return (
      <PuzzleBoard
        key={`custom-${grid}`}
        src={src}
        title={brand.trim() || "Your picture"}
        grid={grid}
        onExit={() => setGrid(null)}
        onChangeDifficulty={() => setGrid(null)}
      />
    );
  }

  return (
    <main className="min-h-screen bg-shell pb-16">
      <header className="flex items-center gap-3 px-4 pt-5 sm:px-8">
        <Link
          to="/"
          aria-label="Back to home"
          className="grid h-10 w-10 place-items-center rounded-full bg-deep text-accent transition-transform hover:scale-105"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        </Link>
        <div className="min-w-0">
          <h1 className="font-display text-lg tracking-[0.2em] uppercase">
            Create Your Story
          </h1>
          <p className="text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
            Bring your own photograph
          </p>
        </div>
      </header>

      <div className="mx-auto mt-6 grid w-full max-w-5xl gap-6 px-4 sm:px-8 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        {/* preview */}
        <section>
          <div className="relative overflow-hidden rounded-[26px] bg-deep shadow-lift">
            <div className="relative aspect-[3/4] w-full">
              {src ? (
                <>
                  <img
                    src={src}
                    alt="Your uploaded photograph, composed as a Pictaria hero puzzle"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-deep/70 via-transparent to-deep/35" />
                  <HeroPuzzle
                    src={src}
                    corner={corner}
                    wedge={wedge}
                    animated={animated}
                  />
                  <div className="absolute inset-x-0 top-5 z-[4] px-6 text-center">
                    <p className="font-display text-[1.35rem] leading-tight tracking-[0.18em] text-shell uppercase">
                      {brand.trim() || "Your brand"}
                    </p>
                    <div className="mx-auto mt-2 flex w-40 items-center gap-2">
                      <span className="h-px flex-1 bg-accent/70" />
                      <span className="h-1 w-1 rotate-45 bg-accent" />
                      <span className="h-px flex-1 bg-accent/70" />
                    </div>
                  </div>
                  {headline.trim() && (
                    <div className="absolute top-[34%] right-4 z-[4] max-w-[62%] rounded-2xl bg-deep/55 px-4 py-3 backdrop-blur-[3px]">
                      <p className="font-display text-[1.05rem] leading-tight text-shell">
                        {headline}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-[0.6rem] tracking-[0.14em] text-deep uppercase">
                        Play now <span aria-hidden>›</span>
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="flex h-full w-full flex-col items-center justify-center gap-3 text-deep-foreground/70 transition-colors hover:text-accent"
                >
                  <ImagePlus className="h-8 w-8" strokeWidth={1.25} />
                  <span className="text-[10px] tracking-[0.24em] uppercase">
                    Choose a photograph
                  </span>
                  <span className="max-w-[16rem] text-center text-[10px] leading-relaxed tracking-[0.12em] text-deep-foreground/45 uppercase">
                    Portrait pictures look best
                  </span>
                </button>
              )}
            </div>
          </div>

          {src && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="rounded-full border border-border px-3.5 py-1.5 text-[0.6rem] tracking-[0.18em] text-muted-foreground uppercase transition-colors hover:text-foreground"
              >
                Replace photo
              </button>
              {difficulties.map((d) => (
                <button
                  key={d.grid}
                  type="button"
                  onClick={() => setGrid(d.grid)}
                  className="rounded-full bg-deep px-3.5 py-1.5 text-[0.6rem] tracking-[0.18em] text-accent uppercase shadow-soft transition-transform hover:scale-[1.03]"
                >
                  Play {d.grid}×{d.grid}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* controls */}
        <section className="rounded-[26px] border border-border bg-card/70 p-5">
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => pick(e.target.files?.[0])}
          />

          <h2 className="font-display text-base tracking-[0.2em] uppercase">
            Compose
          </h2>
          <div className="mt-4 grid gap-4">
            <label className="grid gap-1.5">
              <span className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                Brand or occasion
              </span>
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Kailua Bicycle Co."
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                Headline
              </span>
              <input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Can you solve today's picture?"
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </label>

            <div className="grid gap-1.5">
              <span className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                Unsolved corner
              </span>
              <div className="flex flex-wrap gap-2">
                {corners.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCorner(c.value)}
                    className={`rounded-full px-3.5 py-1.5 text-[0.6rem] tracking-[0.16em] uppercase transition-colors ${
                      corner === c.value
                        ? "bg-deep text-accent"
                        : "border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="grid gap-1.5">
              <span className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                How much stays unsolved
              </span>
              <input
                type="range"
                min={3}
                max={8}
                step={1}
                value={wedge}
                onChange={(e) => setWedge(Number(e.target.value))}
                className="accent-accent"
              />
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={animated}
                onChange={(e) => setAnimated(e.target.checked)}
                className="h-4 w-4 accent-accent"
              />
              <span className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                Animate the pieces
              </span>
            </label>
          </div>

          <div className="mt-6 rounded-2xl bg-deep/5 p-4">
            <p className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              <Sparkles className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} />
              For your clientele
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Turn the animation off for email — mail apps show a still image, so
              the jumbled corner does the work. Keep it on for your website and
              social posts. Shareable links and QR codes come next, so a
              customer can scan or tap and play your picture themselves.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
