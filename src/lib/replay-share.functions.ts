import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const nameSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-zA-Z0-9._-]+$/, "Invalid file name");

/**
 * iOS Safari refuses to write `blob:` downloads to Files or Photos, so the clip
 * is parked in storage and handed back as a real https download link. The video
 * bytes go straight from the phone to storage through a signed upload URL —
 * routing multi-megabyte base64 through a server function was far too slow.
 */
export const createReplayUpload = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ name: nameSchema }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const path = `${crypto.randomUUID()}-${data.name}`;

    const { data: upload, error } = await supabaseAdmin.storage
      .from("replays")
      .createSignedUploadUrl(path);
    if (error || !upload?.token) {
      throw new Error(error?.message ?? "That upload couldn't be started.");
    }

    return { path, token: upload.token };
  });

/** Signed download link, created once the clip is actually in storage. */
export const signReplayDownload = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({ path: z.string().min(1).max(200), name: nameSchema }).parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: signed, error } = await supabaseAdmin.storage
      .from("replays")
      .createSignedUrl(data.path, 60 * 60 * 24 * 7, { download: data.name });
    if (error || !signed?.signedUrl) {
      throw new Error(error?.message ?? "That link couldn't be created.");
    }
    return { downloadUrl: signed.signedUrl };
  });
