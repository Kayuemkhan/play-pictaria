import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().trim().email().max(255),
});

export const saveDailySubscriber = createServerFn({ method: "POST" })
  .inputValidator((input) => emailSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin
      .from("daily_subscribers")
      .insert({ email: data.email.toLowerCase(), source: "daily_card" });

    // 23505 = unique violation; the email is already on the list, which is fine.
    if (error && error.code !== "23505") {
      throw new Error(error.message);
    }

    return { success: true };
  });
