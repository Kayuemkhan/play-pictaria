import { defineTool } from "@lovable.dev/mcp-js";

import { listDifficulties } from "../catalog";

export default defineTool({
  name: "list_difficulties",
  title: "List difficulty levels",
  description: "List Pictaria's difficulty levels: grid size, name and piece count.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const difficulties = listDifficulties();
    return {
      content: [{ type: "text", text: JSON.stringify(difficulties, null, 2) }],
      structuredContent: { difficulties },
    };
  },
});
