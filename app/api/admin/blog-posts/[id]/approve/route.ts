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

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const db = adminDb()
  const { data: existing, error: fetchError } = await db
    .from("blog_posts").select("*").eq("id", id).single()
  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 404 })

  const update = existing.pending_data
    ? { ...existing.pending_data, pending_data: null, review_status: "approved" }
    : { is_active: true, published_at: existing.published_at || new Date().toISOString(), review_status: "approved" }

  const { data, error } = await db
    .from("blog_posts").update(update).eq("id", id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logBlogAudit({
    postId: id,
    postTitle: data.title_fi,
    postSlug: data.slug_fi,
    action: "approve",
    actorId: session.user.id,
    actorEmail: session.user.email,
    changes: existing.pending_data
      ? diffFields(existing, existing.pending_data as Record<string, unknown>, Object.keys(existing.pending_data as Record<string, unknown>))
      : null,
    note: existing.pending_data ? null : "Article published",
  })

  return NextResponse.json(data)
}
