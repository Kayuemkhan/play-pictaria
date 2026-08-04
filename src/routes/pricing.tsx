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

import { BottomBackButton } from "@/components/BottomBackButton";
import palmLogo from "@/assets/logo-palms.png";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pictaria Pricing — Artist, Personal & Brand Studio" },
      {
        name: "description",
        content:
          "A free Pictaria every day, Artist Studio at $9.95 a month with full photo editing, Personal Studio at $5.95 a month, and Brand Studio at $195 a month for branded, tracked storybooks.",
      },
      {
        property: "og:title",
        content: "Pictaria Pricing — Artist, Personal & Brand Studio",
      },
      {
        property: "og:description",
        content:
          "Free daily puzzle, Artist Studio $9.95/month with cropping, saturation, contrast and vignettes, Personal Studio $5.95/month, Brand Studio $195/month.",
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
    copy: "Relaxing 3×3 through Challenging 6×6, so the same photo plays differently for a little one and for grandma.",
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
];

const bougie = [
  {
    icon: Images,
    title: "Five storybooks a month",
    copy: "More room to play, with every edited version saved so you can send it again.",
  },
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
];

const business = [

  {
    icon: Sun,
    title: "Your own Daily Pictaria",
    copy: "Your customers can request you reaching out to them daily. You have the option for them to sign up for a daily, a weekly or a monthly Pictaria from your business.",
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
    title: "Logo placement on your photos",
    copy: "Upload your logo and place it anywhere on the picture — any corner, centered, any size — and it stays through play and in the shared image.",
  },
  {
    icon: Wand2,
    title: "The full Artist photo studio",
    copy: "Everything in Artist Studio included: crop and straighten, exposure, contrast and clarity, saturation and vibrance, warmth and tint, vignettes and glow, filters and saved brand presets, sharpen, blur and retouch.",
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
          width={1024}
          height={1024}
          className="ml-auto h-12 w-12 shrink-0 object-contain [filter:brightness(1.4)_saturate(1.25)_drop-shadow(0_2px_8px_oklch(0.15_0.04_230/0.5))]"
        />
      </header>

      <div className="mx-auto mt-6 w-full max-w-5xl px-4 sm:px-8">

        {/* artist */}
        <section className="mt-8">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-lg font-semibold tracking-[0.18em] uppercase">
              Artist Studio
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
            to="/studio/artist"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[0.6rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03]"
          >
            Go artistic
            <span aria-hidden>›</span>
          </Link>
        </section>

        {/* personal */}
        <section className="mt-10">
          <h2 className="font-display text-lg font-semibold tracking-[0.18em] uppercase">
            Personal Studio
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Celebrate your weddings, vacations, birthdays, anniversaries,
            adventures, pets and so much more — your own photos, turned into fun
            for friends and family.
          </p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display text-3xl tracking-[0.08em] text-foreground">
              $5.95
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
            to="/studio/personal"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[0.6rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03]"
          >
            Start a personal storybook
            <span aria-hidden>›</span>
          </Link>
        </section>

        {/* business */}
        <section className="mt-10">
          <h2 className="font-display text-lg font-semibold tracking-[0.18em] uppercase">
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
              $195
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
              to="/studio/brand"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[0.6rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03]"
            >
              Start your Brand Studio
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

      <BottomBackButton />
    </main>
  );
}
