import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

async function getRow() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("stream_status")
    .select("*")
    .eq("platform", "kick")
    .single()
  return data
}

function toResponse(row: any) {
  // Auto-expire manual overrides
  if (row?.override_mode === "manual" && row.expires_at && new Date() > new Date(row.expires_at)) {
    return { mode: "auto", isLive: false, title: "", viewers: 0, expiresAt: null }
  }
  return {
    mode: row?.override_mode ?? "auto",
    isLive: row?.is_live ?? false,
    title: row?.title ?? "",
    viewers: row?.viewers ?? 0,
    expiresAt: row?.expires_at ?? null,
  }
}

export async function GET() {
  const row = await getRow()
  return NextResponse.json(toResponse(row), { headers: { "Cache-Control": "no-store" } })
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

    return NextResponse.json(toResponse(data), { headers: { "Cache-Control": "no-store" } })
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }
}
