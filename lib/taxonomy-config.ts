import type { Lang } from "@/lib/types"

export interface TaxonomyLabels {
  title: string
  subtitle: string
  crumb: string
  countUnit: string
  noCasinos: string
  termSuffix: string
}

export interface TaxonomyConfig {
  taxonomy: string
  path: string
  icon: string
  labels: Record<Lang, TaxonomyLabels>
}

export const TAXONOMY_CONFIGS: TaxonomyConfig[] = [
  {
    taxonomy: "casino-category",
    path: "kasinot",
    icon: "category",
    labels: {
      fi: {
        title: "Kasinokategoriat",
        subtitle: "Selaa nettikasinoita kategorian mukaan ja löydä sinulle sopivin kasino.",
        crumb: "Kasinokategoriat",
        countUnit: "kasino",
        noCasinos: "Tälle kategorialle ei ole vielä listattu kasinoita.",
        termSuffix: "Kasinot",
      },
      en: {
        title: "Casino Categories",
        subtitle: "Browse online casinos by category and find the right one for you.",
        crumb: "Casino Categories",
        countUnit: "casino",
        noCasinos: "No casinos listed for this category yet.",
        termSuffix: "Casinos",
      },
      uk: {
        title: "Casino Categories",
        subtitle: "Browse online casinos by category and find the right one for you.",
        crumb: "Casino Categories",
        countUnit: "casino",
        noCasinos: "No casinos listed for this category yet.",
        termSuffix: "Casinos",
      },
    },
  },
  {
    taxonomy: "deposit-method",
    path: "talletustavat",
    icon: "payments",
    labels: {
      fi: {
        title: "Talletustavat",
        subtitle: "Vertaa kasinoita talletustavan mukaan – löydä kasino joka tukee suosikkimaksutapaasi.",
        crumb: "Talletustavat",
        countUnit: "kasino",
        noCasinos: "Tälle talletustavalle ei ole vielä listattu kasinoita.",
        termSuffix: "Kasinot",
      },
      en: {
        title: "Deposit Methods",
        subtitle: "Compare casinos by deposit method – find a casino that supports your preferred payment option.",
        crumb: "Deposit Methods",
        countUnit: "casino",
        noCasinos: "No casinos listed for this deposit method yet.",
        termSuffix: "Casinos",
      },
      uk: {
        title: "Deposit Methods",
        subtitle: "Compare casinos by deposit method – find a casino that supports your preferred payment option.",
        crumb: "Deposit Methods",
        countUnit: "casino",
        noCasinos: "No casinos listed for this deposit method yet.",
        termSuffix: "Casinos",
      },
    },
  },
  {
    taxonomy: "withdrawal-method",
    path: "kotiutustavat",
    icon: "account_balance_wallet",
    labels: {
      fi: {
        title: "Kotiutustavat",
        subtitle: "Löydä kasino haluamallasi kotiutustavalla – nopeat ja turvalliset kotiutukset.",
        crumb: "Kotiutustavat",
        countUnit: "kasino",
        noCasinos: "Tälle kotiutustavalle ei ole vielä listattu kasinoita.",
        termSuffix: "Kasinot",
      },
      en: {
        title: "Withdrawal Methods",
        subtitle: "Find a casino with your preferred withdrawal method – fast and secure payouts.",
        crumb: "Withdrawal Methods",
        countUnit: "casino",
        noCasinos: "No casinos listed for this withdrawal method yet.",
        termSuffix: "Casinos",
      },
      uk: {
        title: "Withdrawal Methods",
        subtitle: "Find a casino with your preferred withdrawal method – fast and secure payouts.",
        crumb: "Withdrawal Methods",
        countUnit: "casino",
        noCasinos: "No casinos listed for this withdrawal method yet.",
        termSuffix: "Casinos",
      },
    },
  },
  {
    taxonomy: "software",
    path: "ohjelmistot",
    icon: "sports_esports",
    labels: {
      fi: {
        title: "Peliohjelmistot",
        subtitle: "Tutustu peliohjelmistontarjoajiin ja löydä kasino suosikkistudioltasi.",
        crumb: "Peliohjelmistot",
        countUnit: "kasino",
        noCasinos: "Tälle ohjelmistolle ei ole vielä listattu kasinoita.",
        termSuffix: "Kasinot",
      },
      en: {
        title: "Casino Software",
        subtitle: "Explore game software providers and find a casino featuring your favourite studio.",
        crumb: "Casino Software",
        countUnit: "casino",
        noCasinos: "No casinos listed for this software yet.",
        termSuffix: "Casinos",
      },
      uk: {
        title: "Casino Software",
        subtitle: "Explore game software providers and find a casino featuring your favourite studio.",
        crumb: "Casino Software",
        countUnit: "casino",
        noCasinos: "No casinos listed for this software yet.",
        termSuffix: "Casinos",
      },
    },
  },
  {
    taxonomy: "vendor",
    path: "valmistaja",
    icon: "extension",
    labels: {
      fi: {
        title: "Pelivalmistajat",
        subtitle: "Tutustu pelintarjoajiin ja heidän parhaisiin peleihinsa.",
        crumb: "Pelivalmistajat",
        countUnit: "kasino",
        noCasinos: "Kasinot tähän valmistajaan tulossa pian.",
        termSuffix: "Kasinot",
      },
      en: {
        title: "Game Vendors",
        subtitle: "Explore game vendors and their best titles.",
        crumb: "Game Vendors",
        countUnit: "casino",
        noCasinos: "Casinos for this vendor coming soon.",
        termSuffix: "Casinos",
      },
      uk: {
        title: "Game Vendors",
        subtitle: "Explore game vendors and their best titles.",
        crumb: "Game Vendors",
        countUnit: "casino",
        noCasinos: "Casinos for this vendor coming soon.",
        termSuffix: "Casinos",
      },
    },
  },
  {
    taxonomy: "licence",
    path: "lisenssi",
    icon: "verified",
    labels: {
      fi: {
        title: "Kasinolicenssit",
        subtitle: "Vertaa kasinoita lisenssin perusteella – pelaa turvallisesti säännellyissä kasinoissa.",
        crumb: "Kasinolicenssit",
        countUnit: "kasino",
        noCasinos: "Tälle lisenssille ei ole vielä listattu kasinoita.",
        termSuffix: "Kasinot",
      },
      en: {
        title: "Casino Licences",
        subtitle: "Compare casinos by licence – play safely at regulated casinos.",
        crumb: "Casino Licences",
        countUnit: "casino",
        noCasinos: "No casinos listed for this licence yet.",
        termSuffix: "Casinos",
      },
      uk: {
        title: "Casino Licences",
        subtitle: "Compare casinos by licence – play safely at regulated casinos.",
        crumb: "Casino Licences",
        countUnit: "casino",
        noCasinos: "No casinos listed for this licence yet.",
        termSuffix: "Casinos",
      },
    },
  },
]

export const TAXONOMY_CONFIG_BY_TAXONOMY: Record<string, TaxonomyConfig> = Object.fromEntries(
  TAXONOMY_CONFIGS.map((c) => [c.taxonomy, c])
)

export const TAXONOMY_CONFIG_BY_PATH: Record<string, TaxonomyConfig> = Object.fromEntries(
  TAXONOMY_CONFIGS.map((c) => [c.path, c])
)
