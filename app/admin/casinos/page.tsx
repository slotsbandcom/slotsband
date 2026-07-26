import { createClient as createServiceClient } from "@supabase/supabase-js"
import { getAdminCasinos } from "@/lib/supabase/queries"
import AdminCasinosClient from "./casinos-client"

export type ClickStats = Record<string, { total: number; this_month: number }>

async function getClickStats(): Promise<ClickStats> {
  const db = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data } = await db.from("affiliate_clicks").select("casino_slug, clicked_at")

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const stats: ClickStats = {}
  for (const row of data ?? []) {
    const slug = row.casino_slug as string
    if (!stats[slug]) stats[slug] = { total: 0, this_month: 0 }
    stats[slug].total++
    if (new Date(row.clicked_at as string) >= monthStart) stats[slug].this_month++
  }
  return stats
}

export default async function AdminCasinosPage() {
  const [casinos, clickStats] = await Promise.all([
    getAdminCasinos(),
    getClickStats(),
  ])
  return <AdminCasinosClient casinos={casinos} clickStats={clickStats} />
}
