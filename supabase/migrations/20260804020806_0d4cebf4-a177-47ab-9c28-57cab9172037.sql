-- Allow public signups
GRANT INSERT ON public.daily_subscribers TO anon, authenticated;
GRANT SELECT ON public.daily_subscribers TO authenticated;
GRANT ALL ON public.daily_subscribers TO service_role;

DROP POLICY IF EXISTS "Anyone can subscribe" ON public.daily_subscribers;
CREATE POLICY "Anyone can subscribe"
ON public.daily_subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Tighten own-row reads to verified emails only
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.daily_subscribers;
CREATE POLICY "Users can view their own subscription"
ON public.daily_subscribers
FOR SELECT
TO authenticated
USING (
  email = (auth.jwt() ->> 'email')
  AND (auth.jwt() -> 'user_metadata' ->> 'email_verified')::boolean IS TRUE
);