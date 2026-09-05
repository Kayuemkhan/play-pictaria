import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

// Routes with no server loader and no per-request personalization in their
// SSR output — the HTML is byte-identical for every visitor, so it's safe
// to let Cloudflare (or any CDN in front) cache it at the edge instead of
// round-tripping to origin on every request. Anything with a loader, auth-
// gated content, or per-id data (puzzle/collection/portal/my-pictaria/etc.)
// is deliberately left out — don't add a route here without checking it
// has no `loader`/`beforeLoad` and doesn't branch SSR output on cookies.
const PUBLICLY_CACHEABLE_PATHS = new Set([
  "/",
  "/about",
  "/vision-board",
  "/work-life-balance",
  "/share",
  "/pricing",
  "/mindfulness",
]);

function withCacheHeaders(request: Request, response: Response): Response {
  if (request.method !== "GET" || response.status !== 200) return response;
  const { pathname } = new URL(request.url);
  if (!PUBLICLY_CACHEABLE_PATHS.has(pathname)) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) return response;

  // Short s-maxage keeps a deploy from being stale at the edge for long;
  // stale-while-revalidate hides the origin round-trip behind a background
  // refresh instead of making a visitor wait for it.
  response.headers.set("cache-control", "public, s-maxage=300, stale-while-revalidate=86400");
  return response;
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return withCacheHeaders(request, await normalizeCatastrophicSsrResponse(response));
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
