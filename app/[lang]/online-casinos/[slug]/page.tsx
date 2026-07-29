import { redirect } from "next/navigation"
import type { Metadata } from "next"
import type { Lang } from "@/lib/types"
import { getCasinoSlugs } from "@/lib/supabase/build-client"
import OriginalCasinoPage, {
  generateMetadata as originalGenerateMetadata,
} from "@/app/[lang]/nettikasinot/[slug]/page"

const VALID_LANGS: Lang[] = ["fi", "uk", "en"]

interface PageProps {
  params: Promise<{ lang: string; slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getCasinoSlugs()
  return (["uk", "en"] as const).flatMap((lang) =>
    slugs.map((slug) => ({ lang, slug }))
  )
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { lang: rawLang } = await props.params
  const lang = (VALID_LANGS.includes(rawLang as Lang) ? rawLang : "en") as Lang
  if (lang === "fi") return {}
  return originalGenerateMetadata(props)
}

export default async function OnlineCasinoSlugPage(props: PageProps) {
  const { lang: rawLang, slug } = await props.params
  const lang = (VALID_LANGS.includes(rawLang as Lang) ? rawLang : "en") as Lang
  if (lang === "fi") redirect(`/fi/nettikasinot/${slug}`)
  return OriginalCasinoPage(props)
}
