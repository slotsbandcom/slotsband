-- =============================================================================
-- SlotsBand – Supabase Schema
-- Run this file against a fresh Supabase project to create all tables.
-- =============================================================================

-- ─── Extensions ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── CASINOS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.casinos (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                       TEXT UNIQUE NOT NULL,
  name                       TEXT NOT NULL,
  logo_url                   TEXT,
  banner_url                 TEXT,
  established_year           INT,
  rating                     NUMERIC(3,1) NOT NULL DEFAULT 0,
  trust_score                INT NOT NULL DEFAULT 0,
  is_active                  BOOLEAN NOT NULL DEFAULT true,
  is_featured                BOOLEAN NOT NULL DEFAULT false,
  is_new                     BOOLEAN NOT NULL DEFAULT false,
  rank                       INT NOT NULL DEFAULT 999,
  affiliate_url              TEXT NOT NULL DEFAULT '',
  mene_slug                  TEXT NOT NULL DEFAULT '',
  languages_supported        TEXT[] NOT NULL DEFAULT '{}',
  available_in               TEXT[] NOT NULL DEFAULT '{}',
  restricted_in              TEXT[] NOT NULL DEFAULT '{}',
  -- Licensing
  license_authority          TEXT,
  license_number             TEXT,
  license_url                TEXT,
  is_verified                BOOLEAN DEFAULT false,
  -- Bonuses
  welcome_bonus_text         TEXT,
  welcome_bonus_percent      INT,
  welcome_bonus_max_amount   INT,
  welcome_bonus_currency     TEXT DEFAULT 'EUR',
  welcome_bonus_wagering     INT,
  welcome_bonus_min_deposit  INT,
  no_deposit_bonus           BOOLEAN DEFAULT false,
  no_deposit_amount          NUMERIC,
  free_spins_amount          INT,
  free_spins_game            TEXT,
  cashback_percent           NUMERIC,
  loyalty_program            BOOLEAN DEFAULT false,
  vip_program                BOOLEAN DEFAULT false,
  -- Payments
  min_deposit                NUMERIC,
  max_withdrawal_per_day     NUMERIC,
  max_withdrawal_per_month   NUMERIC,
  withdrawal_time_min_hours  INT,
  withdrawal_time_max_hours  INT,
  payment_methods            TEXT[] NOT NULL DEFAULT '{}',
  currencies_accepted        TEXT[] NOT NULL DEFAULT '{}',
  -- Games
  game_providers             TEXT[] NOT NULL DEFAULT '{}',
  total_games_count          INT,
  slots_count                INT,
  live_casino                BOOLEAN DEFAULT false,
  sports_betting             BOOLEAN DEFAULT false,
  poker                      BOOLEAN DEFAULT false,
  jackpot_games              BOOLEAN DEFAULT false,
  game_demo_available        BOOLEAN DEFAULT false,
  -- UX / Technical
  mobile_app_ios             BOOLEAN DEFAULT false,
  mobile_app_android         BOOLEAN DEFAULT false,
  mobile_optimized           BOOLEAN DEFAULT false,
  live_chat_support          BOOLEAN DEFAULT false,
  support_email              BOOLEAN DEFAULT false,
  support_phone              BOOLEAN DEFAULT false,
  support_languages          TEXT[] NOT NULL DEFAULT '{}',
  kyc_required               BOOLEAN DEFAULT false,
  registration_steps         INT,
  is_pikakasino              BOOLEAN DEFAULT false,
  -- Localised content (fi / en / uk)
  review_fi                  TEXT,
  review_en                  TEXT,
  review_uk                  TEXT,
  pros_fi                    TEXT[],
  pros_en                    TEXT[],
  pros_uk                    TEXT[],
  cons_fi                    TEXT[],
  cons_en                    TEXT[],
  cons_uk                    TEXT[],
  faq_fi                     JSONB,
  faq_en                     JSONB,
  faq_uk                     JSONB,
  meta_title_fi              TEXT,
  meta_title_en              TEXT,
  meta_title_uk              TEXT,
  meta_description_fi        TEXT,
  meta_description_en        TEXT,
  meta_description_uk        TEXT,
  -- Media
  screenshots                TEXT[],
  video_review_url           TEXT,
  -- Badge
  badge                      TEXT,
  badge_variant              TEXT CHECK (badge_variant IN ('gold','yellow','gray')),
  -- Timestamps
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── BONUSES ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bonuses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  casino_id   UUID REFERENCES public.casinos(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  bonus_type  TEXT NOT NULL CHECK (bonus_type IN ('welcome','no_deposit','free_spins','cashback','reload')),
  amount      TEXT,
  wagering    INT,
  min_deposit NUMERIC,
  is_featured BOOLEAN DEFAULT false,
  is_active   BOOLEAN DEFAULT true,
  start_date  DATE,
  end_date    DATE,
  lang        TEXT NOT NULL DEFAULT 'fi' CHECK (lang IN ('fi','en','uk')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── GAME PROVIDERS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.game_providers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT UNIQUE NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  logo_url    TEXT,
  website_url TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── GAMES ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.games (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       TEXT UNIQUE NOT NULL,
  name       TEXT NOT NULL,
  provider   TEXT NOT NULL,
  thumbnail  TEXT,
  rtp        NUMERIC(5,2),
  volatility TEXT CHECK (volatility IN ('low','medium','high')),
  type       TEXT CHECK (type IN ('slot','live','table','jackpot','other')),
  demo_url   TEXT,
  is_active  BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── PAYMENT METHODS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT UNIQUE NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  logo_url   TEXT,
  type       TEXT CHECK (type IN ('bank','card','ewallet','crypto','other')),
  is_active  BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── LICENSES ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.licenses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT UNIQUE NOT NULL,
  authority   TEXT NOT NULL,
  country     TEXT,
  is_tax_free BOOLEAN DEFAULT false,
  website_url TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── PAGES ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT NOT NULL,
  lang             TEXT NOT NULL DEFAULT 'fi' CHECK (lang IN ('fi','en','uk')),
  title            TEXT NOT NULL,
  content          TEXT,
  meta_title       TEXT,
  meta_description TEXT,
  is_published     BOOLEAN DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(slug, lang)
);

-- ─── CATEGORIES ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           TEXT UNIQUE NOT NULL,
  name_fi        TEXT NOT NULL,
  name_en        TEXT,
  name_uk        TEXT,
  description_fi TEXT,
  description_en TEXT,
  description_uk TEXT,
  icon           TEXT,
  is_active      BOOLEAN DEFAULT true,
  sort_order     INT DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── BANNERS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.banners (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  casino_id  UUID REFERENCES public.casinos(id) ON DELETE SET NULL,
  image_url  TEXT,
  bonus_text TEXT,
  subtext    TEXT,
  bg_color   TEXT DEFAULT '#2D1783',
  text_color TEXT DEFAULT '#FFFFFF',
  btn_class  TEXT DEFAULT 'bg-[#FFD700] text-black',
  link_url   TEXT,
  is_active  BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  lang       TEXT NOT NULL DEFAULT 'fi' CHECK (lang IN ('fi','en','uk')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── NEWSLETTER SUBSCRIBERS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT UNIQUE NOT NULL,
  lang            TEXT DEFAULT 'fi' CHECK (lang IN ('fi','en','uk')),
  is_active       BOOLEAN DEFAULT true,
  source          TEXT,
  subscribed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ
);

-- ─── AFFILIATE CLICKS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  casino_id   UUID REFERENCES public.casinos(id) ON DELETE SET NULL,
  casino_slug TEXT,
  ip_hash     TEXT,
  user_agent  TEXT,
  lang        TEXT,
  referrer    TEXT,
  clicked_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── STREAM STATUS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.stream_status (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform      TEXT NOT NULL CHECK (platform IN ('kick','twitch','youtube')),
  is_live       BOOLEAN NOT NULL DEFAULT false,
  viewers       INT DEFAULT 0,
  title         TEXT,
  override_mode TEXT DEFAULT 'auto' CHECK (override_mode IN ('auto','manual')),
  expires_at    TIMESTAMPTZ,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(platform)
);

-- ─── RAFFLE SESSIONS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.raffle_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  prize       TEXT,
  prize_value NUMERIC,
  status      TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming','active','completed','cancelled')),
  starts_at   TIMESTAMPTZ,
  ends_at     TIMESTAMPTZ,
  winner_id   UUID,
  stream_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── RAFFLE ENTRIES ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.raffle_entries (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id  UUID NOT NULL REFERENCES public.raffle_sessions(id) ON DELETE CASCADE,
  username   TEXT NOT NULL,
  platform   TEXT CHECK (platform IN ('kick','twitch','youtube','discord')),
  entered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_winner  BOOLEAN DEFAULT false
);

-- ─── BONUSHUNT SESSIONS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bonushunt_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  status          TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming','active','completed')),
  start_balance   NUMERIC DEFAULT 0,
  current_balance NUMERIC DEFAULT 0,
  total_buyin     NUMERIC DEFAULT 0,
  total_won       NUMERIC DEFAULT 0,
  stream_url      TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── BONUSHUNT SLOTS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bonushunt_slots (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL REFERENCES public.bonushunt_sessions(id) ON DELETE CASCADE,
  game        TEXT NOT NULL,
  provider    TEXT NOT NULL,
  balance     NUMERIC NOT NULL DEFAULT 0,
  bet         NUMERIC NOT NULL DEFAULT 0,
  bonus_value NUMERIC NOT NULL DEFAULT 0,
  multiplier  NUMERIC,
  won_amount  NUMERIC,
  opened_at   TIMESTAMPTZ,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── BONUSHUNT PREDICTIONS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bonushunt_predictions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id           UUID NOT NULL REFERENCES public.bonushunt_sessions(id) ON DELETE CASCADE,
  username             TEXT NOT NULL,
  platform             TEXT CHECK (platform IN ('kick','twitch','youtube','discord')),
  predicted_multiplier NUMERIC,
  predicted_total      NUMERIC,
  submitted_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── updated_at trigger function ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'casinos','bonuses','games','pages','categories',
    'banners','bonushunt_sessions','raffle_sessions'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I', t);
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()',
      t
    );
  END LOOP;
END;
$$;

-- ─── Row Level Security (recommended for production) ─────────────────────────
-- Public read access for casinos, games, bonuses, pages, categories, banners
-- Admin write access requires a valid authenticated session (configure in Supabase dashboard)
--
-- ALTER TABLE public.casinos ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "public read" ON public.casinos FOR SELECT USING (true);
-- CREATE POLICY "auth write" ON public.casinos FOR ALL USING (auth.role() = 'authenticated');
-- (Repeat for each table as needed)
