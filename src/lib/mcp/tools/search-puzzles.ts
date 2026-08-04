import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { searchPuzzles } from "../catalog";

export default defineTool({
  name: "search_puzzles",
  title: "Search puzzles",
  description:
    "Search Pictaria puzzles by words in their title, caption or collection name, e.g. \"sunset\" or \"whale\".",
  inputSchema: {
    query: z.string().trim().min(1).describe("Words to search for."),
    limit: z.number().int().min(1).max(50).optional().describe("Max results, default 10."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ query, limit }) => {
    const results = searchPuzzles(query, limit ?? 10);
    return {
      content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      structuredContent: { query, results },
    };
  },
});
