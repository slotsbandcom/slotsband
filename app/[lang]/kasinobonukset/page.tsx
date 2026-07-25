import type { Metadata } from "next"
import type { Lang } from "@/lib/types"
import { getBonuses } from "@/lib/supabase/queries"
import { getPageMeta } from "@/lib/supabase/page-meta"
import BonusesPage from "./bonuses-client"

const VALID_LANGS: Lang[] = ["fi", "en", "uk"]

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const lang = (VALID_LANGS.includes(params.lang as Lang) ? params.lang : "fi") as Lang
  const titles: Record<Lang, string> = {
    fi: "Kasinobonukset 2026 | SlotsBand",
    en: "Casino Bonuses 2026 | SlotsBand",
    uk: "Casino Bonuses 2026 | SlotsBand",
  }
  const descs: Record<Lang, string> = {
    fi: "Löydä parhaat kasinobonukset 2026 – tervetulobonukset, ilmaiskierrokset ja talletusbonarit.",
    en: "Find the best casino bonuses 2026 – welcome bonuses, free spins and deposit offers.",
    uk: "Find the best UK casino bonuses 2026 – welcome bonuses, free spins and deposit offers.",
  }
  const { meta_title, meta_description } = await getPageMeta("kasinobonukset", lang)
  return { title: meta_title || titles[lang], description: meta_description || descs[lang] }
}

export default async function Page({ params }: { params: { lang: string } }) {
  const bonuses = await getBonuses({ activeOnly: true, lang: (params.lang as "fi" | "en" | "uk") || "fi" })
  return <BonusesPage params={params} bonuses={bonuses} />
}
