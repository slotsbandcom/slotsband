import { getAdminSession } from "@/lib/supabase/admin-auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  return NextResponse.json({ role: session.role, email: session.user.email })
}
