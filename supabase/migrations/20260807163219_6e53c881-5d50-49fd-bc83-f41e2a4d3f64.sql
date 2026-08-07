CREATE TABLE public.daily_picks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  puzzle_id text NOT NULL,
  picked_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX daily_picks_picked_at_idx ON public.daily_picks (picked_at DESC);

GRANT SELECT ON public.daily_picks TO anon;
GRANT SELECT ON public.daily_picks TO authenticated;
GRANT ALL ON public.daily_picks TO service_role;

ALTER TABLE public.daily_picks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can see which puzzle is featured"
ON public.daily_picks
FOR SELECT
TO anon, authenticated
USING (true);