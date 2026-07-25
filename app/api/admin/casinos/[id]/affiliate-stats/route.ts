import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

function adminDb() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // `id` param is the casino slug (passed as slug from admin UI)
  const { id: slug } = await params
  const db = adminDb()

  // Total clicks for this casino
  const { count: total } = await db
    .from("affiliate_clicks")
    .select("*", { count: "exact", head: true })
    .eq("casino_slug", slug)

  // This month
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const { count: thisMonth } = await db
    .from("affiliate_clicks")
    .select("*", { count: "exact", head: true })
    .eq("casino_slug", slug)
    .gte("clicked_at", monthStart)

  // Last click timestamp
  const { data: lastRow } = await db
    .from("affiliate_clicks")
    .select("clicked_at")
    .eq("casino_slug", slug)
    .order("clicked_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  // Clicks per language
  const { data: allClicks } = await db
    .from("affiliate_clicks")
    .select("lang")
    .eq("casino_slug", slug)

  const byLangCount: Record<string, number> = {}
  for (const row of allClicks ?? []) {
    const l = (row.lang as string) || "fi"
    byLangCount[l] = (byLangCount[l] ?? 0) + 1
  }
  const totalForPct = Object.values(byLangCount).reduce((a, b) => a + b, 0)
  const byLangPct: Record<string, number> = {}
  for (const [lang, count] of Object.entries(byLangCount)) {
    byLangPct[lang] = totalForPct > 0 ? Math.round((count / totalForPct) * 100) : 0
  }

  // Format last click as relative time
  let lastClickLabel = "—"
  if (lastRow?.clicked_at) {
    const diff = Date.now() - new Date(lastRow.clicked_at as string).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) lastClickLabel = "Just now"
    else if (mins < 60) lastClickLabel = `${mins}m ago`
    else if (mins < 1440) lastClickLabel = `${Math.floor(mins / 60)}h ago`
    else lastClickLabel = `${Math.floor(mins / 1440)}d ago`
  }

  return NextResponse.json({
    total: total ?? 0,
    this_month: thisMonth ?? 0,
    last_click: lastClickLabel,
    by_lang: byLangPct,
    by_lang_count: byLangCount,
  })
}
