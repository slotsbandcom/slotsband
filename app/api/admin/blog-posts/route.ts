import { getAdminSession } from "@/lib/supabase/admin-auth"
import { logBlogAudit } from "@/lib/supabase/blog-audit"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

function adminDb() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const db = adminDb()
  const { data, error } = await db
    .from("blog_posts")
    .select("id, slug_fi, slug_en, slug_uk, title_fi, title_en, title_uk, published_at, is_active, featured_image_url, created_at, review_status, review_note, submitted_by")
    .order("published_at", { ascending: false, nullsFirst: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  if (!body.title_fi?.trim()) return NextResponse.json({ error: "title_fi is required" }, { status: 400 })
  if (!body.slug_fi?.trim()) return NextResponse.json({ error: "slug_fi is required" }, { status: 400 })

  const isEditor = session.role === "editor"
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
      published_at: isEditor ? null : (body.published_at || null),
      requested_published_at: isEditor ? (body.requested_published_at || null) : null,
      is_active: isEditor ? false : (body.is_active ?? true),
      review_status: isEditor ? "pending" : "approved",
      submitted_by: isEditor ? session.user.id : null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logBlogAudit({
    postId: data.id,
    postTitle: data.title_fi,
    postSlug: data.slug_fi,
    action: isEditor ? "submit" : "create",
    actorId: session.user.id,
    actorEmail: session.user.email,
    note: isEditor ? "New article submitted for review" : null,
  })

  return NextResponse.json(data, { status: 201 })
}
