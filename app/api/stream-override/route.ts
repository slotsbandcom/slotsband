import { createClient } from "@/lib/supabase/server"
import { getStreamOverrideRow, toStreamOverrideResponse } from "@/lib/supabase/stream-override"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const row = await getStreamOverrideRow()
  return NextResponse.json(toStreamOverrideResponse(row), { headers: { "Cache-Control": "no-store" } })
}

export async function POST(req: Request) {
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
