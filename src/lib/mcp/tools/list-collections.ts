import { defineTool } from "@lovable.dev/mcp-js";

import { listCollectionSummaries } from "../catalog";

export default defineTool({
  name: "list_collections",
  title: "List collections",
  description:
    "List every Pictaria puzzle collection (gallery) with its tagline, puzzle count and play URL.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const collections = listCollectionSummaries();
    return {
      content: [{ type: "text", text: JSON.stringify(collections, null, 2) }],
      structuredContent: { collections },
    };
  },
});
