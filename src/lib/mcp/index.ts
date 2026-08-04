import { defineMcp } from "@lovable.dev/mcp-js";

import getPuzzleTool from "./tools/get-puzzle";
import listCollectionsTool from "./tools/list-collections";
import listDifficultiesTool from "./tools/list-difficulties";
import listPuzzlesTool from "./tools/list-puzzles";
import searchPuzzlesTool from "./tools/search-puzzles";

export default defineMcp({
  name: "pictaria",
  title: "Pictaria",
  version: "0.1.0",
  instructions:
    "Browse Pictaria's public puzzle catalog. Use `list_collections` for the galleries, `list_puzzles` for the puzzles inside one gallery, `search_puzzles` to find a puzzle by words, `get_puzzle` for one puzzle's details and play URL, and `list_difficulties` for the grid sizes. Read-only: no personal or subscriber data is available.",
  tools: [
    listCollectionsTool,
    listPuzzlesTool,
    searchPuzzlesTool,
    getPuzzleTool,
    listDifficultiesTool,
  ] as never,
});
