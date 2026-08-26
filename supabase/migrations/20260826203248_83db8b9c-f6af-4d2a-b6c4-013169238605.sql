ALTER TABLE public.community_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pictaria_reports ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.community_submissions FROM anon, authenticated;
REVOKE ALL ON public.pictaria_reports FROM anon, authenticated;
GRANT ALL ON public.community_submissions TO service_role;
GRANT ALL ON public.pictaria_reports TO service_role;

DROP POLICY IF EXISTS "No client access to community submissions" ON public.community_submissions;
CREATE POLICY "No client access to community submissions"
  ON public.community_submissions
  AS RESTRICTIVE
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "No client access to pictaria reports" ON public.pictaria_reports;
CREATE POLICY "No client access to pictaria reports"
  ON public.pictaria_reports
  AS RESTRICTIVE
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);