import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const reportSchema = z.object({
  code: z.string().trim().regex(/^[a-z0-9]{6,16}$/),
  note: z.string().trim().max(500).default(""),
});

/** Quietly files a report against a shared Pictaria for review. */
export const reportPictaria = createServerFn({ method: "POST" })
  .inputValidator((input) => reportSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { error } = await supabaseAdmin
      .from("pictaria_reports")
      .insert({ share_code: data.code, note: data.note });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
