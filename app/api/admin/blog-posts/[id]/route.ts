import { getAdminSession } from "@/lib/supabase/admin-auth"
import { diffFields, logBlogAudit } from "@/lib/supabase/blog-audit"
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

// Fields an editor is allowed to stage/submit — never is_active/published_at,
// those only ever change via approval.
const EDITOR_ALLOWED = ALLOWED.filter(k => k !== "is_active" && k !== "published_at")

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const db = adminDb()
  const { data, error } = await db.from("blog_posts").select("*").eq("id", id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })

  // Editors can view/edit any article; show the staged edit (if any)
  // instead of the still-live values.
  if (session.role === "editor" && data.pending_data) {
    return NextResponse.json({ ...data, ...data.pending_data })
  }
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const db = adminDb()

  const { data: existing, error: fetchError } = await db
    .from("blog_posts").select("*").eq("id", id).single()
  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 404 })

  if (session.role === "editor") {
    const staged: Record<string, unknown> = {}
    for (const key of EDITOR_ALLOWED) {
      if (key in body) staged[key] = body[key]
    }
    if (Object.keys(staged).length === 0) {
      return NextResponse.json({ error: "No valid fields" }, { status: 400 })
    }

    const update = existing.is_active
      ? { pending_data: staged, review_status: "pending", submitted_by: session.user.id }
      : { ...staged, review_status: "pending", submitted_by: session.user.id }

    const { data, error } = await db
      .from("blog_posts").update(update).eq("id", id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await logBlogAudit({
      postId: id,
      postTitle: existing.title_fi,
      postSlug: existing.slug_fi,
      action: "submit",
      actorId: session.user.id,
      actorEmail: session.user.email,
      changes: diffFields(existing, staged, EDITOR_ALLOWED),
    })

    return NextResponse.json(data.pending_data ? { ...data, ...data.pending_data } : data)
  }

  const fields: Record<string, unknown> = { review_status: "approved", pending_data: null }
  for (const key of ALLOWED) {
    if (key in body) fields[key] = body[key]
  }
  if (Object.keys(fields).length === 2) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 })
  }

  const { data, error } = await db
    .from("blog_posts").update(fields).eq("id", id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logBlogAudit({
    postId: id,
    postTitle: existing.title_fi,
    postSlug: existing.slug_fi,
    action: "update",
    actorId: session.user.id,
    actorEmail: session.user.email,
    changes: diffFields(existing, fields, ALLOWED),
  })

  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const db = adminDb()
  const { data: existing } = await db.from("blog_posts").select("title_fi, slug_fi").eq("id", id).maybeSingle()

  const { error } = await db.from("blog_posts").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logBlogAudit({
    postId: id,
    postTitle: existing?.title_fi ?? null,
    postSlug: existing?.slug_fi ?? null,
    action: "delete",
    actorId: session.user.id,
    actorEmail: session.user.email,
  })

  return NextResponse.json({ ok: true })
}
