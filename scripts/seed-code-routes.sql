-- Step 1: Add columns
ALTER TABLE pages ADD COLUMN IF NOT EXISTS is_code_route BOOLEAN DEFAULT false;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS route_key VARCHAR(255);

-- Step 1b: Unique index enabling UPDATE by (route_key, lang) for slug changes
CREATE UNIQUE INDEX IF NOT EXISTS pages_route_key_lang_idx ON pages(route_key, lang) WHERE route_key IS NOT NULL;

-- Step 2: Insert/upsert all built-in code route rows
-- route_key = internal identifier (never changes, used in admin URLs)
-- slug     = per-language URL segment (can be edited per language tab in admin)
-- Default: slug = route_key for all languages (admins can change per-lang later)
INSERT INTO pages (slug, lang, title, content, meta_title, meta_description, is_published, is_code_route, route_key) VALUES

-- Homepage (special: not routed via [slug] catch-all — stays at /[lang])
('home', 'fi', 'Etusivu', '', 'SlotsBand – Parhaat Nettikasinot Suomessa 2026', 'Löydä Suomen parhaat nettikasinot 2026. Eksklusiiviset bonukset, verovapaat voitot, pikakotiutukset. Asiantuntijoiden testaama.', true, true, 'home'),
('home', 'en', 'Home', '', 'SlotsBand – Best Online Casinos 2026', 'Find the best online casinos 2026. Exclusive bonuses, fast payouts, expert reviews. Trusted casino guide.', true, true, 'home'),
('home', 'uk', 'Home', '', 'SlotsBand – Best UK Online Casinos 2026', 'Find the best UK online casinos 2026. Exclusive bonuses, UKGC licensed, fast payouts. Expert tested and reviewed.', true, true, 'home'),

-- Nettikasinot
('nettikasinot', 'fi', 'Nettikasinot', '', 'Nettikasinot 2026 | SlotsBand', 'Vertaa parhaita nettikasinoita 2026 – bonukset, pelit ja maksutavat yhdessä paikassa.', true, true, 'nettikasinot'),
('nettikasinot', 'en', 'Online Casinos', '', 'Online Casinos 2026 | SlotsBand', 'Compare the best online casinos 2026 – bonuses, games and payment methods in one place.', true, true, 'nettikasinot'),
('nettikasinot', 'uk', 'Online Casinos', '', 'Online Casinos 2026 | SlotsBand', 'Compare the best UK online casinos 2026 – bonuses, games and payment methods in one place.', true, true, 'nettikasinot'),

-- Kasinobonukset
('kasinobonukset', 'fi', 'Kasinobonukset', '', 'Kasinobonukset 2026 | SlotsBand', 'Löydä parhaat kasinobonukset 2026 – tervetulobonukset, ilmaiskierrokset ja talletusbonarit.', true, true, 'kasinobonukset'),
('kasinobonukset', 'en', 'Casino Bonuses', '', 'Casino Bonuses 2026 | SlotsBand', 'Find the best casino bonuses 2026 – welcome bonuses, free spins and deposit offers.', true, true, 'kasinobonukset'),
('kasinobonukset', 'uk', 'Casino Bonuses', '', 'Casino Bonuses 2026 | SlotsBand', 'Find the best UK casino bonuses 2026 – welcome bonuses, free spins and deposit offers.', true, true, 'kasinobonukset'),

-- Kasinopelit
('kasinopelit', 'fi', 'Kasinopelit', '', 'Kasinopelit 2026 | SlotsBand', 'Tutustu parhaimpiin kasinopeleihin – kolikkopeleihin, pöytäpeleihin ja live-kasinoon.', true, true, 'kasinopelit'),
('kasinopelit', 'en', 'Casino Games', '', 'Casino Games 2026 | SlotsBand', 'Explore the best casino games – slots, table games and live casino.', true, true, 'kasinopelit'),
('kasinopelit', 'uk', 'Casino Games', '', 'Casino Games 2026 | SlotsBand', 'Explore the best UK casino games – slots, table games and live casino.', true, true, 'kasinopelit'),

-- Rafflet
('rafflet', 'fi', 'Rafflet', '', 'Rafflet | SlotsBand', 'Kasinoiden parhaat rafflet ja kilpailut – osallistu ja voita palkintoja.', true, true, 'rafflet'),
('rafflet', 'en', 'Raffles', '', 'Casino Raffles | SlotsBand', 'The best casino raffles and competitions – enter and win prizes.', true, true, 'rafflet'),
('rafflet', 'uk', 'Raffles', '', 'Casino Raffles | SlotsBand', 'The best UK casino raffles and competitions – enter and win prizes.', true, true, 'rafflet'),

-- Bonushunt
('bonushunt', 'fi', 'Bonus Hunt', '', 'Bonus Hunt | SlotsBand', 'Seuraa live bonus hunt -sessiota – avaa bonukset ja katso tulokset reaaliajassa.', true, true, 'bonushunt'),
('bonushunt', 'en', 'Bonus Hunt', '', 'Bonus Hunt | SlotsBand', 'Follow live bonus hunt sessions – open bonuses and see results in real time.', true, true, 'bonushunt'),
('bonushunt', 'uk', 'Bonus Hunt', '', 'Bonus Hunt | SlotsBand', 'Follow live UK bonus hunt sessions – open bonuses and see results in real time.', true, true, 'bonushunt'),

-- Blogi
('blogi', 'fi', 'Blogi', '', 'Blogi | SlotsBand', 'Lue SlotsBand kasinoblogia — vinkkejä, uutisia ja oppaita online kasinoista.', true, true, 'blogi'),
('blogi', 'en', 'Blog', '', 'Blog | SlotsBand', 'Read the SlotsBand casino blog — tips, news and guides about online casinos.', true, true, 'blogi'),
('blogi', 'uk', 'Blog', '', 'Blog | SlotsBand', 'Read the SlotsBand casino blog — tips, news and guides about online casinos.', true, true, 'blogi'),

-- Kasinot (casino-category taxonomy index)
('kasinot', 'fi', 'Kasinokategoriat', '', 'Kasinokategoriat 2026 | SlotsBand', 'Selaa nettikasinoita kategorian mukaan ja löydä sinulle sopivin kasino.', true, true, 'kasinot'),
('kasinot', 'en', 'Casino Categories', '', 'Casino Categories 2026 | SlotsBand', 'Browse online casinos by category and find the right one for you.', true, true, 'kasinot'),
('kasinot', 'uk', 'Casino Categories', '', 'Casino Categories 2026 | SlotsBand', 'Browse online casinos by category and find the right one for you.', true, true, 'kasinot'),

-- Talletustavat (deposit-method taxonomy index)
('talletustavat', 'fi', 'Talletustavat', '', 'Talletustavat 2026 | SlotsBand', 'Vertaa kasinoita talletustavan mukaan – löydä kasino joka tukee suosikkimaksutapaasi.', true, true, 'talletustavat'),
('talletustavat', 'en', 'Deposit Methods', '', 'Deposit Methods 2026 | SlotsBand', 'Compare casinos by deposit method – find a casino that supports your preferred payment option.', true, true, 'talletustavat'),
('talletustavat', 'uk', 'Deposit Methods', '', 'Deposit Methods 2026 | SlotsBand', 'Compare casinos by deposit method – find a casino that supports your preferred payment option.', true, true, 'talletustavat'),

-- Kotiutustavat (withdrawal-method taxonomy index)
('kotiutustavat', 'fi', 'Kotiutustavat', '', 'Kotiutustavat 2026 | SlotsBand', 'Löydä kasino haluamallasi kotiutustavalla – nopeat ja turvalliset kotiutukset.', true, true, 'kotiutustavat'),
('kotiutustavat', 'en', 'Withdrawal Methods', '', 'Withdrawal Methods 2026 | SlotsBand', 'Find a casino with your preferred withdrawal method – fast and secure payouts.', true, true, 'kotiutustavat'),
('kotiutustavat', 'uk', 'Withdrawal Methods', '', 'Withdrawal Methods 2026 | SlotsBand', 'Find a casino with your preferred withdrawal method – fast and secure payouts.', true, true, 'kotiutustavat'),

-- Ohjelmistot (software taxonomy index)
('ohjelmistot', 'fi', 'Peliohjelmistot', '', 'Peliohjelmistot 2026 | SlotsBand', 'Tutustu peliohjelmistontarjoajiin ja löydä kasino suosikkistudioltasi.', true, true, 'ohjelmistot'),
('ohjelmistot', 'en', 'Casino Software', '', 'Casino Software 2026 | SlotsBand', 'Explore game software providers and find a casino featuring your favourite studio.', true, true, 'ohjelmistot'),
('ohjelmistot', 'uk', 'Casino Software', '', 'Casino Software 2026 | SlotsBand', 'Explore game software providers and find a casino featuring your favourite studio.', true, true, 'ohjelmistot'),

-- Valmistaja (vendor taxonomy index)
('valmistaja', 'fi', 'Pelivalmistajat', '', 'Pelivalmistajat 2026 | SlotsBand', 'Tutustu pelintarjoajiin ja heidän parhaisiin peleihinsa.', true, true, 'valmistaja'),
('valmistaja', 'en', 'Game Vendors', '', 'Game Vendors 2026 | SlotsBand', 'Explore game vendors and their best titles.', true, true, 'valmistaja'),
('valmistaja', 'uk', 'Game Vendors', '', 'Game Vendors 2026 | SlotsBand', 'Explore game vendors and their best titles.', true, true, 'valmistaja'),

-- Lisenssi (licence taxonomy index)
('lisenssi', 'fi', 'Kasinolicenssit', '', 'Kasinolicenssit 2026 | SlotsBand', 'Vertaa kasinoita lisenssin perusteella – pelaa turvallisesti säännellyissä kasinoissa.', true, true, 'lisenssi'),
('lisenssi', 'en', 'Casino Licences', '', 'Casino Licences 2026 | SlotsBand', 'Compare casinos by licence – play safely at regulated casinos.', true, true, 'lisenssi'),
('lisenssi', 'uk', 'Casino Licences', '', 'Casino Licences 2026 | SlotsBand', 'Compare casinos by licence – play safely at regulated casinos.', true, true, 'lisenssi')

ON CONFLICT (slug, lang) DO UPDATE SET
  is_code_route = true,
  route_key = COALESCE(EXCLUDED.route_key, pages.route_key, EXCLUDED.slug),
  meta_title = CASE
    WHEN pages.meta_title IS NULL OR pages.meta_title = ''
    THEN EXCLUDED.meta_title
    ELSE pages.meta_title
  END,
  meta_description = CASE
    WHEN pages.meta_description IS NULL OR pages.meta_description = ''
    THEN EXCLUDED.meta_description
    ELSE pages.meta_description
  END;

-- Backfill route_key for any existing code routes still missing it
UPDATE pages SET route_key = slug WHERE is_code_route = true AND route_key IS NULL;
