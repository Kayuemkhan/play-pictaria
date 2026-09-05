import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import palmLogo from "@/assets/logo-palms-only.png";
import kittenAtWork from "@/assets/work-life-kitten.webp";
import { visibleCollections } from "@/data/collections";
import { startBreak } from "@/lib/break-session";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/work-life-balance")({
  head: () => ({
    meta: [
      { title: "Work Life Balance — A Break for Your Brain | Pictaria" },
      {
        name: "description",
        content:
          "Set how many puzzles you'd like to complete before heading back to work — a small, beautiful break for your brain in Pictaria.",
      },
      {
        property: "og:title",
        content: "Work Life Balance — A Break for Your Brain | Pictaria",
      },
      {
        property: "og:description",
        content:
          "Choose your break: one, two, three or five puzzles, then back to work with a clearer head.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/work-life-balance` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "canonical",
        href: `${SITE_URL}/work-life-balance`,
      },
    ],
  }),
  component: WorkLifeBalancePage,
});

const BREAK_CHOICES = [1, 2, 3, 4, 5] as const;

const BENEFITS: { title: string; body: string }[] = [
  {
    title: "Stress relief & relaxation",
    body: "Shifts the brain into a meditative state, lowering heart rate and cortisol.",
  },
  {
    title: "Improves cognitive function",
    body: "Strengthens memory, focus and problem-solving, and promotes neuroplasticity.",
  },
  {
    title: "Mindfulness & flow",
    body: "Anchors you in the present, reducing rumination and anxious thoughts.",
  },
  {
    title: "Slows cognitive decline",
    body: "Builds cognitive reserve, potentially delaying dementia and Alzheimer's symptoms.",
  },
  {
    title: "Builds resilience & patience",
    body: "Teaches emotional regulation and a growth mindset through healthy frustration.",
  },
  {
    title: "Social connection",
    body: "Fosters bonding and communication, and eases loneliness when done with others.",
  },
  {
    title: "Boosts mood & dopamine",
    body: "Small wins trigger dopamine release, improving mood and motivation.",
  },
];

function randomPuzzlePath() {
  const pool = visibleCollections.flatMap((c) => c.puzzles.map((p) => p.id));
  const id = pool[Math.floor(Math.random() * pool.length)];
  return `/puzzle/${id}`;
}

function WorkLifeBalancePage() {
  const [goal, setGoal] = useState<number | null>(null);
  const navigate = useNavigate();

  const beginBreak = () => {
    const chosen = goal ?? 3;
    startBreak(chosen);
    navigate({ to: randomPuzzlePath() });
  };

  return (
    <main className="relative min-h-screen bg-deep pb-16">
      {/* hero picture */}
      <div className="relative h-[46vh] min-h-[300px] w-full sm:h-[50vh]">
        <img
          src={kittenAtWork}
          fetchPriority="high"
          decoding="async"
          alt="A kitten in glasses beside a laptop surrounded by Hawaiian flowers, an ocean view out the window"
          className="absolute inset-0 h-full w-full object-cover"
          width={1344}
          height={896}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-deep/40 via-deep/20 to-deep" />
      </div>

      {/* hero */}
      <section className="relative z-10 -mt-24 px-6 pb-10 text-center sm:-mt-28">
        <div className="relative mx-auto max-w-2xl">
          <Link to="/" aria-label="Home" className="mx-auto block w-fit">
            <img
              src={palmLogo}
              alt="Pictaria"
              width={1024}
              height={1024}
              className="mx-auto h-24 w-auto rounded-[8px] drop-shadow-[0_4px_18px_oklch(0.15_0.04_230/0.65)] transition-transform hover:scale-[1.04] sm:h-32"
            />
          </Link>
          <h1 className="mt-6 font-display text-[1.6rem] leading-snug text-shell sm:text-[2rem]">
            Work Life Balance
          </h1>
        </div>
      </section>

      <section className="px-4 sm:px-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="rounded-[6px] border border-accent/40 bg-deep/50 p-6 backdrop-blur-sm sm:p-10">
            <h2 className="font-display text-lg text-shell">
              A Little Break for Your Brain
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[0.9rem] leading-relaxed text-shell/80">
              Work life balance is very important. Taking a break with your
              brain is very important too. So you can set how many puzzles
              you'd like to complete before going back to work — a small,
              beautiful pause, then right back to it with a clearer head.
            </p>
          </div>


          <div className="rounded-[6px] border border-accent/40 bg-deep/50 p-4 backdrop-blur-sm sm:p-5">
            <h2 className="font-display text-base text-shell">
              How long is your break?
            </h2>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {BREAK_CHOICES.map((n) => (
                <button
                  key={n}
                  type="button"
                  onPointerDown={() => setGoal(n)}
                  onClick={() => setGoal(n)}
                  aria-pressed={goal === n}
                  className={`relative z-10 flex h-12 w-12 touch-manipulation items-center justify-center rounded-full border text-[0.85rem] font-medium shadow-sm transition-transform active:scale-95 ${
                    goal === n
                      ? "border-accent bg-accent text-deep"
                      : "border-accent/60 bg-accent/15 text-accent"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="mt-4 text-center text-[0.8rem] leading-relaxed text-shell/80">
              {goal
                ? `Your break: ${goal} ${goal === 1 ? "puzzle" : "puzzles"}.`
                : "3 puzzles is a proper little vacay."}
            </p>
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={beginBreak}
                className="relative z-10 inline-flex touch-manipulation items-center gap-1.5 rounded-full border border-accent/60 bg-accent/15 px-6 py-3 text-[0.6rem] tracking-[0.2em] text-accent uppercase transition-transform active:scale-95"
              >
                Start my break
                <span aria-hidden>›</span>
              </button>
            </div>
          </div>

          <div className="rounded-[6px] border border-accent/40 bg-deep/50 p-6 backdrop-blur-sm sm:p-10">
            <h2 className="font-display text-lg text-shell">
              Benefits of doing puzzles
            </h2>
            <ul className="mt-6 space-y-4">
              {BENEFITS.map((b) => (
                <li key={b.title} className="flex gap-3">
                  <span aria-hidden className="mt-1 text-accent">
                    ·
                  </span>
                  <p className="text-[0.85rem] leading-relaxed text-shell/80">
                    <span className="text-shell">{b.title}:</span> {b.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
