-- =============================================================================
-- SlotsBand – Seed Data
-- Run this after schema.sql to populate the database with sample content.
-- =============================================================================

-- ─── Stream status rows (one per platform) ───────────────────────────────────
INSERT INTO public.stream_status (platform, is_live, viewers, title, override_mode)
VALUES
  ('kick',    false, 0, '', 'auto'),
  ('twitch',  false, 0, '', 'auto'),
  ('youtube', false, 0, '', 'auto')
ON CONFLICT (platform) DO NOTHING;

-- ─── Licenses ─────────────────────────────────────────────────────────────────
INSERT INTO public.licenses (name, authority, country, is_tax_free, website_url)
VALUES
  ('MGA', 'Malta Gaming Authority', 'MT', false, 'https://www.mga.org.mt'),
  ('Curacao', 'Curaçao eGaming', 'CW', true, 'https://www.curacao-egaming.com'),
  ('UKGC', 'UK Gambling Commission', 'GB', false, 'https://www.gamblingcommission.gov.uk'),
  ('Kahnawake', 'Kahnawake Gaming Commission', 'CA', true, 'https://www.kahnawake.com')
ON CONFLICT (name) DO NOTHING;

-- ─── Game Providers ───────────────────────────────────────────────────────────
INSERT INTO public.game_providers (name, slug, website_url)
VALUES
  ('Pragmatic Play',  'pragmatic-play',  'https://www.pragmaticplay.com'),
  ('NetEnt',          'netent',          'https://www.netent.com'),
  ('Play''n GO',      'playn-go',        'https://www.playngo.com'),
  ('Microgaming',     'microgaming',     'https://www.microgaming.co.uk'),
  ('Evolution',       'evolution',       'https://www.evolution.com'),
  ('Yggdrasil',       'yggdrasil',       'https://www.yggdrasilgaming.com'),
  ('Thunderkick',     'thunderkick',     'https://www.thunderkick.com'),
  ('Hacksaw Gaming',  'hacksaw-gaming',  'https://www.hacksawgaming.com'),
  ('Push Gaming',     'push-gaming',     'https://www.pushgaming.com'),
  ('Red Tiger',       'red-tiger',       'https://redtiger.com')
ON CONFLICT (slug) DO NOTHING;

-- ─── Payment Methods ──────────────────────────────────────────────────────────
INSERT INTO public.payment_methods (name, slug, type)
VALUES
  ('Visa',          'visa',          'card'),
  ('Mastercard',    'mastercard',    'card'),
  ('Trustly',       'trustly',       'bank'),
  ('Skrill',        'skrill',        'ewallet'),
  ('Neteller',      'neteller',      'ewallet'),
  ('Bitcoin',       'bitcoin',       'crypto'),
  ('Ethereum',      'ethereum',      'crypto'),
  ('Paysafecard',   'paysafecard',   'other'),
  ('Klarna',        'klarna',        'bank'),
  ('MuchBetter',    'muchbetter',    'ewallet')
ON CONFLICT (slug) DO NOTHING;

-- ─── Categories ───────────────────────────────────────────────────────────────
INSERT INTO public.categories (slug, name_fi, name_en, name_uk, sort_order)
VALUES
  ('pikakasinot',        'Pikakasinot',          'Fast Casinos',          'Швидкі казино',          1),
  ('uudet-kasinot',      'Uudet Kasinot',         'New Casinos',           'Нові казино',            2),
  ('bonukset',           'Non-Sticky Bonukset',   'Non-Sticky Bonuses',    'Бонуси без вейджеру',    3),
  ('verovapaat',         'Verovapaat Kasinot',    'Tax-Free Casinos',      'Безподаткові казино',    4),
  ('ilmaispyoraytykset', 'Ilmaispyöräytykset',    'Free Spins',            'Безкоштовні спини',      5),
  ('kryptot',            'Kryptot',               'Crypto Casinos',        'Крипто казино',          6)
ON CONFLICT (slug) DO NOTHING;

-- ─── Sample Casinos ───────────────────────────────────────────────────────────
INSERT INTO public.casinos (
  slug, name, logo_url, established_year,
  rating, trust_score, rank,
  is_active, is_featured, is_new, is_pikakasino,
  affiliate_url, mene_slug,
  license_authority, is_verified,
  welcome_bonus_text, welcome_bonus_percent, welcome_bonus_max_amount,
  welcome_bonus_currency, welcome_bonus_wagering,
  min_deposit, payment_methods, game_providers,
  live_casino, mobile_optimized, live_chat_support,
  review_fi, review_en,
  pros_fi, cons_fi,
  meta_title_fi, meta_description_fi
) VALUES
(
  'blingi', 'Blingi', '/logos/blingi.png', 2022,
  9.2, 92, 1,
  true, true, false, true,
  'https://blingi.com/?btag=123', 'blingi',
  'MGA', true,
  'Talleta 20€ ja saa 250 ilmaiskierrosta', 100, 500, 'EUR', 30,
  20, ARRAY['trustly','visa','mastercard'], ARRAY['Pragmatic Play','NetEnt','Play''n GO'],
  true, true, true,
  'Blingi on yksi Suomen suosituimmista pikakasino-sivustoista. MGA-lisenssillä toimiva kasino tarjoaa yli 3000 peliä ja nopeat pikakotiutukset Trustlyn kautta.',
  'Blingi is one of Finland''s most popular fast casino sites. Operating under an MGA licence, the casino offers over 3000 games and fast withdrawals via Trustly.',
  ARRAY['Nopeat kotiutukset', 'Laaja pelitarjonta', 'Pikakasino', 'MGA-lisenssi'],
  ARRAY['Ei puhelintu­kea', 'Rajoitettu bonustarjous'],
  'Blingi Kasino 2026 – Arvostelu ja Bonus | SlotsBand',
  'Lue asiantunteva Blingi arvostelu. Vertaile bonukset, pelit ja kotiutusajat – löydä paras nettikasinosi SlotsBandilta.'
),
(
  'casinoroom', 'Casino Room', '/logos/casinoroom.png', 2005,
  8.7, 88, 2,
  true, true, false, false,
  'https://casinoroom.com/?ref=slotsband', 'casinoroom',
  'MGA', true,
  'Talleta ja saa 100% bonus jopa 200€ asti', 100, 200, 'EUR', 35,
  10, ARRAY['trustly','visa','skrill','neteller'], ARRAY['NetEnt','Microgaming','Evolution'],
  true, true, true,
  'Casino Room on perustettu vuonna 2005 ja on yksi Suomen tunnetuimmista nettikasinoista. Laaja pelivalikoimaan kuuluu yli 1500 kolikkopeleä ja live-kasino.',
  'Casino Room was founded in 2005 and is one of Finland''s best-known online casinos. Its wide game selection includes over 1500 slot games and a live casino.',
  ARRAY['Pitkä kokemus', 'Laaja pelitarjonta', 'MGA-lisenssi'],
  ARRAY['Hitaammat kotiutukset', 'Korkea kierrätysvaatimus'],
  'Casino Room 2026 – Arvostelu ja Bonus | SlotsBand',
  'Casino Room arvostelu 2026. Katso bonukset, kolikkopelien määrä ja kotiutusajat. Luotettava MGA-lisenssoitu kasino.'
),
(
  'videoslots', 'Videoslots', '/logos/videoslots.png', 2011,
  8.9, 90, 3,
  true, false, false, false,
  'https://videoslots.com/?ref=slotsband', 'videoslots',
  'MGA', true,
  'Talleta 10€ ja saa 11 ilmaiskierrosta', 100, 200, 'EUR', 35,
  10, ARRAY['trustly','visa','mastercard','skrill'], ARRAY['Pragmatic Play','NetEnt','Yggdrasil','Thunderkick'],
  true, true, true,
  'Videoslots on yksi maailman suurimmista nettikasinoista yli 7000 pelillä. Omaperäinen Battle of Slots -ominaisuus erottaa sen muista.',
  'Videoslots is one of the world''s largest online casinos with over 7000 games. Its unique Battle of Slots feature sets it apart from the rest.',
  ARRAY['Valtava pelitarjonta 7000+ peliä', 'Ainutlaatuinen Battle of Slots', 'Nopeat kotiutukset'],
  ARRAY['Ei pikakasino', 'Monimutkaiset bonusehdot'],
  'Videoslots 2026 – Arvostelu, Pelit ja Bonus | SlotsBand',
  'Videoslots arvostelu 2026. Yli 7000 peliä, nopeat kotiutukset ja ainutlaatuinen Battle of Slots -ominaisuus. Lue täydellinen arvostelu SlotsBandilta.'
)
ON CONFLICT (slug) DO NOTHING;

-- ─── Sample Bonuses ───────────────────────────────────────────────────────────
INSERT INTO public.bonuses (casino_id, title, description, bonus_type, amount, wagering, min_deposit, is_featured, lang)
SELECT
  c.id,
  'Talleta ja saa 250 ilmaiskierrosta',
  'Talleta vähintään 20€ ja saa 250 ilmaiskierrosta Blingin uusiin peleihin.',
  'welcome',
  '250 ilmaiskierrosta',
  30,
  20,
  true,
  'fi'
FROM public.casinos c WHERE c.slug = 'blingi'
ON CONFLICT DO NOTHING;

INSERT INTO public.bonuses (casino_id, title, description, bonus_type, amount, wagering, min_deposit, is_featured, lang)
SELECT
  c.id,
  '100% bonus jopa 200€',
  'Ensitalletusbonus uusille pelaajille. Tuplaa ensitalletuksesi jopa 200 euroon asti.',
  'welcome',
  '100% jopa 200€',
  35,
  10,
  true,
  'fi'
FROM public.casinos c WHERE c.slug = 'casinoroom'
ON CONFLICT DO NOTHING;

-- ─── Sample Games ─────────────────────────────────────────────────────────────
INSERT INTO public.games (slug, name, provider, rtp, volatility, type, is_active, is_featured)
VALUES
  ('sweet-bonanza',           'Sweet Bonanza',           'Pragmatic Play', 96.51, 'high',   'slot',    true, true),
  ('gates-of-olympus',        'Gates of Olympus',        'Pragmatic Play', 96.50, 'high',   'slot',    true, true),
  ('big-bass-bonanza',        'Big Bass Bonanza',        'Pragmatic Play', 96.71, 'high',   'slot',    true, false),
  ('reactoonz',               'Reactoonz',               'Play''n GO',     96.51, 'high',   'slot',    true, true),
  ('book-of-dead',            'Book of Dead',            'Play''n GO',     96.21, 'high',   'slot',    true, false),
  ('starburst',               'Starburst',               'NetEnt',         96.09, 'low',    'slot',    true, false),
  ('gonzo-s-quest',           'Gonzo''s Quest',           'NetEnt',         95.97, 'medium', 'slot',    true, false),
  ('dead-or-alive-2',         'Dead or Alive 2',         'NetEnt',         96.82, 'high',   'slot',    true, true),
  ('jammin-jars',             'Jammin'' Jars',            'Push Gaming',    96.83, 'high',   'slot',    true, true),
  ('money-train-4',           'Money Train 4',           'Relax Gaming',   96.00, 'high',   'slot',    true, true),
  ('lightning-roulette',      'Lightning Roulette',      'Evolution',      97.30, 'low',    'live',    true, true),
  ('crazy-time',              'Crazy Time',              'Evolution',      96.08, 'medium', 'live',    true, true),
  ('monopoly-live',           'Monopoly Live',           'Evolution',      96.23, 'medium', 'live',    true, false),
  ('mega-ball',               'Mega Ball',               'Evolution',      95.40, 'high',   'live',    true, false)
ON CONFLICT (slug) DO NOTHING;

-- ─── Sample Raffle Session ────────────────────────────────────────────────────
INSERT INTO public.raffle_sessions (title, description, prize, prize_value, status, ends_at)
VALUES (
  'Viikoittainen raffle – Viikko 30',
  'Osallistu viikon raffleen kommentoimalla "!raffle" suorassa lähetyksessä.',
  '500€ käteinen',
  500,
  'upcoming',
  (NOW() + INTERVAL '7 days')
)
ON CONFLICT DO NOTHING;

-- ─── Sample Bonus Hunt Session ────────────────────────────────────────────────
INSERT INTO public.bonushunt_sessions (title, date, status, start_balance, total_buyin)
VALUES (
  'Bonus Hunt #1 – Testisessio',
  CURRENT_DATE,
  'upcoming',
  1000,
  1000
)
ON CONFLICT DO NOTHING;
