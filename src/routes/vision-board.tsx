import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import palmLogo from "@/assets/logo-palms-only.png";
import reefBackdrop from "@/assets/vision-board-reef.jpg";

export const Route = createFileRoute("/vision-board")({
  head: () => ({
    meta: [
      { title: "Vision Board — Pictaria" },
      {
        name: "description",
        content:
          "Pictaria makes vision boards active. Build your vision piece by piece and connect a positive feeling to the life you are calling in.",
      },
      { property: "og:title", content: "Vision Board — Pictaria" },
      {
        property: "og:description",
        content:
          "Pictaria makes vision boards active. Build your vision piece by piece and connect a positive feeling to the life you are calling in.",
      },
      { property: "og:type", content: "website" },
      {
        property: "og:url",
        content: "https://play-pictaria.lovable.app/vision-board",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://play-pictaria.lovable.app/vision-board",
      },
    ],
  }),
  component: VisionBoardPage,
});

function VisionBoardPage() {
  return (
    <main className="relative min-h-screen pb-12">
      {/* muted reef backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <img
          src={reefBackdrop}
          alt="A Hawaiian coral reef full of tropical fish"
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-deep/65" />
      </div>

      {/* hero */}
      <section className="relative overflow-hidden px-6 pt-10 pb-16 text-center sm:pt-16 sm:pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-seafoam/10 via-transparent to-deep/20" />

        <div className="relative mx-auto max-w-2xl">
          <Link to="/" aria-label="Home" className="mx-auto block w-fit">
            <img
              src={palmLogo}
              alt="Pictaria"
              width={1024}
              height={1024}
              className="mx-auto h-32 w-auto rounded-[8px] drop-shadow-[0_4px_18px_oklch(0.15_0.04_230/0.65)] transition-transform hover:scale-[1.04] sm:h-40"
            />
          </Link>
          <h1 className="mt-6 font-display text-[1.6rem] leading-snug text-shell sm:text-[2rem]">
            Vision Board
          </h1>
        </div>
      </section>

      <section className="mt-10 px-4 sm:px-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="rounded-[6px] border border-accent/40 bg-deep/50 p-6 backdrop-blur-sm sm:p-10">
            <h2 className="font-display text-lg text-shell">Why It Works</h2>
            <p className="mx-auto mt-4 max-w-xl text-[0.9rem] leading-relaxed text-shell/80">
              There's a reason so many people use vision boards, including
              millionaires and CEOs. Your brain's Reticular Activating System
              (RAS) helps focus your attention on your goals and notice
              opportunities that might otherwise pass you by.
            </p>
          </div>

          <div className="rounded-[6px] border border-accent/40 bg-deep/50 p-6 backdrop-blur-sm sm:p-10">
            <h2 className="font-display text-lg text-shell">
              Vision Boards, Made Active
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[0.9rem] leading-relaxed text-shell/80">
              Pictaria makes vision boards active. As you build your vision
              piece by piece, the satisfaction of solving the puzzle connects a
              positive feeling to the image, bringing thought and emotion
              together with intention.
            </p>
          </div>

          <div className="rounded-[6px] border border-accent/40 bg-deep/50 p-6 backdrop-blur-sm sm:p-10">
            <h2 className="font-display text-lg text-shell">My Own Story</h2>
            <p className="mx-auto mt-4 max-w-xl text-[0.9rem] leading-relaxed text-shell/80">
              Years ago, when I had almost no money, I put a beautiful Maui
              property on my vision board. Within a year, an unexpected
              opportunity appeared, and I acquired that very property!
            </p>
            <p className="mx-auto mt-4 max-w-xl text-[0.9rem] leading-relaxed text-shell/80">
              Since that day I have been a believer in vision boards and living
              in my dream home in Maui ever since.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10 px-4 text-center sm:px-8">
        <Link
          to="/collection/$collectionId"
          params={{ collectionId: "vision-board" }}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-[0.7rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03]"
        >
          See my vision board
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
        </Link>
      </section>
    </main>
  );
}
