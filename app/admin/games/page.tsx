import { getGames, getCasinos } from "@/lib/supabase/queries"
import AdminGamesPage from "./games-client"

// Admin-only traffic — always render fresh (dashboard stats aren't cached).
export const dynamic = "force-dynamic"

export default async function GamesPage() {
  const [games, casinos] = await Promise.all([
    getGames(),
    getCasinos(),
  ])
  return <AdminGamesPage games={games} casinos={casinos} />
}
