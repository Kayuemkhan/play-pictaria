import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import palmLogo from "@/assets/logo-palms-only.png";
import eKomoMai from "@/assets/cat-08.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Why travel to Pictaria everyday?" },
      {
        name: "description",
        content:
          "Discover beautiful photography one puzzle \"peace\" at a time. Pictaria turns your favorite photographs into calm, beautiful puzzles.",
      },
      {
        property: "og:title",
        content: "Why travel to Pictaria everyday?",
      },
      {
        property: "og:description",
        content:
          "Discover beautiful photography one puzzle \"peace\" at a time. Pictaria turns your favorite photographs into calm, beautiful puzzles.",
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
      {/* E Komo Mai backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <img
          src={eKomoMai}
          alt="E Komo Mai — a cat gazing out a window at the ocean"
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
            Why travel to Pictaria everyday?
          </h1>

        </div>
      </section>

      {/* Science of Play sections */}
      <section className="mt-10 px-4 sm:px-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="rounded-[6px] border border-accent/40 bg-deep/50 p-6 backdrop-blur-sm sm:p-10">
            <h2 className="font-display text-lg text-shell">The Science of Play</h2>
            <p className="mx-auto mt-4 max-w-xl text-[0.9rem] leading-relaxed text-shell/80">
              Research shows that puzzles do more than entertain. They engage memory, attention, processing speed, visual-spatial skills, and fine motor coordination. Mentally stimulating activities are also associated with healthier cognitive aging, while the focused nature of puzzling can encourage relaxation, mindfulness, and improved mood.
            </p>
          </div>

          <div className="rounded-[6px] border border-accent/40 bg-deep/50 p-6 backdrop-blur-sm sm:p-10">
            <h2 className="font-display text-lg text-shell">There’s a Reason We Took That Photo</h2>
            <p className="mx-auto mt-4 max-w-xl text-[0.9rem] leading-relaxed text-shell/80">
              We carry thousands of photos on our phones, yet rarely spend meaningful time with them. But there’s a reason we took each one. That person mattered. That place brought us joy. That moment was worth remembering. Pictaria lets you slow down and reconnect with those memories, piece by piece.
            </p>
          </div>

          <div className="rounded-[6px] border border-accent/40 bg-deep/50 p-6 backdrop-blur-sm sm:p-10">
            <h2 className="font-display text-lg text-shell">Find Your Frequency</h2>
            <p className="mx-auto mt-4 max-w-xl text-[0.9rem] leading-relaxed text-shell/80">
              Sound is more than something we hear. It is a physical vibration, and scientists are discovering fascinating ways our brains and even our cells respond to it. Recent research has found that acoustic stimulation can influence gene activity and cellular behavior, while studies of entrainment explore how rhythmic sound may interact with the brain’s own electrical rhythms.
            </p>
            <p className="mx-auto mt-4 max-w-xl text-[0.9rem] leading-relaxed text-shell/80">
              Research into music, sound, and binaural beats is showing promising possibilities for relaxation, focus, memory, mood, and stress reduction. The science is still unfolding, but the connection between sound, rhythm, and the human body is fascinating.
            </p>
          </div>

          <div className="rounded-[6px] border border-accent/40 bg-deep/50 p-6 backdrop-blur-sm sm:p-10">
            <h2 className="font-display text-lg text-shell">Build Your Vision Board</h2>
            <p className="mx-auto mt-4 max-w-xl text-[0.9rem] leading-relaxed text-shell/80">
              A traditional vision board is something you look at. Pictaria turns it into something you do. Instead of simply viewing the life you envision, you actively assemble it, piece by piece, engaging your hands, eyes, and mind in bringing the image together.
            </p>
          </div>
        </div>
      </section>

      {/* final CTA */}
      <section className="mt-10 px-4 text-center sm:px-8">
        <p className="font-display text-[1.1rem] text-shell">
          “pictures are worth a thousand words puzzles make them fun”
        </p>
        <p className="mt-2 font-display text-[1rem] text-shell/85">
          — Amy Wakingwolf
        </p>

        <Link
          to="/collections"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-[0.7rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03]"
        >
          Start playing
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
        </Link>
      </section>

    </main>
  );
}
