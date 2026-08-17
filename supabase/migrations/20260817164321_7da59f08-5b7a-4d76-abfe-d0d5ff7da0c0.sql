CREATE TABLE public.community_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  share_code text NOT NULL,
  photo_path text NOT NULL,
  title text NOT NULL DEFAULT '',
  tagline text NOT NULL DEFAULT '',
  story text NOT NULL DEFAULT '',
  tier text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'pending',
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT community_submissions_status_check CHECK (status IN ('pending','approved','declined')),
  CONSTRAINT community_submissions_unique UNIQUE (share_code, photo_path)
);

GRANT ALL ON public.community_submissions TO service_role;

ALTER TABLE public.community_submissions ENABLE ROW LEVEL SECURITY;

CREATE INDEX community_submissions_status_idx ON public.community_submissions (status, created_at DESC);