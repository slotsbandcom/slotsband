import type { Metadata } from "next"
import type { Lang } from "@/lib/types"
import { getRaffles } from "@/lib/supabase/queries"
import { getPageMeta } from "@/lib/supabase/page-meta"
import RafflesPage from "./raffles-client"

interface Props {
  params: Promise<{ lang: string }>
}

const VALID_LANGS: Lang[] = ["fi", "en", "uk"]

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = (VALID_LANGS.includes(raw as Lang) ? raw : "fi") as Lang
  const titles: Record<Lang, string> = {
    fi: "Rafflet | SlotsBand",
    en: "Casino Raffles | SlotsBand",
    uk: "Casino Raffles | SlotsBand",
  }
  const descs: Record<Lang, string> = {
    fi: "Kasinoiden parhaat rafflet ja kilpailut – osallistu ja voita palkintoja.",
    en: "The best casino raffles and competitions – enter and win prizes.",
    uk: "The best UK casino raffles and competitions – enter and win prizes.",
  }
  const { meta_title, meta_description } = await getPageMeta("rafflet", lang)
  return { title: meta_title || titles[lang], description: meta_description || descs[lang] }
}

export default async function RaffletPage({ params }: Props) {
  const raffles = await getRaffles()
  return <RafflesPage params={params} raffles={raffles} />
}
