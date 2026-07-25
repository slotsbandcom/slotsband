-- Step 1: Add is_code_route column
ALTER TABLE pages ADD COLUMN IF NOT EXISTS is_code_route BOOLEAN DEFAULT false;

-- Step 2: Insert all built-in code route rows
-- ON CONFLICT: always mark as code route; only update meta if currently empty
INSERT INTO pages (slug, lang, title, content, meta_title, meta_description, is_published, is_code_route) VALUES

-- Homepage
('home', 'fi', 'Etusivu', '', 'SlotsBand – Parhaat Nettikasinot Suomessa 2026', 'Löydä Suomen parhaat nettikasinot 2026. Eksklusiiviset bonukset, verovapaat voitot, pikakotiutukset. Asiantuntijoiden testaama.', true, true),
('home', 'en', 'Home', '', 'SlotsBand – Best Online Casinos 2026', 'Find the best online casinos 2026. Exclusive bonuses, fast payouts, expert reviews. Trusted casino guide.', true, true),
('home', 'uk', 'Home', '', 'SlotsBand – Best UK Online Casinos 2026', 'Find the best UK online casinos 2026. Exclusive bonuses, UKGC licensed, fast payouts. Expert tested and reviewed.', true, true),

-- Nettikasinot
('nettikasinot', 'fi', 'Nettikasinot', '', 'Nettikasinot 2026 | SlotsBand', 'Vertaa parhaita nettikasinoita 2026 – bonukset, pelit ja maksutavat yhdessä paikassa.', true, true),
('nettikasinot', 'en', 'Online Casinos', '', 'Online Casinos 2026 | SlotsBand', 'Compare the best online casinos 2026 – bonuses, games and payment methods in one place.', true, true),
('nettikasinot', 'uk', 'Online Casinos', '', 'Online Casinos 2026 | SlotsBand', 'Compare the best UK online casinos 2026 – bonuses, games and payment methods in one place.', true, true),

-- Kasinobonukset
('kasinobonukset', 'fi', 'Kasinobonukset', '', 'Kasinobonukset 2026 | SlotsBand', 'Löydä parhaat kasinobonukset 2026 – tervetulobonukset, ilmaiskierrokset ja talletusbonarit.', true, true),
('kasinobonukset', 'en', 'Casino Bonuses', '', 'Casino Bonuses 2026 | SlotsBand', 'Find the best casino bonuses 2026 – welcome bonuses, free spins and deposit offers.', true, true),
('kasinobonukset', 'uk', 'Casino Bonuses', '', 'Casino Bonuses 2026 | SlotsBand', 'Find the best UK casino bonuses 2026 – welcome bonuses, free spins and deposit offers.', true, true),

-- Kasinopelit
('kasinopelit', 'fi', 'Kasinopelit', '', 'Kasinopelit 2026 | SlotsBand', 'Tutustu parhaimpiin kasinopeleihin – kolikkopeleihin, pöytäpeleihin ja live-kasinoon.', true, true),
('kasinopelit', 'en', 'Casino Games', '', 'Casino Games 2026 | SlotsBand', 'Explore the best casino games – slots, table games and live casino.', true, true),
('kasinopelit', 'uk', 'Casino Games', '', 'Casino Games 2026 | SlotsBand', 'Explore the best UK casino games – slots, table games and live casino.', true, true),

-- Rafflet
('rafflet', 'fi', 'Rafflet', '', 'Rafflet | SlotsBand', 'Kasinoiden parhaat rafflet ja kilpailut – osallistu ja voita palkintoja.', true, true),
('rafflet', 'en', 'Raffles', '', 'Casino Raffles | SlotsBand', 'The best casino raffles and competitions – enter and win prizes.', true, true),
('rafflet', 'uk', 'Raffles', '', 'Casino Raffles | SlotsBand', 'The best UK casino raffles and competitions – enter and win prizes.', true, true),

-- Bonushunt
('bonushunt', 'fi', 'Bonus Hunt', '', 'Bonus Hunt | SlotsBand', 'Seuraa live bonus hunt -sessiota – avaa bonukset ja katso tulokset reaaliajassa.', true, true),
('bonushunt', 'en', 'Bonus Hunt', '', 'Bonus Hunt | SlotsBand', 'Follow live bonus hunt sessions – open bonuses and see results in real time.', true, true),
('bonushunt', 'uk', 'Bonus Hunt', '', 'Bonus Hunt | SlotsBand', 'Follow live UK bonus hunt sessions – open bonuses and see results in real time.', true, true),

-- Blogi
('blogi', 'fi', 'Blogi', '', 'Blogi | SlotsBand', 'Lue SlotsBand kasinoblogia — vinkkejä, uutisia ja oppaita online kasinoista.', true, true),
('blogi', 'en', 'Blog', '', 'Blog | SlotsBand', 'Read the SlotsBand casino blog — tips, news and guides about online casinos.', true, true),
('blogi', 'uk', 'Blog', '', 'Blog | SlotsBand', 'Read the SlotsBand casino blog — tips, news and guides about online casinos.', true, true),

-- Kasinot (casino-category)
('kasinot', 'fi', 'Kasinokategoriat', '', 'Kasinokategoriat 2026 | SlotsBand', 'Selaa nettikasinoita kategorian mukaan ja löydä sinulle sopivin kasino.', true, true),
('kasinot', 'en', 'Casino Categories', '', 'Casino Categories 2026 | SlotsBand', 'Browse online casinos by category and find the right one for you.', true, true),
('kasinot', 'uk', 'Casino Categories', '', 'Casino Categories 2026 | SlotsBand', 'Browse online casinos by category and find the right one for you.', true, true),

-- Talletustavat (deposit-method)
('talletustavat', 'fi', 'Talletustavat', '', 'Talletustavat 2026 | SlotsBand', 'Vertaa kasinoita talletustavan mukaan – löydä kasino joka tukee suosikkimaksutapaasi.', true, true),
('talletustavat', 'en', 'Deposit Methods', '', 'Deposit Methods 2026 | SlotsBand', 'Compare casinos by deposit method – find a casino that supports your preferred payment option.', true, true),
('talletustavat', 'uk', 'Deposit Methods', '', 'Deposit Methods 2026 | SlotsBand', 'Compare casinos by deposit method – find a casino that supports your preferred payment option.', true, true),

-- Kotiutustavat (withdrawal-method)
('kotiutustavat', 'fi', 'Kotiutustavat', '', 'Kotiutustavat 2026 | SlotsBand', 'Löydä kasino haluamallasi kotiutustavalla – nopeat ja turvalliset kotiutukset.', true, true),
('kotiutustavat', 'en', 'Withdrawal Methods', '', 'Withdrawal Methods 2026 | SlotsBand', 'Find a casino with your preferred withdrawal method – fast and secure payouts.', true, true),
('kotiutustavat', 'uk', 'Withdrawal Methods', '', 'Withdrawal Methods 2026 | SlotsBand', 'Find a casino with your preferred withdrawal method – fast and secure payouts.', true, true),

-- Ohjelmistot (software)
('ohjelmistot', 'fi', 'Peliohjelmistot', '', 'Peliohjelmistot 2026 | SlotsBand', 'Tutustu peliohjelmistontarjoajiin ja löydä kasino suosikkistudioltasi.', true, true),
('ohjelmistot', 'en', 'Casino Software', '', 'Casino Software 2026 | SlotsBand', 'Explore game software providers and find a casino featuring your favourite studio.', true, true),
('ohjelmistot', 'uk', 'Casino Software', '', 'Casino Software 2026 | SlotsBand', 'Explore game software providers and find a casino featuring your favourite studio.', true, true),

-- Valmistaja (vendor)
('valmistaja', 'fi', 'Pelivalmistajat', '', 'Pelivalmistajat 2026 | SlotsBand', 'Tutustu pelintarjoajiin ja heidän parhaisiin peleihinsa.', true, true),
('valmistaja', 'en', 'Game Vendors', '', 'Game Vendors 2026 | SlotsBand', 'Explore game vendors and their best titles.', true, true),
('valmistaja', 'uk', 'Game Vendors', '', 'Game Vendors 2026 | SlotsBand', 'Explore game vendors and their best titles.', true, true),

-- Lisenssi (licence)
('lisenssi', 'fi', 'Kasinolicenssit', '', 'Kasinolicenssit 2026 | SlotsBand', 'Vertaa kasinoita lisenssin perusteella – pelaa turvallisesti säännellyissä kasinoissa.', true, true),
('lisenssi', 'en', 'Casino Licences', '', 'Casino Licences 2026 | SlotsBand', 'Compare casinos by licence – play safely at regulated casinos.', true, true),
('lisenssi', 'uk', 'Casino Licences', '', 'Casino Licences 2026 | SlotsBand', 'Compare casinos by licence – play safely at regulated casinos.', true, true)

ON CONFLICT (slug, lang) DO UPDATE SET
  is_code_route = true,
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
