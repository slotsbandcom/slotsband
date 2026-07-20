import { getGames } from "@/lib/supabase/queries"
import GamesPage from "./games-client"

export default async function Page({ params }: { params: { lang: string } }) {
  const games = await getGames({ activeOnly: true })
  return <GamesPage params={params} games={games} />
}
