import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"
import { syncCasinoBonus } from "@/lib/supabase/bonus-sync"

function adminDb() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("casinos")
    .select("*")
    .order("rank", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  // Remove any empty id so Postgres generates one
  if (!body.id) delete body.id

  const { data, error } = await supabase
    .from("casinos")
    .insert(body)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Sync bonus table so new casino appears on /kasinobonukset/ immediately
  try { await syncCasinoBonus(adminDb(), data) } catch (e) {
    console.warn("[bonus-sync]", e)
  }

  return NextResponse.json(data, { status: 201 })
}
