import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * iOS Safari refuses to write `blob:` downloads to Files/Photos, so the clip is
 * parked in storage and handed back as a real https link. Safari's download
 * manager saves that link properly, and the video page offers "Save to Photos".
 */
export const uploadReplayClip = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        base64: z.string().min(1),
        name: z
          .string()
          .min(1)
          .max(80)
          .regex(/^[a-zA-Z0-9._-]+$/, "Invalid file name"),
        type: z.enum(["video/mp4", "video/webm"]),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const bytes = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));
    if (bytes.byteLength > 40 * 1024 * 1024) {
      throw new Error("That clip is too large to share.");
    }

    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const path = `${crypto.randomUUID()}-${data.name}`;
    const { error } = await supabaseAdmin.storage
      .from("replays")
      .upload(path, bytes, { contentType: data.type, upsert: true });
    if (error) throw new Error(error.message);

    const { data: signed, error: signError } = await supabaseAdmin.storage
      .from("replays")
      .createSignedUrl(path, 60 * 60 * 24 * 7, { download: data.name });
    if (signError || !signed?.signedUrl) {
      throw new Error(signError?.message ?? "That link couldn't be created.");
    }

    const { data: viewSigned } = await supabaseAdmin.storage
      .from("replays")
      .createSignedUrl(path, 60 * 60 * 24 * 7);

    return {
      downloadUrl: signed.signedUrl,
      viewUrl: viewSigned?.signedUrl ?? signed.signedUrl,
    };
  });
