import { createServerFn } from "@tanstack/react-start";

import {
  portalAudioSchema,
  portalIdSchema,
  portalSaveSchema,
  portalUnlockSchema,
} from "./portal-types";

export const unlockPortal = createServerFn({ method: "POST" })
  .inputValidator((input) => portalUnlockSchema.parse(input))
  .handler(async ({ data }) => {
    const { unlockPortalSession } = await import("./portal.server");
    return { ok: await unlockPortalSession(data.passcode) };
  });

export const lockPortal = createServerFn({ method: "POST" }).handler(async () => {
  const { lockPortalSession } = await import("./portal.server");
  await lockPortalSession();
  return { ok: true };
});

export const listPortalBusinesses = createServerFn({ method: "POST" }).handler(
  async () => {
    const { isPortalUnlocked, toRecord } = await import("./portal.server");
    if (!(await isPortalUnlocked())) return { locked: true as const };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("portal_businesses")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);

    const records = await Promise.all((data ?? []).map((row) => toRecord(row as never)));
    return { locked: false as const, records };
  },
);

export const getPortalBusiness = createServerFn({ method: "POST" })
  .inputValidator((input) => portalIdSchema.parse(input))
  .handler(async ({ data }) => {
    const { isPortalUnlocked, toRecord } = await import("./portal.server");
    if (!(await isPortalUnlocked())) return { locked: true as const };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("portal_businesses")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return { locked: false as const, record: null };

    return { locked: false as const, record: await toRecord(row as never) };
  });

export const savePortalBusiness = createServerFn({ method: "POST" })
  .inputValidator((input) => portalSaveSchema.parse(input))
  .handler(async ({ data }) => {
    const { requirePortal, storePortalPhoto } = await import("./portal.server");
    await requirePortal();

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, photo, ...fields } = data;

    const patch = { ...fields } as Record<string, string> & { photo_path?: string };
    if (photo) patch.photo_path = await storePortalPhoto(photo);

    if (id) {
      const { error } = await supabaseAdmin
        .from("portal_businesses")
        .update(patch as never)
        .eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }

    const { data: row, error } = await supabaseAdmin
      .from("portal_businesses")
      .insert(patch as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const deletePortalBusiness = createServerFn({ method: "POST" })
  .inputValidator((input) => portalIdSchema.parse(input))
  .handler(async ({ data }) => {
    const { requirePortal } = await import("./portal.server");
    await requirePortal();

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("portal_businesses")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const organisePortalNote = createServerFn({ method: "POST" })
  .inputValidator((input) => portalAudioSchema.parse(input))
  .handler(async ({ data }) => {
    const { requirePortal, transcribeNote, organiseNote } = await import(
      "./portal.server"
    );
    await requirePortal();

    const transcript = await transcribeNote(data.audio);
    if (!transcript) {
      throw new Error("Nothing was heard in that recording — please try again.");
    }
    const fields = await organiseNote(transcript);
    return { transcript, fields };
  });
