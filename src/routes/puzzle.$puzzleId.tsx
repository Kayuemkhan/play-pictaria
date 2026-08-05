import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PuzzleBoard } from "@/components/PuzzleBoard";

import { difficulties, findPuzzle } from "@/data/collections";

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
  const [grid, setGrid] = useState<number | null>(initialGrid ?? null);
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




  if (grid) {
    return (
      <PuzzleBoard
        key={`${puzzle.id}-${grid}`}
        src={puzzle.image}
        title={puzzle.title}
        grid={grid}
        onExit={() =>
          navigate({
            to: "/collection/$collectionId",
            params: { collectionId: collection.id },
          })
        }
        onChangeDifficulty={() => setGrid(null)}
      />
    );
  }

  return (
    <main className="min-h-screen bg-mist-gradient px-4 pb-16 sm:px-6">
      <div className="mx-auto w-full max-w-3xl pt-8">
        <div className="overflow-hidden rounded-[4px] border border-accent/60 shadow-lift">
          <img
            src={puzzle.image}
            alt={puzzle.title}
            width={1024}
            height={768}
            className="aspect-[3/4] w-full object-cover"
          />
        </div>

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


        <p className="mt-10 text-center text-[11px] tracking-[0.3em] text-muted-foreground uppercase">
          Choose your pace
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {difficulties.map((d) => (
            <button
              key={d.grid}
              onClick={() => setGrid(d.grid)}
              className="group rounded-[4px] border border-accent/60 bg-card px-4 py-6 text-center shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-lift"
            >
              <p className="font-display text-3xl text-primary">
                {d.grid}×{d.grid}
              </p>
              <p className="mt-2 text-sm">{d.label}</p>
              <p className="text-[11px] tracking-wide text-muted-foreground">
                {d.note}
              </p>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
