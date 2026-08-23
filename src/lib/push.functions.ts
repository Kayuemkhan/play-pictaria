import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export interface PushMedleySummary {
  id: string;
  title: string;
  body: string;
  albums: string[];
  sent_at: string | null;
  sent_count: number;
  created_at: string;
}

/** The browser needs the public half of the signing key to subscribe. */
export const getPushKey = createServerFn({ method: "GET" }).handler(async () => {
  const { pushPublicKey } = await import("./push.server");
  return { publicKey: pushPublicKey() };
});

const subscriptionInput = z.object({
  endpoint: z.string().url(),
  p256dh: z.string().min(1),
  auth: z.string().min(1),
  userAgent: z.string().max(400).optional(),
});

/** Remembers a phone that turned notifications on. */
export const savePushSubscription = createServerFn({ method: "POST" })
  .inputValidator((data) => subscriptionInput.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("push_subscriptions").upsert(
      {
        endpoint: data.endpoint,
        p256dh: data.p256dh,
        auth: data.auth,
        user_agent: data.userAgent ?? null,
        active: true,
      },
      { onConflict: "endpoint" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Turns notifications off again for one phone. */
export const removePushSubscription = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ endpoint: z.string().url() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("push_subscriptions")
      .update({ active: false })
      .eq("endpoint", data.endpoint);
    return { ok: true };
  });

// ------------------------------------------------------------------ founder

export const getPushOverview = createServerFn({ method: "GET" }).handler(async () => {
  const { requirePortal } = await import("./portal.server");
  await requirePortal();

  const { readJobState, medleyIsDue, MEDLEY_INTERVAL_DAYS, pickAlbums } = await import(
    "./push.server"
  );
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const [{ count }, { data: medleys }, state] = await Promise.all([
    supabaseAdmin
      .from("push_subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("active", true),
    supabaseAdmin
      .from("push_medleys")
      .select("id, title, body, albums, sent_at, sent_count, created_at")
      .order("created_at", { ascending: false })
      .limit(12),
    readJobState(),
  ]);

  const nextDue = state.last_medley_at
    ? new Date(
        new Date(state.last_medley_at).getTime() +
          MEDLEY_INTERVAL_DAYS * 24 * 60 * 60 * 1000,
      ).toISOString()
    : null;

  return {
    devices: count ?? 0,
    paused: state.paused,
    pausedReason: state.paused_reason,
    lastMedleyAt: state.last_medley_at,
    nextDue,
    due: medleyIsDue(state),
    upcomingAlbums: pickAlbums(3).map((album) => album.title),
    medleys: (medleys ?? []) as PushMedleySummary[],
  };
});

/** Founder action: write a fresh medley and send it to every phone now. */
export const sendMedleyNow = createServerFn({ method: "POST" }).handler(async () => {
  const { requirePortal } = await import("./portal.server");
  await requirePortal();

  const { createMedley, dispatchMedley, readJobState } = await import("./push.server");
  const state = await readJobState();
  if (state.paused) {
    throw new Error(state.paused_reason ?? "Notifications are paused right now.");
  }

  const { medley, degraded } = await createMedley();
  const result = await dispatchMedley(medley.id);
  return { ...result, degraded };
});

/** Founder action: clear a paused notification schedule. */
export const resumeMedleySchedule = createServerFn({ method: "POST" }).handler(async () => {
  const { requirePortal } = await import("./portal.server");
  await requirePortal();
  const { setPaused } = await import("./push.server");
  await setPaused(false, null);
  return { ok: true };
});
