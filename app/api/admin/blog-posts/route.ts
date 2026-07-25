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
    .from("blog_posts")
    .select("id, slug_fi, slug_en, slug_uk, title_fi, title_en, title_uk, published_at, is_active, featured_image_url, created_at")
    .order("published_at", { ascending: false, nullsFirst: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  if (!body.title_fi?.trim()) return NextResponse.json({ error: "title_fi is required" }, { status: 400 })
  if (!body.slug_fi?.trim()) return NextResponse.json({ error: "slug_fi is required" }, { status: 400 })

  const db = adminDb()
  const { data, error } = await db
    .from("blog_posts")
    .insert({
      slug_fi: body.slug_fi.trim(),
      slug_en: body.slug_en?.trim() || body.slug_fi.trim(),
      slug_uk: body.slug_uk?.trim() || body.slug_fi.trim(),
      title_fi: body.title_fi.trim(),
      title_en: body.title_en?.trim() || null,
      title_uk: body.title_uk?.trim() || null,
      content_fi: body.content_fi || null,
      content_en: body.content_en || null,
      content_uk: body.content_uk || null,
      excerpt_fi: body.excerpt_fi?.trim() || null,
      excerpt_en: body.excerpt_en?.trim() || null,
      excerpt_uk: body.excerpt_uk?.trim() || null,
      featured_image_url: body.featured_image_url?.trim() || null,
      meta_title_fi: body.meta_title_fi?.trim() || null,
      meta_title_en: body.meta_title_en?.trim() || null,
      meta_title_uk: body.meta_title_uk?.trim() || null,
      meta_description_fi: body.meta_description_fi?.trim() || null,
      meta_description_en: body.meta_description_en?.trim() || null,
      meta_description_uk: body.meta_description_uk?.trim() || null,
      published_at: body.published_at || null,
      is_active: body.is_active ?? true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
