/** @type {import('next').NextConfig} */

// bonus slug (from old WP /tarjous/[slug]) → destination path relative to /[lang]/
const TARJOUS_MAP = [
  ['21-casino-121-bonus-aina-300e-asti',                                        'nettikasinot/21-casino'],
  ['21-casino-21-ilmaiskierrosta-ilman-talletusta',                             'nettikasinot/21-casino'],
  ['__trashed',                                                                  'kasinobonukset'],
  ['__trashed-2',                                                                'kasinobonukset'],
  ['alf-casino-800e-edesta-bonuksia-250-ilmaiskierrosta',                       'nettikasinot/alf-casino'],
  ['betiton-100-bonus-150e-asti-150-ilmaiskierrosta',                           'kasinobonukset'],
  ['boaboa-casino-500e-200-ilmaiskierrosta',                                    'nettikasinot/boaboa-casino'],
  ['buran-casino-500-bonus-200-ilmaiskierrosta',                                'nettikasinot/buran-casino'],
  ['casinia-casino-tuplaa-ensitalletus-500e-asti-200-ilmaiskierrosta',          'nettikasinot/casinia-casino'],
  ['casinoly-500-non-sticky-bonus-200-ilmaiskierrosta',                         'kasinobonukset'],
  ['casumo-200e-ensitalletusbonus-200-ilmaiskierrosta',                         'kasinobonukset'],
  ['caxino-casino-200-non-sticky-bonus-100-ilmaiskierrosta',                    'nettikasinot/caxino-casino'],
  ['chipz-casino-100-ilmaiskierrosta-ilman-kierratysvaatimusta',                'nettikasinot/chipz-casino'],
  ['duel-com-kasino-no-1-tulevaisuudessa',                                      'nettikasinot/duel-casino'],
  ['kasinobonukset-2026-nain-valitset-itsellesi-parhaan-bonuksen',              'kasinobonukset-2026-nain-valitset-itsellesi-parhaan-bonuksen'],
  ['kryptokasinot-yleistyvat-mita-pelaajan-kannattaa-tietaa-ennen-talletusta',  'kryptokasinot-yleistyvat-mita-pelaajan-kannattaa-tietaa-ennen-talletusta'],
  ['legendplay-casino-1000e-bonuksia-50-ilmaiskierrosta',                       'nettikasinot/legendplay-casino'],
  ['lilibet-casino-50e-ilmaisveto',                                             'kasinobonukset'],
  ['malina-casino-500-bonus-200-ilmaiskierrosta',                               'nettikasinot/malina-casino'],
  ['miksi-verkkopankki-kasinot-ovat-suosittuja',                                'miksi-verkkopankki-kasinot-ovat-suosittuja'],
  ['miten-pelaaminen-ilman-rekisteroitymista-oikeasti-toimii-pankkitunnuksilla','miten-pelaaminen-ilman-rekisteroitymista-oikeasti-toimii-pankkitunnuksilla'],
  ['nain-revolut-toimii-nettikasinoilla',                                        'nain-revolut-toimii-nettikasinoilla'],
  ['neon54-casino-100-bonus-500e-asti-100-ilmaiskierrosta',                     'nettikasinot/neon54-casino'],
  ['onecasino-com',                                                              'nettikasinot/onecasino'],
  ['onnela-casino-10-cashback-joka-paiva',                                       'nettikasinot/onnela-casino'],
  ['paysafecard-maksutavan-plussat-ja-miinukset',                               'paysafecard-maksutavan-plussat-ja-miinukset'],
  ['sisu-kasino-125-bonus-500e-asti',                                            'nettikasinot/sisu-kasino'],
  ['slots-palace-casino-100-bonus-500e-asti',                                    'nettikasinot/slots-palace-casino'],
  ['slotsband-arvonta-voittajat-casinobud',                                      'rafflet'],
  ['spinbara-casino-100-nonsticky-500e-asti-200-ilmaiskierrosta',               'nettikasinot/spinbara-casino'],
  ['spinz-casino-300-non-sticky-bonus-100-ilmaiskierrosta',                     'nettikasinot/spinz-casino'],
  ['taalta-loydat-kaikki-slotsband-arvontojen-voittajat',                       'rafflet'],
  ['teho-kasino-150-bonus-jopa-600e-asti',                                       'nettikasinot/teho-kasino'],
  ['twin-casino-100-bonus-100e-asti-50-ilmaiskierrosta',                        'kasinobonukset'],
  ['vauhdikas-kasino',                                                           'nettikasinot/vauhdikas-casino'],
  ['wazamba-casino-500-200-ilmaiskierrosta',                                     'nettikasinot/wazamba-casino'],
  ['wheelz-casino-20-ilmaiskierrosta-ilman-talletusta',                         'nettikasinot/wheelz-casino'],
  ['wheelz-casino-300-non-sticky-bonus-100-ilmaiskierrosta',                    'nettikasinot/wheelz-casino'],
  ['wildz-casino-500-non-sticky-bonus-200-ilmaiskierrosta',                     'nettikasinot/wildz-casino'],
  ['yoyo-casino-100-bonus-aina-500e-asti-200-bonuskierrosta',                   'kasinobonukset'],
]

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    minimumCacheTTL: 2592000, // 30 days — Supabase images rarely change
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "slotsband.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.slotsband.com",
        pathname: "/**",
      },
    ],
  },
  // Disable the React compiler to prevent Turbopack from generating extra
  // HMR module boundaries that race against router initialization.
  reactCompiler: false,

  async redirects() {
    const L = 'fi|en|uk'

    // /tarjous/[bonus-slug] → casino page or hub fallback, for all 3 langs + bare WP URLs
    const tarjousRedirects = TARJOUS_MAP.flatMap(([bonusSlug, dest]) => [
      {
        source: `/:lang(${L})/tarjous/${bonusSlug}`,
        destination: `/:lang/${dest}`,
        permanent: true,
      },
      {
        source: `/tarjous/${bonusSlug}`,
        destination: `/fi/${dest}`,
        permanent: true,
      },
    ])

    const genericRedirects = [
      // /pelit and /pelit/* → kasinopelit hub
      { source: `/:lang(${L})/pelit/:slug*`, destination: '/:lang/kasinopelit', permanent: true },
      { source: '/pelit/:slug*', destination: '/fi/kasinopelit', permanent: true },
      // /kirjoittaja/* → blogi
      { source: `/:lang(${L})/kirjoittaja/:slug*`, destination: '/:lang/blogi', permanent: true },
      { source: '/kirjoittaja/:slug*', destination: '/fi/blogi', permanent: true },
    ]

    // Old WP nav pointed straight at taxonomy term slugs from site root
    // (e.g. /fi/luotettavat-nettikasinot/) — now they live under a hub path.
    // casino-category terms → /kasinot/[slug], bonus-category terms → /tarjoukset/[slug]
    const TAXONOMY_TERM_MAP = [
      ['nettikasinot-ilman-rekisteroitymista', 'kasinot/nettikasinot-ilman-rekisteroitymista'],
      ['luotettavat-nettikasinot', 'kasinot/luotettavat-nettikasinot'],
      ['parhaat-nettikasinot', 'kasinot/parhaat-nettikasinot'],
      ['uudet-nettikasinot', 'kasinot/uudet-nettikasinot'],
      ['verovapaat-nettikasinot', 'kasinot/verovapaat-nettikasinot'],
      ['parhaat-mobiilikasinot', 'kasinot/mobiilikasinot'], // slug renamed to mobiilikasinot
      ['kryptokasinot', 'kasinot/kryptokasinot'],
      ['suomalaiset-nettikasinot', 'kasinot/suomalaiset-nettikasinot'],
      ['pikakasinot', 'kasinot/pikakasinot'],
      ['100-rtp', 'kasinot/100-rtp'],
      ['bonustarjousten-kasinoluettelo', 'kasinot/bonustarjousten-kasinoluettelo'],
      ['ilmaiskierroksia-ilman-talletusta', 'tarjoukset/ilmaiskierroksia-ilman-talletusta'],
      ['non-sticky-bonukset', 'tarjoukset/non-sticky-bonukset'],
      ['talletusbonukset', 'tarjoukset/talletusbonukset'],
      ['ilmaiskierroksia', 'tarjoukset/ilmaiskierroksia'],
      ['kierratysvapaat-bonukset', 'tarjoukset/kierratysvapaat-bonukset'],
      ['ilmaista-pelirahaa-ilman-talletusta', 'tarjoukset/ilmaista-pelirahaa-ilman-talletusta'],
      ['ilmaiskierroksia-ilman-kierratysta', 'tarjoukset/ilmaiskierroksia-ilman-kierratysta'],
      ['cashback', 'tarjoukset/cashback'],
      // 'rafflet' intentionally excluded — that flat slug is the standalone
      // /rafflet hub page itself, not the bonus-category term archive.
    ]
    const taxonomyRedirects = TAXONOMY_TERM_MAP.map(([oldSlug, dest]) => ({
      source: `/:lang(${L})/${oldSlug}`,
      destination: `/:lang/${dest}`,
      permanent: true,
    }))

    // Old WP static/legal pages used Finnish slugs; the current routes use
    // fixed English folder names shared across all languages.
    const LEGACY_PAGE_MAP = [
      ['tietoa-meista', 'about'],
      ['ota-yhteytta', 'contact'],
      ['tietosuojakaytanto', 'privacy'],
      ['kayttoehdot', 'terms'],
      ['vastuullinen-pelaaminen', 'responsible-gambling'],
      ['kaikki-nettikasinot', 'nettikasinot'],
      ['uutiset', 'blogi'],
      ['games-archive-template-2', 'kasinopelit'],
    ]
    const legacyPageRedirects = LEGACY_PAGE_MAP.map(([oldSlug, dest]) => ({
      source: `/:lang(${L})/${oldSlug}`,
      destination: `/:lang/${dest}`,
      permanent: true,
    }))

    // Old WP account/utility pages with no current equivalent → homepage
    const deadPageRedirects = ['location', 'register', 'login'].map((oldSlug) => ({
      source: `/:lang(${L})/${oldSlug}`,
      destination: '/:lang',
      permanent: true,
    }))

    // Casino/game detail pages that existed on the old WP site but no
    // longer have a matching row in the DB → redirect to the hub instead
    // of 404ing (kasinopelit/[slug] in particular returns a soft 200 for
    // unknown slugs, so intercepting here at the redirect layer avoids that).
    const deadCasinoSlugs = ['huikee-kasino', 'kunkku-kasino', 'netticasino', 'lilibetcasino']
    const deadGameSlugs = [
      'rotiki', 'cleocatra', 'the-rave', 'giga-jar', 'disturbed',
      'whacked', 'money-train-4', 'gargantoonz', 'the-dog-house-dog-or-alive',
    ]
    const deadContentRedirects = [
      ...deadCasinoSlugs.map((slug) => ({
        source: `/:lang(${L})/nettikasinot/${slug}`,
        destination: '/:lang/nettikasinot',
        permanent: true,
      })),
      ...deadGameSlugs.map((slug) => ({
        source: `/:lang(${L})/kasinopelit/${slug}`,
        destination: '/:lang/kasinopelit',
        permanent: true,
      })),
    ]

    // Old WP root-level blog permalinks (from before the /[lang]/ prefix existed)
    const blogRootRedirects = [
      { source: '/blog/kirjoittaja/:slug*', destination: '/fi/blogi', permanent: true },
      { source: '/blog/:slug', destination: '/fi/:slug', permanent: true },
    ]

    // casino-language ("kieli") and casino founding-year ("perustettu") were
    // WP taxonomies with public archive pages; neither has a current
    // equivalent section, so send them to the casino hub instead of 404ing.
    // :rest* also swallows old /sivu/N/ pagination segments in one go.
    const orphanTaxonomyRedirects = [
      { source: `/:lang(${L})/kieli/:rest*`, destination: '/:lang/nettikasinot', permanent: true },
      { source: '/kieli/:rest*', destination: '/fi/nettikasinot', permanent: true },
      { source: `/:lang(${L})/perustettu/:rest*`, destination: '/:lang/nettikasinot', permanent: true },
      { source: '/perustettu/:rest*', destination: '/fi/nettikasinot', permanent: true },
      // WP's default post-category archive
      { source: `/:lang(${L})/category/:rest*`, destination: '/:lang/blogi', permanent: true },
      { source: '/category/:rest*', destination: '/fi/blogi', permanent: true },
    ]

    // Old WP paginated listings (/sivu/2/, /sivu/3/, ...) have no equivalent —
    // the current hub/taxonomy pages load more results in place instead of
    // paginating via the URL — so strip the suffix and land on page 1.
    const HUBS_WITH_TERMS = 'kasinot|talletustavat|kotiutustavat|ohjelmistot|valmistaja|lisenssi|tarjoukset'
    const ALL_HUBS = `${HUBS_WITH_TERMS}|nettikasinot|kasinobonukset|kasinopelit|blogi`
    const paginationRedirects = [
      { source: `/:lang(${L})/:hub(${HUBS_WITH_TERMS})/:term/sivu/:num(\\d+)`, destination: '/:lang/:hub/:term', permanent: true },
      { source: `/:lang(${L})/:hub(${ALL_HUBS})/sivu/:num(\\d+)`, destination: '/:lang/:hub', permanent: true },
      // old hub name, with pagination
      { source: `/:lang(${L})/kaikki-nettikasinot/sivu/:num(\\d+)`, destination: '/:lang/nettikasinot', permanent: true },
    ]

    // Old WP RSS feed URLs (/nettikasinot/[slug]/feed/ etc.) — strip the
    // suffix and let the underlying path resolve (or redirect again) normally.
    const feedRedirects = [
      { source: `/:lang(${L})/nettikasinot/:slug/feed`, destination: '/:lang/nettikasinot/:slug', permanent: true },
      { source: `/:lang(${L})/kasinopelit/:slug/feed`, destination: '/:lang/kasinopelit/:slug', permanent: true },
      { source: `/:lang(${L})/tarjous/:slug/feed`, destination: '/:lang/tarjous/:slug', permanent: true },
      { source: '/tarjous/:slug/feed', destination: '/tarjous/:slug', permanent: true },
    ]

    // Safety net: new-style hub/taxonomy URLs indexed without their /[lang]/
    // prefix (e.g. /kasinot/kryptokasinot/ instead of /fi/kasinot/kryptokasinot/).
    const bareHubFallbackRedirects = [
      { source: `/:hub(${ALL_HUBS})/:rest*`, destination: '/fi/:hub/:rest*', permanent: true },
    ]

    return [
      ...tarjousRedirects,
      ...genericRedirects,
      ...taxonomyRedirects,
      ...legacyPageRedirects,
      ...deadPageRedirects,
      ...deadContentRedirects,
      ...blogRootRedirects,
      ...orphanTaxonomyRedirects,
      ...paginationRedirects,
      ...feedRedirects,
      ...bareHubFallbackRedirects,
    ]
  },
}

export default nextConfig
