import { redirect } from "next/navigation"
import { NettikasinotHub } from "@/components/pages/nettikasinot-hub"
import type { Lang } from "@/lib/types"

const VALID_LANGS: Lang[] = ["fi", "uk", "en"]

interface PageProps {
  params: Promise<{ lang: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function OnlineCasinosPage({ params, searchParams }: PageProps) {
  const { lang: rawLang } = await params
  const lang = (VALID_LANGS.includes(rawLang as Lang) ? rawLang : "en") as Lang

  if (lang === "fi") redirect("/fi/nettikasinot")

  const sp = searchParams ? await searchParams : {}
  const initialFilter = typeof sp.filter === "string" ? sp.filter : null

  return <NettikasinotHub lang={lang} initialFilter={initialFilter} />
}
