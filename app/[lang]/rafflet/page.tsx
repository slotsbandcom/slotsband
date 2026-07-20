import { getRaffles } from "@/lib/supabase/queries"
import RafflesPage from "./raffles-client"

interface Props {
  params: Promise<{ lang: string }>
}

export default async function RaffletPage({ params }: Props) {
  const raffles = await getRaffles()
  return <RafflesPage params={params} raffles={raffles} />
}
