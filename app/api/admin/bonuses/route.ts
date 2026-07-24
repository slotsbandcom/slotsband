import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

const TYPE_TITLES: Record<string, string> = {
  welcome:    "Welcome Bonus",
  no_deposit: "No Deposit Bonus",
  free_spins: "Free Spins",
  cashback:   "Cashback",
  reload:     "Reload Bonus",
}

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("bonuses")
    .select("*, casinos(name, logo_url, slug)")
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const bonuses = (data ?? []).map((row: any) => ({
    ...row,
    casino_name: row.casinos?.name,
    casino_logo: row.casinos?.logo_url,
    casino_slug: row.casinos?.slug,
  }))
  return NextResponse.json(bonuses)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }) }

  const {
    casinoId, bonusType, amount, wagering, minDeposit,
    freeSpinsCount, freeSpinsGame, validFrom, validUntil,
    descriptionFi, descriptionEn, descriptionUk, isFeatured,
  } = body as Record<string, any>

  if (!casinoId || !bonusType) {
    return NextResponse.json({ error: "casinoId and bonusType are required" }, { status: 400 })
  }

  // Build title from type label + amount
  const titleBase = TYPE_TITLES[bonusType] ?? bonusType
  const title = amount ? `${amount} ${titleBase}` : titleBase

  // Append free spins info into amount string
  let amountStr = (amount as string) || null
  if (freeSpinsCount && freeSpinsGame) {
    amountStr = [amountStr, `${freeSpinsCount} FS ${freeSpinsGame}`].filter(Boolean).join(" + ")
  } else if (freeSpinsCount) {
    amountStr = [amountStr, `${freeSpinsCount} Free Spins`].filter(Boolean).join(" + ")
  }

  // Store multi-language descriptions as JSON in the description column
  const description = JSON.stringify({
    fi: (descriptionFi as string) ?? "",
    en: (descriptionEn as string) ?? "",
    uk: (descriptionUk as string) ?? "",
  })

  const { data, error } = await supabase
    .from("bonuses")
    .insert({
      casino_id: casinoId,
      title,
      description,
      bonus_type: bonusType,
      amount: amountStr,
      wagering: wagering != null ? Number(wagering) : null,
      min_deposit: minDeposit != null ? Number(minDeposit) : null,
      is_featured: Boolean(isFeatured),
      is_active: true,
      start_date: (validFrom as string) || null,
      end_date: (validUntil as string) || null,
      lang: "fi",
    })
    .select()
    .single()

  if (error) {
    console.error("[POST /api/admin/bonuses]", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data }, { status: 201 })
}
