import { NextRequest, NextResponse } from "next/server"
import { CASINOS } from "@/lib/data"

interface RouteParams {
  params: Promise<{ lang: string; slug: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { slug, lang } = await params
  const casino = CASINOS.find((c) => c.mene_slug === slug || c.slug === slug)

  if (!casino) {
    return NextResponse.redirect(new URL(`/${lang}/nettikasinot`, request.url))
  }

  // In production: log click to database here
  // await logClick({ casino_id: casino.id, lang, user_agent: request.headers.get("user-agent") })

  return NextResponse.redirect(casino.affiliate_url, {
    status: 302,
    headers: {
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  })
}
