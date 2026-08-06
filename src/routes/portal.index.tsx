import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import { PortalLock } from "@/components/portal/PortalLock";
import { listPortalBusinesses } from "@/lib/portal.functions";
import {
  PORTAL_CATEGORIES,
  PORTAL_STATUSES,
  type PortalRecord,
} from "@/lib/portal-types";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/portal/")({
  head: () => ({
    meta: [
      { title: "Pictaria Portal" },
      { name: "description", content: "Internal Pictaria field portal." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PortalIndex,
});

const CARD_STATUS_TINT: Record<string, string> = {
  New: "text-muted-foreground",
  "Photo Collected": "text-foreground",
  "Ready to Build": "text-primary",
  "Pictaria Created": "text-primary",
  "Sent to Business": "text-primary",
  "Follow-up Needed": "text-destructive",
  "Active Subscriber": "text-accent-foreground",
};

function PortalIndex() {
  const load = useServerFn(listPortalBusinesses);
  const [locked, setLocked] = useState<boolean | null>(null);
  const [records, setRecords] = useState<PortalRecord[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");

  const refresh = async () => {
    const result = await load({});
    if (result.locked) {
      setLocked(true);
      return;
    }
    setLocked(false);
    setRecords(result.records);
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return records.filter((record) => {
      if (status !== "All" && record.status !== status) return false;
      if (category !== "All" && record.category !== category) return false;
      if (!needle) return true;
      return [record.company_name, record.contact_person, record.category, record.status]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [records, query, status, category]);

  if (locked === null) {
    return <main className="min-h-screen bg-deep" />;
  }
  if (locked) return <PortalLock onUnlocked={refresh} />;

  return (
    <main className="min-h-screen bg-deep px-4 pt-16 pb-28">
      <header className="mx-auto max-w-md text-center">
        <h1 className="font-display text-[1.6rem] text-shell">Pictaria Portal</h1>
        <p className="mt-1 text-[10px] tracking-[0.2em] text-shell/60 uppercase">
          {records.length} {records.length === 1 ? "business" : "businesses"}
        </p>
      </header>

      <div className="mx-auto mt-6 max-w-md space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search company, contact, category…"
            className="pl-9"
            aria-label="Search businesses"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filter by status"
            className="h-9 rounded-md border border-input bg-background px-2 text-[12px] text-foreground"
          >
            <option value="All">All statuses</option>
            {PORTAL_STATUSES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter by category"
            className="h-9 rounded-md border border-input bg-background px-2 text-[12px] text-foreground"
          >
            <option value="All">All categories</option>
            {PORTAL_CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3">
        {filtered.map((record) => (
          <Link
            key={record.id}
            to="/portal/$id"
            params={{ id: record.id }}
            className="overflow-hidden rounded-lg border border-accent/50 bg-shell shadow-soft transition-transform hover:scale-[1.02]"
          >
            <div className="bg-muted/40" style={{ aspectRatio: "3 / 4" }}>
              {record.photo_url ? (
                <img
                  src={record.photo_url}
                  alt={record.company_name || "Business photograph"}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="p-2.5">
              <p className="font-display text-[0.95rem] leading-tight text-foreground">
                {record.company_name || "Untitled business"}
              </p>
              <p
                className={`mt-1 text-[9px] tracking-[0.16em] uppercase ${
                  CARD_STATUS_TINT[record.status] ?? "text-muted-foreground"
                }`}
              >
                {record.status}
              </p>
              <p className="mt-1 text-[9px] tracking-[0.12em] text-muted-foreground uppercase">
                {new Date(record.created_at).toLocaleDateString()} · updated{" "}
                {new Date(record.updated_at).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mx-auto mt-10 max-w-md text-center text-[12px] text-shell/70">
          {records.length === 0
            ? "No businesses yet — tap the plus to capture your first visit."
            : "Nothing matches that search."}
        </p>
      )}

      <Link
        to="/portal/new"
        aria-label="New business"
        className="fixed right-5 bottom-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lift transition-transform hover:scale-105"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </main>
  );
}
