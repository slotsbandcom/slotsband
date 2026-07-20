import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface RouteParams {
  params: Promise<{ lang: string; slug: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { slug, lang } = await params

  const supabase = await createClient()
  const { data: casino } = await supabase
    .from("casinos")
    .select("id, slug, affiliate_url, mene_slug")
    .or(`mene_slug.eq.${slug},slug.eq.${slug}`)
    .eq("is_active", true)
    .single()

  if (!casino) {
    return NextResponse.redirect(new URL(`/${lang}/nettikasinot`, request.url))
  }

  // Log affiliate click
  await supabase.from("affiliate_clicks").insert({
    casino_id: casino.id,
    casino_slug: casino.slug,
    lang,
    user_agent: request.headers.get("user-agent"),
    referrer: request.headers.get("referer"),
  })

  return NextResponse.redirect(casino.affiliate_url, {
    status: 302,
    headers: {
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  })
}
