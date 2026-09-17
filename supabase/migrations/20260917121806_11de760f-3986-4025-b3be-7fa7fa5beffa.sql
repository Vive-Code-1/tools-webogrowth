CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  path TEXT NOT NULL,
  referrer_source TEXT NOT NULL DEFAULT 'direct',
  referrer_host TEXT,
  device TEXT NOT NULL DEFAULT 'desktop',
  dwell_ms INTEGER NOT NULL DEFAULT 0,
  is_bounce BOOLEAN NOT NULL DEFAULT false,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX page_views_created_at_idx ON public.page_views (created_at DESC);
CREATE INDEX page_views_path_idx ON public.page_views (path);

GRANT INSERT ON public.page_views TO anon;
GRANT INSERT ON public.page_views TO authenticated;
GRANT ALL ON public.page_views TO service_role;

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record a page view"
  ON public.page_views FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(path) <= 512
    AND length(coalesce(referrer_source, '')) <= 64
    AND length(coalesce(referrer_host, '')) <= 255
    AND length(coalesce(device, '')) <= 32
    AND length(coalesce(session_id, '')) <= 64
    AND dwell_ms >= 0
    AND dwell_ms <= 7200000
  );

CREATE TABLE public.url_index_status (
  url TEXT NOT NULL PRIMARY KEY,
  verdict TEXT,
  coverage_state TEXT,
  robots_state TEXT,
  google_canonical TEXT,
  user_canonical TEXT,
  last_crawl_time TIMESTAMP WITH TIME ZONE,
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX url_index_status_checked_at_idx ON public.url_index_status (checked_at DESC);

GRANT ALL ON public.url_index_status TO service_role;

ALTER TABLE public.url_index_status ENABLE ROW LEVEL SECURITY;