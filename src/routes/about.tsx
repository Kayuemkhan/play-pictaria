import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Puzzle, Heart, ArrowRight } from "lucide-react";
import palmLogo from "@/assets/logo-palms-only.png";
import whiteSand from "@/assets/turtle-02.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "What is Pictaria? — Turn Pictures Into Play" },
      {
        name: "description",
        content:
          "Pictaria turns your favorite photographs into calm, beautiful puzzles. Play free collections or create your own storybook to share.",
      },
      {
        property: "og:title",
        content: "What is Pictaria? — Turn Pictures Into Play",
      },
      {
        property: "og:description",
        content:
          "Pictaria turns your favorite photographs into calm, beautiful puzzles. Play free collections or create your own storybook to share.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://play-pictaria.lovable.app/about" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://play-pictaria.lovable.app/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="relative min-h-screen pb-12">
      {/* white sand backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <img
          src={whiteSand}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-deep/65" />
      </div>

      {/* hero */}
      <section className="relative overflow-hidden px-6 pt-10 pb-16 text-center sm:pt-16 sm:pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-seafoam/10 via-transparent to-deep/20" />



        <div className="relative mx-auto max-w-2xl">
          <img
            src={palmLogo}
            alt="Pictaria"
            width={1024}
            height={1024}
            className="mx-auto h-32 w-auto rounded-[8px] drop-shadow-[0_4px_18px_oklch(0.15_0.04_230/0.65)] sm:h-40"
          />
          <h1 className="mt-6 font-display text-[1.6rem] leading-snug text-shell sm:text-[2rem]">
            Pictaria turns your pictures into peaceful puzzles.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[0.9rem] leading-relaxed text-shell/80">
            A calm, beautiful way to play with the photographs you love. Pick a
            picture, choose a difficulty, and let the pieces guide you into a
            little moment of paradise.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/collections"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[0.65rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03]"
            >
              Play a puzzle
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 rounded-full border border-accent/60 bg-deep/60 px-5 py-2.5 text-[0.65rem] tracking-[0.2em] text-shell uppercase backdrop-blur-sm transition-colors hover:bg-accent/15"
            >
              Create your own
            </Link>
          </div>
        </div>
      </section>

      {/* what / how / why */}
      <section className="px-4 sm:px-8">
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-3">
          <InfoCard
            icon={<Puzzle className="h-5 w-5" strokeWidth={1.5} />}
            title="What it is"
            body="Pictaria is a gentle puzzle experience built around your own photographs. Every puzzle is made of equal rectangular tiles that lock together as you play."
          />
          <InfoCard
            icon={<Camera className="h-5 w-5" strokeWidth={1.5} />}
            title="How it works"
            body="Upload a picture, choose a grid size from Relaxing 3×3 to Challenging 6×6, and share your storybook with friends. No clutter, just play."
          />
          <InfoCard
            icon={<Heart className="h-5 w-5" strokeWidth={1.5} />}
            title="Why people love it"
            body="It is a quiet break from a noisy world. Play solo, share a storybook, or send someone a surprise puzzle made from a memory you both treasure."
          />
        </div>
      </section>

      {/* mindfulness paragraph */}
      <section className="mt-10 px-4 sm:px-8">
        <div className="mx-auto max-w-2xl rounded-[6px] border border-accent/40 bg-deep/50 p-6 text-center backdrop-blur-sm sm:p-10">
          <h2 className="font-display text-lg text-shell">A quiet kind of wellness</h2>
          <p className="mx-auto mt-4 max-w-xl text-[0.9rem] leading-relaxed text-shell/80">
            Puzzles gently pull your attention into the present moment. As your
            hands move the pieces and the picture slowly appears, the outside
            world fades away. That focused calm can ease stress, lift your mood,
            and leave you feeling restored — a small ritual of mindfulness hidden
            inside a simple, beautiful game.
          </p>
        </div>
      </section>

      {/* final CTA */}
      <section className="mt-10 px-4 text-center sm:px-8">
        <p className="font-display text-[1.1rem] text-shell">
          Pictures say a thousand words. Puzzles make them fun.
        </p>
        <Link
          to="/collections"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-[0.7rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03]"
        >
          Start playing
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
        </Link>
      </section>

      {/* bottom nav */}
      <nav className="mt-12 flex flex-wrap items-center justify-center gap-4 px-4 text-[0.6rem] tracking-[0.18em] text-shell/60 uppercase">
        <Link to="/" className="transition-colors hover:text-accent">
          Home
        </Link>
        <span aria-hidden className="text-shell/30">
          •
        </span>
        <Link to="/collections" className="transition-colors hover:text-accent">
          Gallery
        </Link>
        <span aria-hidden className="text-shell/30">
          •
        </span>
        <Link to="/create" className="transition-colors hover:text-accent">
          Create
        </Link>
        <span aria-hidden className="text-shell/30">
          •
        </span>
        <Link to="/pricing" className="transition-colors hover:text-accent">
          Pricing
        </Link>
      </nav>
    </main>
  );
}

function InfoCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[6px] border border-accent/40 bg-deep/50 p-5 backdrop-blur-sm transition-colors hover:bg-accent/10">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/20 text-accent">
        {icon}
      </div>
      <h3 className="mt-4 font-display text-[0.95rem] text-shell">{title}</h3>
      <p className="mt-2 text-[0.85rem] leading-relaxed text-shell/75">{body}</p>
    </div>
  );
}

