import { createServerFn } from "@tanstack/react-start";

import {
  categorySaveSchema,
  collectionSaveSchema,
  idSchema,
  imageSaveSchema,
  reorderImagesSchema,
} from "./puzzle-library-types";
import type {
  LibraryCategory,
  LibraryCollectionDetail,
  LibraryCollectionSummary,
  LibraryImage,
} from "./puzzle-library-types";

// ------------------------------------------------------------- categories

export const listCategories = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ categories: LibraryCategory[] }> => {
    const { requirePortal } = await import("./portal.server");
    await requirePortal();

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("puzzle_categories")
      .select("id, name, slug")
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return { categories: (data ?? []) as LibraryCategory[] };
  },
);

export const saveCategory = createServerFn({ method: "POST" })
  .inputValidator((input) => categorySaveSchema.parse(input))
  .handler(async ({ data }) => {
    const { requirePortal } = await import("./portal.server");
    await requirePortal();
    const { slugForCategory } = await import("./puzzle-library.server");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const slug = await slugForCategory(data.name, data.id);

    if (data.id) {
      const { error } = await supabaseAdmin
        .from("puzzle_categories")
        .update({ name: data.name, slug } as never)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }

    const { data: row, error } = await supabaseAdmin
      .from("puzzle_categories")
      .insert({ name: data.name, slug } as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .inputValidator((input) => idSchema.parse(input))
  .handler(async ({ data }) => {
    const { requirePortal } = await import("./portal.server");
    await requirePortal();

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("puzzle_categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ------------------------------------------------------------- collections

export const listLibraryCollections = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ collections: LibraryCollectionSummary[] }> => {
    const { requirePortal } = await import("./portal.server");
    await requirePortal();
    const { signLibraryPhoto } = await import("./puzzle-library.server");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [collectionsResult, categoriesResult, imagesResult] = await Promise.all([
      supabaseAdmin
        .from("puzzle_collections")
        .select("id, title, tagline, cover_path, category_id, free, hidden")
        .order("created_at", { ascending: false }),
      supabaseAdmin.from("puzzle_categories").select("id, name"),
      supabaseAdmin.from("puzzle_images").select("collection_id"),
    ]);
    if (collectionsResult.error) throw new Error(collectionsResult.error.message);
    if (categoriesResult.error) throw new Error(categoriesResult.error.message);
    if (imagesResult.error) throw new Error(imagesResult.error.message);

    const categoryNames = new Map((categoriesResult.data ?? []).map((row) => [row.id, row.name]));
    const imageCounts = new Map<string, number>();
    for (const row of imagesResult.data ?? []) {
      imageCounts.set(row.collection_id, (imageCounts.get(row.collection_id) ?? 0) + 1);
    }

    const collections = await Promise.all(
      (collectionsResult.data ?? []).map(async (row): Promise<LibraryCollectionSummary> => ({
        id: row.id,
        title: row.title,
        tagline: row.tagline,
        cover_url: await signLibraryPhoto(row.cover_path),
        category_id: row.category_id,
        category_name: row.category_id ? (categoryNames.get(row.category_id) ?? null) : null,
        free: row.free,
        hidden: row.hidden,
        image_count: imageCounts.get(row.id) ?? 0,
      })),
    );

    return { collections };
  },
);

export const getLibraryCollection = createServerFn({ method: "POST" })
  .inputValidator((input) => idSchema.parse(input))
  .handler(async ({ data }): Promise<{ collection: LibraryCollectionDetail | null }> => {
    const { requirePortal } = await import("./portal.server");
    await requirePortal();
    const { signLibraryPhoto } = await import("./puzzle-library.server");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [collectionResult, imagesResult] = await Promise.all([
      supabaseAdmin
        .from("puzzle_collections")
        .select("id, title, tagline, cover_path, category_id, free, hidden")
        .eq("id", data.id)
        .maybeSingle(),
      supabaseAdmin
        .from("puzzle_images")
        .select("id, title, caption, meaning, image_path, sort_order")
        .eq("collection_id", data.id)
        .order("sort_order", { ascending: true }),
    ]);
    if (collectionResult.error) throw new Error(collectionResult.error.message);
    if (imagesResult.error) throw new Error(imagesResult.error.message);
    if (!collectionResult.data) return { collection: null };

    const row = collectionResult.data;
    let categoryName: string | null = null;
    if (row.category_id) {
      const { data: category } = await supabaseAdmin
        .from("puzzle_categories")
        .select("name")
        .eq("id", row.category_id)
        .maybeSingle();
      categoryName = category?.name ?? null;
    }

    const images = await Promise.all(
      (imagesResult.data ?? []).map(async (image): Promise<LibraryImage> => ({
        id: image.id,
        title: image.title,
        caption: image.caption,
        meaning: image.meaning,
        image_url: await signLibraryPhoto(image.image_path),
        sort_order: image.sort_order,
      })),
    );

    return {
      collection: {
        id: row.id,
        title: row.title,
        tagline: row.tagline,
        cover_url: await signLibraryPhoto(row.cover_path),
        category_id: row.category_id,
        category_name: categoryName,
        free: row.free,
        hidden: row.hidden,
        image_count: images.length,
        images,
      },
    };
  });

export const saveLibraryCollection = createServerFn({ method: "POST" })
  .inputValidator((input) => collectionSaveSchema.parse(input))
  .handler(async ({ data }) => {
    const { requirePortal } = await import("./portal.server");
    await requirePortal();
    const { storeLibraryPhoto } = await import("./puzzle-library.server");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, cover, categoryId, ...fields } = data;

    const patch: Record<string, unknown> = {
      title: fields.title,
      tagline: fields.tagline,
      free: fields.free,
      hidden: fields.hidden,
      category_id: categoryId ?? null,
      updated_at: new Date().toISOString(),
    };
    if (cover) patch["cover_path"] = await storeLibraryPhoto(cover);

    if (id) {
      const { error } = await supabaseAdmin
        .from("puzzle_collections")
        .update(patch as never)
        .eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }

    const { data: row, error } = await supabaseAdmin
      .from("puzzle_collections")
      .insert(patch as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const deleteLibraryCollection = createServerFn({ method: "POST" })
  .inputValidator((input) => idSchema.parse(input))
  .handler(async ({ data }) => {
    const { requirePortal } = await import("./portal.server");
    await requirePortal();
    const { removeLibraryPhotos } = await import("./puzzle-library.server");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: collection }, { data: images }] = await Promise.all([
      supabaseAdmin.from("puzzle_collections").select("cover_path").eq("id", data.id).maybeSingle(),
      supabaseAdmin.from("puzzle_images").select("image_path").eq("collection_id", data.id),
    ]);

    await removeLibraryPhotos([
      collection?.cover_path ?? "",
      ...(images ?? []).map((image) => image.image_path),
    ]);

    // Images cascade-delete with the collection (FK ON DELETE CASCADE).
    const { error } = await supabaseAdmin.from("puzzle_collections").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ------------------------------------------------------------- images

export const saveLibraryImage = createServerFn({ method: "POST" })
  .inputValidator((input) => imageSaveSchema.parse(input))
  .handler(async ({ data }) => {
    const { requirePortal } = await import("./portal.server");
    await requirePortal();
    const { storeLibraryPhoto } = await import("./puzzle-library.server");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, collectionId, photo, ...fields } = data;

    if (!id && !photo) {
      throw new Error("Choose a photo for this puzzle.");
    }

    const patch: Record<string, unknown> = {
      title: fields.title,
      caption: fields.caption,
      meaning: fields.meaning,
    };
    if (photo) patch["image_path"] = await storeLibraryPhoto(photo);

    if (id) {
      const { error } = await supabaseAdmin
        .from("puzzle_images")
        .update(patch as never)
        .eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }

    const { count } = await supabaseAdmin
      .from("puzzle_images")
      .select("*", { count: "exact", head: true })
      .eq("collection_id", collectionId);

    const { data: row, error } = await supabaseAdmin
      .from("puzzle_images")
      .insert({ ...patch, collection_id: collectionId, sort_order: count ?? 0 } as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const deleteLibraryImage = createServerFn({ method: "POST" })
  .inputValidator((input) => idSchema.parse(input))
  .handler(async ({ data }) => {
    const { requirePortal } = await import("./portal.server");
    await requirePortal();
    const { removeLibraryPhotos } = await import("./puzzle-library.server");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("puzzle_images")
      .select("image_path")
      .eq("id", data.id)
      .maybeSingle();

    if (row?.image_path) await removeLibraryPhotos([row.image_path]);

    const { error } = await supabaseAdmin.from("puzzle_images").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const reorderLibraryImages = createServerFn({ method: "POST" })
  .inputValidator((input) => reorderImagesSchema.parse(input))
  .handler(async ({ data }) => {
    const { requirePortal } = await import("./portal.server");
    await requirePortal();

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await Promise.all(
      data.orderedIds.map((id, index) =>
        supabaseAdmin
          .from("puzzle_images")
          .update({ sort_order: index } as never)
          .eq("id", id)
          .eq("collection_id", data.collectionId),
      ),
    );
    return { ok: true as const };
  });
