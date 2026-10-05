import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/supabase/admin-auth"
import { revalidatePublicSite } from "@/lib/supabase/public-cache"

// Purges every cached public page — see the "Site Cache" card in
// /admin/settings. For changes made directly in Supabase; edits made through
// the admin API routes already revalidate on their own.
export async function POST() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  revalidatePublicSite()
  return NextResponse.json({ ok: true })
}
