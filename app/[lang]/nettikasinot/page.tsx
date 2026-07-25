import type { Metadata } from "next"
import type { Lang } from "@/lib/types"
import { getCasinos } from "@/lib/supabase/queries"
import { getPageMeta } from "@/lib/supabase/page-meta"
import NettikasinotPage from "./listing-client"

interface Props {
  params: Promise<{ lang: string }>
}

const VALID_LANGS: Lang[] = ["fi", "en", "uk"]

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = (VALID_LANGS.includes(raw as Lang) ? raw : "fi") as Lang
  const titles: Record<Lang, string> = {
    fi: "Nettikasinot 2026 | SlotsBand",
    en: "Online Casinos 2026 | SlotsBand",
    uk: "Online Casinos 2026 | SlotsBand",
  }
  const descs: Record<Lang, string> = {
    fi: "Vertaa parhaita nettikasinoita 2026 – bonukset, pelit ja maksutavat yhdessä paikassa.",
    en: "Compare the best online casinos 2026 – bonuses, games and payment methods in one place.",
    uk: "Compare the best UK online casinos 2026 – bonuses, games and payment methods in one place.",
  }
  const { meta_title, meta_description } = await getPageMeta("nettikasinot", lang)
  return { title: meta_title || titles[lang], description: meta_description || descs[lang] }
}

export default async function NettikasinotRSC({ params }: Props) {
  const casinos = await getCasinos({ activeOnly: true })
  return <NettikasinotPage params={params} casinos={casinos} />
}
