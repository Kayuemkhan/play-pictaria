import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { Collection, Puzzle } from "@/data/collections";

/** Every admin-added collection that's ready to play — merged with the static catalog by the page. */
export const getLibraryCollections = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ collections: Collection[] }> => {
    const { fetchLibraryCollections } = await import("./collection-catalog.server");
    return { collections: await fetchLibraryCollections() };
  },
);

const puzzleIdSchema = z.object({ puzzleId: z.string().trim().min(1).max(200) });

/** Async fallback for when a puzzle id isn't in the static catalog. */
export const getLibraryPuzzle = createServerFn({ method: "POST" })
  .inputValidator((input) => puzzleIdSchema.parse(input))
  .handler(
    async ({ data }): Promise<{ found: { puzzle: Puzzle; collection: Collection } | null }> => {
      const { fetchLibraryPuzzle } = await import("./collection-catalog.server");
      return { found: await fetchLibraryPuzzle(data.puzzleId) };
    },
  );
