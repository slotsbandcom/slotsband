import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

function adminDb() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET — list all page rows (client groups by slug)
export async function GET() {
  const db = adminDb()
  const { data, error } = await db
    .from("pages")
    .select("id, slug, lang, title, is_published, created_at, updated_at")
    .order("slug", { ascending: true })
    .order("lang", { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// POST — create / upsert rows for one or more langs
// Body: { slug, fi?: LangData, en?: LangData, uk?: LangData }
// LangData: { title, content?, meta_title?, meta_description?, is_published? }
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  if (!body.slug?.trim()) return NextResponse.json({ error: "slug is required" }, { status: 400 })
  if (!body.fi?.title?.trim()) return NextResponse.json({ error: "Finnish title (fi.title) is required" }, { status: 400 })

  const slug = body.slug.trim()
  const db = adminDb()
  const rows = []

  for (const lang of ["fi", "en", "uk"] as const) {
    const d = body[lang]
    if (!d?.title?.trim()) continue
    rows.push({
      slug,
      lang,
      title: d.title.trim(),
      content: d.content || null,
      meta_title: d.meta_title?.trim() || null,
      meta_description: d.meta_description?.trim() || null,
      is_published: d.is_published ?? false,
    })
  }

  if (rows.length === 0) return NextResponse.json({ error: "No lang data provided" }, { status: 400 })

  const { data, error } = await db
    .from("pages")
    .upsert(rows, { onConflict: "slug,lang" })
    .select()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
