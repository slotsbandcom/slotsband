import type { Metadata } from "next"
import type { Lang } from "@/lib/types"
import { getGames } from "@/lib/supabase/queries"
import { getPageMeta } from "@/lib/supabase/page-meta"
import GamesPage from "./games-client"

interface Props {
  params: Promise<{ lang: string }>
}

const VALID_LANGS: Lang[] = ["fi", "en", "uk"]

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = (VALID_LANGS.includes(raw as Lang) ? raw : "fi") as Lang
  const titles: Record<Lang, string> = {
    fi: "Kasinopelit 2026 | SlotsBand",
    en: "Casino Games 2026 | SlotsBand",
    uk: "Casino Games 2026 | SlotsBand",
  }
  const descs: Record<Lang, string> = {
    fi: "Tutustu parhaimpiin kasinopeleihin – kolikkopeleihin, pöytäpeleihin ja live-kasinoon.",
    en: "Explore the best casino games – slots, table games and live casino.",
    uk: "Explore the best UK casino games – slots, table games and live casino.",
  }
  const { meta_title, meta_description } = await getPageMeta("kasinopelit", lang)
  return { title: meta_title || titles[lang], description: meta_description || descs[lang] }
}

export default async function KasinopelitPage({ params }: Props) {
  const games = await getGames({ activeOnly: true })
  return <GamesPage params={params} games={games} />
}
