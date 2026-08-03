CREATE TABLE public.daily_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  source text DEFAULT 'daily_card'
);

GRANT SELECT, INSERT ON public.daily_subscribers TO anon;
GRANT SELECT, INSERT ON public.daily_subscribers TO authenticated;
GRANT ALL ON public.daily_subscribers TO service_role;

ALTER TABLE public.daily_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous and authenticated signups"
ON public.daily_subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Users can view their own subscription"
ON public.daily_subscribers
FOR SELECT
TO authenticated
USING (email = (auth.jwt() ->> 'email'));