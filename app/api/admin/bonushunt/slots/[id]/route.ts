import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

function adminDb() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }) }

  const { game, provider, balance, bet, bonusValue, multiplier } = body as Record<string, any>

  const update: Record<string, unknown> = {}
  if (game !== undefined) update.game = game
  if (provider !== undefined) update.provider = provider
  if (balance !== undefined) update.balance = Number(balance) || 0
  if (bet !== undefined) update.bet = Number(bet) || 0
  if (bonusValue !== undefined) update.bonus_value = Number(bonusValue) || 0
  if (multiplier !== undefined) {
    update.multiplier = multiplier === null || multiplier === "" ? null : Number(multiplier)
    update.opened_at = update.multiplier === null ? null : new Date().toISOString()
  }

  const { data, error } = await adminDb()
    .from("bonushunt_slots")
    .update(update)
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { error } = await adminDb().from("bonushunt_slots").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
