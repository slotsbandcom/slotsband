import { getBonuses } from "@/lib/supabase/queries"
import BonusesPage from "./bonuses-client"

export default async function Page({ params }: { params: { lang: string } }) {
  const bonuses = await getBonuses({ activeOnly: true, lang: (params.lang as "fi" | "en" | "uk") || "fi" })
  return <BonusesPage params={params} bonuses={bonuses} />
}
