CREATE TABLE public.beta_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  tier text NOT NULL DEFAULT 'artist',
  max_uses integer NOT NULL DEFAULT 25,
  expires_at timestamptz,
  disabled boolean NOT NULL DEFAULT false,
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.beta_codes TO service_role;
ALTER TABLE public.beta_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No client access to beta codes" ON public.beta_codes AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

CREATE TABLE public.beta_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  tier text NOT NULL DEFAULT 'artist',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (email, code)
);

GRANT ALL ON public.beta_redemptions TO service_role;
ALTER TABLE public.beta_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No client access to beta redemptions" ON public.beta_redemptions AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);