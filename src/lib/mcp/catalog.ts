import { collections, difficulties } from "@/data/collections";
import { SITE_URL } from "@/lib/site";

export function puzzleUrl(puzzleId: string) {
  return `${SITE_URL}/puzzle/${puzzleId}`;
}

export function collectionUrl(collectionId: string) {
  return `${SITE_URL}/collection/${collectionId}`;
}

/** Text-only view of a collection — never exposes bundled image data. */
export function collectionSummary(collection: (typeof collections)[number]) {
  return {
    id: collection.id,
    title: collection.title,
    tagline: collection.tagline,
    puzzleCount: collection.puzzles.length,
    comingSoon: collection.comingSoon ?? false,
    storybookOwner: collection.storybook?.owner ?? null,
    url: collectionUrl(collection.id),
  };
}

export function listCollectionSummaries() {
  return collections.filter((c) => !c.hidden).map(collectionSummary);
}

export function findCollection(collectionId: string) {
  return collections.find((c) => c.id === collectionId);
}

export function puzzleSummary(puzzleId: string) {
  for (const collection of collections) {
    const puzzle = collection.puzzles.find((p) => p.id === puzzleId);
    if (puzzle) {
      return {
        id: puzzle.id,
        title: puzzle.title,
        caption: puzzle.caption,
        collectionId: collection.id,
        collectionTitle: collection.title,
        url: puzzleUrl(puzzle.id),
      };
    }
  }
  return undefined;
}

export function searchPuzzles(query: string, limit: number) {
  const needle = query.trim().toLowerCase();
  const results: ReturnType<typeof puzzleSummary>[] = [];
  for (const collection of collections) {
    if (collection.hidden) continue;
    for (const puzzle of collection.puzzles) {
      const haystack = `${puzzle.title} ${puzzle.caption} ${collection.title}`.toLowerCase();
      if (haystack.includes(needle)) {
        results.push({
          id: puzzle.id,
          title: puzzle.title,
          caption: puzzle.caption,
          collectionId: collection.id,
          collectionTitle: collection.title,
          url: puzzleUrl(puzzle.id),
        });
      }
      if (results.length >= limit) return results;
    }
  }
  return results;
}

export function listDifficulties() {
  return difficulties.map((d) => ({
    grid: `${d.grid}x${d.grid}`,
    label: d.label,
    note: d.note,
  }));
}
