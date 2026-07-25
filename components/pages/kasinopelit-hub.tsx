import { getGames } from "@/lib/supabase/queries"
import GamesPage from "@/app/[lang]/kasinopelit/games-client"
import type { Lang } from "@/lib/types"

export async function KasinopelitHub({ lang }: { lang: Lang }) {
  const games = await getGames({ activeOnly: true })
  return <GamesPage params={Promise.resolve({ lang })} games={games} />
}
