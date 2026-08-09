import { createServerFn } from "@tanstack/react-start";

export interface SubscriberRow {
  email: string;
  source: string | null;
  created_at: string;
}

/** Founder action: every email address on the Pictaria list, newest first. */
export const listSubscribers = createServerFn({ method: "GET" }).handler(
  async () => {
    const { requirePortal } = await import("./portal.server");
    await requirePortal();

    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const { data, error } = await supabaseAdmin
      .from("daily_subscribers")
      .select("email, source, created_at")
      .order("created_at", { ascending: false })
      .limit(5000);
    if (error) throw new Error(error.message);

    return { rows: (data ?? []) as SubscriberRow[] };
  },
);
