ALTER TABLE public.daily_subscribers ADD COLUMN daily boolean DEFAULT true;

COMMENT ON COLUMN public.daily_subscribers.daily IS 'Whether the subscriber wants a free Pictaria every day';