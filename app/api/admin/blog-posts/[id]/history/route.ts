import { getAdminSession } from "@/lib/supabase/admin-auth"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

function adminDb() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const { data, error } = await adminDb()
    .from("blog_post_audit_log")
    .select("*")
    .eq("post_id", id)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    // Table may not exist yet if the migration hasn't been run
    if (error.message.toLowerCase().includes("does not exist")) {
      return NextResponse.json([])
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
