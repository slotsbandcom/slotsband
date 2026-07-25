import { getBonuses } from "@/lib/supabase/queries"
import BonusesPage from "@/app/[lang]/kasinobonukset/bonuses-client"
import type { Lang } from "@/lib/types"

export async function KasinobonuksetHub({ lang }: { lang: Lang }) {
  const bonuses = await getBonuses({ activeOnly: true, lang })
  return <BonusesPage params={{ lang }} bonuses={bonuses} />
}
