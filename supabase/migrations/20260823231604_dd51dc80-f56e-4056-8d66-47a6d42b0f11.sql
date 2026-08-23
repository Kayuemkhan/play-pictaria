CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.push_subscriptions TO service_role;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.push_medleys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  albums TEXT[] NOT NULL DEFAULT '{}',
  url TEXT NOT NULL DEFAULT '/',
  sent_at TIMESTAMPTZ,
  sent_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.push_medleys TO service_role;
ALTER TABLE public.push_medleys ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.push_job_state (
  id TEXT NOT NULL PRIMARY KEY,
  lease_until TIMESTAMPTZ,
  paused BOOLEAN NOT NULL DEFAULT false,
  paused_reason TEXT,
  last_run_at TIMESTAMPTZ,
  last_medley_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.push_job_state TO service_role;
ALTER TABLE public.push_job_state ENABLE ROW LEVEL SECURITY;

INSERT INTO public.push_job_state (id) VALUES ('medley') ON CONFLICT DO NOTHING;