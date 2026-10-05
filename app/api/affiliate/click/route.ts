import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"

const LANGS = ["fi", "en", "uk"]
const str = (v: unknown, max: number) => (typeof v === "string" && v.length > 0 ? v.slice(0, max) : null)

// Public endpoint — validate everything so bots can't stuff arbitrary
// payloads into affiliate_clicks.
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }) }

  const casino_slug = str(body.casino_slug, 100)
  if (!casino_slug || !/^[a-z0-9-]+$/i.test(casino_slug)) {
    return NextResponse.json({ error: "Invalid casino_slug" }, { status: 400 })
  }
  const casino_id = str(body.casino_id, 64)
  const lang = typeof body.lang === "string" && LANGS.includes(body.lang) ? body.lang : null
  const referrer = str(body.referrer, 500)

  const supabase = await createClient()

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown"
  const ip_hash = createHash("sha256").update(ip).digest("hex")
  const user_agent = req.headers.get("user-agent")?.slice(0, 500) ?? undefined

  await supabase.from("affiliate_clicks").insert({
    casino_id: casino_id ?? null,
    casino_slug,
    ip_hash,
    user_agent,
    lang,
    referrer,
  })

  return NextResponse.json({ success: true })
}
