import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

function adminDb() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

type Params = { params: Promise<{ slug: string }> }

// GET — return all lang rows for this slug as { fi, en, uk }
export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params
  const db = adminDb()
  const { data, error } = await db
    .from("pages")
    .select("*")
    .eq("slug", slug)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data || data.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Shape into { fi, en, uk }
  const result: Record<string, unknown> = { slug }
  for (const row of data) result[row.lang as string] = row
  return NextResponse.json(result)
}

// PATCH — upsert rows for provided langs
// Body: { fi?: LangData, en?: LangData, uk?: LangData }
export async function PATCH(req: NextRequest, { params }: Params) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { slug } = await params
  const body = await req.json()
  const db = adminDb()
  const rows = []

  for (const lang of ["fi", "en", "uk"] as const) {
    const d = body[lang]
    if (!d) continue
    if (d.title !== undefined && !d.title?.trim()) continue // skip empty title rows
    rows.push({
      slug,
      lang,
      title: d.title?.trim() ?? "",
      content: d.content ?? null,
      meta_title: d.meta_title?.trim() || null,
      meta_description: d.meta_description?.trim() || null,
      is_published: d.is_published ?? false,
    })
  }

  if (rows.length === 0) return NextResponse.json({ error: "No valid lang data" }, { status: 400 })

  const { data, error } = await db
    .from("pages")
    .upsert(rows, { onConflict: "slug,lang" })
    .select()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Return shaped result
  const result: Record<string, unknown> = { slug }
  for (const row of data) result[row.lang as string] = row
  return NextResponse.json(result)
}

// DELETE — remove all lang rows for this slug
export async function DELETE(_req: NextRequest, { params }: Params) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { slug } = await params
  const db = adminDb()
  const { error } = await db.from("pages").delete().eq("slug", slug)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
