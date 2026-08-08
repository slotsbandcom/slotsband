import type { MetadataRoute } from "next"
import { createClient } from "@supabase/supabase-js"
import { TAXONOMY_CONFIGS } from "@/lib/taxonomy-config"

const SITE_URL = "https://www.slotsband.com"
const LANGS = ["fi", "en", "uk"]

function buildClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export const revalidate = 86400

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = buildClient()
  const urls: MetadataRoute.Sitemap = []
  const now = new Date()

  // ─── Homepage ──────────────────────────────────────────────────────────────
  for (const lang of LANGS) {
    urls.push({ url: `${SITE_URL}/${lang}`, lastModified: now, changeFrequency: "daily", priority: 1.0 })
  }

  // ─── Code route hub pages (slugs from DB, per lang) ───────────────────────
  const { data: codeRoutes } = await db
    .from("pages")
    .select("lang, slug, route_key")
    .eq("is_code_route", true)
    .eq("is_published", true)
    .not("route_key", "is", null)

  const codeRoutePriority: Record<string, number> = {
    nettikasinot: 0.9,
    kasinobonukset: 0.8,
    kasinopelit: 0.8,
    blogi: 0.7,
  }

  for (const row of codeRoutes ?? []) {
    if (row.route_key === "home") continue // homepage already added above
    urls.push({
      url: `${SITE_URL}/${row.lang}/${row.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: codeRoutePriority[row.route_key as string] ?? 0.7,
    })
  }

  // ─── Static (non-code) pages ───────────────────────────────────────────────
  const staticPaths = ["/about", "/contact", "/responsible-gambling"]
  for (const lang of LANGS) {
    for (const path of staticPaths) {
      urls.push({ url: `${SITE_URL}/${lang}${path}`, lastModified: now, changeFrequency: "weekly", priority: 0.5 })
    }
  }

  // ─── Casino pages ──────────────────────────────────────────────────────────
  const { data: casinos } = await db
    .from("casinos")
    .select("slug, updated_at")
    .eq("is_active", true)

  // Build per-lang casino slug from code route slugs
  const casinoSlugByLang: Record<string, string> = {}
  for (const row of codeRoutes ?? []) {
    if (row.route_key === "nettikasinot") casinoSlugByLang[row.lang as string] = row.slug as string
  }

  for (const casino of casinos ?? []) {
    for (const lang of LANGS) {
      const casinoBase = casinoSlugByLang[lang] || "nettikasinot"
      urls.push({
        url: `${SITE_URL}/${lang}/${casinoBase}/${casino.slug}`,
        lastModified: casino.updated_at ? new Date(casino.updated_at) : now,
        changeFrequency: "monthly",
        priority: 0.8,
      })
    }
  }

  // ─── Blog posts ────────────────────────────────────────────────────────────
  const { data: blogPosts } = await db
    .from("blog_posts")
    .select("slug_fi, slug_en, slug_uk, published_at")
    .eq("is_active", true)

  for (const post of blogPosts ?? []) {
    const slugs: Record<string, string> = {
      fi: post.slug_fi,
      en: post.slug_en ?? post.slug_fi,
      uk: post.slug_uk ?? post.slug_fi,
    }
    for (const lang of LANGS) {
      urls.push({
        url: `${SITE_URL}/${lang}/${slugs[lang]}`,
        lastModified: post.published_at ? new Date(post.published_at) : now,
        changeFrequency: "monthly",
        priority: 0.6,
      })
    }
  }

  // ─── Taxonomy term pages ───────────────────────────────────────────────────
  const ACTIVE_TAXONOMIES = TAXONOMY_CONFIGS.map((c) => c.taxonomy)
  const { data: terms } = await db
    .from("taxonomy_terms")
    .select("taxonomy, slug_fi, slug_en, slug_uk")
    .in("taxonomy", ACTIVE_TAXONOMIES)
    .eq("is_active", true)

  // Build per-lang taxonomy index slugs from code routes
  const taxRouteKeyMap: Record<string, string> = {
    "casino-category": "kasinot",
    "deposit-method": "talletustavat",
    "withdrawal-method": "kotiutustavat",
    "software": "ohjelmistot",
    "vendor": "valmistaja",
    "licence": "lisenssi",
  }
  const taxSlugByLangAndTax: Record<string, Record<string, string>> = {}
  for (const row of codeRoutes ?? []) {
    const routeKey = row.route_key as string
    for (const [tax, rk] of Object.entries(taxRouteKeyMap)) {
      if (rk === routeKey) {
        if (!taxSlugByLangAndTax[tax]) taxSlugByLangAndTax[tax] = {}
        taxSlugByLangAndTax[tax][row.lang as string] = row.slug as string
      }
    }
  }

  const LANG_SLUG: Record<string, "slug_fi" | "slug_en" | "slug_uk"> = {
    fi: "slug_fi",
    en: "slug_en",
    uk: "slug_uk",
  }

  for (const term of terms ?? []) {
    const config = TAXONOMY_CONFIGS.find((c) => c.taxonomy === term.taxonomy)
    if (!config) continue
    for (const lang of LANGS) {
      const slug = term[LANG_SLUG[lang]]
      const indexSlug = taxSlugByLangAndTax[term.taxonomy]?.[lang] || config.path
      urls.push({
        url: `${SITE_URL}/${lang}/${indexSlug}/${slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
      })
    }
  }

  return urls
}
