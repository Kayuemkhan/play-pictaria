import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * The retention + cancellation flow behind /account.
 *
 * Pictaria does not have a live payment provider connected yet, so nothing here
 * charges, extends or ends a real billing subscription. Every choice a member
 * makes is written to `subscription_requests` so the founder can act on it from
 * the portal — and the UI never claims a payment change that didn't happen.
 */

export type SubscriptionRequestKind = "free_month" | "cancel";

export interface SubscriptionRequestRow {
  id: string;
  email: string;
  plan: string | null;
  kind: SubscriptionRequestKind;
  reason: string | null;
  status: string;
  created_at: string;
}

const inputSchema = z.object({
  email: z.string().trim().email().max(200),
  plan: z.string().trim().max(60).optional(),
  kind: z.enum(["free_month", "cancel"]),
  reason: z.string().trim().max(500).optional(),
});

/** Records either an accepted free month or a finalized cancellation request. */
export const submitSubscriptionRequest = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const { error } = await supabaseAdmin.from("subscription_requests").insert({
      email: data.email.toLowerCase(),
      plan: data.plan ?? null,
      kind: data.kind,
      reason: data.reason ?? null,
    });
    if (error) throw new Error(error.message);

    return { received: true as const, kind: data.kind };
  });

/** Founder view: every free month accepted and every cancellation, newest first. */
export const listSubscriptionRequests = createServerFn({ method: "GET" }).handler(
  async () => {
    const { requirePortal } = await import("./portal.server");
    await requirePortal();

    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const { data, error } = await supabaseAdmin
      .from("subscription_requests")
      .select("id, email, plan, kind, reason, status, created_at")
      .order("created_at", { ascending: false })
      .limit(2000);
    if (error) throw new Error(error.message);

    return { rows: (data ?? []) as SubscriptionRequestRow[] };
  },
);

/** Founder action: mark a request as handled (free month granted, or cancelled). */
export const markSubscriptionRequestDone = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ id: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data }) => {
    const { requirePortal } = await import("./portal.server");
    await requirePortal();

    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const { error } = await supabaseAdmin
      .from("subscription_requests")
      .update({ status: "handled" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    return { ok: true as const };
  });
