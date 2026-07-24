/**
 * scripts/import-faq.mjs
 *
 * 1. Checks faq_fi/faq_en/faq_uk columns exist (prints DDL if not)
 * 2. Parses XML → extracts joli_faq_group / joli_faq items
 * 3. For each of the 15 taxonomy_terms with [joli-faq-seo id='XXXX'] shortcodes:
 *    - Builds [{q, a}] array (HTML-decoded answers)
 *    - UPDATEs faq_fi in taxonomy_terms
 *    - Removes the shortcode from description_fi
 *
 * Run: node scripts/import-faq.mjs [--dry-run]
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { createClient } from "@supabase/supabase-js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DRY_RUN = process.argv.includes("--dry-run")

// ─── Load .env.local ──────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(__dirname, "../.env.local")
  if (!fs.existsSync(envPath)) { console.error("❌  .env.local not found"); process.exit(1) }
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const [k, ...rest] = line.split("=")
    if (k && rest.length && !k.startsWith("#")) process.env[k.trim()] = rest.join("=").trim()
  }
}
loadEnv()

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ─── Check columns exist ──────────────────────────────────────────────────────
async function checkColumns() {
  const { error } = await db
    .from("taxonomy_terms")
    .select("faq_fi, faq_en, faq_uk")
    .limit(1)

  if (error && error.message.includes("faq_fi")) {
    console.error("❌  Column faq_fi does not exist yet.")
    console.error("\nRun this DDL in the Supabase Dashboard → SQL Editor:\n")
    console.error(`ALTER TABLE taxonomy_terms
  ADD COLUMN IF NOT EXISTS faq_fi JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS faq_en JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS faq_uk JSONB DEFAULT NULL;`)
    console.error("\nThen re-run this script.\n")
    process.exit(1)
  }
  if (error) { console.error("DB error:", error.message); process.exit(1) }
  console.log("✅  Columns faq_fi / faq_en / faq_uk exist.\n")
}

await checkColumns()

// ─── XML helpers ──────────────────────────────────────────────────────────────
function decodeEntities(str) {
  return str
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
}

function extractCDATA(text) {
  if (!text) return ""
  return text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim()
}

function getTagValueRaw(xml, tag) {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i")
  const m = xml.match(re)
  return m ? m[1].trim() : ""
}

function getTagValue(xml, tag) {
  return extractCDATA(getTagValueRaw(xml, tag))
}

function extractPostmeta(itemXml) {
  const meta = {}
  const re = /<wp:postmeta>([\s\S]*?)<\/wp:postmeta>/gi
  let m
  while ((m = re.exec(itemXml)) !== null) {
    const block = m[1]
    const key = extractCDATA(getTagValueRaw(block, "wp:meta_key"))
    const val = extractCDATA(getTagValueRaw(block, "wp:meta_value"))
    if (!meta[key]) meta[key] = []
    meta[key].push(val)
  }
  return meta
}

/** Parse PHP serialized integer array: a:N:{i:0;i:VAL;i:1;i:VAL2;...} */
function parsePhpIntArray(serialized) {
  const intMatches = [...serialized.matchAll(/i:(\d+)/g)].map(m => m[1])
  // keys are at even indices (0,2,4...), values at odd (1,3,5...)
  const values = []
  for (let i = 1; i < intMatches.length; i += 2) values.push(intMatches[i])
  return values
}

// ─── Parse XML ────────────────────────────────────────────────────────────────
const dataDir = path.join(__dirname, "../data")
const xmlFile = fs.readdirSync(dataDir).find(f => f.endsWith(".xml"))
if (!xmlFile) { console.error("❌  No XML file in data/"); process.exit(1) }

console.log(`📂  Parsing ${xmlFile}...`)
const xml = fs.readFileSync(path.join(dataDir, xmlFile), "utf-8")

const faqGroups = {}   // wpId → { title, faqIds: string[] }
const faqItems  = {}   // wpId → { title (question), content (answer HTML) }

const itemRe = /<item>([\s\S]*?)<\/item>/g
let im
while ((im = itemRe.exec(xml)) !== null) {
  const block = im[1]
  const postType = getTagValue(block, "wp:post_type")
  if (postType !== "joli_faq" && postType !== "joli_faq_group") continue

  const wpId   = getTagValue(block, "wp:post_id")
  const title  = getTagValue(block, "title")
  const content = getTagValue(block, "content:encoded")
  const meta   = extractPostmeta(block)

  if (postType === "joli_faq_group") {
    const faqIds = meta.faqs ? parsePhpIntArray(meta.faqs[0] ?? "") : []
    faqGroups[wpId] = { title, faqIds }
  } else {
    // Decode HTML entities in the content (WP stores it double-encoded in XML)
    faqItems[wpId] = { question: title, answer: decodeEntities(content) }
  }
}

console.log(`    joli_faq_group: ${Object.keys(faqGroups).length}`)
console.log(`    joli_faq:       ${Object.keys(faqItems).length}\n`)

// ─── Fetch taxonomy_terms from DB ─────────────────────────────────────────────
const { data: terms, error: termsErr } = await db
  .from("taxonomy_terms")
  .select("id, taxonomy, slug, name_fi, description_fi")
  .order("taxonomy")

if (termsErr) { console.error("DB error:", termsErr.message); process.exit(1) }

// ─── Find shortcodes ──────────────────────────────────────────────────────────
const SHORTCODE_RE = /\[joli-faq-seo\s+id=['"](\d+)['"]\]/g

const updates = []  // { termId, termName, groupId, faqs: [{q,a}], cleanedDesc }

for (const term of terms) {
  if (!term.description_fi) continue
  const match = term.description_fi.match(/\[joli-faq-seo\s+id=['"](\d+)['"]\]/)
  if (!match) continue

  const groupId = match[1]
  const group = faqGroups[groupId]
  if (!group) {
    console.warn(`⚠️  Group ${groupId} not found in XML for term "${term.name_fi}"`)
    continue
  }

  // Build [{q, a}] array
  const faqs = []
  for (const faqId of group.faqIds) {
    const item = faqItems[faqId]
    if (item) faqs.push({ q: item.question, a: item.answer })
    else console.warn(`  ⚠️  FAQ item ${faqId} not found in XML`)
  }

  // Remove shortcode from description_fi
  const cleanedDesc = term.description_fi
    .replace(/\[joli-faq-seo\s+id=['"][^'"]+['"]\]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

  updates.push({
    termId: term.id,
    termName: term.name_fi,
    slug: term.slug,
    taxonomy: term.taxonomy,
    groupId,
    groupTitle: group.title,
    faqs,
    cleanedDesc,
  })
}

// ─── Preview ──────────────────────────────────────────────────────────────────
console.log("═".repeat(80))
console.log(`Found ${updates.length} terms to update:\n`)

for (const u of updates) {
  console.log(`  [${u.taxonomy}] ${u.termName} (${u.slug})`)
  console.log(`    group_id : ${u.groupId} "${u.groupTitle}"`)
  console.log(`    faqs     : ${u.faqs.length} items`)
  for (const f of u.faqs) {
    console.log(`      Q: ${f.q}`)
    const aText = f.a.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
    console.log(`      A: ${aText.substring(0, 100)}${aText.length > 100 ? "…" : ""}`)
  }
  console.log()
}

if (DRY_RUN) {
  console.log("👆  DRY RUN — no changes written. Remove --dry-run to apply.\n")
  process.exit(0)
}

// ─── Apply updates ────────────────────────────────────────────────────────────
console.log("═".repeat(80))
console.log("⚡  Applying updates...\n")

let ok = 0, fail = 0

for (const u of updates) {
  const { error } = await db
    .from("taxonomy_terms")
    .update({
      faq_fi: u.faqs,
      description_fi: u.cleanedDesc,
    })
    .eq("id", u.termId)

  if (error) {
    console.error(`  ✗ ${u.termName}: ${error.message}`)
    fail++
  } else {
    console.log(`  ✓ ${u.termName} — ${u.faqs.length} FAQs saved, shortcode removed`)
    ok++
  }
}

console.log(`\n✅  Done — ${ok} updated, ${fail} failed.\n`)

// ─── Verification scan ────────────────────────────────────────────────────────
if (fail > 0) process.exit(1)
const { data: verifyTerms } = await db
  .from("taxonomy_terms")
  .select("name_fi, description_fi, faq_fi")
  .not("faq_fi", "is", null)

console.log(`\n📊  Verification: ${verifyTerms?.length ?? 0} terms now have faq_fi data`)

const remaining = (terms ?? []).filter(t =>
  t.description_fi?.includes("[joli-faq-seo")
)
if (remaining.length > 0) {
  console.warn(`⚠️  ${remaining.length} term(s) still have shortcode in description_fi:`)
  for (const t of remaining) console.warn(`    - ${t.name_fi}`)
} else {
  console.log("✅  No [joli-faq-seo] shortcodes remaining in description_fi")
}
