import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * iOS Safari refuses to write `blob:` downloads to Files or Photos, so the clip
 * is parked in storage and handed back as a real https download link. The video
 * bytes go straight from the phone to storage through a signed upload URL —
 * routing multi-megabyte base64 through a server function was far too slow.
 */
export const createReplayUpload = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        name: z
          .string()
          .min(1)
          .max(80)
          .regex(/^[a-zA-Z0-9._-]+$/, "Invalid file name"),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const path = `${crypto.randomUUID()}-${data.name}`;

    const { data: upload, error: uploadError } = await supabaseAdmin.storage
      .from("replays")
      .createSignedUploadUrl(path);
    if (uploadError || !upload?.token) {
      throw new Error(uploadError?.message ?? "That upload couldn't be started.");
    }

    const { data: signed, error: signError } = await supabaseAdmin.storage
      .from("replays")
      .createSignedUrl(path, 60 * 60 * 24 * 7, { download: data.name });
    if (signError || !signed?.signedUrl) {
      throw new Error(signError?.message ?? "That link couldn't be created.");
    }

    return {
      path,
      token: upload.token,
      downloadUrl: signed.signedUrl,
    };
  });
