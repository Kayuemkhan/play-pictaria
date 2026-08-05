CREATE TABLE public.pictaria_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  share_code TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT ALL ON public.pictaria_reports TO service_role;
ALTER TABLE public.pictaria_reports ENABLE ROW LEVEL SECURITY;