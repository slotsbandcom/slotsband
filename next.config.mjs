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
  ['kasinobonukset-2026-nain-valitset-itsellesi-parhaan-bonuksen',              'kasinobonukset'],
  ['kryptokasinot-yleistyvat-mita-pelaajan-kannattaa-tietaa-ennen-talletusta',  'nettikasinot'],
  ['legendplay-casino-1000e-bonuksia-50-ilmaiskierrosta',                       'nettikasinot/legendplay-casino'],
  ['lilibet-casino-50e-ilmaisveto',                                             'kasinobonukset'],
  ['malina-casino-500-bonus-200-ilmaiskierrosta',                               'nettikasinot/malina-casino'],
  ['miksi-verkkopankki-kasinot-ovat-suosittuja',                                'nettikasinot'],
  ['miten-pelaaminen-ilman-rekisteroitymista-oikeasti-toimii-pankkitunnuksilla','nettikasinot'],
  ['nain-revolut-toimii-nettikasinoilla',                                        'nettikasinot'],
  ['neon54-casino-100-bonus-500e-asti-100-ilmaiskierrosta',                     'nettikasinot/neon54-casino'],
  ['onecasino-com',                                                              'nettikasinot/onecasino'],
  ['onnela-casino-10-cashback-joka-paiva',                                       'nettikasinot/onnela-casino'],
  ['paysafecard-maksutavan-plussat-ja-miinukset',                               'nettikasinot'],
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

    return [...tarjousRedirects, ...genericRedirects]
  },
}

export default nextConfig
