-- Run this in the Supabase SQL Editor to migrate to the full normalized raffle schema.
-- After running, getRaffles() will use proper columns instead of the description JSON fallback.

-- 1. Add missing columns to raffle_sessions
ALTER TABLE raffle_sessions
  ADD COLUMN IF NOT EXISTS slug             text,
  ADD COLUMN IF NOT EXISTS casino_partner   text,
  ADD COLUMN IF NOT EXISTS casino_slug      text,
  ADD COLUMN IF NOT EXISTS prize_name       text,
  ADD COLUMN IF NOT EXISTS prize_currency   text DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS entry_requirements jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS image_url        text;

-- 2. Backfill the active raffle from the description JSON (run once)
UPDATE raffle_sessions
SET
  casino_partner        = description::jsonb ->> 'casino_name',
  casino_slug           = description::jsonb ->> 'casino_slug',
  entry_requirements    = (description::jsonb -> 'how_to')
WHERE status = 'active'
  AND description LIKE '{%';

-- 3. Create raffle_winners table
CREATE TABLE IF NOT EXISTS raffle_winners (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  raffle_id   uuid REFERENCES raffle_sessions(id) ON DELETE CASCADE,
  winner_name text NOT NULL,
  prize_name  text NOT NULL,
  casino_name text,
  won_at      timestamptz DEFAULT now()
);

-- 4. Seed past winners linked to the active raffle
INSERT INTO raffle_winners (raffle_id, winner_name, prize_name, casino_name, won_at)
SELECT
  s.id,
  w.winner_name,
  w.prize_name,
  w.casino_name,
  w.won_at::timestamptz
FROM raffle_sessions s,
(VALUES
  ('Mikko T.',  '500€ käteinen',  'Spinnair',   '2026-01-10'),
  ('Laura K.',  'PS5 konsoli',    'Lussurio',    '2026-01-03'),
  ('Janne M.',  'AirPods Pro',    'IWild',       '2025-12-27'),
  ('Sanna V.',  '200€ käteinen',  'Bob Casino',  '2025-12-20'),
  ('Petri H.',  'iPhone 15',      'Gamblezen',   '2025-12-10')
) AS w(winner_name, prize_name, casino_name, won_at)
WHERE s.status = 'active'
ON CONFLICT DO NOTHING;

-- 5. Add missing columns to raffle_entries
ALTER TABLE raffle_entries
  ADD COLUMN IF NOT EXISTS entry_date timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS is_winner  boolean DEFAULT false;
