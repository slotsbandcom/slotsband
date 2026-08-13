import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

function adminDb() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Starts a new bonus hunt session (status "active"). Only one session can be
// active at a time, so any currently active session is marked "completed"
// first — the predictions form and admin dashboard both key off status="active".
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }) }

  const title = typeof body.title === "string" ? body.title.trim() : ""
  const date = typeof body.date === "string" && body.date ? body.date : new Date().toISOString().slice(0, 10)

  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 })

  const db = adminDb()

  const { error: closeError } = await db
    .from("bonushunt_sessions")
    .update({ status: "completed" })
    .eq("status", "active")

  if (closeError) return NextResponse.json({ error: closeError.message }, { status: 500 })

  const { data, error } = await db
    .from("bonushunt_sessions")
    .insert({ title, date, status: "active" })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data }, { status: 201 })
}
