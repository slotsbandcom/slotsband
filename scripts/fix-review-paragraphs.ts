#!/usr/bin/env node
/**
 * One-time script: wrap plain-text reviews in <p> tags for all casinos
 * that have review_fi or review_en without any HTML paragraph structure.
 *
 * Usage: npx tsx scripts/fix-review-paragraphs.ts
 */

import { createClient } from "@supabase/supabase-js"
import * as fs from "fs"
import * as path from "path"

// ── Load .env.local ────────────────────────────────────────────────────────────
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
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// ── formatReviewText (mirrors lib/utils.ts) ────────────────────────────────────
function formatReviewText(text: string): string {
  const trimmed = text.trim()
  if (!trimmed) return ""

  // Already structured HTML — trust it
  if (/<p[\s>]/i.test(trimmed)) return trimmed

  // Has double newlines — split on paragraph breaks
  if (/\n\n/.test(trimmed)) {
    return trimmed
      .split(/\n\n+/)
      .map(block => block.replace(/\n/g, " ").trim())
      .filter(Boolean)
      .map(block => `<p>${block}</p>`)
      .join("")
  }

  // Plain text — split into sentences, group by 3
  const sentenceEnder = /([.!?]["»]?)\s+(?=[A-ZÄÖÅÀ-ɏ])/g
  const sentences = trimmed
    .replace(/\n/g, " ")
    .replace(sentenceEnder, "$1\n")
    .split("\n")
    .map(s => s.trim())
    .filter(Boolean)

  if (sentences.length <= 1) return `<p>${trimmed.replace(/\n/g, " ")}</p>`

  const paragraphs: string[] = []
  for (let i = 0; i < sentences.length; i += 3) {
    const chunk = sentences.slice(i, i + 3).join(" ").trim()
    if (chunk) paragraphs.push(`<p>${chunk}</p>`)
  }
  return paragraphs.join("")
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Fetching casinos with review content...")

  const { data, error } = await supabase
    .from("casinos")
    .select("id, slug, review_fi, review_en, review_uk")
    .or("review_fi.not.is.null,review_en.not.is.null,review_uk.not.is.null")
    .order("slug")

  if (error) {
    console.error("Supabase fetch error:", error.message)
    process.exit(1)
  }

  const rows = data ?? []
  console.log(`Found ${rows.length} casinos with review content.\n`)

  let updated = 0
  let skipped = 0

  for (const casino of rows) {
    const patch: Record<string, string> = {}

    for (const col of ["review_fi", "review_en", "review_uk"] as const) {
      const val = casino[col]
      if (!val) continue
      if (/<p[\s>]/i.test(val)) continue  // already has <p> tags
      patch[col] = formatReviewText(val)
    }

    if (Object.keys(patch).length === 0) {
      skipped++
      continue
    }

    const { error: updateError } = await supabase
      .from("casinos")
      .update(patch)
      .eq("id", casino.id)

    if (updateError) {
      console.error(`  ✗ ${casino.slug}: ${updateError.message}`)
    } else {
      const cols = Object.keys(patch).join(", ")
      console.log(`  ✓ ${casino.slug} — updated ${cols}`)
      updated++
    }
  }

  console.log(`\nDone. Updated: ${updated}, already formatted: ${skipped}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
