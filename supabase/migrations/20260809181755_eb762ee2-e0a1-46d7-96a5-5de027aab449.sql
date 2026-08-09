-- portal_businesses holds sensitive lead data and is only ever accessed by
-- trusted server code using the service role. Make the denial explicit.

REVOKE ALL ON public.portal_businesses FROM anon;
REVOKE ALL ON public.portal_businesses FROM authenticated;
GRANT ALL ON public.portal_businesses TO service_role;

ALTER TABLE public.portal_businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_businesses FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "No client access to portal businesses" ON public.portal_businesses;
CREATE POLICY "No client access to portal businesses"
ON public.portal_businesses
AS RESTRICTIVE
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);