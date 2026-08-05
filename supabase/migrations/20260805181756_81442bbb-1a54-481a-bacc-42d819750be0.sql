DROP POLICY IF EXISTS "Anyone can publish a Pictaria" ON public.pictarias;
DROP POLICY IF EXISTS "Shared Pictarias are viewable by anyone with the link" ON public.pictarias;
REVOKE ALL ON public.pictarias FROM anon, authenticated;
GRANT ALL ON public.pictarias TO service_role;

REVOKE ALL ON public.pictaria_reports FROM anon, authenticated;
GRANT ALL ON public.pictaria_reports TO service_role;

DROP POLICY IF EXISTS "Anyone can upload Pictaria photos" ON storage.objects;