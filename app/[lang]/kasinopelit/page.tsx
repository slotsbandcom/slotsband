import { getGames } from "@/lib/supabase/queries"
import GamesPage from "./games-client"

interface Props {
  params: Promise<{ lang: string }>
}

export default async function KasinopelitPage({ params }: Props) {
  const games = await getGames({ activeOnly: true })
  return <GamesPage params={params} games={games} />
}
