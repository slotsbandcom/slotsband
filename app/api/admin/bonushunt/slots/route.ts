import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

function adminDb() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }) }

  const { sessionId, game, provider, balance, bet, bonusValue } = body as Record<string, any>

  if (!sessionId || !game || !provider) {
    return NextResponse.json({ error: "sessionId, game and provider are required" }, { status: 400 })
  }

  const db = adminDb()

  const { count } = await db
    .from("bonushunt_slots")
    .select("id", { count: "exact", head: true })
    .eq("session_id", sessionId)

  const { data, error } = await db
    .from("bonushunt_slots")
    .insert({
      session_id: sessionId,
      game,
      provider,
      balance: Number(balance) || 0,
      bet: Number(bet) || 0,
      bonus_value: Number(bonusValue) || 0,
      sort_order: count ?? 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data }, { status: 201 })
}
