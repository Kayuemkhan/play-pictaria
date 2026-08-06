CREATE TABLE public.portal_businesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_path TEXT NOT NULL DEFAULT '',
  company_name TEXT NOT NULL DEFAULT '',
  contact_person TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  website TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Other',
  product_service TEXT NOT NULL DEFAULT '',
  marketing_ideas TEXT NOT NULL DEFAULT '',
  story_ideas TEXT NOT NULL DEFAULT '',
  follow_up TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  transcript TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'New',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT ALL ON public.portal_businesses TO service_role;

ALTER TABLE public.portal_businesses ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.portal_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER portal_businesses_updated_at
BEFORE UPDATE ON public.portal_businesses
FOR EACH ROW EXECUTE FUNCTION public.portal_touch_updated_at();

CREATE INDEX portal_businesses_created_at_idx ON public.portal_businesses (created_at DESC);