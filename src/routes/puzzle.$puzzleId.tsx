import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PuzzleBoard } from "@/components/PuzzleBoard";

import { PoemCTAs } from "@/components/PoemCTAs";
import palmLogo from "@/assets/logo-palms-only.png";

import { collections, findPuzzle } from "@/data/collections";

export const Route = createFileRoute("/puzzle/$puzzleId")({
  validateSearch: (search: Record<string, unknown>) => ({
    grid: search["grid"] ? Number(search["grid"]) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Play a puzzle — Pictaria" },
      {
        name: "description",
        content:
          "Choose your pace — 3×3 relaxing through 6×6 intriguing — and piece together a beautiful photograph in Pictaria.",
      },
      { property: "og:title", content: "Play a puzzle — Pictaria" },
      {
        property: "og:description",
        content:
          "Pick a difficulty and assemble a beautiful photograph, piece by piece.",
      },
    ],
  }),
  component: PuzzlePage,
});

function PuzzlePage() {
  const { puzzleId } = Route.useParams();
  const { grid: initialGrid } = Route.useSearch();
  const navigate = useNavigate();
  const [grid, setGrid] = useState<number>(initialGrid ?? 4);
  const found = findPuzzle(puzzleId);


  if (!found) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-mist-gradient px-6 text-center">
        <h1 className="font-display text-4xl">Puzzle not found</h1>
        <Link
          to="/"
          className="mt-6 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground"
        >
          Back to gallery
        </Link>
      </main>
    );
  }

  const { puzzle, collection } = found;

  // Surprise me — hop to a different collection somewhere in the Pictaria universe
  const surpriseMe = (g: number) => {
    const others = collections.filter(
      (c) => c.id !== collection.id && c.puzzles.length > 0,
    );
    const bag = others.length
      ? others
      : collections.filter((c) => c.puzzles.length > 0);
    const nextCollection = bag[Math.floor(Math.random() * bag.length)]!;
    const pool = nextCollection.puzzles.filter((p) => p.id !== puzzle.id);
    if (!pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)]!;
    navigate({
      to: "/puzzle/$puzzleId",
      params: { puzzleId: pick.id },
      search: { grid: g },
    });
  };


  if (grid) {
    return (
      <PuzzleBoard
        key={`${puzzle.id}-${grid}`}
        src={puzzle.image}
        title={puzzle.title}
        grid={grid}
        onNext={() => surpriseMe(grid)}
        onChangeGrid={(g) => {
          setGrid(g);
          navigate({
            to: "/puzzle/$puzzleId",
            params: { puzzleId },
            search: { grid: g },
            replace: true,
          });
        }}
        onExit={() =>
          navigate({
            to: "/collection/$collectionId",
            params: { collectionId: collection.id },
          })
        }
      />
    );
  }

  return (
    <main className="min-h-screen bg-mist-gradient px-4 pb-16 sm:px-6">
      <div className="mx-auto w-full max-w-3xl pt-8">
        <Link
          to="/"
          aria-label="Pictaria — turn pictures into play"
          className="group mb-6 flex flex-col items-center"
        >
          <img
            src={palmLogo}
            alt="Pictaria"
            width={1024}
            height={1024}
            className="h-14 w-auto transition-transform duration-500 ease-[var(--ease-calm)] group-hover:scale-[1.06] sm:h-16"
          />
          <span className="mt-2 font-display text-2xl leading-none tracking-[0.34em] text-primary uppercase sm:text-3xl">
            Pictaria
          </span>
          <span className="-mt-0.5 font-display text-[0.6rem] tracking-[0.42em] text-muted-foreground uppercase sm:text-[0.7rem]">
            Turn pictures into play
          </span>
        </Link>

        <div className="overflow-hidden rounded-[4px] border border-accent/60 shadow-lift">
          <img
            src={puzzle.image}
            alt={puzzle.title}
            width={1024}
            height={768}
            className="aspect-[3/4] w-full object-cover"
          />
        </div>

        {puzzle.meaning && (
          <p className="mt-3 text-center text-sm text-muted-foreground italic">
            {puzzle.meaning}
          </p>
        )}

        <div className="mt-6 text-center">
          <p className="text-[11px] tracking-[0.3em] text-muted-foreground uppercase">
            {collection.title}
          </p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl">
            {puzzle.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{puzzle.caption}</p>

          {puzzle.recipe && (
            <div className="mt-4 rounded-[4px] border border-accent/40 bg-card/60 p-4 text-left">
              <p className="text-[10px] tracking-[0.2em] text-primary uppercase">
                Recipe
              </p>
              <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-sm leading-relaxed text-foreground">
                {puzzle.recipe.split("\n").map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          )}
          {puzzle.story && (
            <div className="mx-auto mt-5 max-w-prose space-y-3 text-left">
              {puzzle.story.map((para, i) => (
                <p key={i} className="text-sm leading-relaxed text-foreground">
                  {para}
                </p>
              ))}
            </div>
          )}
        </div>


        <div className="mt-10">
          <PoemCTAs />
        </div>
      </div>
    </main>
  );
}
