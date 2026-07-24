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

  // ─── Taxonomy term pages ───────────────────────────────────────────────────
  const ACTIVE_TAXONOMIES = TAXONOMY_CONFIGS.map((c) => c.taxonomy)
  const { data: terms } = await db
    .from("taxonomy_terms")
    .select("taxonomy, slug")
    .in("taxonomy", ACTIVE_TAXONOMIES)
    .eq("is_active", true)

  for (const term of terms ?? []) {
    const config = TAXONOMY_CONFIGS.find((c) => c.taxonomy === term.taxonomy)
    if (!config) continue
    for (const lang of LANGS) {
      urls.push({
        url: `${SITE_URL}/${lang}/${config.path}/${term.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
      })
    }
  }

  return urls
}
