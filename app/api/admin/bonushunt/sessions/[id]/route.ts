import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

function adminDb() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Enters the real final result for a session and auto-picks the winning
// prediction (smallest absolute difference to finalResult). On an exact tie
// between multiple predictions, winner_prediction_id is left null and the
// tied candidates are returned so the admin UI can prompt a manual pick —
// which happens via a second call to this route with winnerPredictionId set.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }) }

  const db = adminDb()

  // Manual tie-break: admin picked one of the tied candidates directly.
  if (typeof body.winnerPredictionId === "string") {
    const { data, error } = await db
      .from("bonushunt_sessions")
      .update({ winner_prediction_id: body.winnerPredictionId })
      .eq("id", id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data, tiedCandidates: [] })
  }

  const finalResult = Number(body.finalResult)
  if (!Number.isFinite(finalResult) || finalResult < 0) {
    return NextResponse.json({ error: "Valid finalResult is required" }, { status: 400 })
  }

  const { data: predictions, error: predError } = await db
    .from("bonushunt_predictions")
    .select("id, predicted_total")
    .eq("session_id", id)

  if (predError) return NextResponse.json({ error: predError.message }, { status: 500 })

  let winnerId: string | null = null
  let tiedCandidates: { id: string; predicted_total: number }[] = []

  if (predictions && predictions.length > 0) {
    const diffs = predictions.map(p => ({ ...p, diff: Math.abs(Number(p.predicted_total) - finalResult) }))
    const minDiff = Math.min(...diffs.map(p => p.diff))
    const candidates = diffs.filter(p => p.diff === minDiff)
    if (candidates.length === 1) {
      winnerId = candidates[0].id
    } else {
      tiedCandidates = candidates.map(({ id, predicted_total }) => ({ id, predicted_total }))
    }
  }

  const { data, error } = await db
    .from("bonushunt_sessions")
    .update({
      final_result: finalResult,
      winner_prediction_id: winnerId,
      status: "completed",
      result_entered_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data, tiedCandidates })
}
