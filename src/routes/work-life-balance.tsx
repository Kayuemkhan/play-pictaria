import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import palmLogo from "@/assets/logo-palms-only.png";
import kittenAtWork from "@/assets/work-life-kitten.jpg";
import { visibleCollections } from "@/data/collections";
import { startBreak } from "@/lib/break-session";

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
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://play-pictaria.lovable.app/work-life-balance",
      },
    ],
  }),
  component: WorkLifeBalancePage,
});

const BREAK_CHOICES = [1, 2, 3, 5] as const;

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
  const [goal, setGoal] = useState<number>(2);
  const navigate = useNavigate();

  const beginBreak = () => {
    startBreak(goal);
    navigate({ to: randomPuzzlePath() });
  };

  return (
    <main className="relative min-h-screen bg-deep pb-16">
      {/* hero picture */}
      <div className="relative h-[46vh] min-h-[300px] w-full sm:h-[50vh]">
        <img
          src={kittenAtWork}
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


          <div className="rounded-[6px] border border-accent/40 bg-deep/50 p-6 backdrop-blur-sm sm:p-10">
            <h2 className="font-display text-lg text-shell">
              How long is your break?
            </h2>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {BREAK_CHOICES.map((n) => {
                const active = goal === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setGoal(n)}
                    aria-pressed={active}
                    className={`rounded-full border px-5 py-3 text-[0.6rem] tracking-[0.2em] uppercase transition-all ${
                      active
                        ? "border-accent bg-accent text-deep shadow-lift"
                        : "border-accent/40 bg-deep/40 text-shell/80 hover:border-accent hover:text-accent"
                    }`}
                  >
                    {n} {n === 1 ? "puzzle" : "puzzles"}
                  </button>
                );
              })}
            </div>
            <p className="mt-6 text-center text-[0.8rem] leading-relaxed text-shell/70">
              {goal === 1
                ? "One puzzle — a quick breath before the next thing."
                : `${goal} puzzles — a proper little vacay, then back to work.`}
            </p>
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={beginBreak}
                className="inline-flex items-center gap-1.5 rounded-full border border-accent/60 bg-accent/15 px-6 py-3 text-[0.6rem] tracking-[0.2em] text-accent uppercase transition-transform hover:scale-[1.03]"
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
