/**
 * scripts/scan-external-links.mjs
 *
 * SCAN ONLY — no writes to DB.
 *
 * Finds all external <a href="..."> tags in:
 *   - taxonomy_terms: description_fi, description_en, description_uk
 *   - casinos: review_fi, review_en, review_uk
 *
 * External = href doesn't start with "/" AND doesn't contain slotsband.com
 *            AND doesn't contain slotsband.vercel.app
 *
 * Run: node scripts/scan-external-links.mjs
 * After confirmation: node scripts/scan-external-links.mjs --apply
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { createClient } from "@supabase/supabase-js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const APPLY = process.argv.includes("--apply")

// ─── Load .env.local ──────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(__dirname, "../.env.local")
  if (!fs.existsSync(envPath)) {
    console.error("❌  .env.local not found")
    process.exit(1)
  }
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const [k, ...rest] = line.split("=")
    if (k && rest.length && !k.startsWith("#"))
      process.env[k.trim()] = rest.join("=").trim()
  }
}
loadEnv()

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns true if the href is an external link we want to strip */
function isExternal(href) {
  if (!href) return false
  if (href.startsWith("/")) return false               // relative path
  if (href.startsWith("#")) return false               // anchor
  if (href.startsWith("mailto:")) return false         // email
  if (href.includes("slotsband.com")) return false     // our domain
  if (href.includes("slotsband.vercel.app")) return false
  return true
}

/**
 * Find all <a href="...">...</a> in html where href is external.
 * Returns array of { href, anchorText, fullMatch }
 */
function findExternalLinks(html) {
  if (!html) return []
  const results = []
  // Matches <a ...href="..."...>content</a> — handles single and double quotes
  const re = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi
  let m
  while ((m = re.exec(html)) !== null) {
    const attrs = m[1]
    const anchorText = m[2].replace(/<[^>]+>/g, "").trim() // strip nested tags
    const hrefMatch = attrs.match(/href=["']([^"']*?)["']/i)
    if (!hrefMatch) continue
    const href = hrefMatch[1]
    if (isExternal(href)) {
      results.push({ href, anchorText, fullMatch: m[0] })
    }
  }
  return results
}

/**
 * Strip all external <a> tags from html, keeping anchor text.
 * Returns { cleaned, count }
 */
function stripExternalLinks(html) {
  if (!html) return { cleaned: html, count: 0 }
  let count = 0
  const re = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi
  const cleaned = html.replace(re, (fullMatch, attrs, inner) => {
    const hrefMatch = attrs.match(/href=["']([^"']*?)["']/i)
    if (!hrefMatch) return fullMatch
    const href = hrefMatch[1]
    if (isExternal(href)) {
      count++
      return inner // keep anchor text, drop the <a> tag
    }
    return fullMatch
  })
  return { cleaned, count }
}

// ─── Scan taxonomy_terms ──────────────────────────────────────────────────────

async function scanTaxonomyTerms() {
  const { data: terms, error } = await db
    .from("taxonomy_terms")
    .select("id, taxonomy, slug, name_fi, description_fi, description_en, description_uk")
    .order("taxonomy")

  if (error) { console.error("taxonomy_terms fetch error:", error.message); return [] }

  const hits = []
  for (const term of terms ?? []) {
    for (const col of ["description_fi", "description_en", "description_uk"]) {
      const links = findExternalLinks(term[col])
      for (const link of links) {
        hits.push({
          table: "taxonomy_terms",
          id: term.id,
          label: `[${term.taxonomy}] ${term.name_fi} (${term.slug})`,
          column: col,
          href: link.href,
          anchorText: link.anchorText,
          fullMatch: link.fullMatch,
        })
      }
    }
  }
  return hits
}

// ─── Scan casinos ─────────────────────────────────────────────────────────────

async function scanCasinos() {
  const { data: casinos, error } = await db
    .from("casinos")
    .select("id, name, slug, review_fi, review_en, review_uk")
    .order("name")

  if (error) { console.error("casinos fetch error:", error.message); return [] }

  const hits = []
  for (const casino of casinos ?? []) {
    for (const col of ["review_fi", "review_en", "review_uk"]) {
      const links = findExternalLinks(casino[col])
      for (const link of links) {
        hits.push({
          table: "casinos",
          id: casino.id,
          label: `${casino.name} (${casino.slug})`,
          column: col,
          href: link.href,
          anchorText: link.anchorText,
          fullMatch: link.fullMatch,
        })
      }
    }
  }
  return hits
}

// ─── Apply: UPDATE rows ───────────────────────────────────────────────────────

async function applyFixes(hits) {
  // Group by table + id so we fetch each row only once and apply all column fixes
  const byRow = {}
  for (const hit of hits) {
    const key = `${hit.table}::${hit.id}`
    if (!byRow[key]) byRow[key] = { table: hit.table, id: hit.id, columns: new Set() }
    byRow[key].columns.add(hit.column)
  }

  // For each affected row, re-fetch all HTML columns, strip links, update
  let updatedRows = 0
  let updatedLinks = 0

  for (const { table, id, columns } of Object.values(byRow)) {
    const colList = [...columns]

    const { data: row, error: fetchErr } = await db
      .from(table)
      .select(["id", ...colList].join(","))
      .eq("id", id)
      .single()

    if (fetchErr || !row) {
      console.error(`  ✗ fetch ${table}/${id}:`, fetchErr?.message)
      continue
    }

    const patch = {}
    let rowLinkCount = 0
    for (const col of colList) {
      const { cleaned, count } = stripExternalLinks(row[col])
      if (count > 0) {
        patch[col] = cleaned
        rowLinkCount += count
      }
    }

    if (Object.keys(patch).length === 0) continue

    const { error: updateErr } = await db.from(table).update(patch).eq("id", id)
    if (updateErr) {
      console.error(`  ✗ update ${table}/${id}:`, updateErr.message)
    } else {
      updatedRows++
      updatedLinks += rowLinkCount
      console.log(`  ✓ ${table} · ${id} · stripped ${rowLinkCount} link(s) from [${colList.join(", ")}]`)
    }
  }

  console.log(`\n✅  Done — ${updatedLinks} external links removed across ${updatedRows} rows.`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🔍  Scanning for external links...\n")

  const [taxHits, casinoHits] = await Promise.all([scanTaxonomyTerms(), scanCasinos()])
  const allHits = [...taxHits, ...casinoHits]

  if (allHits.length === 0) {
    console.log("✅  No external links found in any HTML column. Nothing to clean.")
    return
  }

  // ── Preview ──────────────────────────────────────────────────────────────
  console.log(`Found ${allHits.length} external link(s):\n`)
  console.log("─".repeat(90))

  let currentLabel = ""
  for (const hit of allHits) {
    const rowLabel = `${hit.table} · ${hit.label}`
    if (rowLabel !== currentLabel) {
      if (currentLabel) console.log()
      console.log(`📍  ${rowLabel}`)
      currentLabel = rowLabel
    }
    console.log(`    column : ${hit.column}`)
    console.log(`    href   : ${hit.href}`)
    console.log(`    text   : "${hit.anchorText}"`)
    console.log(`    before : ${hit.fullMatch.substring(0, 120)}${hit.fullMatch.length > 120 ? "…" : ""}`)
    console.log(`    after  : ${hit.anchorText}`)
    console.log()
  }

  console.log("─".repeat(90))
  console.log(`\nTotal: ${allHits.length} external link(s) across ${new Set(allHits.map(h => h.id)).size} row(s)`)
  console.log("\nTables affected:")
  const byTable = {}
  for (const h of allHits) byTable[h.table] = (byTable[h.table] ?? 0) + 1
  for (const [t, n] of Object.entries(byTable)) console.log(`  ${t}: ${n} link(s)`)

  if (APPLY) {
    console.log("\n⚡  --apply flag detected — running UPDATE now...\n")
    await applyFixes(allHits)
  } else {
    console.log("\n👆  This was a DRY RUN (preview only).")
    console.log("    Run with --apply to execute the UPDATE:\n")
    console.log("    node scripts/scan-external-links.mjs --apply\n")
  }
}

main().catch(e => { console.error(e); process.exit(1) })
