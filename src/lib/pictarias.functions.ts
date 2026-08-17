import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Roughly 6 MB of base64 per photograph — plenty for a phone picture. */
const MAX_PHOTO_CHARS = 8_000_000;

const publishSchema = z.object({
  title: z.string().trim().max(120).default(""),
  tagline: z.string().trim().max(200).default(""),
  story: z.string().trim().max(2000).default(""),
  grid: z.number().int().min(3).max(6).default(4),
  tier: z.enum(["free", "personal", "artist", "brand"]).default("free"),
  photos: z
    .array(z.string().max(MAX_PHOTO_CHARS))
    .min(1)
    .max(10),
  /** Indexes (into `photos`) the sender offered to share with the community. */
  shareIndexes: z.array(z.number().int().min(0).max(9)).default([]),
});

const codeSchema = z.object({
  code: z.string().trim().regex(/^[a-z0-9]{6,16}$/),
});

/** Short, readable share code — no ambiguous characters. */
function makeCode() {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 10; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

function decodeDataUrl(dataUrl: string) {
  const match = /^data:(image\/(?:jpeg|jpg|png|webp));base64,(.+)$/i.exec(
    dataUrl,
  );
  if (!match) throw new Error("Only JPEG, PNG or WebP pictures can be shared.");
  const contentType = match[1]!;
  const bytes = Uint8Array.from(atob(match[2]!), (c) => c.charCodeAt(0));
  const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
  return { contentType, bytes, ext };
}

export const publishPictaria = createServerFn({ method: "POST" })
  .inputValidator((input) => publishSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const { reviewPicture } = await import("./moderation.server");

    // Every picture passes a gentle safety review before it can be shared.
    for (const photo of data.photos) {
      const review = await reviewPicture(photo);
      if (!review.allowed) {
        throw new Error(
          review.reason ||
            "This picture doesn't suit Pictaria — please choose another.",
        );
      }
    }

    const code = makeCode();
    const paths: string[] = [];

    for (let i = 0; i < data.photos.length; i += 1) {
      const { contentType, bytes, ext } = decodeDataUrl(data.photos[i]!);
      const path = `${code}/${i}.${ext}`;
      const { error } = await supabaseAdmin.storage
        .from("pictarias")
        .upload(path, bytes, { contentType, upsert: true });
      if (error) throw new Error(error.message);
      paths.push(path);
    }

    const { error } = await supabaseAdmin.from("pictarias").insert({
      share_code: code,
      title: data.title,
      tagline: data.tagline,
      story: data.story,
      grid: data.grid,
      tier: data.tier,
      photo_paths: paths,
    });
    if (error) throw new Error(error.message);

    // Offered to the community? It waits for Amy's authorization first.
    const offered = data.shareIndexes
      .filter((i) => i < paths.length)
      .map((i) => ({
        share_code: code,
        photo_path: paths[i]!,
        title: data.title,
        tagline: data.tagline,
        story: data.story,
        tier: data.tier,
        status: "pending",
      }));
    if (offered.length) {
      const { error: offerError } = await supabaseAdmin
        .from("community_submissions")
        .insert(offered);
      if (offerError) throw new Error(offerError.message);
    }

    return { code };
  });

export const getSharedPictaria = createServerFn({ method: "POST" })
  .inputValidator((input) => codeSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const { data: row, error } = await supabaseAdmin
      .from("pictarias")
      .select("share_code, title, tagline, story, grid, tier, photo_paths")
      .eq("share_code", data.code)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;

    const urls: string[] = [];
    for (const path of row.photo_paths) {
      const { data: signed } = await supabaseAdmin.storage
        .from("pictarias")
        .createSignedUrl(path, 60 * 60 * 24 * 7);
      if (signed?.signedUrl) urls.push(signed.signedUrl);
    }

    return {
      title: row.title,
      tagline: row.tagline,
      story: row.story,
      grid: row.grid,
      tier: row.tier ?? "free",
      photos: urls,
    };
  });
