import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { listDifficulties, puzzleSummary } from "../catalog";

export default defineTool({
  name: "get_puzzle",
  title: "Get a puzzle",
  description:
    "Get one Pictaria puzzle by id: its title, caption, collection, play URL and the difficulty grids it can be played at.",
  inputSchema: {
    puzzleId: z.string().trim().min(1).describe("Puzzle id, e.g. \"whale-01\"."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ puzzleId }) => {
    const puzzle = puzzleSummary(puzzleId);
    if (!puzzle) {
      throw new ToolError(`No puzzle with id "${puzzleId}".`);
    }

    const payload = { puzzle, difficulties: listDifficulties() };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
