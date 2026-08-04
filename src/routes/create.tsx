import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ImagePlus, Sparkles, X } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { HeroPuzzle, type HeroCorner } from "@/components/HeroPuzzle";
import { PuzzleBoard } from "@/components/PuzzleBoard";
import { difficulties } from "@/data/collections";
import { saveDailySubscriber } from "@/lib/daily.functions";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import palmLogo from "@/assets/logo-palms.png";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Create Your Story — Pictaria Brand Studio" },
      {
        name: "description",
        content:
          "Upload your own photography and Pictaria composes an elegant hero puzzle plus a branded storybook — ready for social, email and play.",
      },
      {
        property: "og:title",
        content: "Create Your Story — Pictaria Brand Studio",
      },
      {
        property: "og:description",
        content:
          "Bring your own photographs. Pictaria composes them into a branded storybook of playable puzzles.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CreatePage,
});

/** Fixed Pictaria signature framing — the same one used on the home hero. */
const HERO_CORNER: HeroCorner = "bottom-right";
const HERO_WEDGE = 4;

interface Photo {
  id: string;
  url: string;
}

function CreatePage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [brand, setBrand] = useState("Four Seasons Maui");
  const [headline, setHeadline] = useState("Can you solve today's pineapple?");
  const [caption, setCaption] = useState("");
  const [animated, setAnimated] = useState(true);
  const [playing, setPlaying] = useState<{ url: string; grid: number } | null>(
    null,
  );

  const [cardPos, setCardPos] = useState({ x: 66, y: 38 });
  const fileInput = useRef<HTMLInputElement>(null);
  const urls = useRef<string[]>([]);

  // Email capture: a storybook builder gives us their address before they start.
  const [unlocked, setUnlocked] = useState(false);
  const [gateChecked, setGateChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [wantsDaily, setWantsDaily] = useState(true);
  const [gateStatus, setGateStatus] = useState<"idle" | "saving" | "error">(
    "idle",
  );
  const [gateError, setGateError] = useState("");
  const saveSubscriber = useServerFn(saveDailySubscriber);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (
        data.session?.user?.email ||
        localStorage.getItem("pictaria_creator_email") ||
        localStorage.getItem("pictaria_daily_signed_up") === "1"
      ) {
        setUnlocked(true);
      }
      setGateChecked(true);
    };
    check();
  }, []);

  const submitGate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGateStatus("saving");
    setGateError("");
    try {
      await saveSubscriber({
        data: { email, source: "storybook_create", daily: wantsDaily },
      });
      localStorage.setItem("pictaria_creator_email", email.trim().toLowerCase());
      setUnlocked(true);
      setGateStatus("idle");
    } catch (err) {
      setGateStatus("error");
      setGateError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    }
  };


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


  useEffect(
    () => () => {
      urls.current.forEach((u) => URL.revokeObjectURL(u));
    },
    [],
  );

  const add = (files: FileList | null) => {
    if (!files || !files.length) return;
    const next = Array.from(files).map((file, i) => {
      const url = URL.createObjectURL(file);
      urls.current.push(url);
      return { id: `${Date.now()}-${i}-${file.name}`, url };
    });
    setPhotos((prev) => [...prev, ...next]);
  };

  const remove = (id: string) => {
    setPhotos((prev) => {
      const kept = prev.filter((p) => p.id !== id);
      setHeroIndex((h) => Math.min(h, Math.max(kept.length - 1, 0)));
      return kept;
    });
  };

  const hero = photos[heroIndex] ?? photos[0];

  if (playing) {
    return (
      <PuzzleBoard
        key={`${playing.url}-${playing.grid}`}
        src={playing.url}
        title={brand.trim() || "Your picture"}
        grid={playing.grid}
        onExit={() => setPlaying(null)}
        onChangeDifficulty={() => setPlaying(null)}
      />
    );
  }

  if (!unlocked) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-deep px-6 py-12">
        <div className="w-full max-w-sm rounded-lg border border-accent/60 bg-shell p-6 text-center shadow-soft">
          <img
            src={palmLogo}
            alt="Pictaria"
            width={1024}
            height={1024}
            className="mx-auto h-12 w-auto"
          />
          <h1 className="mt-3 font-display text-[1.35rem] text-foreground">
            Build your storybook
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            Sign up for a free storybook. If you want to subscribe, it's $5.95 a
            month.
          </p>

          <form onSubmit={submitGate} className="mt-6 text-left">
            <Label
              htmlFor="creator-email"
              className="text-[0.55rem] tracking-[0.18em] text-muted-foreground uppercase"
            >
              Email address
            </Label>
            <Input
              id="creator-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              maxLength={255}
              className="mt-1.5"
            />

            <label className="mt-4 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={wantsDaily}
                onChange={(e) => setWantsDaily(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-primary"
              />
              <span className="text-[12px] leading-snug text-foreground">
                Would you like a free Pictaria everyday?
              </span>
            </label>

            {gateStatus === "error" && (
              <p className="mt-2 text-[11px] text-destructive">{gateError}</p>
            )}
            <Button
              type="submit"
              disabled={gateStatus === "saving" || !gateChecked}
              className="mt-4 w-full rounded-full bg-primary text-[0.55rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03] disabled:opacity-60"
            >
              {gateStatus === "saving" ? "Saving..." : "Start here"}
            </Button>
          </form>

          <Link
            to="/"
            className="mt-4 inline-block text-[10px] tracking-[0.18em] text-muted-foreground uppercase"
          >
            Back home
          </Link>
        </div>
      </main>
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
            Bring your own photography
          </p>
        </div>
      </header>

      <div className="mx-auto mt-6 grid w-full max-w-5xl gap-6 px-4 sm:px-8 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        {/* preview */}
        <section>
          <div className="relative overflow-hidden rounded-[26px] bg-deep shadow-lift">
            <div className="relative aspect-[3/4] w-full">
              {hero ? (
                <>
                  <img
                    src={hero.url}
                    alt={`${brand.trim() || "Your"} hero photograph composed as a Pictaria puzzle`}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-deep/70 via-transparent to-deep/35" />
                  <HeroPuzzle
                    key={hero.id}
                    src={hero.url}
                    corner={HERO_CORNER}
                    wedge={HERO_WEDGE}
                    depth={3}
                    inset={0}
                    animated={animated}
                  />
                  <div className="absolute inset-x-0 top-5 z-[4] px-6 text-center">
                    <p className="font-display text-[1.3rem] leading-tight tracking-[0.16em] text-shell uppercase">
                      {brand.trim() || "Your brand"}
                    </p>
                    <div className="mx-auto mt-2 flex w-40 items-center gap-2">
                      <span className="h-px flex-1 bg-accent/70" />
                      <span className="h-1 w-1 rotate-45 bg-accent" />
                      <span className="h-px flex-1 bg-accent/70" />
                    </div>
                  </div>
                  {headline.trim() && (
                    <div
                      role="group"
                      aria-label="Drag to position the headline"
                      onPointerDown={startDrag}
                      style={{
                        left: `${cardPos.x}%`,
                        top: `${cardPos.y}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                      className="absolute z-[4] w-[52%] cursor-grab touch-none rounded-xl bg-deep/55 px-3 py-2 backdrop-blur-[3px] active:cursor-grabbing"
                    >
                      <p className="font-display text-[0.85rem] leading-tight text-shell">
                        {headline}
                      </p>
                      <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[0.5rem] tracking-[0.14em] text-deep uppercase">
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
                    Add photographs
                  </span>
                  <span className="max-w-[16rem] text-center text-[10px] leading-relaxed tracking-[0.12em] text-deep-foreground/45 uppercase">
                    Portrait pictures look best — choose several at once
                  </span>
                </button>
              )}
            </div>
            {hero && caption.trim() && (
              <div className="border-t border-shell/10 px-5 py-4">
                <p className="text-[9px] tracking-[0.24em] text-accent uppercase">
                  {brand.trim() || "The story"}
                </p>
                <p className="mt-2 text-xs leading-relaxed whitespace-pre-line text-shell/85">
                  {caption}
                </p>
              </div>
            )}
          </div>


          {hero && (
            <div className="mt-3 flex flex-wrap gap-2">
              {difficulties.map((d) => (
                <button
                  key={d.grid}
                  type="button"
                  onClick={() => setPlaying({ url: hero.url, grid: d.grid })}
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
            multiple
            className="sr-only"
            onChange={(e) => {
              add(e.target.files);
              e.target.value = "";
            }}
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
                placeholder="Four Seasons Maui"
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

            <label className="grid gap-1.5">
              <span className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                Story note (optional)
              </span>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={4}
                placeholder="A recipe, the location, a memory — anything you'd like to share beneath the picture."
                className="resize-y rounded-xl border border-border bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:border-accent"
              />
              <span className="text-[9px] tracking-[0.16em] text-muted-foreground uppercase">
                Appears beneath the photograph — leave blank to hide
              </span>
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

          {/* storybook */}
          <div className="mt-7">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-base tracking-[0.2em] uppercase">
                Put hero picture to send to friends and family here
              </h3>
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="shrink-0 rounded-full border border-border px-3.5 py-1.5 text-[0.6rem] tracking-[0.18em] text-muted-foreground uppercase transition-colors hover:text-foreground"
              >
                Add photos
              </button>
            </div>
            <p className="mt-2 text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
              {photos.length
                ? `${photos.length} ${photos.length === 1 ? "picture" : "pictures"} — tap one to make it the hero`
                : "Add their own photographs here"}
            </p>

            {photos.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {photos.map((photo, i) => (
                  <div key={photo.id} className="relative">
                    <button
                      type="button"
                      onClick={() => setHeroIndex(i)}
                      className={`block w-full overflow-hidden rounded-xl transition-shadow ${
                        i === heroIndex
                          ? "ring-2 ring-accent"
                          : "shadow-soft hover:shadow-lift"
                      }`}
                    >
                      <img
                        src={photo.url}
                        alt=""
                        className="aspect-[3/4] w-full object-cover"
                      />
                    </button>
                    <button
                      type="button"
                      aria-label="Remove picture"
                      onClick={() => remove(photo.id)}
                      className="absolute top-1 right-1 grid h-6 w-6 place-items-center rounded-full bg-deep/85 text-shell transition-transform hover:scale-105"
                    >
                      <X className="h-3 w-3" strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlaying({ url: photo.url, grid: 4 })}
                      className="mt-1 w-full text-[0.55rem] tracking-[0.18em] text-muted-foreground uppercase transition-colors hover:text-foreground"
                    >
                      Play
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* business CTA */}
          <div className="relative mt-6 overflow-hidden rounded-[4px] border border-accent/60 bg-card/70 p-4">
            <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
              <p className="min-w-0 font-display text-[0.85rem] leading-snug [color:color-mix(in_oklch,var(--foreground)_92%,black)]">
                I&rsquo;m a business — I would love to send Pictaria&rsquo;s!
              </p>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-[0.55rem] tracking-[0.18em] text-muted-foreground uppercase">
                  Analytics &amp; action buttons
                </span>
                <Link
                  to="/business"
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[0.55rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03]"
                >
                  See business
                  <span aria-hidden>›</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-deep/5 p-4">

            <p className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              <Sparkles className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} />
              For your clientele
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Drop in a resort&rsquo;s own photography and the whole storybook
              becomes theirs. Turn the animation off for email — mail apps show a
              still image, so the jumbled corner does the work. Keep it on for
              the website and social posts. Shareable links and QR codes come
              next, so a guest can scan or tap and play the picture themselves.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
