import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

function adminDb() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET() {
  const db = adminDb()
  const { data, error } = await db
    .from("taxonomy_terms")
    .select("*")
    .order("taxonomy", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("name_fi", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: cttRows } = await db
    .from("casino_taxonomy_terms")
    .select("term_id")

  const casinoCountByTermId: Record<string, number> = {}
  for (const row of cttRows ?? []) {
    casinoCountByTermId[row.term_id] = (casinoCountByTermId[row.term_id] ?? 0) + 1
  }

  const terms = (data ?? []).map((t) => ({
    ...t,
    casino_count: casinoCountByTermId[t.id] ?? 0,
  }))

  return NextResponse.json(terms)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  if (!body.taxonomy) return NextResponse.json({ error: "taxonomy is required" }, { status: 400 })
  if (!body.name_fi?.trim()) return NextResponse.json({ error: "name_fi is required" }, { status: 400 })
  if (!body.slug?.trim()) return NextResponse.json({ error: "slug is required" }, { status: 400 })

  const db = adminDb()
  const { data, error } = await db
    .from("taxonomy_terms")
    .insert({
      taxonomy: body.taxonomy,
      slug: body.slug.trim(),
      name_fi: body.name_fi.trim(),
      name_en: body.name_en?.trim() || null,
      name_uk: body.name_uk?.trim() || null,
      description_fi: body.description_fi?.trim() || null,
      description_en: body.description_en?.trim() || null,
      description_uk: body.description_uk?.trim() || null,
      icon: body.icon || null,
      image_url: body.image_url?.trim() || null,
      is_active: body.is_active ?? true,
      sort_order: Number(body.sort_order) || 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
