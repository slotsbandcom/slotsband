import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

function adminDb() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Public, unauthenticated endpoint — the "Tee ennuste" form on /[lang]/bonushunt
// has no login/account system by design. Writes go through the service-role
// client because bonushunt_predictions has no anon INSERT policy (see
// supabase/enable_rls.sql §5 / migrations/20260813_bonushunt_predictions_winner.sql).
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }) }

  const nickname = typeof body.nickname === "string" ? body.nickname.trim() : ""
  const amount = Number(body.amount)
  const game = typeof body.game === "string" ? body.game.trim() : ""

  if (!nickname) return NextResponse.json({ error: "Nickname is required" }, { status: 400 })
  if (!Number.isFinite(amount) || amount < 0) return NextResponse.json({ error: "Valid amount is required" }, { status: 400 })

  const db = adminDb()

  const { data: session, error: sessionError } = await db
    .from("bonushunt_sessions")
    .select("id")
    .eq("status", "active")
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (sessionError) return NextResponse.json({ error: sessionError.message }, { status: 500 })
  if (!session) return NextResponse.json({ error: "No active bonus hunt session right now" }, { status: 409 })

  const { data, error } = await db
    .from("bonushunt_predictions")
    .insert({
      session_id: session.id,
      username: nickname,
      predicted_total: amount,
      predicted_game: game || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data }, { status: 201 })
}
