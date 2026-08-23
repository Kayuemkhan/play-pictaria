REVOKE ALL ON FUNCTION public.trigger_push_medley() FROM anon, authenticated;
ALTER FUNCTION public.trigger_push_medley() OWNER TO postgres;