import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

function adminDb() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // `id` param is the casino slug (passed as slug from admin UI)
  const { id: slug } = await params

  const { data, error } = await adminDb()
    .from("casino_audit_log")
    .select("*")
    .eq("casino_slug", slug)
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
