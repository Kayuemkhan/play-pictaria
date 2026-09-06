import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

import { PortalGuard } from "@/components/portal/PortalGuard";
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
  component: GuardedDashboard,
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
    <div className="rounded-lg border border-accent/40 bg-shell/95 p-4 text-center shadow-soft">
      <p className="font-display text-[1.6rem] text-foreground">{value.toLocaleString()}</p>
      <p className="mt-0.5 text-[9px] tracking-[0.16em] text-muted-foreground uppercase">{label}</p>
    </div>
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
    <main className="min-h-screen bg-deep px-4 pt-12 pb-24">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-[1.5rem] text-shell">Dashboard</h1>
        <p className="mt-1 text-[10px] tracking-[0.2em] text-shell/60 uppercase">
          {loading ? "crunching the numbers…" : "traffic, waitlist and subscribers"}
        </p>
      </header>

      {error && (
        <p className="mx-auto mt-6 max-w-2xl text-center text-[11px] text-destructive">{error}</p>
      )}

      {summary && (
        <div className="mx-auto mt-6 max-w-2xl space-y-6">
          <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <Stat label="Waitlist" value={summary.waitlist} />
            <Stat label="Subscribers" value={summary.totalSubscribers} />
            <Stat label="Visitors today" value={summary.visitorsToday} />
            <Stat label="Views today" value={summary.viewsToday} />
            <Stat label="Visitors · 7d" value={summary.visitors7d} />
            <Stat label="Views · 7d" value={summary.views7d} />
            <Stat label="Visitors · all time" value={summary.visitorsAll} />
            <Stat label="Views · all time" value={summary.viewsAll} />
          </section>

          <section className="rounded-lg border border-accent/40 bg-shell/95 p-5 shadow-soft">
            <p className="text-center text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              Last 30 days
            </p>
            <div className="mt-3 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary.daily} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="views" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDay}
                    tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    interval={4}
                  />
                  <Tooltip
                    labelFormatter={(value) => formatDay(String(value))}
                    contentStyle={{
                      fontSize: 11,
                      borderRadius: 8,
                      border: "1px solid var(--accent)",
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
                    stroke="var(--accent)"
                    fill="none"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-lg border border-accent/40 bg-shell/95 p-5 shadow-soft">
            <p className="text-center text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              Subscribers by source
            </p>
            <ul className="mt-3 space-y-1.5">
              {summary.subscribersBySource.map((row) => (
                <li
                  key={row.source}
                  className="flex items-center justify-between rounded-lg bg-background/60 px-4 py-2"
                >
                  <span className="text-[12px] text-foreground">
                    {SOURCE_LABELS[row.source] ?? row.source}
                  </span>
                  <span className="text-[12px] text-muted-foreground">{row.count}</span>
                </li>
              ))}
              {summary.subscribersBySource.length === 0 && (
                <p className="text-center text-[11px] text-muted-foreground">No subscribers yet.</p>
              )}
            </ul>
          </section>

          <section className="rounded-lg border border-accent/40 bg-shell/95 p-5 shadow-soft">
            <p className="text-center text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              Top pages · last 30 days
            </p>
            <ul className="mt-3 space-y-1.5">
              {summary.topPaths.map((row) => (
                <li
                  key={row.path}
                  className="flex items-center justify-between rounded-lg bg-background/60 px-4 py-2"
                >
                  <span className="truncate text-[12px] text-foreground">{row.path}</span>
                  <span className="ml-3 shrink-0 text-[12px] text-muted-foreground">
                    {row.views}
                  </span>
                </li>
              ))}
              {summary.topPaths.length === 0 && (
                <p className="text-center text-[11px] text-muted-foreground">
                  No traffic recorded yet.
                </p>
              )}
            </ul>
          </section>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link
          to="/portal/new"
          className="text-[10px] tracking-[0.18em] text-shell/60 uppercase underline"
        >
          Back to Pictaria Project
        </Link>
      </div>
    </main>
  );
}

function GuardedDashboard() {
  return (
    <PortalGuard>
      <Dashboard />
    </PortalGuard>
  );
}
