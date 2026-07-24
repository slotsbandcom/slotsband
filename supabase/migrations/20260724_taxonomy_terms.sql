-- Migration: taxonomy_terms + casino_taxonomy_terms
-- Created: 2026-07-24
-- Run this in Supabase Dashboard → SQL Editor

-- ─── 1. taxonomy_terms ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.taxonomy_terms (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  taxonomy       TEXT NOT NULL,
  slug           TEXT NOT NULL,
  name_fi        TEXT NOT NULL,
  name_en        TEXT,
  name_uk        TEXT,
  description_fi TEXT,
  description_en TEXT,
  description_uk TEXT,
  icon           TEXT,
  image_url      TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  sort_order     INT NOT NULL DEFAULT 0,
  wp_term_id     INT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT taxonomy_terms_taxonomy_slug_key UNIQUE (taxonomy, slug)
);

-- Index for fast filtering by taxonomy
CREATE INDEX IF NOT EXISTS idx_taxonomy_terms_taxonomy ON public.taxonomy_terms (taxonomy);
CREATE INDEX IF NOT EXISTS idx_taxonomy_terms_wp_term_id ON public.taxonomy_terms (wp_term_id);

-- ─── 2. casino_taxonomy_terms ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.casino_taxonomy_terms (
  casino_id  UUID NOT NULL REFERENCES public.casinos(id) ON DELETE CASCADE,
  term_id    UUID NOT NULL REFERENCES public.taxonomy_terms(id) ON DELETE CASCADE,
  PRIMARY KEY (casino_id, term_id)
);

-- Indexes for both lookup directions
CREATE INDEX IF NOT EXISTS idx_ctt_casino_id ON public.casino_taxonomy_terms (casino_id);
CREATE INDEX IF NOT EXISTS idx_ctt_term_id   ON public.casino_taxonomy_terms (term_id);

-- ─── 3. updated_at trigger for taxonomy_terms ────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_updated_at' AND tgrelid = 'public.taxonomy_terms'::regclass
  ) THEN
    -- add updated_at column if it doesn't exist yet
    ALTER TABLE public.taxonomy_terms ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
    CREATE TRIGGER set_updated_at
      BEFORE UPDATE ON public.taxonomy_terms
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;
