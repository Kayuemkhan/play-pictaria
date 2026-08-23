import { createFileRoute } from "@tanstack/react-router";

/**
 * Scheduled endpoint for the every-30-days Pictaria medley notification.
 * Called over HTTP by the database scheduler with the shared secret header.
 *
 * Safety rails: a single-flight lease, a hard cap on devices per run
 * (SEND_BATCH_LIMIT), a paused state that stops all work, and one probe-free
 * exit when the medley is not yet due.
 */
export const Route = createFileRoute("/api/public/push-medley")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const presented = request.headers.get("x-pictaria-cron") ?? "";
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: tokenRow } = await supabaseAdmin
          .from("push_job_state")
          .select("cron_token")
          .eq("id", "medley")
          .maybeSingle();
        const expected =
          (tokenRow?.cron_token as string | undefined) ?? process.env["PUSH_CRON_SECRET"];
        if (!expected) return Response.json({ error: "not configured" }, { status: 503 });
        if (presented.length !== expected.length || presented !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }


        const {
          readJobState,
          medleyIsDue,
          acquireLease,
          releaseLease,
          createMedley,
          dispatchMedley,
          setPaused,
        } = await import("@/lib/push.server");

        const state = await readJobState();
        if (state.paused) {
          return Response.json({ skipped: "paused", reason: state.paused_reason });
        }
        if (!medleyIsDue(state)) {
          return Response.json({ skipped: "not-due", lastMedleyAt: state.last_medley_at });
        }

        const leased = await acquireLease(10);
        if (!leased) return Response.json({ skipped: "already-running" });

        try {
          const { medley, degraded } = await createMedley();
          if (degraded) await setPaused(true, degraded);
          const result = await dispatchMedley(medley.id);
          return Response.json({
            sent: result.sent,
            failed: result.failed,
            title: medley.title,
            paused: Boolean(degraded),
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Medley run failed";
          await setPaused(true, message);
          console.error("Medley run failed", error);
          return Response.json({ error: message }, { status: 500 });
        } finally {
          await releaseLease();
        }
      },
    },
  },
});
