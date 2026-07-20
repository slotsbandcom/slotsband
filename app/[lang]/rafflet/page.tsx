import { getRaffles } from "@/lib/supabase/queries"
import RafflesPage from "./raffles-client"

export default async function Page({ params }: { params: { lang: string } }) {
  const raffles = await getRaffles()
  return <RafflesPage params={params} raffles={raffles} />
}
