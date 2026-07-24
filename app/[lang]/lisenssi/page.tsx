import type { Metadata } from "next"
import { TaxonomyIndexPage } from "@/components/taxonomy-index-page"
import { resolveLang, buildIndexMetadata, getIndexData } from "@/lib/taxonomy-page-helpers"

export const revalidate = 3600

const TAX = "licence"
interface Props { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  return buildIndexMetadata(TAX, resolveLang(lang))
}

export default async function Page({ params }: Props) {
  const { lang } = await params
  const resolvedLang = resolveLang(lang)
  const terms = await getIndexData(TAX)
  return <TaxonomyIndexPage taxonomy={TAX} lang={resolvedLang} terms={terms} />
}
