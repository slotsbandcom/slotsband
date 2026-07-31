/**
 * import-missing-tarjous-articles.mjs
 *
 * Imports the 4 WP articles that only exist in the XML export (post_type
 * "bonus", never migrated to blog_posts) so their old /tarjous/[slug]/ URLs
 * — now redirecting to a matching slug via TARJOUS_MAP in next.config.mjs —
 * resolve to real content instead of a 404/blank post.
 *
 * Cleanup applied to each article's HTML before insert:
 *  - Strip WP Gutenberg block comments (<!-- wp:... -->)
 *  - Drop <figure class="wp-block-image">...</figure> blocks — the old WP
 *    media (slotsband.com/fi/wp-content/uploads/...) now 403s, so embedding
 *    them would just show broken images
 *  - Rewrite absolute slotsband.com internal links to relative paths
 *  - Unwrap (remove href, keep text) links to third-party competitor/PBN
 *    domains found in the source content (bonusetu.com, herrabonus.com,
 *    verkkopankkicasino.com, paysafecardcasino.fi) — no reason to leak SEO
 *    equity to competitor gambling-comparison sites. Trusted authority
 *    links (finanssivalvonta.fi, kuluttajaliitto.fi) are kept as-is.
 *
 * Run: node scripts/import-missing-tarjous-articles.mjs [--dry-run]
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { createClient } from "@supabase/supabase-js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function loadEnv() {
  const envPath = path.join(__dirname, "../.env.local")
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const [k, ...rest] = line.split("=")
    if (k && rest.length && !k.startsWith("#")) process.env[k.trim()] = rest.join("=").trim()
  }
}
loadEnv()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const XML_PATH = path.join(__dirname, "../data/slotsbandcomsuomi.WordPress.2026-07-24.xml")
const DRY_RUN = process.argv.includes("--dry-run")

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const COMPETITOR_DOMAINS = ["bonusetu.com", "herrabonus.com", "verkkopankkicasino.com", "paysafecardcasino.fi"]

const ARTICLES = [
  {
    slug: "kasinobonukset-2026-nain-valitset-itsellesi-parhaan-bonuksen",
    metaDescription:
      "Opas kasinobonusten valintaan: talletusbonus, non-sticky-bonus ja ilmaiskierrokset vertailussa. Näin luet bonusehdot ja vältät yleisimmät sudenkuopat.",
  },
  {
    slug: "kryptokasinot-yleistyvat-mita-pelaajan-kannattaa-tietaa-ennen-talletusta",
    metaDescription:
      "Kryptokasinot yleistyvät nettipelaamisessa. Näin krypto-talletukset ja -kotiutukset toimivat, ja mitä pelaajan kannattaa tarkistaa ennen ensimmäistä siirtoa.",
  },
  {
    slug: "miksi-verkkopankki-kasinot-ovat-suosittuja",
    metaDescription:
      "Verkkopankki kasinot ovat suosittuja nopeiden talletusten ja kotiutusten ansiosta. Trustly, Brite ja Zimpler mahdollistavat turvallisen pelaamisen myös mobiilissa.",
  },
  {
    slug: "paysafecard-maksutavan-plussat-ja-miinukset",
    metaDescription:
      "Paysafecard on suosittu prepaid-maksutapa nettikasinoilla. Vertailussa maksutavan plussat ja miinukset — yksityisyys, budjetin hallinta ja kotiutusrajoitukset.",
  },
]

function extractTag(block, tag) {
  const re = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, "s")
  const m = block.match(re)
  return m ? m[1].trim() : ""
}

function cleanContent(raw) {
  let html = raw
    // Strip Gutenberg block comment markers
    .replace(/<!--\s*\/?wp:[^>]*-->/g, "")
    // Drop dead-image figure blocks entirely
    .replace(/<figure class="wp-block-image[^"]*">[\s\S]*?<\/figure>/g, "")
    // Rewrite absolute internal links to relative paths
    .replace(/https?:\/\/(?:www\.)?slotsband\.com(\/[^"'\s]*)/g, (_m, p1) => p1.replace(/\/$/, ""))

  // Unwrap links to competitor domains: <a href="https://competitor.com/...">text</a> -> text
  for (const domain of COMPETITOR_DOMAINS) {
    const re = new RegExp(`<a[^>]*href="https?://(?:www\\.)?${domain.replace(/\./g, "\\.")}[^"]*"[^>]*>([\\s\\S]*?)<\\/a>`, "g")
    html = html.replace(re, "$1")
  }

  // Collapse excessive blank lines left behind by comment/figure removal
  html = html.replace(/\n{3,}/g, "\n\n").trim()
  return html
}

async function main() {
  const xml = fs.readFileSync(XML_PATH, "utf-8")
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) || []

  const rows = []
  for (const art of ARTICLES) {
    const it = items.find((i) => {
      const nm = i.match(/<wp:post_name><!\[CDATA\[(.*?)\]\]><\/wp:post_name>/)
      const pt = i.match(/<wp:post_type><!\[CDATA\[(.*?)\]\]><\/wp:post_type>/)
      return nm && nm[1] === art.slug && pt && pt[1] === "bonus"
    })
    if (!it) {
      console.error(`NOT FOUND in XML: ${art.slug}`)
      continue
    }

    const title = extractTag(it, "title")
    const postDate = extractTag(it, "wp:post_date")
    const contentMatch = it.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/)
    const rawContent = contentMatch ? contentMatch[1] : ""
    const content = cleanContent(rawContent)

    rows.push({
      slug_fi: art.slug,
      slug_en: art.slug,
      slug_uk: art.slug,
      title_fi: title,
      content_fi: content,
      excerpt_fi: art.metaDescription,
      meta_title_fi: title,
      meta_description_fi: art.metaDescription,
      published_at: new Date(postDate.replace(" ", "T") + "Z").toISOString(),
      is_active: true,
    })
  }

  console.log(`Parsed ${rows.length}/${ARTICLES.length} articles from XML.\n`)
  for (const r of rows) {
    console.log(`— ${r.slug_fi}`)
    console.log(`  title: ${r.title_fi}`)
    console.log(`  content length: ${r.content_fi.length} chars`)
    console.log(`  meta_description: ${r.meta_description_fi}`)
    console.log()
  }

  if (DRY_RUN) {
    console.log("DRY RUN — no writes. Pass without --dry-run to insert.\n")
    return
  }

  const { data: existing } = await supabase
    .from("blog_posts")
    .select("slug_fi")
    .in("slug_fi", rows.map((r) => r.slug_fi))

  const existingSlugs = new Set((existing ?? []).map((r) => r.slug_fi))
  const toInsert = rows.filter((r) => !existingSlugs.has(r.slug_fi))
  const toSkip = rows.filter((r) => existingSlugs.has(r.slug_fi))

  if (toSkip.length) console.log("Already present, skipping:", toSkip.map((r) => r.slug_fi))

  if (toInsert.length === 0) {
    console.log("Nothing new to insert.")
    return
  }

  const { data, error } = await supabase.from("blog_posts").insert(toInsert).select("slug_fi, id")
  if (error) {
    console.error("Insert failed:", error.message)
    process.exit(1)
  }
  console.log(`Inserted ${data.length} article(s):`, data.map((r) => r.slug_fi))
}

main().catch((e) => {
  console.error("Fatal:", e.message)
  process.exit(1)
})
