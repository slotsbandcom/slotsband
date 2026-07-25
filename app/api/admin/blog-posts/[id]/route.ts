import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

function adminDb() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const ALLOWED = [
  "slug_fi", "slug_en", "slug_uk",
  "title_fi", "title_en", "title_uk",
  "content_fi", "content_en", "content_uk",
  "excerpt_fi", "excerpt_en", "excerpt_uk",
  "featured_image_url",
  "meta_title_fi", "meta_title_en", "meta_title_uk",
  "meta_description_fi", "meta_description_en", "meta_description_uk",
  "published_at", "is_active",
]

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = adminDb()
  const { data, error } = await db.from("blog_posts").select("*").eq("id", id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const fields: Record<string, unknown> = {}
  for (const key of ALLOWED) {
    if (key in body) fields[key] = body[key]
  }
  if (Object.keys(fields).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 })
  }

  const db = adminDb()
  const { data, error } = await db
    .from("blog_posts").update(fields).eq("id", id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const db = adminDb()
  const { error } = await db.from("blog_posts").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
