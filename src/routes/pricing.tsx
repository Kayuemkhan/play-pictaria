import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BarChart3,
  Check,
  Circle,
  Contrast,
  Crop,
  Droplets,
  Heart,
  Images,
  Minus,
  MousePointerClick,
  Palette,
  Sparkles,
  QrCode,
  Sun,
  Wand2,
} from "lucide-react";

import artistBottom from "@/assets/pricing-artist-bottom.jpg";
import { HeroPuzzle } from "@/components/HeroPuzzle";

const planColumns = [
  { name: "Free", price: "FREE", period: "" },
  { name: "Personal", price: "$5.95", period: "/ month" },
  { name: "Artist", price: "$9.95", period: "/ month" },
  { name: "Brand", price: "$195", period: "/ month" },
];

const planRows: { label: string; values: (boolean | string)[] }[] = [
  { label: "A fresh Pictaria every day", values: [true, true, true, true] },
  { label: "All public albums", values: [true, true, true, true] },
  { label: "Every difficulty, 3×3 to 6×6", values: [true, true, true, true] },
  { label: "No ads, ever", values: [true, true, true, true] },
  { label: "Turn your own photos into puzzles", values: [false, true, true, true] },
  { label: "Storybooks a month", values: ["—", "3", "5", "Unlimited"] },
  { label: "Captions & recipes under each picture", values: [false, true, true, true] },
  { label: "Send a link anywhere", values: [false, true, true, true] },
  { label: "Crop, straighten & reframe", values: [false, false, true, true] },
  { label: "Exposure, contrast & saturation", values: [false, false, true, true] },
  { label: "Vignettes, glow & one-tap looks", values: [false, false, true, true] },
  { label: "Saved presets", values: [false, false, true, true] },
  { label: "Your logo on every picture", values: [false, false, false, true] },
  { label: "Full analytics", values: [false, false, false, true] },
  { label: "Actions: book, payment, calendar", values: [false, false, false, true] },
  { label: "Your own branded Daily Pictaria", values: [false, false, false, true] },
];



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
    title: "Your Albums",
    copy: "Five private albums to organize your favorite stories. Name them anything — Water Park, Sunset Hike, Our Wedding, Baby's First Year, The Puppy — and fill each one with the five hero shots you love most. They become beautiful little collections you can find at a glance, turn into puzzles, and share with the people you love.",
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
    <main className="relative min-h-dvh bg-background pb-16">
      <header className="relative z-[1] mx-auto w-full max-w-5xl px-4 pt-8 text-center sm:px-8">
        <h1 className="font-display text-lg tracking-[0.2em] uppercase">
          Pictaria Pricing
        </h1>
      </header>

      <div className="relative z-[1] mx-auto mt-10 w-full max-w-5xl px-4 sm:px-8">

        {/* plan comparison chart */}
        <section className="mb-8">
          <h2 className="font-display text-sm font-semibold tracking-[0.18em] uppercase">
            Compare the plans
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-left">
              <thead>
                <tr>
                  <th className="border border-accent/50 bg-card/70 p-3 text-[0.6rem] tracking-[0.18em] text-muted-foreground uppercase">
                    What you get
                  </th>
                  {planColumns.map((p) => (
                    <th
                      key={p.name}
                      className="border border-accent/50 bg-card/70 p-3 text-center"
                    >
                      <span className="block font-display text-[0.7rem] tracking-[0.16em] uppercase">
                        {p.name}
                      </span>
                      <span className="mt-1 block font-display text-base tracking-[0.06em] text-foreground">
                        {p.price}
                      </span>
                      <span className="block text-[0.55rem] tracking-[0.18em] text-muted-foreground uppercase">
                        {p.period}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {planRows.map((row) => (
                  <tr key={row.label}>
                    <td className="border border-accent/50 p-3 text-xs leading-relaxed text-muted-foreground">
                      {row.label}
                    </td>
                    {row.values.map((v, i) => (
                      <td
                        key={i}
                        className="border border-accent/50 p-3 text-center align-middle"
                      >
                        {v === true ? (
                          <Check
                            className="mx-auto h-4 w-4 text-primary"
                            strokeWidth={2.5}
                            aria-label="included"
                          />
                        ) : v === false ? (
                          <Minus
                            className="mx-auto h-4 w-4 text-muted-foreground/50"
                            strokeWidth={2}
                            aria-label="not included"
                          />
                        ) : (
                          <span className="text-xs text-foreground">{v}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>


        {/* no ads, ever */}
        <section className="rounded-none border border-accent/50 bg-card/70 p-5 text-center">
          <h2 className="font-display text-sm font-semibold tracking-[0.18em] uppercase">
            There will never be any ads in Pictaria
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-xs leading-relaxed text-muted-foreground">
            Not even ads for Pictaria. No pop-ups, no banners, no
            "watch this to keep playing." We're not that kind of app.
          </p>
        </section>

        {/* free, every day */}
        <section className="mt-6">
          <h2 className="font-display text-sm font-semibold tracking-[0.18em] uppercase">
            a little vacay everyday
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Pictaria is a magical place you can visit whenever you need a little
            escape. Start your day with a little adventure, and a fresh mystery
            waiting to be solved, a tiny moment of relaxation that costs nothing.
            Wander through albums of sea turtles, Hawaiian flowers, golden
            beaches, and more. Play as many as you like, stay as long as you
            like, and come back whenever you need a little piece of paradise.
          </p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display text-lg font-semibold tracking-[0.18em] text-foreground uppercase">
              FREE
            </span>
          </div>

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
                  Wander the public albums
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
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              to="/studio/personal"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[0.6rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03]"
            >
              Start a personal album
              <span aria-hidden>›</span>
            </Link>

            <Link
              to="/my-pictaria"
              className="inline-flex items-center gap-1.5 rounded-full border border-accent/60 px-4 py-2 text-[0.6rem] tracking-[0.2em] text-accent uppercase"
            >
              Peek inside your albums
              <span aria-hidden>›</span>
            </Link>
          </div>

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
            to="/my-pictaria"
            search={{ tier: "artist" }}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-teal-600/40 px-4 py-2 text-[0.6rem] tracking-[0.2em] text-teal-700 uppercase transition hover:border-teal-600"
          >
            Start my album
            <span aria-hidden>›</span>
          </Link>
        </section>

        {/* business */}
        <section className="mt-10">
          <h2 className="font-display text-lg font-semibold tracking-[0.18em] uppercase">
            Brand — $195 / month
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            What if your customers looked forward to hearing from you every day? With Brand Studio, every message becomes a moment your customers can enjoy. Transform your own photos, the ones you have meaningfully invested into over the years with models photographers and editors, into interactive Pictarias that invite them to slow down, solve, discover, and smile.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            It's a refreshing new way to build meaningful connections, strengthen your brand, get more value to your existing catalog, and create the kind of engagement people genuinely anticipate.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            You will send them a Pictaria every day, every week, or every month — and they decide which. Because it's their choice, it tells you exactly how much enthusiasm there is for your brand: a customer who asks for one every day is telling you something a survey never could.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Base plan — $195 per month: Your branded Daily, Weekly, or Monthly Pictaria, logo placement, full analytics, action buttons for booking, payments, and calendar, QR codes, and the full Artist photo studio. Your first 1,000 delivered Pictarias are included.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Delivery — per 1,000 Pictarias delivered (after your first 1,000, with the rate easing as you reach more people; volume resets each month):
          </p>
          <ul className="mt-2 space-y-1 pl-4 text-xs leading-relaxed text-muted-foreground">
            <li>1,001 – 10,000 …… $100 per 1,000</li>
            <li>10,001 – 50,000 …… $80 per 1,000</li>
            <li>50,001 and beyond …… $60 per 1,000</li>
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            All-You-Can-Send — $995 per month: For the months you would rather not watch the meter, unlimited delivered Pictarias for a flat rate.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Full analytics, included at no additional cost — opens, plays, completions, clicks, bookings, appointments, and purchases, so you always know exactly how your customers are engaging with your brand.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              to="/my-pictaria"
              search={{ tier: "brand" }}
              className="inline-flex items-center gap-1.5 rounded-full border border-teal-600/40 px-4 py-2 text-[0.6rem] tracking-[0.2em] text-teal-700 uppercase transition hover:border-teal-600"
            >
              Start your Brand Studio
              <span aria-hidden>›</span>
            </Link>
          </div>
        </section>

        {/* artist at the bottom — a blonde painter on a Hawaiian beach */}
        <div className="relative z-[1] mt-10 overflow-hidden rounded-[4px]">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-24 bg-gradient-to-b from-background to-transparent" />
          <img
            src={artistBottom}
            alt="A blonde artist painting the ocean on a Hawaiian beach"
            width={1152}
            height={1536}
            loading="lazy"
            className="aspect-[3/4] w-full object-cover opacity-90"
          />
          <HeroPuzzle
            src={artistBottom}
            cols={6}
            rows={6}
            wedge={4}
            depth={3}
            inset={0}
            corner="bottom-right"
            animated={false}
            maxPieces={6}
          />
          <HeroPuzzle
            src={artistBottom}
            cols={6}
            rows={6}
            wedge={3}
            depth={2}
            inset={0}
            corner="top-left"
            animated={false}
            maxPieces={3}
          />
        </div>
      </div>
    </main>
  );
}
