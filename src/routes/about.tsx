import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import palmLogo from "@/assets/logo-palms-only.png";
import eKomoMai from "@/assets/cat-08.jpg";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Travel to Pictaria" },
      {
        name: "description",
        content:
          "Discover beautiful photography one puzzle \"peace\" at a time. Pictaria turns your favorite photographs into calm, beautiful puzzles.",
      },
      {
        property: "og:title",
        content: "Travel to Pictaria",
      },
      {
        property: "og:description",
        content:
          "Discover beautiful photography one puzzle \"peace\" at a time. Pictaria turns your favorite photographs into calm, beautiful puzzles.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/about` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/about` }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="relative min-h-screen pb-8">
      {/* deep blue base */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-deep" />

      {/* E Komo Mai — the cat gazing out into Pictaria, full color, fading into the blue */}
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[392px] sm:h-[472px]">
        <img
          src={eKomoMai}
          fetchPriority="high"
          decoding="async"
          alt="E Komo Mai — a cat gazing out into Pictaria"
          aria-hidden="true"
          className="h-full w-full object-cover"
          style={{
            objectPosition: "50% 74%",
            maskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 34%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.25) 80%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 34%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.25) 80%, rgba(0,0,0,0) 100%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-deep/10 via-deep/45 to-deep" />
      </div>


      {/* hero */}
      <section className="relative overflow-hidden px-6 pt-5 pb-2 text-center sm:pt-6 sm:pb-3">
        <div className="absolute inset-0 bg-gradient-to-b from-seafoam/10 via-transparent to-deep/20" />

        <div className="relative mx-auto max-w-2xl">
          <Link to="/" aria-label="Home" className="mx-auto block w-fit">
            <img
              src={palmLogo}
              alt="Pictaria"
              width={1024}
              height={1024}
              className="mx-auto h-11 w-auto rounded-[8px] drop-shadow-[0_4px_18px_oklch(0.15_0.04_230/0.65)] transition-transform hover:scale-[1.04] sm:h-14"
            />
          </Link>
          <h1 className="mt-8 font-display text-[1.6rem] leading-snug text-gold-shimmer sm:mt-12 sm:text-[2rem]">
            Travel to Pictaria
          </h1>
        </div>
      </section>


      {/* Science of Play sections */}
      <section className="mt-3 px-4 sm:mt-5 sm:px-8">
        <div className="mx-auto max-w-2xl space-y-5">
          <div className="rounded-[6px] border border-accent/40 bg-deep/50 p-5 backdrop-blur-sm sm:p-8">
            <h2 className="font-display text-lg text-gold-shimmer">Welcome Pictarians!</h2>
            <p className="mx-auto mt-4 max-w-xl text-[0.9rem] leading-relaxed text-gold-shimmer">
              We think of a Pictaria as more of a place than a puzzle. It’s a quiet invitation to linger with the moments that mean the most — a peaceful way to reconnect with what matters.
            </p>
          </div>


          <div className="rounded-[6px] border border-accent/40 bg-deep/50 p-5 backdrop-blur-sm sm:p-8">
            <h2 className="font-display text-lg text-gold-shimmer">The Science of Play</h2>
            <p className="mx-auto mt-4 max-w-xl text-[0.9rem] leading-relaxed text-gold-shimmer">
              Research shows that puzzles do more than entertain. They engage memory, attention, processing speed, visual-spatial skills, and fine motor coordination. Mentally stimulating activities are also associated with healthier cognitive aging, while the focused nature of puzzling can encourage relaxation, mindfulness, and improved mood.
            </p>
          </div>

          <div className="rounded-[6px] border border-accent/40 bg-deep/50 p-5 backdrop-blur-sm sm:p-8">
            <h2 className="font-display text-lg text-gold-shimmer">There’s a Reason We Took That Photo</h2>
            <p className="mx-auto mt-4 max-w-xl text-[0.9rem] leading-relaxed text-gold-shimmer">
              We carry thousands of photos on our phones, yet rarely spend meaningful time with them. But there’s a reason we took each one. That person mattered. That place brought us joy. That moment was worth remembering. Pictaria lets you slow down and reconnect with those memories, piece by piece.
            </p>
          </div>

          <div className="rounded-[6px] border border-accent/40 bg-deep/50 p-5 backdrop-blur-sm sm:p-8">
            <h2 className="font-display text-lg text-gold-shimmer">Visualize</h2>
            <p className="mx-auto mt-4 max-w-xl text-[0.9rem] leading-relaxed text-gold-shimmer">
              There's a reason so many people use vision boards, including millionaires and CEOs. Your brain's Reticular Activating System (RAS) helps focus your attention on your goals and notice opportunities that might otherwise pass you by.
            </p>
            <p className="mx-auto mt-4 max-w-xl text-[0.9rem] leading-relaxed text-gold-shimmer">
              Pictaria makes vision boards active. As you build your vision piece by piece, the satisfaction of solving the puzzle connects a positive feeling to the image, bringing thought and emotion together with intention.
            </p>
            <p className="mx-auto mt-4 max-w-xl text-[0.9rem] leading-relaxed text-gold-shimmer">
              Years ago, when I had almost no money, I put a beautiful Maui property on my vision board. Within a year, an unexpected opportunity appeared, and I acquired that very property. And I have been a believer in vision boards and living in my dream home in Maui ever since.
            </p>
          </div>
          <div className="rounded-[6px] border border-accent/40 bg-deep/50 p-5 backdrop-blur-sm sm:p-8">
            <h2 className="font-display text-lg text-gold-shimmer">Find Your Frequency</h2>
            <p className="mx-auto mt-4 max-w-xl text-[0.9rem] leading-relaxed text-gold-shimmer">
              Sound is more than something we hear. It is a physical vibration, and scientists are discovering fascinating ways our brains and even our cells respond to it. Recent research has found that acoustic stimulation can influence gene activity and cellular behavior, while studies of entrainment explore how rhythmic sound may interact with the brain’s own electrical rhythms.
            </p>
            <p className="mx-auto mt-4 max-w-xl text-[0.9rem] leading-relaxed text-gold-shimmer">
              Research into music, sound, and binaural beats is showing promising possibilities for relaxation, focus, memory, mood, and stress reduction. The science is still unfolding, but the connection between sound, rhythm, and the human body is fascinating.
            </p>
          </div>

          <div className="rounded-[6px] border border-accent/40 bg-deep/50 p-5 backdrop-blur-sm sm:p-8">
            <p className="mx-auto max-w-xl text-center font-display text-[1.05rem] leading-relaxed text-gold-shimmer">
              “In the end, life isn’t made of years. It’s made of moments.”
            </p>
            <p className="mt-2 text-center font-display text-[0.95rem] text-shell/85">
              <span className="text-[0.75rem]">🌺</span> Amy Wakingwolf
            </p>
          </div>
        </div>

      </section>

      {/* final CTA */}
      <section className="mt-6 px-4 text-center sm:px-8">
        <Link
          to="/collections"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-[0.7rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03]"
        >
          Start playing
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
        </Link>
      </section>

    </main>
  );
}
