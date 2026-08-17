import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const statusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "approved", "declined"]),
});

export interface CommunitySubmission {
  id: string;
  share_code: string;
  title: string;
  tagline: string;
  story: string;
  tier: string;
  status: "pending" | "approved" | "declined";
  created_at: string;
  photo_url: string | null;
}

/** Everything a visitor offered to the community, newest first. Admin only. */
export const listCommunitySubmissions = createServerFn({ method: "POST" }).handler(
  async () => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const { data, error } = await supabaseAdmin
      .from("community_submissions")
      .select("id, share_code, photo_path, title, tagline, story, tier, status, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);

    const records: CommunitySubmission[] = [];
    for (const row of data ?? []) {
      const { data: signed } = await supabaseAdmin.storage
        .from("pictarias")
        .createSignedUrl(row.photo_path, 60 * 60 * 6);
      records.push({
        id: row.id,
        share_code: row.share_code,
        title: row.title ?? "",
        tagline: row.tagline ?? "",
        story: row.story ?? "",
        tier: row.tier ?? "free",
        status: (row.status ?? "pending") as CommunitySubmission["status"],
        created_at: row.created_at,
        photo_url: signed?.signedUrl ?? null,
      });
    }
    return { records };
  },
);

/** Authorize (or decline) one offered picture. */
export const setCommunitySubmissionStatus = createServerFn({ method: "POST" })
  .inputValidator((input) => statusSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { error } = await supabaseAdmin
      .from("community_submissions")
      .update({
        status: data.status,
        reviewed_at: data.status === "pending" ? null : new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
