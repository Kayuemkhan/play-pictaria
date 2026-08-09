import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { Database } from "@/integrations/supabase/types";

export interface DailyPick {
  id: string;
  puzzle_id: string;
  picked_at: string;
}

const pickSchema = z.object({
  puzzleId: z.string().trim().min(1).max(120),
});

const removeSchema = z.object({
  id: z.string().uuid(),
});


/**
 * Which puzzle is today's Pictaria, plus every puzzle featured before it.
 * Public: read through the publishable key behind the anon SELECT policy.
 */
export const getDailyPicks = createServerFn({ method: "GET" }).handler(async () => {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const supabasePublic = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });

  const { data, error } = await supabasePublic
    .from("daily_picks")
    .select("id, puzzle_id, picked_at")
    .order("picked_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);

  const picks = (data ?? []) as DailyPick[];
  return {
    current: picks[0] ?? null,
    past: picks.slice(1),
  };
});

/** Founder action: make a puzzle today's Pictaria. */
export const setDailyPick = createServerFn({ method: "POST" })
  .inputValidator((input) => pickSchema.parse(input))
  .handler(async ({ data }) => {
    const { requirePortal } = await import("./portal.server");
    await requirePortal();

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("daily_picks")
      .insert({ puzzle_id: data.puzzleId });
    if (error) throw new Error(error.message);

    return { ok: true };
  });

/** Founder action: erase one entry from the Yesterdailys archive. */
export const removeDailyPick = createServerFn({ method: "POST" })
  .inputValidator((input) => removeSchema.parse(input))
  .handler(async ({ data }) => {
    const { requirePortal } = await import("./portal.server");
    await requirePortal();

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("daily_picks")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    return { ok: true };
  });
