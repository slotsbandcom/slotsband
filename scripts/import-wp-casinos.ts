#!/usr/bin/env node
/**
 * WordPress XML → Supabase casino importer
 * Usage: npx tsx scripts/import-wp-casinos.ts
 */

import { XMLParser } from "fast-xml-parser"
import { createClient } from "@supabase/supabase-js"
import * as fs from "fs"
import * as path from "path"

// ── Load .env.local ────────────────────────────────────────────────────────
function loadEnvFile(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, "utf-8")
    for (const line of content.split(/\r?\n/)) {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
      if (!match) continue
      const key = match[1]
      const val = match[2].replace(/^["']|["']$/g, "").trim()
      if (!process.env[key]) process.env[key] = val
    }
  } catch {}
}
loadEnvFile(path.join(process.cwd(), ".env.local"))

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
})

// ── XML file path ──────────────────────────────────────────────────────────
const XML_PATH = path.join(
  process.env.HOME ?? process.env.USERPROFILE ?? "",
  "Downloads",
  "slotsbandcomsuomi.WordPress.2026-07-20.xml"
)

// ── Helpers ────────────────────────────────────────────────────────────────

/** Strip HTML tags, return plain text */
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()
}

/** Parse <ul><li>...</li></ul> HTML into a string[] */
function parseHtmlList(html: string): string[] {
  if (!html) return []
  const items: string[] = []
  const re = /<li[^>]*>([\s\S]*?)<\/li>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    const text = stripHtml(m[1]).trim()
    if (text) items.push(text)
  }
  return items
}

/** Extract the last path segment after /mene/ */
function extractMeneSlug(url: string): string | null {
  const m = url.match(/\/mene\/([^/?#]+)/)
  return m ? m[1] : null
}

/** Build the postmeta lookup map from parsed XML postmeta array.
 *  fast-xml-parser wraps CDATA in { __cdata: "..." } objects — unwrap them. */
function unwrapCdata(v: unknown): string {
  if (v === null || v === undefined) return ""
  if (typeof v === "object" && v !== null && "__cdata" in v) {
    return String((v as Record<string, unknown>)["__cdata"] ?? "")
  }
  return String(v)
}

function buildMeta(postmeta: unknown): Record<string, string> {
  const meta: Record<string, string> = {}
  if (!postmeta) return meta
  const items = Array.isArray(postmeta) ? postmeta : [postmeta]
  for (const pm of items) {
    const key = unwrapCdata(pm?.["wp:meta_key"]).trim()
    const val = unwrapCdata(pm?.["wp:meta_value"])
    if (key) meta[key] = val
  }
  return meta
}

// ── Schema check ───────────────────────────────────────────────────────────

interface ColumnSpec {
  name: string
  type: string
  default?: string
}

const REQUIRED_COLUMNS: ColumnSpec[] = [
  { name: "slug",             type: "text" },
  { name: "name",             type: "text" },
  { name: "is_active",        type: "boolean",       default: "true" },
  { name: "is_featured",      type: "boolean",       default: "false" },
  { name: "rating",           type: "numeric(4,2)" },
  { name: "rating_trust",     type: "numeric(4,2)" },
  { name: "rating_games",     type: "numeric(4,2)" },
  { name: "rating_bonus",     type: "numeric(4,2)" },
  { name: "rating_customer",  type: "numeric(4,2)" },
  { name: "bonus_text",       type: "text" },
  { name: "bonus_terms",      type: "text" },
  { name: "bonus_detailed_tc",type: "text" },
  { name: "pros_fi",          type: "text[]" },
  { name: "cons_fi",          type: "text[]" },
  { name: "review_fi",        type: "text" },
  { name: "excerpt_fi",       type: "text" },
  { name: "affiliate_url",    type: "text" },
  { name: "mene_slug",        type: "text" },
  { name: "button_title",     type: "text" },
  { name: "button_notice",    type: "text" },
  { name: "lang",             type: "text",          default: "'fi'" },
]

async function checkSchema(): Promise<string[]> {
  console.log("\n── Step 3: Schema check ────────────────────────────────────────")
  const missing: string[] = []

  for (const col of REQUIRED_COLUMNS) {
    const { error } = await supabase
      .from("casinos")
      .select(col.name)
      .limit(0)

    // Any error from a simple SELECT means the column doesn't exist
    // (service role bypasses RLS, so permission errors won't occur)
    if (error) {
      missing.push(col.name)
      console.log(`  ✗ MISSING: ${col.name} (${col.type})`)
    } else {
      console.log(`  ✓ OK:      ${col.name}`)
    }
  }

  if (missing.length > 0) {
    console.log("\n── ALTER TABLE SQL to add missing columns ───────────────────────")
    console.log("Run this in the Supabase SQL Editor:\n")
    const lines = missing.map((colName) => {
      const spec = REQUIRED_COLUMNS.find((c) => c.name === colName)!
      const defaultClause = spec.default ? ` DEFAULT ${spec.default}` : ""
      return `  ADD COLUMN IF NOT EXISTS ${colName.padEnd(22)} ${spec.type}${defaultClause}`
    })
    console.log(`ALTER TABLE casinos\n${lines.join(",\n")};\n`)
    console.log("Continuing import — missing columns will be silently skipped.\n")
  } else {
    console.log("\n  ✓ All required columns exist. Proceeding with full import.\n")
  }

  return missing
}

// ── Casino record type ─────────────────────────────────────────────────────

interface CasinoRecord {
  slug: string
  name: string
  is_active: boolean
  is_featured: boolean
  rating: number | null
  rating_trust: number | null
  rating_games: number | null
  rating_bonus: number | null
  rating_customer: number | null
  bonus_text: string | null
  bonus_terms: string | null
  bonus_detailed_tc: string | null
  pros_fi: string[]
  cons_fi: string[]
  review_fi: string | null
  excerpt_fi: string | null
  affiliate_url: string | null
  mene_slug: string | null
  button_title: string | null
  button_notice: string | null
  lang: "fi"
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log("══════════════════════════════════════════════════════════════")
  console.log(" WordPress XML → Supabase Casino Importer")
  console.log("══════════════════════════════════════════════════════════════")

  // ── Step 1: Parse XML ────────────────────────────────────────────────────
  console.log("\n── Step 1: Parsing XML ─────────────────────────────────────────")
  console.log(`File: ${XML_PATH}`)

  if (!fs.existsSync(XML_PATH)) {
    console.error(`\nERROR: File not found: ${XML_PATH}`)
    process.exit(1)
  }

  const xmlContent = fs.readFileSync(XML_PATH, "utf-8")

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    cdataPropName: "__cdata",
    isArray: (name) => ["item", "wp:postmeta", "category"].includes(name),
    parseTagValue: false,
    trimValues: false,
  })

  const parsed = parser.parse(xmlContent)
  const items: unknown[] = parsed?.rss?.channel?.item ?? []

  console.log(`Total items in XML: ${items.length}`)

  // Filter to casino post type only
  const casinoItems = items.filter((item: any) => {
    const postType = item?.["wp:post_type"]?.__cdata ?? item?.["wp:post_type"] ?? ""
    return postType === "casino"
  })

  console.log(`Casino items found: ${casinoItems.length}`)

  // ── Step 3: Schema check ─────────────────────────────────────────────────
  const missingColumns = await checkSchema()
  const missingSet = new Set(missingColumns)

  // ── Step 2: Parse and build records ─────────────────────────────────────
  console.log("── Step 2: Parsing casino data ─────────────────────────────────")

  const records: CasinoRecord[] = []
  let skippedNoSlug = 0

  for (const item of casinoItems as any[]) {
    // Title
    const name: string =
      item?.title?.__cdata ?? item?.title ?? ""

    // Slug
    const slug: string =
      item?.["wp:post_name"]?.__cdata ?? item?.["wp:post_name"] ?? ""

    if (!slug) {
      skippedNoSlug++
      console.log(`  ⚠ SKIP (no slug): "${name}"`)
      continue
    }

    // Status
    const status: string =
      item?.["wp:status"]?.__cdata ?? item?.["wp:status"] ?? "draft"
    const isActive = status === "publish"

    // Content (review HTML)
    const reviewFi: string =
      item?.["content:encoded"]?.__cdata ?? item?.["content:encoded"] ?? ""

    // Excerpt
    const excerptFi: string =
      item?.["excerpt:encoded"]?.__cdata ?? item?.["excerpt:encoded"] ?? ""

    // Postmeta
    const meta = buildMeta(item?.["wp:postmeta"])

    const ratingRaw       = parseFloat(meta["casino_overall_rating"] ?? "")
    const ratingTrustRaw  = parseFloat(meta["casino_rating_trust"]   ?? "")
    const ratingGamesRaw  = parseFloat(meta["casino_rating_games"]   ?? "")
    const ratingBonusRaw  = parseFloat(meta["casino_rating_bonus"]   ?? "")
    const ratingCustomerRaw = parseFloat(meta["casino_rating_customer"] ?? "")

    const affiliateUrl = meta["casino_external_link"] || null
    // Fall back to the casino slug when no affiliate link is set
    const meneSlug = (affiliateUrl ? extractMeneSlug(affiliateUrl) : null) ?? slug

    const prosHtml = meta["casino_pros_desc"] ?? ""
    const consHtml = meta["casino_cons_desc"]  ?? ""

    records.push({
      slug,
      name: name.trim(),
      is_active: isActive,
      is_featured: false,
      rating:          isNaN(ratingRaw)        ? 0    : ratingRaw,
      rating_trust:    isNaN(ratingTrustRaw)   ? null : ratingTrustRaw,
      rating_games:    isNaN(ratingGamesRaw)   ? null : ratingGamesRaw,
      rating_bonus:    isNaN(ratingBonusRaw)   ? null : ratingBonusRaw,
      rating_customer: isNaN(ratingCustomerRaw) ? null : ratingCustomerRaw,
      bonus_text:        meta["casino_short_desc"]    || null,
      bonus_terms:       meta["casino_terms_desc"]    || null,
      bonus_detailed_tc: meta["casino_detailed_tc"]   || null,
      pros_fi: parseHtmlList(prosHtml),
      cons_fi: parseHtmlList(consHtml),
      review_fi:    reviewFi  || null,
      excerpt_fi:   excerptFi || null,
      affiliate_url: affiliateUrl,
      mene_slug:    meneSlug,
      button_title:  meta["casino_button_title"]  || null,
      button_notice: meta["casino_button_notice"] || null,
      lang: "fi",
    })
  }

  console.log(`Records ready to import: ${records.length}`)

  // ── Step 4: Upsert into Supabase ─────────────────────────────────────────
  console.log("\n── Step 4: Importing into Supabase ────────────────────────────")

  let successCount = 0
  let errorCount = 0
  const errors: { name: string; error: string }[] = []

  for (let i = 0; i < records.length; i++) {
    const rec = records[i]
    console.log(`  [${i + 1}/${records.length}] ${rec.name}`)

    // Drop columns that don't exist in the DB to avoid PGRST204 errors
    const payload: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(rec)) {
      if (!missingSet.has(key)) {
        payload[key] = value
      }
    }

    const { error } = await supabase
      .from("casinos")
      .upsert(payload, { onConflict: "slug" })

    if (error) {
      console.log(`    ✗ ERROR: ${error.message}`)
      errorCount++
      errors.push({ name: rec.name, error: error.message })
    } else {
      console.log(`    ✓ OK  ${rec.is_active ? "(publish)" : "(draft)"} — rating: ${rec.rating ?? "—"}, pros: ${rec.pros_fi.length}, cons: ${rec.cons_fi.length}`)
      successCount++
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n══════════════════════════════════════════════════════════════")
  console.log(" Summary")
  console.log("══════════════════════════════════════════════════════════════")
  console.log(`  Total casino items in XML : ${casinoItems.length}`)
  console.log(`  Skipped (no slug)         : ${skippedNoSlug}`)
  console.log(`  Attempted                 : ${records.length}`)
  console.log(`  ✓ Imported successfully   : ${successCount}`)
  console.log(`  ✗ Errors                  : ${errorCount}`)

  if (errors.length > 0) {
    console.log("\n  Error details:")
    for (const e of errors) {
      console.log(`    • ${e.name}: ${e.error}`)
    }
  }

  if (missingColumns.length > 0) {
    console.log(`\n  ⚠ ${missingColumns.length} column(s) were missing and skipped: ${missingColumns.join(", ")}`)
    console.log("  Run the ALTER TABLE SQL above in Supabase Dashboard → SQL Editor,")
    console.log("  then re-run this script to populate those fields.")
  }

  console.log("")
}

main().catch((err) => {
  console.error("Fatal error:", err)
  process.exit(1)
})
