import { getBonuses, getCasinos } from "@/lib/supabase/queries"
import AdminBonusesPage from "./bonuses-client"

// Admin-only traffic — always render fresh (dashboard stats aren't cached).
export const dynamic = "force-dynamic"

export default async function BonusesPage() {
  const [bonuses, casinos] = await Promise.all([
    getBonuses(),
    getCasinos(),
  ])
  return <AdminBonusesPage bonuses={bonuses} casinos={casinos} />
}
