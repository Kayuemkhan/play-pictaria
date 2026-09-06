CREATE TABLE public.page_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  path text NOT NULL,
  referrer text,
  visitor_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.page_views TO service_role;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "page_views_no_client_access" ON public.page_views FOR ALL TO authenticated, anon USING (false) WITH CHECK (false);
CREATE INDEX page_views_created_at_idx ON public.page_views (created_at DESC);

CREATE TABLE public.puzzle_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.puzzle_categories TO service_role;
ALTER TABLE public.puzzle_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "puzzle_categories_no_client_access" ON public.puzzle_categories FOR ALL TO authenticated, anon USING (false) WITH CHECK (false);

CREATE TABLE public.puzzle_collections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL DEFAULT '',
  tagline text NOT NULL DEFAULT '',
  cover_path text NOT NULL DEFAULT '',
  category_id uuid REFERENCES public.puzzle_categories(id) ON DELETE SET NULL,
  free boolean NOT NULL DEFAULT true,
  hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.puzzle_collections TO service_role;
ALTER TABLE public.puzzle_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "puzzle_collections_no_client_access" ON public.puzzle_collections FOR ALL TO authenticated, anon USING (false) WITH CHECK (false);

CREATE TABLE public.puzzle_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id uuid NOT NULL REFERENCES public.puzzle_collections(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  caption text NOT NULL DEFAULT '',
  meaning text NOT NULL DEFAULT '',
  image_path text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.puzzle_images TO service_role;
ALTER TABLE public.puzzle_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "puzzle_images_no_client_access" ON public.puzzle_images FOR ALL TO authenticated, anon USING (false) WITH CHECK (false);
CREATE INDEX puzzle_images_collection_idx ON public.puzzle_images (collection_id, sort_order);