import { redirect } from "next/navigation"
import { NettikasinotHub } from "@/components/pages/nettikasinot-hub"
import type { Lang } from "@/lib/types"

const VALID_LANGS: Lang[] = ["fi", "uk", "en"]

interface PageProps {
  params: Promise<{ lang: string }>
}

export const revalidate = 3600

// Only fi/en/uk exist (generateStaticParams in [lang]/layout.tsx); any other
// first path segment 404s without rendering.
export const dynamicParams = false

export default async function OnlineCasinosPage({ params }: PageProps) {
  const { lang: rawLang } = await params
  const lang = (VALID_LANGS.includes(rawLang as Lang) ? rawLang : "en") as Lang

  if (lang === "fi") redirect("/fi/nettikasinot")

  // ?filter= is applied client-side by the listing (see listing-client.tsx)
  return <NettikasinotHub lang={lang} />
}
