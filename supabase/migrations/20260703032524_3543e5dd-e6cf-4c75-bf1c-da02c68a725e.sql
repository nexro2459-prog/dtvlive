
CREATE TABLE public.channel_stream_overrides (
  channel_id text PRIMARY KEY,
  streams jsonb NOT NULL DEFAULT '[]'::jsonb,
  type text NOT NULL DEFAULT 'hls',
  embed_url text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.channel_stream_overrides TO anon, authenticated;
GRANT ALL ON public.channel_stream_overrides TO service_role;

ALTER TABLE public.channel_stream_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "channel_overrides public read"
  ON public.channel_stream_overrides FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE TRIGGER channel_stream_overrides_touch
  BEFORE UPDATE ON public.channel_stream_overrides
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
