import type { Metadata } from "next"
import type { Lang } from "@/lib/types"
import { getBonusHunts } from "@/lib/supabase/queries"
import { getPageMeta } from "@/lib/supabase/page-meta"
import BonusHuntPage from "./bonushunt-client"

const VALID_LANGS: Lang[] = ["fi", "en", "uk"]

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const lang = (VALID_LANGS.includes(params.lang as Lang) ? params.lang : "fi") as Lang
  const titles: Record<Lang, string> = {
    fi: "Bonus Hunt | SlotsBand",
    en: "Bonus Hunt | SlotsBand",
    uk: "Bonus Hunt | SlotsBand",
  }
  const descs: Record<Lang, string> = {
    fi: "Seuraa live bonus hunt -sessiota – avaa bonukset ja katso tulokset reaaliajassa.",
    en: "Follow live bonus hunt sessions – open bonuses and see results in real time.",
    uk: "Follow live UK bonus hunt sessions – open bonuses and see results in real time.",
  }
  const { meta_title, meta_description } = await getPageMeta("bonushunt", lang)
  return { title: meta_title || titles[lang], description: meta_description || descs[lang] }
}

export default async function Page({ params }: { params: { lang: string } }) {
  const bonusHunts = await getBonusHunts()
  return <BonusHuntPage params={params} bonusHunts={bonusHunts} />
}
