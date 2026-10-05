import { createClient as createServiceClient } from "@supabase/supabase-js"
import { getAdminCasinos } from "@/lib/supabase/queries"
import AdminCasinosClient from "./casinos-client"

export type ClickStats = Record<string, { total: number; this_month: number }>

// Counted in the DB per casino (head-only count queries). Fetching the rows
// and counting here silently capped at Supabase's 1000-row default — with
// 25k+ clicks that meant only the oldest 1000 were counted, so newer casinos
// showed 0.
async function getClickStats(slugs: string[]): Promise<ClickStats> {
  const db = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const count = (slug: string, since?: string) => {
    let q = db.from("affiliate_clicks").select("*", { count: "exact", head: true }).eq("casino_slug", slug)
    if (since) q = q.gte("clicked_at", since)
    return q.then(({ count }) => count ?? 0)
  }

  const stats: ClickStats = {}
  await Promise.all(
    slugs.map(async (slug) => {
      const [total, this_month] = await Promise.all([count(slug), count(slug, monthStart.toISOString())])
      if (total > 0) stats[slug] = { total, this_month }
    })
  )
  return stats
}

export default async function AdminCasinosPage() {
  const casinos = await getAdminCasinos()
  const clickStats = await getClickStats(casinos.map((c) => c.slug))
  return <AdminCasinosClient casinos={casinos} clickStats={clickStats} />
}
