import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BarChart3,
  CalendarCheck,
  CreditCard,
  MapPin,
  QrCode,
  Sparkles,
  BedDouble,
  MousePointerClick,
} from "lucide-react";
import palmLogo from "@/assets/logo-palms.png";

export const Route = createFileRoute("/business")({
  head: () => ({
    meta: [
      { title: "Pictaria for Business — Branded Puzzles That Convert" },
      {
        name: "description",
        content:
          "Send your own photography as playable Pictaria puzzles, track every open and finish, and add action buttons like book a tour, book a room, set an appointment or take a payment.",
      },
      {
        property: "og:title",
        content: "Pictaria for Business — Branded Puzzles That Convert",
      },
      {
        property: "og:description",
        content:
          "Branded storybooks with analytics and action buttons: book a tour, book a room, set an appointment, take a payment.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BusinessPage,
});

const actions = [
  {
    icon: MapPin,
    title: "Book a tour",
    copy: "Finish the picture, see the property — the button drops the guest straight into your tour calendar.",
  },
  {
    icon: BedDouble,
    title: "Book a room",
    copy: "Link any puzzle to a rate, a suite or a package on your own booking engine.",
  },
  {
    icon: CalendarCheck,
    title: "Set an appointment",
    copy: "Send a consult, a tasting or a fitting invite behind a picture they want to solve.",
  },
  {
    icon: CreditCard,
    title: "Take a payment",
    copy: "Deposits, gift cards, prints or tickets — checkout opens the moment the last tile locks in.",
  },
];

const metrics = [
  { label: "Opens", copy: "Who received it and who actually opened it." },
  { label: "Plays", copy: "Every puzzle started, by picture and difficulty." },
  { label: "Completions", copy: "Finish rate and time to solve, per picture." },
  { label: "Clicks", copy: "Which action button earned the tap, and when." },
];

function BusinessPage() {
  return (
    <main className="min-h-dvh bg-background pb-16">
      <header className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 pt-6 sm:px-8">
        <Link
          to="/create"
          aria-label="Back to Create Your Story"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        </Link>
        <div className="min-w-0">
          <h1 className="font-display text-lg tracking-[0.2em] uppercase">
            Pictaria for Business
          </h1>
          <p className="text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
            Your pictures, playable and measurable
          </p>
        </div>
        <img
          src={palmLogo}
          alt=""
          aria-hidden
          width={40}
          height={40}
          className="ml-auto h-9 w-9 shrink-0 object-contain opacity-90"
        />
      </header>

      <div className="mx-auto mt-6 w-full max-w-5xl px-4 sm:px-8">
        {/* poem-style intro */}
        <section className="relative overflow-hidden rounded-[4px] border border-accent/60 bg-card/70 p-5">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-4 -left-5 font-display text-[6rem] leading-none text-accent/10 select-none"
          >
            ❦
          </span>
          <p className="relative font-display text-[0.95rem] leading-snug [color:color-mix(in_oklch,var(--foreground)_92%,black)]">
            A picture stops the scroll — a puzzle keeps them there. Send your own
            photography as a branded Pictaria storybook, then watch what it does.
          </p>
          <Link
            to="/create"
            className="relative mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-[0.6rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03]"
          >
            Build a branded storybook
            <span aria-hidden>›</span>
          </Link>
        </section>

        {/* analytics */}
        <section className="mt-8">
          <h2 className="flex items-center gap-2 font-display text-base tracking-[0.2em] uppercase">
            <BarChart3 className="h-4 w-4 text-accent" strokeWidth={1.5} />
            Track every picture
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Every storybook you send has its own link, so nothing is guesswork.
            Pictaria records the whole journey — delivered, opened, played,
            finished, tapped — and shows it picture by picture, so you know which
            image is doing the selling and which one to retire.
          </p>
          <dl className="mt-4 grid gap-3 sm:grid-cols-4">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-[4px] border border-accent/50 bg-card/70 p-3"
              >
                <dt className="text-[0.6rem] tracking-[0.2em] text-primary uppercase">
                  {m.label}
                </dt>
                <dd className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {m.copy}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Send the same picture two ways, compare finish rates, and keep the
            one that wins. Export the numbers, or drop your own analytics tag in
            so the plays land beside the rest of your marketing.
          </p>
        </section>

        {/* action buttons */}
        <section className="mt-8">
          <h2 className="flex items-center gap-2 font-display text-base tracking-[0.2em] uppercase">
            <MousePointerClick
              className="h-4 w-4 text-accent"
              strokeWidth={1.5}
            />
            Action buttons on every puzzle
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Each picture can carry its own external button, pointed anywhere you
            already do business. The button waits quietly while they play, then
            arrives at the celebration — the warmest moment you will ever get.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {actions.map((a) => (
              <div
                key={a.title}
                className="flex gap-3 rounded-[4px] border border-accent/50 bg-card/70 p-4"
              >
                <a.icon
                  className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                  strokeWidth={1.5}
                />
                <div className="min-w-0">
                  <p className="font-display text-sm tracking-[0.14em] uppercase">
                    {a.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {a.copy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* delivery */}
        <section className="mt-8 rounded-2xl bg-deep/5 p-4">
          <p className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            <Sparkles className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} />
            How you send it
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Email, text, your website, social, or a printed{" "}
            <QrCode className="inline h-3.5 w-3.5 -translate-y-px text-accent" />{" "}
            QR code on a key card, menu or room table. Turn the animation off for
            email — mail apps show a still image, so the jumbled corner does the
            work. Keep it on for the website and social posts. White label puts
            your name, colors and logo on every screen, with no Pictaria badge in
            sight.
          </p>
        </section>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            to="/create"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[0.6rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03]"
          >
            Start with your pictures
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
      </div>
    </main>
  );
}
