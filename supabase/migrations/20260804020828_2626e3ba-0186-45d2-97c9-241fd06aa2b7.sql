DROP POLICY IF EXISTS "Users can view their own subscription" ON public.daily_subscribers;
CREATE POLICY "Users can view their own subscription"
ON public.daily_subscribers
FOR SELECT
TO authenticated
USING (email = (auth.jwt() ->> 'email'));

DROP POLICY IF EXISTS "Anyone can subscribe" ON public.daily_subscribers;
CREATE POLICY "Anyone can subscribe"
ON public.daily_subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL
  AND length(email) BETWEEN 5 AND 320
  AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
);