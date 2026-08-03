REVOKE INSERT ON public.daily_subscribers FROM anon;
REVOKE INSERT ON public.daily_subscribers FROM authenticated;

DROP POLICY IF EXISTS "Allow anonymous and authenticated signups" ON public.daily_subscribers;

GRANT SELECT ON public.daily_subscribers TO authenticated;