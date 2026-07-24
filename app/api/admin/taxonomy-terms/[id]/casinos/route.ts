import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

function adminDb() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = adminDb()

  const [{ data: allCasinos, error: ce }, { data: assigned, error: ae }] = await Promise.all([
    db.from("casinos").select("id, name, slug, is_active").order("name", { ascending: true }),
    db.from("casino_taxonomy_terms").select("casino_id").eq("term_id", id),
  ])

  if (ce) return NextResponse.json({ error: ce.message }, { status: 500 })
  if (ae) return NextResponse.json({ error: ae.message }, { status: 500 })

  const assignedSet = new Set((assigned ?? []).map((r) => r.casino_id))
  const casinos = (allCasinos ?? []).map((c) => ({ ...c, assigned: assignedSet.has(c.id) }))

  return NextResponse.json(casinos)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const { casino_ids } = await req.json() as { casino_ids: string[] }

  const db = adminDb()

  const { error: delError } = await db
    .from("casino_taxonomy_terms")
    .delete()
    .eq("term_id", id)

  if (delError) return NextResponse.json({ error: delError.message }, { status: 500 })

  if (casino_ids.length > 0) {
    const rows = casino_ids.map((casino_id) => ({ casino_id, term_id: id }))
    const { error: insError } = await db.from("casino_taxonomy_terms").insert(rows)
    if (insError) return NextResponse.json({ error: insError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, count: casino_ids.length })
}
