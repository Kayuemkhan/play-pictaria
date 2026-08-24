import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import underwaterAsset from "@/assets/vision-board-underwater.jpg";

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
      {/* underwater header image — sits at the top and fades into the deep background */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[52vh] overflow-hidden bg-deep">
        <img
          src={underwaterAsset}
          fetchPriority="high"
          decoding="async"
          alt="Sunlight beaming down through calm ocean water"
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[45%] via-deep/70 via-[75%] to-deep" />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-20 bg-deep" />

      {/* hero */}
      <section className="relative overflow-hidden px-6 pt-[22vh] pb-0 text-center">
        <div className="relative mx-auto max-w-2xl">
          <h1 className="font-display text-[1.6rem] leading-snug text-shell drop-shadow-[0_2px_12px_oklch(0.15_0.04_230/0.75)] sm:text-[2rem]">
            Vision Boards
          </h1>
        </div>
      </section>



      <section className="mt-3 px-4 sm:px-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="rounded-[6px] border border-accent/40 bg-deep/50 p-6 backdrop-blur-sm sm:p-10">
            <h2 className="font-display text-lg text-shell">
              Why People Love Vision Boards
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[0.9rem] leading-relaxed text-shell/80">
              There's a reason so many people use vision boards, including
              millionaires and CEOs. Your brain's Reticular Activating System
              (RAS) helps focus your attention on your goals and notice
              opportunities that might otherwise pass you by.
            </p>
            <p className="mx-auto mt-4 max-w-xl text-[0.9rem] leading-relaxed text-shell/80">
              Pictaria adds another layer: the physical act of moving tiles to
              solve a puzzle triggers effortful processing, bringing action into
              the passive. That satisfying dopamine hit when the final piece
              snaps into place helps hardwire the vision into your memory,
              making it much stronger than simply looking at a picture.
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

      <section className="mt-3 px-4 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-[6px] border border-accent/40 bg-deep/50 p-6 backdrop-blur-sm sm:p-10">
            <h2 className="font-display text-lg text-shell">
              Words That Shape Reality
            </h2>
            <div className="mt-6 space-y-6 text-left">
              <QuoteBlock
                author="Neville Goddard"
                quotes={[
                  "Assume the feeling of your wish fulfilled and observe the route that your attention follows.",
                  "Imagination is the only reality.",
                ]}
              />
              <QuoteBlock
                author="Abraham Hicks"
                quotes={[
                  "You don't attract what you want. You attract what you are.",
                  "The only reason you want anything is because you think you'll feel better when you have it.",
                ]}
              />
              <QuoteBlock
                author="Wayne Dyer"
                quotes={[
                  "You are not a human being with a spiritual experience. You are a spiritual being with a human experience.",
                  "When you change the way you look at things, the things you look at change.",
                ]}
              />
              <QuoteBlock
                author="Bashar"
                quotes={[
                  "Follow your highest excitement, moment to moment, with no insistence on the outcome.",
                ]}
              />
              <QuoteBlock
                author="Bob Proctor"
                quotes={[
                  "You don't attract what you want. You attract what you are.",
                ]}
              />
              <QuoteBlock
                author="Byron Katie"
                quotes={[
                  "I am a lover of what is, not because I'm a spiritual person, but because it hurts when I argue with reality.",
                  "When you argue with reality, you lose—but only 100% of the time.",
                ]}
              />
              <QuoteBlock
                author="Mel Robbins"
                quotes={[
                  "You are one decision away from a completely different life.",
                  "Confidence is built through action, not thinking.",
                ]}
              />
              <QuoteBlock
                author="Buddha"
                quotes={[
                  "You yourself, as much as anybody in the entire universe, deserve your love and affection.",
                  "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.",
                ]}
              />
            </div>
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

function QuoteBlock({
  author,
  quotes,
}: {
  author: string;
  quotes: string[];
}) {
  return (
    <div>
      <h3 className="font-display text-[0.95rem] text-accent">{author}</h3>
      <ul className="mt-2 space-y-2">
        {quotes.map((quote, i) => (
          <li
            key={i}
            className="pl-4 text-[0.85rem] leading-relaxed text-shell/80 relative before:absolute before:left-0 before:top-[0.55em] before:h-1 before:w-1 before:rounded-full before:bg-accent/70"
          >
            {quote}
          </li>
        ))}
      </ul>
    </div>
  );
}
