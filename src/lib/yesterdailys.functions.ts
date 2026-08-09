import { createServerFn } from "@tanstack/react-start";

import { isPortalPick, portalPickCode } from "./daily-display";

export interface YesterdailyItem {
  /** Collection puzzle id, or the share code for a Project Pictaria photo. */
  kind: "puzzle" | "shared";
  id: string;
  title: string;
  image: string | null;
  picked_at: string;
}

/**
 * Every Pictaria that has already had its day — the daily picks archive,
 * with Project Pictaria photographs resolved to their shared pictures.
 */
export const getYesterdailys = createServerFn({ method: "GET" }).handler(
  async () => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const { data: picks, error } = await supabaseAdmin
      .from("daily_picks")
      .select("id, puzzle_id, picked_at")
      .order("picked_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);

    // The newest pick is today's Pictaria; everything older belongs here.
    const past = (picks ?? []).slice(1);
    const items: YesterdailyItem[] = [];
    const seen = new Set<string>();

    for (const pick of past) {
      if (seen.has(pick.puzzle_id)) continue;
      seen.add(pick.puzzle_id);

      if (!isPortalPick(pick.puzzle_id)) {
        items.push({
          kind: "puzzle",
          id: pick.puzzle_id,
          title: "",
          image: null,
          picked_at: pick.picked_at,
        });
        continue;
      }

      const code = portalPickCode(pick.puzzle_id);
      const { data: row } = await supabaseAdmin
        .from("pictarias")
        .select("title, photo_paths")
        .eq("share_code", code)
        .maybeSingle();
      if (!row) continue;

      let image: string | null = null;
      const path = (row.photo_paths ?? [])[0];
      if (path) {
        const { data: signed } = await supabaseAdmin.storage
          .from("pictarias")
          .createSignedUrl(path, 60 * 60 * 24 * 7);
        image = signed?.signedUrl ?? null;
      }

      items.push({
        kind: "shared",
        id: code,
        title: row.title || "A Pictaria for you",
        image,
        picked_at: pick.picked_at,
      });
    }

    return { items };
  },
);
