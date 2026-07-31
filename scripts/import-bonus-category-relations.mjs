/**
 * import-bonus-category-relations.mjs
 *
 * Populează casino_taxonomy_terms pentru taxonomia bonus-category, care a fost
 * omisă intenționat de import-taxonomies.mjs (SKIP_CASINO_RELATIONS).
 *
 * În WP, bonus-category era atribuită postului custom "bonus" (nu direct
 * cazinoului). Legătura bonus -> cazino se face prin postmeta
 * "bonus_parent_casino" (serialized PHP array cu un WP post ID), sau, când
 * lipsește, prin potrivirea numelui de cazino din titlul bonusului.
 *
 * Run: node scripts/import-bonus-category-relations.mjs [--dry-run]
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

function extractTag(block, tag) {
  const re = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, "s")
  const m = block.match(re)
  return m ? m[1].trim() : ""
}

const xml = fs.readFileSync(XML_PATH, "utf-8")
const items = xml.match(/<item>[\s\S]*?<\/item>/g) || []

// ─── Cazinouri din XML: wp post id -> slug + nume ─────────────────────────────
const casinoById = new Map()
for (const it of items) {
  if (!/<wp:post_type><!\[CDATA\[casino\]\]><\/wp:post_type>/.test(it)) continue
  const id = extractTag(it, "wp:post_id")
  const slug = extractTag(it, "wp:post_name")
  const title = extractTag(it, "title")
  casinoById.set(id, { slug, title })
}

// Nume normalizat pentru matching pe titlu bonus
function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
}
const casinoByNormName = new Map()
for (const { slug, title } of casinoById.values()) {
  const key = normalize(title.replace(/\s*casino\s*$/i, ""))
  if (key) casinoByNormName.set(key, slug)
}

// ─── Posturi bonus din XML ─────────────────────────────────────────────────────
const bonusPosts = items.filter((it) =>
  /<wp:post_type><!\[CDATA\[bonus\]\]><\/wp:post_type>/.test(it)
)

const resolved = [] // { casinoSlug, termSlug, source }
const unresolved = []

for (const it of bonusPosts) {
  const title = extractTag(it, "title")
  const cats = [...it.matchAll(/<category domain="bonus-category" nicename="([^"]+)"/g)].map(
    (m) => m[1]
  )
  if (cats.length === 0) continue

  let casinoSlug = null
  let source = null

  const parentMeta = it.match(
    /<wp:meta_key><!\[CDATA\[bonus_parent_casino\]\]><\/wp:meta_key>\s*<wp:meta_value><!\[CDATA\[([\s\S]*?)\]\]><\/wp:meta_value>/
  )
  if (parentMeta) {
    const idMatch = parentMeta[1].match(/s:\d+:"(\d+)"/)
    if (idMatch && casinoById.has(idMatch[1])) {
      casinoSlug = casinoById.get(idMatch[1]).slug
      source = "postmeta"
    }
  }

  if (!casinoSlug) {
    // Fallback: match casino name against the start of the bonus title
    // e.g. "Wheelz Casino: 20 ilmaiskierrosta ilman talletusta" -> "wheelz"
    const titlePrefix = title.split(/[:\-–]/)[0]
    const key = normalize(titlePrefix.replace(/\s*casino\s*$/i, ""))
    if (casinoByNormName.has(key)) {
      casinoSlug = casinoByNormName.get(key)
      source = "title-match"
    }
  }

  if (!casinoSlug) {
    unresolved.push({ title, cats })
    continue
  }

  for (const termSlug of cats) {
    resolved.push({ casinoSlug, termSlug, source, title })
  }
}

console.log(`\nTotal posturi bonus: ${bonusPosts.length}`)
console.log(`Relații rezolvate: ${resolved.length}  (postmeta: ${resolved.filter(r => r.source === "postmeta").length}, title-match: ${resolved.filter(r => r.source === "title-match").length})`)
console.log(`Bonusuri nerezolvate: ${unresolved.length}`)
for (const u of unresolved) console.log(`  ⚠️  "${u.title}" (${u.cats.join(", ")})`)

console.log("\n── Relații găsite ──")
for (const r of resolved) {
  console.log(`  [${r.source}] ${r.casinoSlug}  ×  ${r.termSlug}   ("${r.title}")`)
}

async function main() {
  const { data: casinos } = await supabase.from("casinos").select("id, slug")
  const casinoIdBySlug = new Map((casinos ?? []).map((c) => [c.slug, c.id]))

  const { data: terms } = await supabase
    .from("taxonomy_terms")
    .select("id, slug_fi")
    .eq("taxonomy", "bonus-category")
  const termIdBySlug = new Map((terms ?? []).map((t) => [t.slug_fi, t.id]))

  const pairs = []
  const missing = []
  for (const r of resolved) {
    const casinoId = casinoIdBySlug.get(r.casinoSlug)
    const termId = termIdBySlug.get(r.termSlug)
    if (!casinoId) { missing.push(`cazino lipsă în DB: ${r.casinoSlug}`); continue }
    if (!termId) { missing.push(`termen lipsă în DB: ${r.termSlug}`); continue }
    pairs.push({ casino_id: casinoId, term_id: termId })
  }

  const seen = new Set()
  const uniquePairs = pairs.filter((p) => {
    const k = `${p.casino_id}::${p.term_id}`
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })

  console.log(`\nPerechi unice cazino↔termen de inserat: ${uniquePairs.length}`)
  if (missing.length) {
    console.log(`Avertismente (${new Set(missing).size} unice):`)
    for (const m of new Set(missing)) console.log(`  • ${m}`)
  }

  if (DRY_RUN) {
    console.log("\nDRY RUN — nicio scriere în DB\n")
    return
  }

  const { data: existingRels } = await supabase
    .from("casino_taxonomy_terms")
    .select("casino_id, term_id")
    .in("term_id", [...termIdBySlug.values()])
  const existingSet = new Set((existingRels ?? []).map((r) => `${r.casino_id}::${r.term_id}`))

  const newPairs = uniquePairs.filter((p) => !existingSet.has(`${p.casino_id}::${p.term_id}`))
  console.log(`Relații noi de inserat: ${newPairs.length}`)

  if (newPairs.length > 0) {
    const { error } = await supabase.from("casino_taxonomy_terms").insert(newPairs)
    if (error) {
      console.error("Eroare insert:", error.message)
      process.exit(1)
    }
  }
  console.log("Import complet.\n")
}

main().catch((e) => {
  console.error("Fatal:", e.message)
  process.exit(1)
})
