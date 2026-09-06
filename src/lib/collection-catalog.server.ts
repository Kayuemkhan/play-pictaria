import type { Collection, Puzzle } from "@/data/collections";

interface CollectionRow {
  id: string;
  title: string;
  tagline: string;
  cover_path: string;
  free: boolean;
  hidden: boolean;
}

interface ImageRow {
  id: string;
  collection_id: string;
  title: string;
  caption: string;
  meaning: string;
  image_path: string;
  sort_order: number;
}

async function shapeCollection(row: CollectionRow, images: ImageRow[]): Promise<Collection> {
  const { signLibraryPhoto } = await import("./puzzle-library.server");
  const ordered = [...images].sort((a, b) => a.sort_order - b.sort_order);
  const puzzles: Puzzle[] = await Promise.all(
    ordered.map(async (image): Promise<Puzzle> => {
      const signedImage = await signLibraryPhoto(image.image_path);
      return {
        id: image.id,
        title: image.title || row.title,
        caption: image.caption,
        image: signedImage,
        ...(image.meaning ? { meaning: image.meaning } : {}),
      };
    }),
  );
  const cover = row.cover_path ? await signLibraryPhoto(row.cover_path) : (puzzles[0]?.image ?? "");
  return {
    id: row.id,
    title: row.title,
    tagline: row.tagline,
    cover,
    free: row.free,
    hidden: row.hidden,
    puzzles,
  };
}

/**
 * Admin-added collections that have at least one image — the same shape as
 * the static `Collection`/`Puzzle` types in src/data/collections.ts, so the
 * public browsing/playing pages can merge them in without special-casing.
 * Collections with zero images yet are left out (nothing to play).
 */
export async function fetchLibraryCollections(): Promise<Collection[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [collectionsResult, imagesResult] = await Promise.all([
    supabaseAdmin
      .from("puzzle_collections")
      .select("id, title, tagline, cover_path, free, hidden, created_at")
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("puzzle_images")
      .select("id, collection_id, title, caption, meaning, image_path, sort_order"),
  ]);
  if (collectionsResult.error) throw new Error(collectionsResult.error.message);
  if (imagesResult.error) throw new Error(imagesResult.error.message);

  const imagesByCollection = new Map<string, ImageRow[]>();
  for (const image of (imagesResult.data ?? []) as ImageRow[]) {
    const list = imagesByCollection.get(image.collection_id) ?? [];
    list.push(image);
    imagesByCollection.set(image.collection_id, list);
  }

  const rows = (collectionsResult.data ?? []) as CollectionRow[];
  const withImages = rows.filter((row) => (imagesByCollection.get(row.id) ?? []).length > 0);
  return Promise.all(
    withImages.map((row) => shapeCollection(row, imagesByCollection.get(row.id) ?? [])),
  );
}

/** A single admin-added puzzle, by its image id — used as a fallback when a puzzle isn't in the static catalog. */
export async function fetchLibraryPuzzle(
  puzzleId: string,
): Promise<{ puzzle: Puzzle; collection: Collection } | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: image, error: imageError } = await supabaseAdmin
    .from("puzzle_images")
    .select("id, collection_id, title, caption, meaning, image_path, sort_order")
    .eq("id", puzzleId)
    .maybeSingle();
  if (imageError) throw new Error(imageError.message);
  if (!image) return null;

  const { data: collectionRow, error: collectionError } = await supabaseAdmin
    .from("puzzle_collections")
    .select("id, title, tagline, cover_path, free, hidden")
    .eq("id", image.collection_id)
    .maybeSingle();
  if (collectionError) throw new Error(collectionError.message);
  if (!collectionRow) return null;

  const { data: siblings, error: siblingsError } = await supabaseAdmin
    .from("puzzle_images")
    .select("id, collection_id, title, caption, meaning, image_path, sort_order")
    .eq("collection_id", image.collection_id);
  if (siblingsError) throw new Error(siblingsError.message);

  const collection = await shapeCollection(
    collectionRow as CollectionRow,
    (siblings ?? []) as ImageRow[],
  );
  const puzzle = collection.puzzles.find((p) => p.id === puzzleId);
  if (!puzzle) return null;
  return { puzzle, collection };
}
