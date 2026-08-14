import { createFileRoute, Link } from "@tanstack/react-router";
import {
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


import palmLogo from "@/assets/logo-palms-only.png";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pictaria Pricing — Personal, Artist & Brand Studio" },
      {
        name: "description",
        content:
          "A free Pictaria every day, Personal Studio at $5.95 a month for your own storybooks, Artist Studio at $9.95 a month with full photo editing, and Brand Studio at $195 a month for branded, tracked storybooks.",
      },
      {
        property: "og:title",
        content: "Pictaria Pricing — Personal, Artist & Brand Studio",
      },
      {
        property: "og:description",
        content:
          "Free daily puzzle, Personal Studio $5.95/month for your own storybooks, Artist Studio $9.95/month with cropping, saturation, contrast and vignettes, Brand Studio $195/month.",
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
          className="ml-auto h-12 w-12 shrink-0 rounded-none object-contain drop-shadow-[0_2px_8px_oklch(0.15_0.04_230/0.5)]"
        />
      </header>

      <div className="mx-auto mt-6 w-full max-w-5xl px-4 sm:px-8">

        {/* free, every day */}
        <section className="mt-6">
          <h2 className="font-display text-sm font-semibold tracking-[0.18em] uppercase">
            a little vacay everyday
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Pictaria is a magical place you can visit whenever you need a little
            escape. Start your day with a little adventure, and a fresh mystery
            waiting to be solved, a tiny moment of relaxation that costs nothing.
            Wander through galleries of sea turtles, Hawaiian flowers, golden
            beaches, and more. Play as many as you like, stay as long as you
            like, and come back whenever you need a little piece of paradise.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="flex gap-3 rounded-none border border-accent/50 bg-card/70 p-4">
              <Sparkles
                className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                strokeWidth={1.5}
              />
              <div className="min-w-0">
                <p className="font-display text-sm tracking-[0.14em] uppercase">
                  A fresh Pictaria every morning
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Wake up to a new picture waiting to be solved — a little daily escape that costs nothing.
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-none border border-accent/50 bg-card/70 p-4">
              <Images
                className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                strokeWidth={1.5}
              />
              <div className="min-w-0">
                <p className="font-display text-sm tracking-[0.14em] uppercase">
                  Wander the public gallery
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Play as many public puzzles as you like, stay as long as you like, and come back anytime.
                </p>
              </div>
            </div>
          </div>
          <Link
            to="/daily"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[0.6rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03]"
          >
            Step into Pictaria
            <span aria-hidden>›</span>
          </Link>
        </section>

        {/* personal */}
        <section className="mt-8">
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
                className="flex gap-3 rounded-none border border-accent/50 bg-card/70 p-4"
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

        {/* artist */}
        <section className="mt-10">
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
                className="flex gap-3 rounded-none border border-accent/50 bg-card/70 p-4"
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

        {/* business */}
        <section className="mt-10">
          <h2 className="font-display text-lg font-semibold tracking-[0.18em] uppercase">
            Brand Studio
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            What if your customers looked forward to hearing from you every day?
            With Brand Studio, every message becomes a moment your customers can
            enjoy. Transform your own photos into interactive Pictarias that invite
            them to slow down, solve, discover, and smile. It's a refreshing new
            way to build meaningful connections, strengthen your brand, and
            create the kind of engagement people genuinely anticipate.
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
                className="flex gap-3 rounded-none border border-accent/50 bg-card/70 p-4"
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

      </div>
    </main>
  );
}
