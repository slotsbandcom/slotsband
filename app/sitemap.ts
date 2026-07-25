import type { MetadataRoute } from "next"
import { createClient } from "@supabase/supabase-js"
import { TAXONOMY_CONFIGS } from "@/lib/taxonomy-config"

const SITE_URL = "https://slotsband.com"
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

  // ─── Static pages ──────────────────────────────────────────────────────────
  const staticPaths = [
    "",
    "/nettikasinot",
    "/kasinobonukset",
    "/kasinopelit",
    "/kasinot",
    "/talletustavat",
    "/kotiutustavat",
    "/ohjelmistot",
    "/valmistaja",
    "/lisenssi",
    "/about",
    "/contact",
    "/responsible-gambling",
  ]
  for (const lang of LANGS) {
    for (const path of staticPaths) {
      urls.push({
        url: `${SITE_URL}/${lang}${path}`,
        lastModified: now,
        changeFrequency: path === "" ? "daily" : "weekly",
        priority: path === "" ? 1.0 : path === "/nettikasinot" ? 0.9 : 0.7,
      })
    }
  }

  // ─── Casino pages ──────────────────────────────────────────────────────────
  const { data: casinos } = await db
    .from("casinos")
    .select("slug, updated_at")
    .eq("is_active", true)
  for (const casino of casinos ?? []) {
    for (const lang of LANGS) {
      urls.push({
        url: `${SITE_URL}/${lang}/nettikasinot/${casino.slug}`,
        lastModified: casino.updated_at ? new Date(casino.updated_at) : now,
        changeFrequency: "monthly",
        priority: 0.8,
      })
    }
  }

  // ─── Blog index ────────────────────────────────────────────────────────────
  for (const lang of LANGS) {
    urls.push({
      url: `${SITE_URL}/${lang}/blogi`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    })
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
      urls.push({
        url: `${SITE_URL}/${lang}/${config.path}/${slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
      })
    }
  }

  return urls
}
