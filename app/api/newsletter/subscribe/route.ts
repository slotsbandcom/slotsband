import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }) }

  const email = typeof body.email === "string" ? body.email.trim() : ""
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 })
  }
  const lang = typeof body.lang === "string" && ["fi", "en", "uk"].includes(body.lang) ? body.lang : "fi"
  const source = typeof body.source === "string" ? body.source.slice(0, 100) : undefined

  const supabase = await createClient()

  const { error } = await supabase
    .from("newsletter_subscribers")
    .upsert({ email, lang, source, is_active: true }, { onConflict: "email" })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
