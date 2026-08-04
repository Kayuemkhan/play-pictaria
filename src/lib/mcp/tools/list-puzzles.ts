import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { collectionSummary, findCollection, puzzleUrl } from "../catalog";

export default defineTool({
  name: "list_puzzles",
  title: "List puzzles in a collection",
  description:
    "List the puzzles in one Pictaria collection, with each puzzle's title, caption and play URL.",
  inputSchema: {
    collectionId: z
      .string()
      .trim()
      .min(1)
      .describe("Collection id from list_collections, e.g. \"whales\"."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ collectionId }) => {
    const collection = findCollection(collectionId);
    if (!collection) {
      throw new ToolError(`No collection with id "${collectionId}".`);
    }

    const puzzles = collection.puzzles.map((puzzle) => ({
      id: puzzle.id,
      title: puzzle.title,
      caption: puzzle.caption,
      url: puzzleUrl(puzzle.id),
    }));
    const payload = { collection: collectionSummary(collection), puzzles };

    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
