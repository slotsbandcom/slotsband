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

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const note = body.note?.trim() || null
  const db = adminDb()
  const { data, error } = await db
    .from("blog_posts")
    .update({ review_status: "rejected", review_note: note })
    .eq("id", id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logBlogAudit({
    postId: id,
    postTitle: data.title_fi,
    postSlug: data.slug_fi,
    action: "reject",
    actorId: session.user.id,
    actorEmail: session.user.email,
    note,
  })

  return NextResponse.json(data)
}
