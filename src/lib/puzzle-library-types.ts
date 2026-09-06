import { z } from "zod";

export const idSchema = z.object({ id: z.string().uuid() });

export const categorySaveSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(80),
});

export const collectionSaveSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(160),
  tagline: z.string().trim().max(300).default(""),
  categoryId: z.string().uuid().nullable().optional(),
  free: z.boolean().default(false),
  hidden: z.boolean().default(false),
  /** Data URL for a freshly chosen cover photo. */
  cover: z.string().max(10_000_000).optional(),
});

export const imageSaveSchema = z.object({
  id: z.string().uuid().optional(),
  collectionId: z.string().uuid(),
  title: z.string().trim().max(160).default(""),
  caption: z.string().trim().max(300).default(""),
  meaning: z.string().trim().max(200).default(""),
  /** Data URL for a freshly chosen photo — required when adding a new image. */
  photo: z.string().max(10_000_000).optional(),
});

export const reorderImagesSchema = z.object({
  collectionId: z.string().uuid(),
  orderedIds: z.array(z.string().uuid()).min(1).max(1000),
});

export interface LibraryCategory {
  id: string;
  name: string;
  slug: string;
}

export interface LibraryCollectionSummary {
  id: string;
  title: string;
  tagline: string;
  cover_url: string;
  category_id: string | null;
  category_name: string | null;
  free: boolean;
  hidden: boolean;
  image_count: number;
}

export interface LibraryImage {
  id: string;
  title: string;
  caption: string;
  meaning: string;
  image_url: string;
  sort_order: number;
}

export interface LibraryCollectionDetail extends LibraryCollectionSummary {
  images: LibraryImage[];
}
