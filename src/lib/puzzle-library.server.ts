import { decodeDataUrl } from "./portal.server";

const BUCKET = "puzzle-library";

export async function storeLibraryPhoto(dataUrl: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { contentType, bytes, ext } = decodeDataUrl(dataUrl);
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType, upsert: true });
  if (error) throw new Error(error.message);
  return path;
}

export async function signLibraryPhoto(path: string) {
  if (!path) return "";
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 12);
  return data?.signedUrl ?? "";
}

export async function removeLibraryPhotos(paths: string[]) {
  const clean = paths.filter(Boolean);
  if (!clean.length) return;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.storage.from(BUCKET).remove(clean);
}

/** Turns a category name into a stable, URL-safe slug, deduping on collision. */
export async function slugForCategory(name: string, ignoreId?: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const base =
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "category";

  let slug = base;
  for (let attempt = 1; attempt < 50; attempt += 1) {
    let query = supabaseAdmin.from("puzzle_categories").select("id").eq("slug", slug);
    if (ignoreId) query = query.neq("id", ignoreId);
    const { data } = await query.maybeSingle();
    if (!data) return slug;
    slug = `${base}-${attempt + 1}`;
  }
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}
