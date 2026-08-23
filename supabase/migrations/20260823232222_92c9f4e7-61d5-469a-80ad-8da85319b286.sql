CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

ALTER TABLE public.push_job_state
  ADD COLUMN IF NOT EXISTS cron_token TEXT NOT NULL DEFAULT encode(extensions.gen_random_bytes(24), 'hex');

CREATE OR REPLACE FUNCTION public.trigger_push_medley()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  token TEXT;
BEGIN
  SELECT cron_token INTO token FROM public.push_job_state WHERE id = 'medley';
  IF token IS NULL THEN
    RETURN;
  END IF;

  PERFORM net.http_post(
    url := 'https://project--0ca27c72-0741-42a8-8f85-3b48dd0c8757.lovable.app/api/public/push-medley',
    headers := jsonb_build_object('content-type', 'application/json', 'x-pictaria-cron', token),
    body := '{}'::jsonb
  );
END;
$$;

REVOKE ALL ON FUNCTION public.trigger_push_medley() FROM PUBLIC;

SELECT cron.schedule(
  'pictaria-push-medley',
  '0 17 * * *',
  $$SELECT public.trigger_push_medley();$$
);