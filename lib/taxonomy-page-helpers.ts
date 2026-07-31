import { notFound } from "next/navigation"
import type { Metadata } from "next"
import type { Lang } from "@/lib/types"
import {
  getTaxonomyTermsWithCounts,
  getTaxonomyTerm,
  getCasinosByTerm,
  getTermSlugsByLang,
  getTermName,
  getTermDescription,
} from "@/lib/supabase/taxonomy-queries"
import { TAXONOMY_CONFIG_BY_TAXONOMY } from "@/lib/taxonomy-config"
import { getPageMeta } from "@/lib/supabase/page-meta"

export const VALID_LANGS: Lang[] = ["fi", "uk", "en"]
export const SITE_URL = "https://slotsband.com"

export function resolveLang(raw: string): Lang {
  return (VALID_LANGS.includes(raw as Lang) ? raw : "fi") as Lang
}

// ─── Index page ───────────────────────────────────────────────────────────────

export async function buildIndexMetadata(taxonomy: string, lang: Lang): Promise<Metadata> {
  const config = TAXONOMY_CONFIG_BY_TAXONOMY[taxonomy]
  if (!config) return {}
  const l = config.labels[lang]
  const { meta_title, meta_description } = await getPageMeta(config.path, lang)
  const title = meta_title || `${l.title} 2026`
  const desc = meta_description || l.subtitle
  return {
    title,
    description: desc,
    alternates: {
      canonical: `${SITE_URL}/${lang}/${config.path}`,
      languages: {
        fi: `${SITE_URL}/fi/${config.path}`,
        en: `${SITE_URL}/en/${config.path}`,
        "en-GB": `${SITE_URL}/uk/${config.path}`,
        "x-default": `${SITE_URL}/fi/${config.path}`,
      },
    },
  }
}

export async function getIndexData(taxonomy: string) {
  return getTaxonomyTermsWithCounts(taxonomy)
}

// ─── Term detail page ─────────────────────────────────────────────────────────

export async function buildTermStaticParams(taxonomy: string) {
  const slugs = await getTermSlugsByLang(taxonomy)
  return slugs.flatMap(({ slug_fi, slug_en, slug_uk }) => [
    { lang: "fi", slug: slug_fi },
    { lang: "en", slug: slug_en },
    { lang: "uk", slug: slug_uk },
  ])
}

export async function buildTermMetadata(
  taxonomy: string,
  lang: Lang,
  slug: string
): Promise<Metadata> {
  const config = TAXONOMY_CONFIG_BY_TAXONOMY[taxonomy]
  const term = await getTaxonomyTerm(taxonomy, slug, lang)
  if (!term || !config) return {}
  const name = getTermName(term, lang)
  const descRaw = getTermDescription(term, lang)
  const desc = descRaw
    ? descRaw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().substring(0, 160)
    : `${name} – ${config.labels[lang].title}`
  const title = `${name} ${config.labels[lang].termSuffix} 2026`
  return {
    title,
    description: desc,
    alternates: {
      canonical: `${SITE_URL}/${lang}/${config.path}/${slug}`,
      languages: {
        fi: `${SITE_URL}/fi/${config.path}/${term.slug_fi}`,
        en: `${SITE_URL}/en/${config.path}/${term.slug_en}`,
        "en-GB": `${SITE_URL}/uk/${config.path}/${term.slug_uk}`,
        "x-default": `${SITE_URL}/fi/${config.path}/${term.slug_fi}`,
      },
    },
  }
}

export async function getTermData(taxonomy: string, slug: string, lang: Lang) {
  const term = await getTaxonomyTerm(taxonomy, slug, lang)
  if (!term) notFound()
  const casinos = await getCasinosByTerm(term.id)
  return { term, casinos }
}
