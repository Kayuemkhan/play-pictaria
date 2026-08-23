import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PuzzleBoard } from "@/components/PuzzleBoard";
import { PuzzleNoteEditor } from "@/components/PuzzleNoteEditor";
import { noteParagraphs, usePuzzleNote } from "@/lib/puzzle-notes";


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
  const note = usePuzzleNote(puzzleId);
  const found = findPuzzle(puzzleId);


  if (!found) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-mist-gradient px-6 text-center">
        <h1 className="font-display text-4xl">Puzzle not found</h1>
        <Link
          to="/"
          className="mt-6 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground"
        >
          Back to album
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

  const displayTitle = note.title ?? puzzle.title;
  const displayParagraphs = note.story
    ? noteParagraphs(note.story)
    : (puzzle.story ?? null);

  const info = (
    <div className="mx-auto max-w-2xl text-center">
      <h1 className="font-display text-2xl leading-tight sm:text-3xl">
        {displayTitle}
      </h1>
      {puzzle.meaning && !note.title && (
        <p className="mt-0.5 text-xs text-muted-foreground italic">
          {puzzle.meaning}
        </p>
      )}
      {displayParagraphs ? (
        <div className="mt-2 space-y-1.5">
          {displayParagraphs.map((para, i) => (
            <p key={i} className="text-[0.8rem] leading-relaxed text-foreground">
              {para}
            </p>
          ))}
        </div>
      ) : (
        puzzle.caption && (
          <p className="mt-1 text-[0.8rem] text-muted-foreground">
            {puzzle.caption}
          </p>
        )
      )}



      {collection.storyFooter && (
        <p className="mt-2 text-[0.68rem] tracking-wide text-muted-foreground/70 italic">
          {collection.storyFooter}
        </p>
      )}
      {puzzle.recipe && (
        <div className="mt-4 rounded-[6px] border border-accent/50 bg-card/70 px-4 py-4 text-center shadow-soft">
          {/* recipe card header */}
          <div className="border-b border-accent/40 pb-2">
            <p className="text-[9px] tracking-[0.34em] text-primary uppercase">
              Recipe
            </p>
            <p className="mt-1 font-display text-xl leading-tight text-foreground">
              {puzzle.title}
            </p>
            {puzzle.recipe.yield && (
              <p className="mt-0.5 text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                {puzzle.recipe.yield}
              </p>
            )}
          </div>

          <div className="mt-3">
            <p className="text-[9px] tracking-[0.28em] text-primary uppercase">
              Ingredients
            </p>
            <ul className="mt-1.5 inline-block list-inside space-y-1 text-left">
              {puzzle.recipe.ingredients.map((item, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-[0.8rem] leading-relaxed text-foreground"
                >
                  <span aria-hidden className="text-accent">
                    •
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-3.5">
            <p className="text-[9px] tracking-[0.28em] text-primary uppercase">
              Directions
            </p>
            <ol className="mt-1.5 inline-block list-inside space-y-1.5 text-left">
              {puzzle.recipe.steps.map((step, i) => (
                <li
                  key={i}
                  className="flex gap-2.5 text-[0.8rem] leading-relaxed text-foreground"
                >
                  <span
                    aria-hidden
                    className="mt-[1px] font-display text-[0.85rem] text-primary"
                  >
                    {i + 1}.
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {puzzle.recipe.note && (
            <p className="mt-3.5 border-t border-accent/30 pt-2.5 text-[0.74rem] leading-relaxed text-muted-foreground italic">
              {puzzle.recipe.note}
            </p>
          )}
        </div>
      )}

    </div>
  );

  return (
    <PuzzleBoard
      key={`${puzzle.id}-${grid}`}
      src={puzzle.image}
      title={displayTitle}
      grid={grid}
      info={info}
      collectionName={collection.title}
      collectionId={collection.id}
      onNext={() => surpriseMe(grid)}
      {...(collection.puzzles.length > 1
        ? {
            onNextInSeries: () => {
              const i = collection.puzzles.findIndex((p) => p.id === puzzle.id);
              const next =
                collection.puzzles[(i + 1) % collection.puzzles.length]!;
              navigate({
                to: "/puzzle/$puzzleId",
                params: { puzzleId: next.id },
                search: { grid },
              });
            },
          }
        : {})}

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
