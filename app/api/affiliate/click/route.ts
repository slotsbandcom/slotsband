import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { casino_id, casino_slug, lang, referrer } = await req.json()

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown"
  const ip_hash = createHash("sha256").update(ip).digest("hex")
  const user_agent = req.headers.get("user-agent") ?? undefined

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
