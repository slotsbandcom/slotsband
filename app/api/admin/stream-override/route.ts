import { createClient } from "@/lib/supabase/server"
import { getAdminSession } from "@/lib/supabase/admin-auth"
import { toStreamOverrideResponse } from "@/lib/supabase/stream-override"
import { NextResponse } from "next/server"

// Admin-only write for the manual stream override (moved here from the public
// /api/stream-override so the proxy's /api/admin guard covers it).
export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const body = await req.json()
    const supabase = await createClient()

    const isLive = body.isLive ?? false
    const mode = body.mode ?? "manual"
    const autoResetHours = body.autoResetHours ?? 8

    let expiresAt: string | null = null
    if (mode === "manual" && isLive && autoResetHours > 0) {
      const exp = new Date()
      exp.setHours(exp.getHours() + autoResetHours)
      expiresAt = exp.toISOString()
    }

    const row = {
      platform: "kick",
      override_mode: mode,
      is_live: isLive,
      title: body.title ?? "",
      viewers: body.viewers ?? 0,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from("stream_status")
      .upsert(row, { onConflict: "platform" })
      .select()
      .single()

    if (error) {
      console.error("[v0] stream-override upsert error:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(toStreamOverrideResponse(data), { headers: { "Cache-Control": "no-store" } })
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }
}
