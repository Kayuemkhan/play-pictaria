import { createServerFn } from "@tanstack/react-start";

import {
  portalAudioSchema,
  portalIdSchema,
  portalSaveSchema,
  portalShareSchema,
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
    const { isPortalUnlocked, toRecord, withClockSkewRetry } = await import(
      "./portal.server"
    );
    if (!(await isPortalUnlocked())) return { locked: true as const };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await withClockSkewRetry(async () =>
      supabaseAdmin
        .from("portal_businesses")
        .select("*")
        .order("updated_at", { ascending: false }),
    );
    if (error) throw new Error(error.message);

    const records = await Promise.all((data ?? []).map((row) => toRecord(row as never)));
    return { locked: false as const, records };
  },
);

export const getPortalBusiness = createServerFn({ method: "POST" })
  .inputValidator((input) => portalIdSchema.parse(input))
  .handler(async ({ data }) => {
    const { isPortalUnlocked, toRecord, withClockSkewRetry } = await import(
      "./portal.server"
    );
    if (!(await isPortalUnlocked())) return { locked: true as const };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await withClockSkewRetry(async () =>
      supabaseAdmin
        .from("portal_businesses")
        .select("*")
        .eq("id", data.id)
        .maybeSingle(),
    );
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

/**
 * Creates (or updates) the public Pictaria share link for a business photo so
 * it can be sent to the customer and posted on social media right away.
 * Any wording passed in from the preview screen wins over the stored notes.
 */
export const createPortalShareLink = createServerFn({ method: "POST" })
  .inputValidator((input) => portalShareSchema.parse(input))
  .handler(async ({ data }) => {
    const { requirePortal } = await import("./portal.server");
    await requirePortal();

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error } = await supabaseAdmin
      .from("portal_businesses")
      .select("id, share_code, photo_path, company_name, product_service, story_ideas")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("That business record no longer exists.");

    const business = row as {
      company_name?: string | null;
      product_service?: string | null;
      story_ideas?: string | null;
    };

    const content = {
      title: data.title || business.company_name || "A Pictaria for you",
      tagline: data.tagline ?? business.product_service ?? "",
      story: data.story ?? business.story_ideas ?? "",
      grid: data.grid ?? 4,
    };

    const existing = (row as { share_code?: string | null }).share_code;
    if (existing) {
      const { error: patchError } = await supabaseAdmin
        .from("pictarias")
        .update(content as never)
        .eq("share_code", existing);
      if (patchError) throw new Error(patchError.message);
      return { code: existing };
    }

    const photoPath = (row as { photo_path?: string | null }).photo_path ?? "";
    if (!photoPath) {
      throw new Error("Add the community photograph first, then create the link.");
    }

    const { data: file, error: downloadError } = await supabaseAdmin.storage
      .from("portal")
      .download(photoPath);
    if (downloadError || !file) {
      throw new Error(downloadError?.message ?? "That photograph couldn't be read.");
    }

    const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
    let code = "";
    for (let i = 0; i < 10; i += 1) {
      code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    const ext = photoPath.split(".").pop()?.toLowerCase() ?? "jpg";
    const contentType =
      ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
    const bytes = new Uint8Array(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from("pictarias")
      .upload(`${code}/0.${ext}`, bytes, { contentType, upsert: true });
    if (uploadError) throw new Error(uploadError.message);

    const { error: insertError } = await supabaseAdmin.from("pictarias").insert({
      share_code: code,
      title: content.title,
      tagline: content.tagline,
      story: content.story,
      grid: content.grid,
      tier: "brand",
      photo_paths: [`${code}/0.${ext}`],
    });
    if (insertError) throw new Error(insertError.message);

    const { error: saveError } = await supabaseAdmin
      .from("portal_businesses")
      .update({ share_code: code } as never)
      .eq("id", data.id);
    if (saveError) throw new Error(saveError.message);

    return { code };
  });
