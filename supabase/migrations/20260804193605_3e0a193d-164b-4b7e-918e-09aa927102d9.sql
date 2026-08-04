CREATE TABLE public.pictarias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  share_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT '',
  tagline TEXT NOT NULL DEFAULT '',
  story TEXT NOT NULL DEFAULT '',
  grid SMALLINT NOT NULL DEFAULT 4,
  tier TEXT NOT NULL DEFAULT 'free',
  photo_paths TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.pictarias TO anon;
GRANT SELECT, INSERT ON public.pictarias TO authenticated;
GRANT ALL ON public.pictarias TO service_role;

ALTER TABLE public.pictarias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shared Pictarias are viewable by anyone with the link"
  ON public.pictarias FOR SELECT
  USING (true);

CREATE POLICY "Anyone can publish a Pictaria"
  ON public.pictarias FOR INSERT
  WITH CHECK (true);