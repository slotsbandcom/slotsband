import { getBonusHunts } from "@/lib/supabase/queries"
import BonusHuntPage from "@/app/[lang]/bonushunt/bonushunt-client"
import type { Lang } from "@/lib/types"

export async function BonushuntHub({ lang }: { lang: Lang }) {
  const bonusHunts = await getBonusHunts()
  return <BonusHuntPage params={{ lang }} bonusHunts={bonusHunts} />
}
