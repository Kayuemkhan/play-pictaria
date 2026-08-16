import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import palmLogo from "@/assets/logo-palms-only.png";
import kittenAtWork from "@/assets/work-life-kitten.jpg";
import { visibleCollections } from "@/data/collections";

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

function randomPuzzlePath() {
  const pool = visibleCollections.flatMap((c) => c.puzzles.map((p) => p.id));
  const id = pool[Math.floor(Math.random() * pool.length)];
  return `/puzzle/${id}`;
}

function WorkLifeBalancePage() {
  const [goal, setGoal] = useState<number>(2);
  const navigate = useNavigate();

  const startBreak = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "pictaria:break",
        JSON.stringify({ goal, done: 0, startedAt: Date.now() }),
      );
    }
    navigate({ to: randomPuzzlePath() });
  };

  return (
    <main className="relative min-h-screen pb-16">
      {/* kitten-at-work backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <img
          src={kittenAtWork}
          alt="A kitten in glasses working at a laptop surrounded by Hawaiian flowers, an ocean view out the window"
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-deep/65" />
      </div>

      {/* hero */}
      <section className="relative overflow-hidden px-6 pt-10 pb-12 text-center sm:pt-16">
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
            <p className="mx-auto mt-4 max-w-xl text-[0.9rem] leading-relaxed text-shell/80">
              Pick your number below. We'll keep your break in mind while you
              play, and you'll know exactly when it's time to head back.
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
                onClick={startBreak}
                className="inline-flex items-center gap-1.5 rounded-full border border-accent/60 bg-accent/15 px-6 py-3 text-[0.6rem] tracking-[0.2em] text-accent uppercase transition-transform hover:scale-[1.03]"
              >
                Start my break
                <span aria-hidden>›</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
