import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Loader2 } from "lucide-react";

import { AdminPageHeader } from "@/components/portal/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardSummary } from "@/lib/analytics.functions";
import type { DashboardSummary } from "@/lib/analytics.functions";

export const Route = createFileRoute("/portal/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Pictaria Project" },
      {
        name: "description",
        content: "Traffic, waitlist and subscriber counts for Pictaria.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Dashboard,
});

const SOURCE_LABELS: Record<string, string> = {
  launch_list: "Waitlist (launch list)",
  daily: "Daily digest",
  unknown: "Unspecified",
};

function formatDay(iso: string) {
  const [, month, day] = iso.split("-");
  const date = new Date(Number(iso.slice(0, 4)), Number(month) - 1, Number(day));
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <p className="font-display text-2xl text-foreground">{value.toLocaleString()}</p>
        <p className="mt-0.5 text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
          {label}
        </p>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const load = useServerFn(getDashboardSummary);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void load({})
      .then(setSummary)
      .catch((err) => setError(err instanceof Error ? err.message : "Couldn't load the dashboard."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        title="Dashboard"
        description="Traffic, waitlist and subscriber counts for Pictaria."
      />

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Crunching the numbers…
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {summary && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Waitlist" value={summary.waitlist} />
            <Stat label="Subscribers" value={summary.totalSubscribers} />
            <Stat label="Visitors today" value={summary.visitorsToday} />
            <Stat label="Views today" value={summary.viewsToday} />
            <Stat label="Visitors · 7d" value={summary.visitors7d} />
            <Stat label="Views · 7d" value={summary.views7d} />
            <Stat label="Visitors · all time" value={summary.visitorsAll} />
            <Stat label="Views · all time" value={summary.viewsAll} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Last 30 days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={summary.daily} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                    <defs>
                      <linearGradient id="views" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDay}
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                      interval={4}
                    />
                    <Tooltip
                      labelFormatter={(value) => formatDay(String(value))}
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                        background: "var(--card)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="views"
                      name="Views"
                      stroke="var(--primary)"
                      fill="url(#views)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="visitors"
                      name="Visitors"
                      stroke="var(--accent-foreground)"
                      fill="none"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Subscribers by source</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {summary.subscribersBySource.map((row) => (
                  <div
                    key={row.source}
                    className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2"
                  >
                    <span className="text-sm text-foreground">
                      {SOURCE_LABELS[row.source] ?? row.source}
                    </span>
                    <span className="text-sm text-muted-foreground">{row.count}</span>
                  </div>
                ))}
                {summary.subscribersBySource.length === 0 && (
                  <p className="text-sm text-muted-foreground">No subscribers yet.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Top pages · last 30 days</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {summary.topPaths.map((row) => (
                  <div
                    key={row.path}
                    className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2"
                  >
                    <span className="truncate text-sm text-foreground">{row.path}</span>
                    <span className="ml-3 shrink-0 text-sm text-muted-foreground">{row.views}</span>
                  </div>
                ))}
                {summary.topPaths.length === 0 && (
                  <p className="text-sm text-muted-foreground">No traffic recorded yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
