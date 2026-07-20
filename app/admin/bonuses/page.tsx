import { getBonuses, getCasinos } from "@/lib/supabase/queries"
import AdminBonusesPage from "./bonuses-client"

export default async function BonusesPage() {
  const [bonuses, casinos] = await Promise.all([
    getBonuses(),
    getCasinos(),
  ])
  return <AdminBonusesPage bonuses={bonuses} casinos={casinos} />
}
