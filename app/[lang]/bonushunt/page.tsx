import { getBonusHunts } from "@/lib/supabase/queries"
import BonusHuntPage from "./bonushunt-client"

export default async function Page({ params }: { params: { lang: string } }) {
  const bonusHunts = await getBonusHunts()
  return <BonusHuntPage params={params} bonusHunts={bonusHunts} />
}
