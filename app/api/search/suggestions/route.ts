import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Same query → same answer for everyone; let the CDN absorb repeats.
const CDN_CACHE = { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" }

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim()
  if (!q || q.length < 2 || q.length > 50) return NextResponse.json({ results: [] }, { headers: CDN_CACHE })

  const { data } = await sb
    .from("casinos")
    .select("name, slug, rating, logo_url")
    .ilike("name", `%${q}%`)
    .eq("is_active", true)
    .order("rating", { ascending: false })
    .limit(5)

  return NextResponse.json({ results: data ?? [] }, { headers: CDN_CACHE })
}
