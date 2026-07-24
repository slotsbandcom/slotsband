/**
 * scripts/backfill-bonuses.ts
 *
 * One-time backfill: creates rows in `bonuses` for every active casino that
 * has bonus data in the `casinos` table but no existing bonus row yet.
 *
 * Run with:
 *   npx tsx scripts/backfill-bonuses.ts
 *   npx tsx scripts/backfill-bonuses.ts --dry-run   (preview only, no writes)
 *
 * Strategy per casino (one primary row, max three rows total):
 *   • "welcome"    – if welcome_bonus_percent OR welcome_bonus_text is set
 *                    free_spins info is appended to the amount string
 *   • "no_deposit" – extra row if no_deposit_bonus=true AND no_deposit_amount>0
 *   • "cashback"   – extra row if cashback_percent>0 AND no welcome bonus
 *                    already contains cashback in its text
 *
 * Casinos that already have ANY row in `bonuses` are skipped entirely
 * (no overwriting of manually-edited bonus records).
 */

import { createClient } from "@supabase/supabase-js"
import * as fs from "fs"
import * as path from "path"

// ─── Load .env.local ────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local")
  if (!fs.existsSync(envPath)) return
  const raw = fs.readFileSync(envPath, "utf-8")
  for (const line of raw.split("\n")) {
    const [k, ...rest] = line.split("=")
    if (k && rest.length && !k.startsWith("#")) {
      process.env[k.trim()] = rest.join("=").trim()
    }
  }
}
loadEnv()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌  NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in .env.local")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const DRY_RUN = process.argv.includes("--dry-run")

// ─── Helpers ────────────────────────────────────────────────────────────────
type Casino = {
  id: string
  slug: string
  name: string
  welcome_bonus_text: string | null
  welcome_bonus_percent: number | null
  welcome_bonus_max_amount: number | null
  welcome_bonus_currency: string | null
  welcome_bonus_wagering: number | null
  welcome_bonus_min_deposit: number | null
  no_deposit_bonus: boolean | null
  no_deposit_amount: number | null
  free_spins_amount: number | null
  free_spins_game: string | null
  cashback_percent: number | null
}

type BonusInsert = {
  casino_id: string
  title: string
  description: string
  bonus_type: string
  amount: string | null
  wagering: number | null
  min_deposit: number | null
  is_featured: boolean
  is_active: boolean
  lang: string
}

/** true when the casino has at least one bonus-related field filled */
function hasBonusData(c: Casino): boolean {
  return !!(
    c.welcome_bonus_percent ||
    c.welcome_bonus_text ||
    (c.no_deposit_bonus && c.no_deposit_amount) ||
    c.free_spins_amount ||
    c.cashback_percent
  )
}

/**
 * Build the primary amount string for the casino's welcome/main bonus.
 * Combines percent + max amount + optional free spins.
 */
function buildAmount(c: Casino): string | null {
  const parts: string[] = []
  const cur = c.welcome_bonus_currency ?? "EUR"
  const sym = cur === "EUR" ? "€" : cur

  if (c.welcome_bonus_percent && c.welcome_bonus_max_amount) {
    parts.push(`${c.welcome_bonus_percent}% up to ${sym}${c.welcome_bonus_max_amount}`)
  } else if (c.welcome_bonus_percent) {
    parts.push(`${c.welcome_bonus_percent}% Welcome Bonus`)
  } else if (c.welcome_bonus_max_amount) {
    parts.push(`Up to ${sym}${c.welcome_bonus_max_amount}`)
  }

  if (c.free_spins_amount && c.free_spins_amount > 0) {
    parts.push(`${c.free_spins_amount} Free Spins`)
  }

  if (parts.length) return parts.join(" + ")
  // Fall back to the text field when no structured data
  if (c.welcome_bonus_text) return c.welcome_bonus_text
  return null
}

/** Determine primary bonus type */
function primaryType(c: Casino): string {
  if (c.welcome_bonus_percent || c.welcome_bonus_text || c.welcome_bonus_max_amount) return "welcome"
  if (c.no_deposit_bonus && c.no_deposit_amount)                                      return "no_deposit"
  if (c.free_spins_amount && c.free_spins_amount > 0)                                 return "free_spins"
  if (c.cashback_percent)                                                              return "cashback"
  return "welcome"
}

/** Build the rows to insert for a given casino */
function buildRows(c: Casino, existingIds: Set<string>): BonusInsert[] {
  if (existingIds.has(c.id)) return []    // already has a bonus → skip entirely

  const rows: BonusInsert[] = []
  const lang = "fi"
  const pt = primaryType(c)

  // ── Primary row ────────────────────────────────────────────────────────────
  const primaryAmount = buildAmount(c)
  const primaryTitle  = c.welcome_bonus_text ?? primaryAmount ?? "Casino Bonus"

  rows.push({
    casino_id:   c.id,
    title:       primaryTitle,
    description: JSON.stringify({ fi: "", en: "", uk: "" }),
    bonus_type:  pt,
    amount:      primaryAmount,
    wagering:    c.welcome_bonus_wagering ?? null,
    min_deposit: c.welcome_bonus_min_deposit ?? null,
    is_featured: false,
    is_active:   true,
    lang,
  })

  // ── No-deposit extra row (only if primary wasn't already no_deposit) ───────
  if (pt !== "no_deposit" && c.no_deposit_bonus && c.no_deposit_amount && c.no_deposit_amount > 0) {
    const cur = c.welcome_bonus_currency ?? "EUR"
    const sym = cur === "EUR" ? "€" : cur
    rows.push({
      casino_id:   c.id,
      title:       `${sym}${c.no_deposit_amount} No Deposit Bonus`,
      description: JSON.stringify({ fi: "", en: "", uk: "" }),
      bonus_type:  "no_deposit",
      amount:      `${sym}${c.no_deposit_amount}`,
      wagering:    null,
      min_deposit: null,
      is_featured: false,
      is_active:   true,
      lang,
    })
  }

  // ── Cashback extra row (only if primary wasn't cashback) ──────────────────
  if (pt !== "cashback" && c.cashback_percent && c.cashback_percent > 0) {
    // Skip if the welcome text already mentions cashback
    const text = (c.welcome_bonus_text ?? "").toLowerCase()
    const alreadyMentioned = text.includes("cashback")
    if (!alreadyMentioned) {
      rows.push({
        casino_id:   c.id,
        title:       `${c.cashback_percent}% Cashback`,
        description: JSON.stringify({ fi: "", en: "", uk: "" }),
        bonus_type:  "cashback",
        amount:      `${c.cashback_percent}% Cashback`,
        wagering:    0,
        min_deposit: c.welcome_bonus_min_deposit ?? null,
        is_featured: false,
        is_active:   true,
        lang,
      })
    }
  }

  return rows
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🚀  Bonus backfill — ${DRY_RUN ? "DRY RUN (no writes)" : "LIVE"}\n`)

  // 1. Fetch all active casinos
  const { data: casinos, error: ce } = await supabase
    .from("casinos")
    .select(`id, slug, name,
      welcome_bonus_text, welcome_bonus_percent, welcome_bonus_max_amount,
      welcome_bonus_currency, welcome_bonus_wagering, welcome_bonus_min_deposit,
      no_deposit_bonus, no_deposit_amount,
      free_spins_amount, free_spins_game,
      cashback_percent`)
    .eq("is_active", true)
    .order("rank", { ascending: true })

  if (ce) { console.error("❌  Failed to fetch casinos:", ce.message); process.exit(1) }
  console.log(`📋  Active casinos fetched: ${casinos!.length}`)

  // 2. Fetch existing casino_ids already in bonuses
  const { data: existingBonuses, error: be } = await supabase
    .from("bonuses")
    .select("casino_id")

  if (be) { console.error("❌  Failed to fetch existing bonuses:", be.message); process.exit(1) }
  const existingIds = new Set((existingBonuses ?? []).map((b: any) => b.casino_id as string))
  console.log(`📦  Casinos already with bonuses: ${existingIds.size}`)

  // 3. Filter casinos that have bonus data
  const eligible = (casinos as Casino[]).filter(hasBonusData)
  console.log(`🎰  Casinos with bonus data: ${eligible.length}`)
  console.log(`⏭️   Will skip (already have rows): ${eligible.filter(c => existingIds.has(c.id)).length}`)

  const toProcess = eligible.filter(c => !existingIds.has(c.id))
  console.log(`✅  Will create bonuses for: ${toProcess.length} casinos\n`)

  if (toProcess.length === 0) {
    console.log("Nothing to do. All done!")
    return
  }

  // 4. Preview
  let totalRows = 0
  const allRows: BonusInsert[] = []
  for (const casino of toProcess) {
    const rows = buildRows(casino, existingIds)
    allRows.push(...rows)
    const typeSummary = rows.map(r => r.bonus_type).join("+")
    const amtDisplay  = rows[0]?.amount ?? "(no amount)"
    console.log(`  [${casino.slug}] ${typeSummary} | ${amtDisplay}`)
    totalRows += rows.length
  }
  console.log(`\n📊  Total bonus rows to insert: ${totalRows}`)

  if (DRY_RUN) {
    console.log("\n⚠️   DRY RUN — nothing written. Remove --dry-run to apply.\n")
    return
  }

  // 5. Insert in batches of 20
  const BATCH = 20
  let inserted = 0
  for (let i = 0; i < allRows.length; i += BATCH) {
    const batch = allRows.slice(i, i + BATCH)
    const { error: ie } = await supabase.from("bonuses").insert(batch)
    if (ie) {
      console.error(`❌  Insert error at batch ${i / BATCH + 1}:`, ie.message)
      process.exit(1)
    }
    inserted += batch.length
    process.stdout.write(`\r✅  Inserted: ${inserted}/${totalRows}`)
  }

  console.log(`\n\n🎉  Done! Created ${inserted} bonus rows for ${toProcess.length} casinos.`)
  console.log(`    Skipped: ${existingIds.size} casinos (already had bonus rows)\n`)
}

main().catch(e => { console.error(e); process.exit(1) })
