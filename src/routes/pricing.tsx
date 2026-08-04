import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BarChart3,
  Circle,
  Contrast,
  Crop,
  Droplets,
  Heart,
  Images,
  MousePointerClick,
  Palette,
  Sparkles,
  QrCode,
  Sun,
  Wand2,
} from "lucide-react";

import palmLogo from "@/assets/logo-palms.png";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pictaria Pricing — Personal Studio & Brand Studio" },
      {
        name: "description",
        content:
          "A free Pictaria every day, Personal Studio at $5.99 a month for three storybooks of ten pictures each, and Brand Studio at $199 a month for branded, tracked storybooks.",
      },
      {
        property: "og:title",
        content: "Pictaria Pricing — Personal Studio & Brand Studio",
      },
      {
        property: "og:description",
        content:
          "Free daily puzzle, Personal Studio $5.99/month, Brand Studio $199/month with analytics and action buttons.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

const personal = [
  {
    icon: Images,
    title: "Three storybooks a month",
    copy: "Ten pictures in each one — thirty pictures turned into play, every month.",
  },
  {
    icon: Sparkles,
    title: "Every difficulty, every picture",
    copy: "Relaxing 3×3 through Challenging 6×6, so the same photo plays differently for a keiki and for grandma.",
  },
  {
    icon: Heart,
    title: "Captions and recipes",
    copy: "Write a line under each picture — a memory, a name, a recipe — and it arrives with the puzzle.",
  },
  {
    icon: MousePointerClick,
    title: "Send it anywhere",
    copy: "A link for text, email or social. Your storybooks stay saved so you can send them again next year.",
  },
  {
    icon: Sparkles,
    title: "The Pictaria badge",
    copy: "Personal storybooks carry the Pictaria badge, larger and proud, so everyone you send to knows where the play came from.",
  },
];

const bougie = [
  {
    icon: Crop,
    title: "Crop & straighten",
    copy: "Reframe any photo, straighten a crooked horizon, and choose the puzzle shape — square, vertical or wide.",
  },
  {
    icon: Sun,
    title: "Exposure, brightness & shadows",
    copy: "Lift a dark face, pull back a blown-out sky, and open up the shadows without losing the mood.",
  },
  {
    icon: Contrast,
    title: "Contrast & clarity",
    copy: "Add punch and definition so the tiles read beautifully, even at 6×6.",
  },
  {
    icon: Droplets,
    title: "Saturation & vibrance",
    copy: "Make the ocean that impossible blue — or take the color all the way down to a soft, elegant fade.",
  },
  {
    icon: Palette,
    title: "Warmth & tint",
    copy: "Push golden-hour warm or cool it down, and fix a photo shot under the wrong light.",
  },
  {
    icon: Circle,
    title: "Vignettes & glow",
    copy: "Soft edge vignettes, a gentle bloom, and a haze that makes a snapshot feel like a print.",
  },
  {
    icon: Wand2,
    title: "Filters & one-tap looks",
    copy: "Saved Hawaiian looks — Lagoon, Sunset, Vintage Postcard, Black & White — plus your own presets to reuse.",
  },
  {
    icon: Sparkles,
    title: "Sharpen, blur & retouch",
    copy: "Sharpen the details, soften a background, smooth skin gently, and remove the little distractions.",
  },
  {
    icon: Images,
    title: "Ten storybooks a month",
    copy: "More room to play, with every edited version saved so you can send it again.",
  },
];

const business = [

  {
    icon: Sun,
    title: "Your own Daily Pictaria",
    copy: "One of your pictures every day, from your platform under your name — the habit your guests come back for.",
  },
  {
    icon: BarChart3,
    title: "Full analytics",
    copy: "Opens, plays, completions and clicks — picture by picture, so you keep the images that win.",
  },

  {
    icon: MousePointerClick,
    title: "Action buttons",
    copy: "Book a tour, book a room, set an appointment, take a payment — the button arrives at the celebration.",
  },
  {
    icon: Sparkles,
    title: "Fully branded",
    copy: "Your logo, your colors, your domain, with the Pictaria badge very small at the very bottom of the scroll.",
  },
  {
    icon: Sparkles,
    title: "Logo placement on your photos",
    copy: "Upload your logo and place it anywhere on the picture — any corner, centered, any size — and it stays through play and in the shared image.",
  },
  {
    icon: Wand2,
    title: "The full Bougie photo studio",
    copy: "Everything in Bougie Studio included: crop and straighten, exposure, contrast and clarity, saturation and vibrance, warmth and tint, vignettes and glow, filters and saved brand presets, sharpen, blur and retouch.",
  },
  {
    icon: QrCode,
    title: "Unlimited storybooks & QR codes",
    copy: "Unlimited branded storybooks and tracked links, plus printed QR codes for key cards, menus and room tables.",
  },

];

function PricingPage() {
  return (
    <main className="min-h-dvh bg-background pb-16">
      <header className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 pt-6 sm:px-8">
        <Link
          to="/"
          aria-label="Back home"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        </Link>
        <div className="min-w-0">
          <h1 className="font-display text-lg tracking-[0.2em] uppercase">
            Pictaria Pricing
          </h1>
          <p className="text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
            Pictures say a thousand words
          </p>
        </div>
        <img
          src={palmLogo}
          alt=""
          aria-hidden
          width={40}
          height={40}
          className="ml-auto h-9 w-9 shrink-0 object-contain [filter:brightness(1.2)_saturate(1.15)]"
        />
      </header>

      <div className="mx-auto mt-6 w-full max-w-5xl px-4 sm:px-8">
        <section className="relative overflow-hidden rounded-[4px] border border-accent/60 bg-card/70 p-5">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-4 -left-5 font-display text-[6rem] leading-none text-accent/10 select-none"
          >
            ❦
          </span>
          <p className="relative font-display text-[0.95rem] leading-snug [color:color-mix(in_oklch,var(--foreground)_92%,black)]">
            One free Pictaria in your inbox every single day — always. When you
            are ready to send your own pictures, there are three studios: one for
            the people you love, one for the people who want every photo perfect,
            and one for the people you serve.
          </p>

        </section>

        {/* personal */}
        <section className="mt-8">
          <h2 className="font-display text-base tracking-[0.2em] uppercase">
            Personal Studio
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Weddings, vacations, keiki, first birthdays, adventures, pets and so
            much more — your own photos, turned into puzzles your family will
            actually sit down and play.
          </p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display text-3xl tracking-[0.08em] text-foreground">
              $5.99
            </span>
            <span className="text-[0.7rem] tracking-[0.18em] text-muted-foreground uppercase">
              / month
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {personal.map((f) => (
              <div
                key={f.title}
                className="flex gap-3 rounded-[4px] border border-accent/50 bg-card/70 p-4"
              >
                <f.icon
                  className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                  strokeWidth={1.5}
                />
                <div className="min-w-0">
                  <p className="font-display text-sm tracking-[0.14em] uppercase">
                    {f.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {f.copy}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/create"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[0.6rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03]"
          >
            Start a personal storybook
            <span aria-hidden>›</span>
          </Link>
        </section>

        {/* bougie */}
        <section className="mt-10">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-base tracking-[0.2em] uppercase">
              Bougie Studio
            </h2>
            <span className="rounded-full border border-accent/60 bg-accent/10 px-2.5 py-0.5 text-[0.55rem] tracking-[0.2em] text-accent uppercase">
              Most loved
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Everything in Personal Studio, plus the whole photo studio. Crop it,
            light it, warm it, glow it — make an ordinary phone snapshot look
            like something framed on a wall before it ever becomes a puzzle.
          </p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display text-3xl tracking-[0.08em] text-foreground">
              $9.95
            </span>
            <span className="text-[0.7rem] tracking-[0.18em] text-muted-foreground uppercase">
              / month
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {bougie.map((f) => (
              <div
                key={f.title}
                className="flex gap-3 rounded-[4px] border border-accent/50 bg-card/70 p-4"
              >
                <f.icon
                  className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                  strokeWidth={1.5}
                />
                <div className="min-w-0">
                  <p className="font-display text-sm tracking-[0.14em] uppercase">
                    {f.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {f.copy}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/create"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[0.6rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03]"
          >
            Go bougie
            <span aria-hidden>›</span>
          </Link>
        </section>

        {/* business */}

        <section className="mt-10">
          <h2 className="font-display text-base tracking-[0.2em] uppercase">
            Brand Studio
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Starts with your own Daily Pictaria — one of your pictures every day,
            sent from your platform, so your customers get the same little joy we
            send ours. Then everything else: drop in your own photography and the
            whole storybook becomes yours, and watch exactly what it does.
          </p>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display text-3xl tracking-[0.08em] text-foreground">
              $199
            </span>
            <span className="text-[0.7rem] tracking-[0.18em] text-muted-foreground uppercase">
              / month
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {business.map((f) => (
              <div
                key={f.title}
                className="flex gap-3 rounded-[4px] border border-accent/50 bg-card/70 p-4"
              >
                <f.icon
                  className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                  strokeWidth={1.5}
                />
                <div className="min-w-0">
                  <p className="font-display text-sm tracking-[0.14em] uppercase">
                    {f.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {f.copy}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              to="/business"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[0.6rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03]"
            >
              See the business page
              <span aria-hidden>›</span>
            </Link>
            <Link
              to="/collections"
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-[0.6rem] tracking-[0.2em] text-primary uppercase transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              See it in play
              <span aria-hidden>›</span>
            </Link>
          </div>
        </section>

        <section className="mt-10 rounded-2xl bg-deep/5 p-4">
          <p className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            <Sparkles className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} />
            Always free
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Daily Pictaria — one new picture to solve every day, plus the whole
            public gallery of turtles, whales, cats and pineapples. No card, no
            paywall.
          </p>
          <Link
            to="/daily"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-[0.6rem] tracking-[0.2em] text-primary uppercase transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Get the daily Pictaria
            <span aria-hidden>›</span>
          </Link>
        </section>
      </div>
    </main>
  );
}
