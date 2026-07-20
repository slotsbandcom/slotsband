import { getGames, getCasinos } from "@/lib/supabase/queries"
import AdminGamesPage from "./games-client"

export default async function GamesPage() {
  const [games, casinos] = await Promise.all([
    getGames(),
    getCasinos(),
  ])
  return <AdminGamesPage games={games} casinos={casinos} />
}
