/**
 * parse-taxonomies.mjs
 * Parsează termenii din cele 8 taxonomii + relațiile lor cu posturile casino
 * din exportul WordPress XML.
 *
 * Run: node scripts/parse-taxonomies.mjs
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const XML_PATH = path.join(__dirname, "../data/slotsbandcomsuomi.WordPress.2026-07-24.xml")

const TARGET_TAXONOMIES = new Set([
  "casino-category",
  "bonus-category",
  "deposit-method",
  "withdrawal-method",
  "software",
  "vendor",
  "licence",
  "game-category",
])

// ─── Helper: extract CDATA or text between tags ───────────────────────────────
function extractTag(block, tag) {
  const re = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, "s")
  const m = block.match(re)
  return m ? m[1].trim() : ""
}

function extractAll(block, tag) {
  const re = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, "sg")
  const results = []
  let m
  while ((m = re.exec(block)) !== null) results.push(m[1].trim())
  return results
}

function extractMeta(block, key) {
  // Find <wp:termmeta> blocks and get the value for a specific meta_key
  const metaBlockRe = /<wp:termmeta>(.*?)<\/wp:termmeta>/sg
  let mb
  while ((mb = metaBlockRe.exec(block)) !== null) {
    const metaBlock = mb[1]
    const metaKey = extractTag(metaBlock, "wp:meta_key")
    if (metaKey === key) return extractTag(metaBlock, "wp:meta_value")
  }
  return null
}

// ─── Parse ────────────────────────────────────────────────────────────────────
const xml = fs.readFileSync(XML_PATH, "utf-8")

// 1. Extract all <wp:term> blocks
const termBlocks = []
const termRe = /<wp:term>(.*?)<\/wp:term>/sg
let tm
while ((tm = termRe.exec(xml)) !== null) termBlocks.push(tm[1])

// 2. Parse and filter by target taxonomies
const terms = []
const termById = {}

for (const block of termBlocks) {
  const taxonomy = extractTag(block, "wp:term_taxonomy")
  if (!TARGET_TAXONOMIES.has(taxonomy)) continue

  const termId     = extractTag(block, "wp:term_id")
  const slug       = extractTag(block, "wp:term_slug")
  const name       = extractTag(block, "wp:term_name")
  const parent     = extractTag(block, "wp:term_parent")
  const description = extractTag(block, "wp:term_description")

  const term = { termId, taxonomy, slug, name, parent: parent || null, description: description || null }
  terms.push(term)
  termById[termId] = term
}

// 3. Extract casino posts and their taxonomy associations
// A post item: <item>...</item>
const posts = []
const itemRe = /<item>(.*?)<\/item>/sg
let im
while ((im = itemRe.exec(xml)) !== null) {
  const block   = im[1]
  const postType = extractTag(block, "wp:post_type")
  if (postType !== "casino") continue

  const postId   = extractTag(block, "wp:post_id")
  const postName = extractTag(block, "wp:post_name")   // slug
  const title    = extractTag(block, "title")
  const status   = extractTag(block, "wp:status")

  // Extract <category> elements – these link to taxonomy terms
  const catRe = /<category domain="([^"]+)" nicename="([^"]+)"><!\[CDATA\[(.*?)\]\]><\/category>/g
  const associations = []
  let cm
  while ((cm = catRe.exec(block)) !== null) {
    const domain   = cm[1]  // taxonomy name
    const nicename = cm[2]  // term slug
    const catName  = cm[3]  // term name
    if (TARGET_TAXONOMIES.has(domain)) {
      associations.push({ taxonomy: domain, slug: nicename, name: catName })
    }
  }

  posts.push({ postId, slug: postName, title, status, associations })
}

// ─── Build output ─────────────────────────────────────────────────────────────

// Group terms by taxonomy
const byTaxonomy = {}
for (const t of TARGET_TAXONOMIES) byTaxonomy[t] = []
for (const term of terms) byTaxonomy[term.taxonomy].push(term)

// Build relation map: taxonomy -> term slug -> list of casino slugs
const relations = {}
for (const t of TARGET_TAXONOMIES) relations[t] = {}

for (const post of posts) {
  for (const assoc of post.associations) {
    if (!relations[assoc.taxonomy][assoc.slug]) {
      relations[assoc.taxonomy][assoc.slug] = []
    }
    relations[assoc.taxonomy][assoc.slug].push({ slug: post.slug, title: post.title, status: post.status })
  }
}

// ─── Print report ─────────────────────────────────────────────────────────────

const URL_MAP = {
  "casino-category":  "/kasinot/*",
  "bonus-category":   "/tarjoukset/*",
  "deposit-method":   "/talletustavat/*",
  "withdrawal-method":"/kotiutustavat/*",
  "software":         "/ohjelmistot/*",
  "vendor":           "/valmistaja/*",
  "licence":          "/lisenssi/*",
  "game-category":    "/pelit/*",
}

console.log("\n" + "═".repeat(80))
console.log("  WORDPRESS TAXONOMY IMPORT REPORT")
console.log("  Fișier: slotsbandcomsuomi.WordPress.2026-07-24.xml")
console.log("═".repeat(80))
console.log(`\nTotal termeni în cele 8 taxonomii: ${terms.length}`)
console.log(`Total posturi casino parsate: ${posts.length} (status breakdown mai jos)`)
const statusCounts = {}
for (const p of posts) statusCounts[p.status] = (statusCounts[p.status] ?? 0) + 1
for (const [s, c] of Object.entries(statusCounts)) console.log(`  • ${s}: ${c}`)

for (const taxonomy of TARGET_TAXONOMIES) {
  const list = byTaxonomy[taxonomy]
  console.log(`\n${"─".repeat(80)}`)
  console.log(`  TAXONOMIE: ${taxonomy}  (${list.length} termeni)  →  ${URL_MAP[taxonomy]}`)
  console.log("─".repeat(80))
  console.log(`  ${"ID".padEnd(6)} ${"SLUG".padEnd(35)} ${"NAME".padEnd(30)} PARENT`)
  console.log(`  ${"─".repeat(6)} ${"─".repeat(35)} ${"─".repeat(30)} ${"─".repeat(20)}`)
  for (const t of list.sort((a, b) => a.name.localeCompare(b.name))) {
    const casinoCount = (relations[taxonomy][t.slug] ?? []).length
    const parentDisp = t.parent ?? "—"
    const countStr = casinoCount > 0 ? ` [${casinoCount} cazinouri]` : ""
    console.log(`  ${t.termId.padEnd(6)} ${t.slug.padEnd(35)} ${t.name.padEnd(30)} ${parentDisp}${countStr}`)
    if (t.description) {
      const desc = t.description.replace(/\s+/g, " ").substring(0, 80)
      console.log(`         desc: "${desc}${t.description.length > 80 ? "…" : ""}"`)
    }
  }
}

// ─── Relații detaliate per taxonomie ─────────────────────────────────────────
console.log("\n" + "═".repeat(80))
console.log("  RELAȚII: termeni → cazinouri asociate")
console.log("═".repeat(80))

for (const taxonomy of TARGET_TAXONOMIES) {
  const taxRels = relations[taxonomy]
  const hasAny = Object.values(taxRels).some(arr => arr.length > 0)
  if (!hasAny) continue

  console.log(`\n── ${taxonomy} ──`)
  for (const [slug, casinos] of Object.entries(taxRels).sort()) {
    if (casinos.length === 0) continue
    console.log(`  ${slug} (${casinos.length}): ${casinos.map(c => c.slug || c.title).join(", ")}`)
  }
}

// ─── Sumarul final ────────────────────────────────────────────────────────────
console.log("\n" + "═".repeat(80))
console.log("  SUMAR PER TAXONOMIE")
console.log("═".repeat(80))
console.log(`  ${"TAXONOMIE".padEnd(22)} ${"TERMENI".padEnd(10)} ${"TERMENI CU CAZINOURI".padEnd(25)} PARENT TERMS`)
for (const taxonomy of TARGET_TAXONOMIES) {
  const list = byTaxonomy[taxonomy]
  const withCasinos = list.filter(t => (relations[taxonomy][t.slug] ?? []).length > 0).length
  const withParent  = list.filter(t => t.parent).length
  console.log(`  ${taxonomy.padEnd(22)} ${String(list.length).padEnd(10)} ${String(withCasinos).padEnd(25)} ${withParent}`)
}
console.log("")
