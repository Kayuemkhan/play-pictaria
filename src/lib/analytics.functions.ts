import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const DAY_MS = 24 * 60 * 60 * 1000;

const recordSchema = z.object({
  path: z.string().trim().min(1).max(300),
  referrer: z.string().trim().max(500).optional(),
  visitorId: z.string().trim().min(8).max(100),
});

/** Anonymous, first-party page-view beacon — no cookies, no PII. */
export const recordPageView = createServerFn({ method: "POST" })
  .inputValidator((input) => recordSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("page_views").insert({
      path: data.path,
      referrer: data.referrer || null,
      visitor_id: data.visitorId,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export interface DailyPoint {
  date: string;
  views: number;
  visitors: number;
}

export interface TopPath {
  path: string;
  views: number;
}

export interface DashboardSummary {
  waitlist: number;
  totalSubscribers: number;
  subscribersBySource: { source: string; count: number }[];
  viewsToday: number;
  views7d: number;
  views30d: number;
  viewsAll: number;
  visitorsToday: number;
  visitors7d: number;
  visitors30d: number;
  visitorsAll: number;
  daily: DailyPoint[];
  topPaths: TopPath[];
}

function uniqueVisitors(rows: { visitor_id: string }[]) {
  return new Set(rows.map((row) => row.visitor_id)).size;
}

/** Founder overview: waitlist size, subscriber breakdown, and site traffic. */
export const getDashboardSummary = createServerFn({ method: "GET" }).handler(
  async (): Promise<DashboardSummary> => {
    const { requirePortal } = await import("./portal.server");
    await requirePortal();

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [subscribersResult, viewsAllResult, recentResult, allVisitorsResult] = await Promise.all([
      supabaseAdmin.from("daily_subscribers").select("source"),
      supabaseAdmin.from("page_views").select("*", { count: "exact", head: true }),
      supabaseAdmin
        .from("page_views")
        .select("path, visitor_id, created_at")
        .gte("created_at", new Date(Date.now() - 30 * DAY_MS).toISOString())
        .limit(50_000),
      supabaseAdmin.from("page_views").select("visitor_id").limit(50_000),
    ]);

    if (subscribersResult.error) throw new Error(subscribersResult.error.message);
    if (viewsAllResult.error) throw new Error(viewsAllResult.error.message);
    if (recentResult.error) throw new Error(recentResult.error.message);
    if (allVisitorsResult.error) throw new Error(allVisitorsResult.error.message);

    const subscribers = subscribersResult.data ?? [];
    const bySource = new Map<string, number>();
    for (const row of subscribers) {
      const key = row.source ?? "unknown";
      bySource.set(key, (bySource.get(key) ?? 0) + 1);
    }

    const rows = recentResult.data ?? [];
    const now = Date.now();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const since7d = now - 7 * DAY_MS;

    const rowsToday = rows.filter(
      (row) => new Date(row.created_at).getTime() >= startOfToday.getTime(),
    );
    const rows7d = rows.filter((row) => new Date(row.created_at).getTime() >= since7d);

    const dayBuckets = new Map<string, { views: number; visitors: Set<string> }>();
    for (let i = 29; i >= 0; i -= 1) {
      const key = new Date(now - i * DAY_MS).toISOString().slice(0, 10);
      dayBuckets.set(key, { views: 0, visitors: new Set() });
    }
    const pathCounts = new Map<string, number>();
    for (const row of rows) {
      const bucket = dayBuckets.get(row.created_at.slice(0, 10));
      if (bucket) {
        bucket.views += 1;
        bucket.visitors.add(row.visitor_id);
      }
      pathCounts.set(row.path, (pathCounts.get(row.path) ?? 0) + 1);
    }

    return {
      waitlist: bySource.get("launch_list") ?? 0,
      totalSubscribers: subscribers.length,
      subscribersBySource: [...bySource.entries()]
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count),
      viewsToday: rowsToday.length,
      views7d: rows7d.length,
      views30d: rows.length,
      viewsAll: viewsAllResult.count ?? 0,
      visitorsToday: uniqueVisitors(rowsToday),
      visitors7d: uniqueVisitors(rows7d),
      visitors30d: uniqueVisitors(rows),
      visitorsAll: uniqueVisitors(allVisitorsResult.data ?? []),
      daily: [...dayBuckets.entries()].map(([date, bucket]) => ({
        date,
        views: bucket.views,
        visitors: bucket.visitors.size,
      })),
      topPaths: [...pathCounts.entries()]
        .map(([path, views]) => ({ path, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10),
    };
  },
);
