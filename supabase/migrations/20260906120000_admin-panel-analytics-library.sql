-- Admin panel: site-traffic analytics + a photo/category library the portal
-- can manage without a code deploy. All four tables are service-role only
-- (no public policies), matching the existing push_* / daily_subscribers style.

CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  path TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX page_views_created_at_idx ON public.page_views (created_at DESC);
CREATE INDEX page_views_visitor_id_idx ON public.page_views (visitor_id);
GRANT ALL ON public.page_views TO service_role;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.puzzle_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.puzzle_categories TO service_role;
ALTER TABLE public.puzzle_categories ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.puzzle_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  tagline TEXT NOT NULL DEFAULT '',
  cover_path TEXT NOT NULL DEFAULT '',
  category_id UUID REFERENCES public.puzzle_categories(id) ON DELETE SET NULL,
  free BOOLEAN NOT NULL DEFAULT false,
  hidden BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX puzzle_collections_category_id_idx ON public.puzzle_collections (category_id);
GRANT ALL ON public.puzzle_collections TO service_role;
ALTER TABLE public.puzzle_collections ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.puzzle_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES public.puzzle_collections(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  caption TEXT NOT NULL DEFAULT '',
  meaning TEXT NOT NULL DEFAULT '',
  image_path TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX puzzle_images_collection_id_idx ON public.puzzle_images (collection_id);
GRANT ALL ON public.puzzle_images TO service_role;
ALTER TABLE public.puzzle_images ENABLE ROW LEVEL SECURITY;

-- Storage: create a "puzzle-library" bucket the same way "pictarias" and
-- "portal" were (Supabase dashboard / Lovable Cloud — bucket creation isn't
-- done via SQL in this project). Make it a PRIVATE bucket, like "portal".
-- No storage.objects policy is needed: every read/write to it goes through
-- supabaseAdmin (service role), which bypasses RLS entirely — same as the
-- "portal" bucket, which also has no dedicated policy. Do not add a public
-- policy here; it would let any anon visitor read/write the bucket directly.
