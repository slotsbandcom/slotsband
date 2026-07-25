import { getRaffles } from "@/lib/supabase/queries"
import RafflesPage from "@/app/[lang]/rafflet/raffles-client"
import type { Lang } from "@/lib/types"

export async function RaffletHub({ lang }: { lang: Lang }) {
  const raffles = await getRaffles()
  return <RafflesPage params={Promise.resolve({ lang })} raffles={raffles} />
}
