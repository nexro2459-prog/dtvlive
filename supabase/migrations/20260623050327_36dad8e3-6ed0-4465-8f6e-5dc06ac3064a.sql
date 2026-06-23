
-- =========================================================
-- site_profile: public-readable singleton
-- =========================================================
CREATE TABLE public.site_profile (
  id            INTEGER PRIMARY KEY DEFAULT 1,
  display_name  TEXT    NOT NULL DEFAULT 'Abu Talib Fahim',
  tagline       TEXT    NOT NULL DEFAULT 'Owner of Dtv',
  bio           TEXT    NOT NULL DEFAULT 'Building a better way to watch live TV. Thank you for being with us.',
  avatar_url    TEXT,
  badges        TEXT[]  NOT NULL DEFAULT ARRAY['Verified']::text[],
  social_links  JSONB   NOT NULL DEFAULT '{}'::jsonb,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT site_profile_singleton CHECK (id = 1)
);

GRANT SELECT ON public.site_profile TO anon, authenticated;
GRANT ALL    ON public.site_profile TO service_role;

ALTER TABLE public.site_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_profile public read"
  ON public.site_profile FOR SELECT
  TO anon, authenticated
  USING (true);

-- Seed singleton row
INSERT INTO public.site_profile (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- =========================================================
-- admin_credentials: hashed password + server-only session token
-- =========================================================
CREATE TABLE public.admin_credentials (
  id              INTEGER PRIMARY KEY DEFAULT 1,
  password_hash   TEXT,                       -- sha256(salt || password), hex
  password_salt   TEXT,                       -- hex
  session_token   TEXT,                       -- sha256 hex of plaintext token
  session_expires TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT admin_credentials_singleton CHECK (id = 1)
);

-- No anon or authenticated grants — only service_role (server) may read/write.
GRANT ALL ON public.admin_credentials TO service_role;
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;
-- No policies = locked to clients. Server uses service role.

INSERT INTO public.admin_credentials (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- =========================================================
-- admin_login_attempts: rate-limit window
-- =========================================================
CREATE TABLE public.admin_login_attempts (
  id           BIGSERIAL PRIMARY KEY,
  ip           TEXT NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  success      BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX admin_login_attempts_ip_time_idx
  ON public.admin_login_attempts (ip, attempted_at DESC);

GRANT ALL ON public.admin_login_attempts TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.admin_login_attempts_id_seq TO service_role;
ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;
-- No policies = server-only.

-- =========================================================
-- updated_at trigger for site_profile
-- =========================================================
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER site_profile_touch
  BEFORE UPDATE ON public.site_profile
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER admin_credentials_touch
  BEFORE UPDATE ON public.admin_credentials
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
