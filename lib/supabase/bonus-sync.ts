/**
 * syncCasinoBonus — called after any casino create/update.
 * Keeps the "welcome" row in the bonuses table in sync with the casino's
 * bonus fields so the casino automatically appears on /kasinobonukset/.
 *
 * Rules:
 *  • Casino has bonus data → upsert the welcome bonus row
 *  • Casino has NO bonus data + welcome row exists → set is_active = false
 *  • Only touches the auto-managed "welcome" row; cashback/no_deposit rows
 *    created by the backfill or admin are left untouched.
 */

type Casino = {
  id: string
  welcome_bonus_text?: string | null
  welcome_bonus_percent?: number | null
  welcome_bonus_max_amount?: number | null
  welcome_bonus_currency?: string | null
  welcome_bonus_wagering?: number | null
  welcome_bonus_min_deposit?: number | null
  no_deposit_bonus?: boolean | null
  no_deposit_amount?: number | null
  free_spins_amount?: number | null
  cashback_percent?: number | null
}

function hasBonusData(c: Casino): boolean {
  return !!(
    c.welcome_bonus_percent ||
    c.welcome_bonus_text ||
    c.welcome_bonus_max_amount ||
    (c.no_deposit_bonus && c.no_deposit_amount) ||
    c.free_spins_amount ||
    c.cashback_percent
  )
}

function buildAmount(c: Casino): string | null {
  const parts: string[] = []
  const sym = c.welcome_bonus_currency === "GBP" ? "£" : "€"

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

  return parts.join(" + ") || c.welcome_bonus_text || null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function syncCasinoBonus(db: any, casino: Casino): Promise<void> {
  const hasData = hasBonusData(casino)
  const amount  = buildAmount(casino)
  const title   = casino.welcome_bonus_text ?? amount ?? "Casino Bonus"

  // Find any existing auto-synced welcome row for this casino
  const { data: existing } = await db
    .from("bonuses")
    .select("id")
    .eq("casino_id", casino.id)
    .eq("bonus_type", "welcome")
    .maybeSingle()

  if (existing) {
    // Update — either refresh data or deactivate if bonus fields cleared
    await db.from("bonuses").update({
      title,
      amount,
      wagering:    casino.welcome_bonus_wagering ?? null,
      min_deposit: casino.welcome_bonus_min_deposit ?? null,
      is_active:   hasData,
    }).eq("id", existing.id)
  } else if (hasData) {
    // Create for the first time
    await db.from("bonuses").insert({
      casino_id:   casino.id,
      title,
      description: JSON.stringify({ fi: "", en: "", uk: "" }),
      bonus_type:  "welcome",
      amount,
      wagering:    casino.welcome_bonus_wagering ?? null,
      min_deposit: casino.welcome_bonus_min_deposit ?? null,
      is_featured: false,
      is_active:   true,
      lang:        "fi",
    })
  }
}
